"""
AI Debug Assistant Endpoint - Error analysis and solutions
Currently uses pattern matching; designed for easy OpenAI integration
"""
from flask import Blueprint, request, jsonify
import logging
import re

bp = Blueprint("ai_debug", __name__, url_prefix="/api/ai/debug")
log = logging.getLogger("levqor.ai.debug")


@bp.post("/")
def ai_debug():
    """
    Analyze errors and provide solutions
    
    Request: { "error": string, "context": { stack?, component?, ... } }
    Response: { "success": boolean, "explanation": string, "steps": array, "prevention": string }
    """
    from api.metrics.app import increment_ai_request, increment_error
    
    increment_ai_request()
    
    try:
        data = request.get_json()
        
        if not data or "error" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: error"
            }), 400
        
        error = data.get("error", "").strip()
        context = data.get("context", {})
        
        if not error or len(error) < 5:
            return jsonify({
                "success": False,
                "error": "Error message must be at least 5 characters"
            }), 422
        
        if len(error) > 2000:
            return jsonify({
                "success": False,
                "error": "Error message too long (max 2000 characters)"
            }), 422
        
        log.info(f"AI debug request: error_length={len(error)}, component={context.get('component', 'unknown')}")
        
        explanation, steps, prevention = _analyze_error(error, context)
        
        return jsonify({
            "success": True,
            "explanation": explanation,
            "steps": steps,
            "prevention": prevention,
            "meta": {
                "error_length": len(error),
                "pattern_based": True
            }
        }), 200
        
    except Exception as e:
        from api.metrics.app import increment_error
        increment_error()
        log.error(f"AI debug error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _analyze_error(error: str, context: dict) -> tuple[str, list[dict], str]:
    """
    Pattern-based error analysis
    TODO: Replace with OpenAI API call when ready
    """
    error_lower = error.lower()
    
    if "timeout" in error_lower or "timed out" in error_lower:
        return (
            "This is a timeout error, which means the operation took longer than expected to complete.",
            [
                {
                    "step": 1,
                    "action": "Check network connectivity",
                    "description": "Ensure stable internet connection"
                },
                {
                    "step": 2,
                    "action": "Reduce payload size",
                    "description": "Try processing smaller batches of data"
                },
                {
                    "step": 3,
                    "action": "Increase timeout limit",
                    "description": "Adjust timeout settings if operation is legitimately slow"
                }
            ],
            "Set appropriate timeout values based on expected operation duration. For large data transfers, implement progress tracking and chunked uploads."
        )
    
    elif "permission" in error_lower or "forbidden" in error_lower or "403" in error:
        return (
            "This is a permission error, indicating you don't have access to perform this action.",
            [
                {
                    "step": 1,
                    "action": "Verify your account permissions",
                    "description": "Check if your user role has required access"
                },
                {
                    "step": 2,
                    "action": "Contact your administrator",
                    "description": "Request necessary permissions for this operation"
                }
            ],
            "Implement proper role-based access control (RBAC) and clearly communicate permission requirements to users."
        )
    
    elif "not found" in error_lower or "404" in error:
        return (
            "This error means the requested resource could not be found.",
            [
                {
                    "step": 1,
                    "action": "Verify the resource ID or path",
                    "description": "Check for typos in URLs or identifiers"
                },
                {
                    "step": 2,
                    "action": "Confirm the resource exists",
                    "description": "It may have been deleted or moved"
                },
                {
                    "step": 3,
                    "action": "Check your filters",
                    "description": "Active filters may be hiding the resource"
                }
            ],
            "Validate resource existence before operations and provide clear error messages when resources are not found."
        )
    
    elif "network" in error_lower or "connection" in error_lower:
        return (
            "This is a network connectivity issue preventing communication with the server.",
            [
                {
                    "step": 1,
                    "action": "Check internet connection",
                    "description": "Verify you're online"
                },
                {
                    "step": 2,
                    "action": "Try again",
                    "description": "Network issues are often temporary"
                },
                {
                    "step": 3,
                    "action": "Contact support",
                    "description": "If problem persists, report to Levqor support"
                }
            ],
            "Implement retry logic with exponential backoff for transient network failures. Show clear connection status indicators."
        )
    
    elif "validation" in error_lower or "invalid" in error_lower:
        return (
            "This is a validation error, meaning the provided data doesn't meet requirements.",
            [
                {
                    "step": 1,
                    "action": "Review the error message",
                    "description": "It should indicate which field is invalid"
                },
                {
                    "step": 2,
                    "action": "Check data format",
                    "description": "Ensure data matches expected format (email, date, etc.)"
                },
                {
                    "step": 3,
                    "action": "Verify required fields",
                    "description": "Confirm all mandatory fields are filled"
                }
            ],
            "Implement client-side validation to catch issues before submission. Provide clear format examples and requirements."
        )
    
    else:
        return (
            f"An unexpected error occurred: {error[:100]}...",
            [
                {
                    "step": 1,
                    "action": "Review recent changes",
                    "description": "Check what you were doing when the error occurred"
                },
                {
                    "step": 2,
                    "action": "Try refreshing",
                    "description": "Sometimes a simple refresh resolves the issue"
                },
                {
                    "step": 3,
                    "action": "Contact support",
                    "description": "Provide error details to Levqor support team"
                }
            ],
            "Implement comprehensive error logging and monitoring to track and prevent recurring issues."
        )
