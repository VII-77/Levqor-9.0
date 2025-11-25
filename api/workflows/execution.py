"""
Workflow Execution API Routes - MEGA PHASE v15
Endpoints for creating, listing, and running workflows
"""
import uuid
import logging
from flask import jsonify, request, g
from . import workflows_bp

from modules.workflows.models import Workflow, WorkflowStep
from modules.workflows.storage import (
    create_workflow, get_workflow_by_id, list_workflows, 
    update_workflow, delete_workflow
)
from modules.workflows.runner import WorkflowRunner
from modules.workflows.events import get_workflow_runs, get_workflow_events

log = logging.getLogger("levqor.workflows.api")


@workflows_bp.route('', methods=['GET'])
def api_list_workflows():
    """
    GET /api/workflows - List all workflows.
    Query params: tenant_id, owner_id, active_only, limit
    """
    try:
        tenant_id = request.args.get('tenant_id') or getattr(g, 'tenant_id', None)
        owner_id = request.args.get('owner_id')
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        limit = min(int(request.args.get('limit', 100)), 500)
        
        workflows = list_workflows(
            tenant_id=tenant_id,
            owner_id=owner_id,
            active_only=active_only,
            limit=limit
        )
        
        return jsonify({
            "workflows": [w.to_dict() for w in workflows],
            "total": len(workflows)
        }), 200
        
    except Exception as e:
        log.error(f"Error listing workflows: {e}")
        return jsonify({"error": "Failed to list workflows"}), 500


@workflows_bp.route('/<workflow_id>', methods=['GET'])
def api_get_workflow(workflow_id: str):
    """
    GET /api/workflows/<id> - Get workflow details.
    """
    try:
        workflow = get_workflow_by_id(workflow_id)
        
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        return jsonify(workflow.to_dict()), 200
        
    except Exception as e:
        log.error(f"Error getting workflow {workflow_id}: {e}")
        return jsonify({"error": "Failed to get workflow"}), 500


@workflows_bp.route('', methods=['POST'])
def api_create_workflow():
    """
    POST /api/workflows - Create a new workflow (Class C: stored but not auto-activated).
    Body: { name, description, steps, schedule_config? }
    """
    try:
        data = request.get_json() or {}
        
        if not data.get('name'):
            return jsonify({"error": "Workflow name is required"}), 400
        
        steps_data = data.get('steps', [])
        steps = [WorkflowStep.from_dict(s) for s in steps_data]
        
        workflow = Workflow(
            id=str(uuid.uuid4()),
            name=data.get('name', 'Untitled Workflow'),
            description=data.get('description', ''),
            steps=steps,
            owner_id=data.get('owner_id', ''),
            tenant_id=getattr(g, 'tenant_id', 'default'),
            is_active=False,
            schedule_config=None
        )
        
        workflow_id = create_workflow(workflow)
        
        log.info(f"Workflow created (Class C - not active): {workflow_id}")
        
        return jsonify({
            "id": workflow_id,
            "message": "Workflow created. Activation requires approval.",
            "is_active": False
        }), 201
        
    except Exception as e:
        log.error(f"Error creating workflow: {e}")
        return jsonify({"error": "Failed to create workflow"}), 500


@workflows_bp.route('/<workflow_id>', methods=['PUT'])
def api_update_workflow(workflow_id: str):
    """
    PUT /api/workflows/<id> - Update a workflow.
    """
    try:
        data = request.get_json() or {}
        
        workflow = get_workflow_by_id(workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        updates = {}
        if 'name' in data:
            updates['name'] = data['name']
        if 'description' in data:
            updates['description'] = data['description']
        if 'steps' in data:
            updates['steps'] = data['steps']
        
        success = update_workflow(workflow_id, updates)
        
        if success:
            return jsonify({"message": "Workflow updated"}), 200
        else:
            return jsonify({"error": "Failed to update workflow"}), 500
            
    except Exception as e:
        log.error(f"Error updating workflow {workflow_id}: {e}")
        return jsonify({"error": "Failed to update workflow"}), 500


@workflows_bp.route('/<workflow_id>/run', methods=['POST'])
def api_run_workflow(workflow_id: str):
    """
    POST /api/workflows/<id>/run - Trigger a manual workflow run (Class B: logged).
    Body: { context? }
    """
    try:
        workflow = get_workflow_by_id(workflow_id)
        
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        data = request.get_json() or {}
        context = data.get('context', {})
        
        runner = WorkflowRunner(workflow, context)
        result = runner.run()
        
        log.info(f"Workflow run triggered (Class B): {workflow_id} -> run_id={result.run_id}")
        
        return jsonify({
            "run_id": result.run_id,
            "status": result.status,
            "steps_executed": result.steps_executed,
            "result": result.result,
            "error": result.error,
            "pending_approvals": result.pending_approvals
        }), 200
        
    except Exception as e:
        log.error(f"Error running workflow {workflow_id}: {e}")
        return jsonify({"error": "Failed to run workflow"}), 500


@workflows_bp.route('/runs', methods=['GET'])
def api_list_workflow_runs():
    """
    GET /api/workflows/runs - List recent workflow runs.
    Query params: workflow_id, limit
    """
    try:
        workflow_id = request.args.get('workflow_id')
        limit = min(int(request.args.get('limit', 50)), 200)
        
        runs = get_workflow_runs(workflow_id=workflow_id, limit=limit)
        
        return jsonify({
            "runs": runs,
            "total": len(runs)
        }), 200
        
    except Exception as e:
        log.error(f"Error listing workflow runs: {e}")
        return jsonify({"error": "Failed to list workflow runs"}), 500


@workflows_bp.route('/runs/<run_id>/events', methods=['GET'])
def api_get_run_events(run_id: str):
    """
    GET /api/workflows/runs/<run_id>/events - Get events for a workflow run.
    """
    try:
        events = get_workflow_events(run_id)
        
        return jsonify({
            "events": events,
            "total": len(events)
        }), 200
        
    except Exception as e:
        log.error(f"Error getting run events {run_id}: {e}")
        return jsonify({"error": "Failed to get run events"}), 500


@workflows_bp.route('/<workflow_id>/duplicate', methods=['POST'])
def api_duplicate_workflow(workflow_id: str):
    """
    POST /api/workflows/<id>/duplicate - Duplicate a workflow (Growth Loop).
    Creates a copy of an existing workflow with a new name.
    """
    try:
        original = get_workflow_by_id(workflow_id)
        
        if not original:
            return jsonify({"error": "Workflow not found"}), 404
        
        data = request.get_json() or {}
        new_name = data.get("name", f"{original.name} (Copy)")
        
        new_id = str(uuid.uuid4())
        new_steps = [
            WorkflowStep(
                id=str(uuid.uuid4()),
                type=step.type,
                name=step.name,
                config=step.config.copy() if step.config else {},
                timeout=step.timeout,
                retry_config=step.retry_config.copy() if step.retry_config else None
            )
            for step in original.steps
        ]
        
        new_workflow = Workflow(
            id=new_id,
            name=new_name,
            description=data.get("description", original.description),
            steps=new_steps,
            created_by=data.get("owner_id") or original.created_by,
            tenant_id=original.tenant_id,
            is_active=False,
            schedule_config=None
        )
        
        created = create_workflow(new_workflow)
        
        log.info(f"Workflow duplicated: {workflow_id} -> {new_id}")
        
        return jsonify({
            "original_id": workflow_id,
            "new_workflow": created.to_dict(),
            "message": "Workflow duplicated successfully"
        }), 201
        
    except Exception as e:
        log.error(f"Error duplicating workflow {workflow_id}: {e}")
        return jsonify({"error": "Failed to duplicate workflow"}), 500
