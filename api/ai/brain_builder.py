"""
AI Brain Workflow Builder - MEGA PHASE v16
Endpoint for AI-powered workflow generation via Levqor Brain
"""
import uuid
import logging
from flask import Blueprint, jsonify, request, g
from typing import Dict, Any

from .service import generate_ai_response, is_ai_enabled
from modules.approval_policy import classify_workflow, ImpactLevel, requires_approval
from modules.approvals import enqueue_action
from modules.workflows.models import Workflow, WorkflowStep
from modules.workflows.storage import create_workflow

log = logging.getLogger("levqor.ai.brain_builder")

brain_builder_bp = Blueprint('brain_builder', __name__, url_prefix='/api/ai/brain')


WORKFLOW_BUILDER_PROMPT = """You are Levqor Brain, an AI assistant that designs automation workflows.

Given a user's goal, create a workflow definition with the following JSON structure:

{
  "name": "Workflow Name",
  "description": "Brief description",
  "steps": [
    {
      "id": "step_1",
      "type": "log|http_request|email|delay|condition",
      "name": "Step Name",
      "config": { ... step-specific config ... },
      "next_step_ids": ["step_2"]
    }
  ]
}

Step types and configs:
- log: {"message": "...", "level": "info|warn|error"}
- http_request: {"method": "GET|POST", "url": "...", "headers": {}, "body": {}}
- email: {"to": "...", "subject": "...", "body": "..."}
- delay: {"seconds": 10}
- condition: {"condition": "...", "true_step": "...", "false_step": "..."}

Important rules:
1. Keep workflows simple (3-7 steps)
2. Use realistic, professional configurations
3. Email steps require approval - flag appropriately
4. HTTP requests to external APIs require approval

Respond with ONLY the JSON workflow definition, no explanations."""


@brain_builder_bp.route('/build_workflow', methods=['POST'])
def build_workflow():
    """
    POST /api/ai/brain/build_workflow
    AI-powered workflow builder.
    
    Input: { goal, context?, approx_volume?, language? }
    Output: { proposed_workflow, explanation, impact_level }
    """
    try:
        data = request.get_json() or {}
        
        goal = data.get('goal', '')
        context = data.get('context', '')
        approx_volume = data.get('approx_volume', '')
        language = data.get('language', 'en')
        
        if not goal:
            return jsonify({"error": "Goal is required"}), 400
        
        user_prompt = f"Goal: {goal}"
        if context:
            user_prompt += f"\nContext: {context}"
        if approx_volume:
            user_prompt += f"\nApproximate volume: {approx_volume}"
        
        if is_ai_enabled():
            ai_result = generate_ai_response(
                task="workflow_build",
                language=language,
                payload={
                    "goal": goal,
                    "context": context,
                    "approx_volume": approx_volume,
                    "system_prompt": WORKFLOW_BUILDER_PROMPT,
                    "user_prompt": user_prompt
                }
            )
            
            if ai_result and ai_result.get('success'):
                proposed_workflow = _parse_workflow_response(ai_result.get('response', ''))
            else:
                proposed_workflow = _generate_fallback_workflow(goal)
        else:
            proposed_workflow = _generate_fallback_workflow(goal)
        
        impact_level = classify_workflow(proposed_workflow)
        needs_approval = requires_approval(impact_level)
        
        explanation = _generate_explanation(proposed_workflow, impact_level)
        
        return jsonify({
            "proposed_workflow": proposed_workflow,
            "explanation": explanation,
            "impact_level": impact_level.value,
            "impact_name": impact_level.name,
            "requires_approval": needs_approval
        }), 200
        
    except Exception as e:
        log.error(f"Error in brain workflow builder: {e}")
        return jsonify({"error": "Failed to build workflow"}), 500


@brain_builder_bp.route('/submit_workflow', methods=['POST'])
def submit_workflow():
    """
    POST /api/ai/brain/submit_workflow
    Submit a proposed workflow for creation.
    
    If impact is CRITICAL (C), queues for approval.
    If SAFE (A) or SOFT (B), creates directly.
    
    Input: { workflow, impact_level }
    Output: { workflow_id?, approval_id?, status }
    """
    try:
        data = request.get_json() or {}
        
        workflow_data = data.get('workflow', {})
        
        if not workflow_data.get('name'):
            return jsonify({"error": "Workflow name is required"}), 400
        
        impact_level = classify_workflow(workflow_data)
        needs_approval = requires_approval(impact_level)
        
        tenant_id = getattr(g, 'tenant_id', 'default')
        owner_id = data.get('owner_id', '')
        
        if needs_approval:
            approval_id = enqueue_action(
                action_type="create_workflow",
                payload=workflow_data,
                reason=f"Workflow '{workflow_data.get('name')}' contains critical operations (Class C)",
                impact_level=impact_level.value,
                owner_id=owner_id,
                tenant_id=tenant_id
            )
            
            log.info(f"Workflow queued for approval: {approval_id}")
            
            return jsonify({
                "status": "pending_approval",
                "approval_id": approval_id,
                "message": "Workflow requires approval before activation",
                "impact_level": impact_level.value
            }), 202
        
        else:
            steps = [WorkflowStep.from_dict(s) for s in workflow_data.get('steps', [])]
            
            workflow = Workflow(
                id=str(uuid.uuid4()),
                name=workflow_data.get('name', 'Untitled'),
                description=workflow_data.get('description', ''),
                steps=steps,
                owner_id=owner_id,
                tenant_id=tenant_id,
                is_active=False
            )
            
            workflow_id = create_workflow(workflow)
            
            log.info(f"Workflow created directly (Class {impact_level.value}): {workflow_id}")
            
            return jsonify({
                "status": "created",
                "workflow_id": workflow_id,
                "message": "Workflow created successfully",
                "impact_level": impact_level.value
            }), 201
        
    except Exception as e:
        log.error(f"Error submitting workflow: {e}")
        return jsonify({"error": "Failed to submit workflow"}), 500


def _parse_workflow_response(response: str) -> Dict[str, Any]:
    """Parse AI response into workflow structure."""
    import json
    
    try:
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        return json.loads(response.strip())
    except json.JSONDecodeError:
        return _generate_fallback_workflow("parsed request")


def _generate_fallback_workflow(goal: str) -> Dict[str, Any]:
    """Generate a simple fallback workflow when AI is unavailable."""
    return {
        "name": f"Workflow for: {goal[:50]}",
        "description": f"Automated workflow based on: {goal}",
        "steps": [
            {
                "id": "step_1",
                "type": "log",
                "name": "Start Workflow",
                "config": {"message": f"Starting workflow for: {goal}", "level": "info"},
                "next_step_ids": ["step_2"]
            },
            {
                "id": "step_2",
                "type": "delay",
                "name": "Processing Delay",
                "config": {"seconds": 2},
                "next_step_ids": ["step_3"]
            },
            {
                "id": "step_3",
                "type": "log",
                "name": "Complete Workflow",
                "config": {"message": "Workflow completed successfully", "level": "info"},
                "next_step_ids": []
            }
        ]
    }


def _generate_explanation(workflow: Dict[str, Any], impact_level: ImpactLevel) -> str:
    """Generate human-readable explanation of the workflow."""
    steps = workflow.get('steps', [])
    step_types = [s.get('type', 'unknown') for s in steps]
    
    explanation = f"This workflow has {len(steps)} step(s):\n"
    
    for i, step in enumerate(steps, 1):
        step_type = step.get('type', 'unknown')
        step_name = step.get('name', f'Step {i}')
        explanation += f"  {i}. {step_name} ({step_type})\n"
    
    if impact_level == ImpactLevel.CRITICAL:
        explanation += "\nIMPACT: Critical (Class C) - Contains external operations that require approval."
    elif impact_level == ImpactLevel.SOFT:
        explanation += "\nIMPACT: Soft (Class B) - Contains operations that will be logged."
    else:
        explanation += "\nIMPACT: Safe (Class A) - Internal operations only."
    
    return explanation
