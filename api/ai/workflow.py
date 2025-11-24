"""
AI Workflow Builder Endpoint - Natural language to workflow steps
Currently uses pattern matching; designed for easy OpenAI integration
"""
from flask import Blueprint, request, jsonify
import logging
import re

bp = Blueprint("ai_workflow", __name__, url_prefix="/api/ai/workflow")
log = logging.getLogger("levqor.ai.workflow")


@bp.post("/")
def ai_workflow():
    """
    Generate workflow steps from natural language description
    
    Request: { "query": string, "context": { ... } }
    Response: { "success": boolean, "steps": array, "meta": object }
    """
    from api.metrics.app import increment_ai_request, increment_error
    
    increment_ai_request()
    
    try:
        data = request.get_json()
        
        if not data or "query" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: query"
            }), 400
        
        query = data.get("query", "").strip()
        context = data.get("context", {})
        
        if not query or len(query) < 5:
            return jsonify({
                "success": False,
                "error": "Workflow description must be at least 5 characters"
            }), 422
        
        if len(query) > 1000:
            return jsonify({
                "success": False,
                "error": "Description too long (max 1000 characters)"
            }), 422
        
        log.info(f"AI workflow request: query_length={len(query)}")
        
        steps = _generate_workflow_steps(query, context)
        
        return jsonify({
            "success": True,
            "steps": steps,
            "meta": {
                "query_length": len(query),
                "step_count": len(steps),
                "pattern_based": True
            }
        }), 200
        
    except Exception as e:
        from api.metrics.app import increment_error
        increment_error()
        log.error(f"AI workflow error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _generate_workflow_steps(query: str, context: dict) -> list[dict]:
    """
    Pattern-based workflow generation
    TODO: Replace with OpenAI API call when ready
    """
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["backup", "save", "archive"]):
        return [
            {
                "type": "trigger",
                "label": "Schedule",
                "description": "Run daily at 2:00 AM UTC"
            },
            {
                "type": "action",
                "label": "Collect Data",
                "description": "Gather files from specified sources"
            },
            {
                "type": "action",
                "label": "Compress",
                "description": "Create compressed archive"
            },
            {
                "type": "action",
                "label": "Upload",
                "description": "Store in cloud backup location"
            },
            {
                "type": "notification",
                "label": "Notify",
                "description": "Send success/failure notification"
            }
        ]
    
    elif any(word in query_lower for word in ["sync", "synchronize", "mirror"]):
        return [
            {
                "type": "trigger",
                "label": "File Change",
                "description": "Detect when files are modified"
            },
            {
                "type": "condition",
                "label": "Check Size",
                "description": "Verify file size is under limit"
            },
            {
                "type": "action",
                "label": "Sync",
                "description": "Copy changes to destination"
            },
            {
                "type": "notification",
                "label": "Log",
                "description": "Record sync operation"
            }
        ]
    
    elif any(word in query_lower for word in ["email", "send", "notify"]):
        return [
            {
                "type": "trigger",
                "label": "Event",
                "description": "When specified condition is met"
            },
            {
                "type": "action",
                "label": "Format Email",
                "description": "Prepare email content with data"
            },
            {
                "type": "action",
                "label": "Send Email",
                "description": "Deliver to specified recipients"
            }
        ]
    
    else:
        return [
            {
                "type": "trigger",
                "label": "Manual or Scheduled",
                "description": f"Based on: {query[:50]}..."
            },
            {
                "type": "action",
                "label": "Process Data",
                "description": "Main workflow action"
            },
            {
                "type": "action",
                "label": "Store Results",
                "description": "Save output"
            },
            {
                "type": "notification",
                "label": "Complete",
                "description": "Notify completion"
            }
        ]
