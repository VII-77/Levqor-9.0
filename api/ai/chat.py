"""
AI Chat Endpoint - Contextual help and Q&A
Currently uses pattern matching; designed for easy OpenAI integration
"""
from flask import Blueprint, request, jsonify
import logging
import re

bp = Blueprint("ai_chat", __name__, url_prefix="/api/ai/chat")
log = logging.getLogger("levqor.ai.chat")


@bp.post("/")
def ai_chat():
    """
    Handle AI chat requests for contextual help
    
    Request: { "query": string, "context": { page?, userTier?, ... } }
    Response: { "success": boolean, "answer": string, "steps"?: array, "meta": object }
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
        
        if not query or len(query) < 3:
            return jsonify({
                "success": False,
                "error": "Query must be at least 3 characters"
            }), 422
        
        if len(query) > 500:
            return jsonify({
                "success": False,
                "error": "Query too long (max 500 characters)"
            }), 422
        
        log.info(f"AI chat request: query_length={len(query)}, page={context.get('page', 'unknown')}")
        
        answer, steps = _generate_answer(query, context)
        
        return jsonify({
            "success": True,
            "answer": answer,
            "steps": steps if steps else None,
            "meta": {
                "query_length": len(query),
                "pattern_based": True
            }
        }), 200
        
    except Exception as e:
        from api.metrics.app import increment_error
        increment_error()
        log.error(f"AI chat error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _generate_answer(query: str, context: dict) -> tuple[str, list[dict] | None]:
    """
    Pattern-based answer generation
    TODO: Replace with OpenAI API call when ready
    """
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["workflow", "create", "build"]):
        return (
            "To create a workflow in Levqor, go to the Workflows section in your dashboard. "
            "You can use our Natural Language Builder to describe what you want in plain English, "
            "or use the visual builder for more control.",
            [
                {"step": 1, "action": "Navigate to Dashboard → Workflows"},
                {"step": 2, "action": "Click 'New Workflow'"},
                {"step": 3, "action": "Choose Natural Language or Visual mode"}
            ]
        )
    
    elif any(word in query_lower for word in ["pricing", "cost", "price", "plan"]):
        return (
            f"Levqor offers 4 pricing tiers: Starter (£9/mo), Growth (£29/mo), "
            f"Business (£59/mo), and Agency (£149/mo). All plans include a 7-day free trial. "
            f"View full details at levqor.ai/pricing",
            None
        )
    
    elif any(word in query_lower for word in ["trial", "free"]):
        return (
            "All Levqor plans include a 7-day free trial. Card required, but you won't be "
            "charged if you cancel before Day 7. Start your trial on the pricing page.",
            None
        )
    
    elif any(word in query_lower for word in ["support", "help", "contact"]):
        tier = context.get("userTier", "starter").lower()
        sla_map = {
            "starter": "48 hours",
            "growth": "24 hours",
            "business": "12 hours",
            "agency": "4 hours"
        }
        sla = sla_map.get(tier, "48 hours")
        
        return (
            f"Our support team responds within {sla} based on your plan. "
            f"Contact us via the Support tab in your dashboard or email support@levqor.ai",
            None
        )
    
    elif any(word in query_lower for word in ["data", "retention", "backup"]):
        return (
            "Levqor provides automated data backup and retention management. "
            "Your data is encrypted at rest and in transit. Configure retention policies "
            "in Dashboard → Settings → Data Retention.",
            None
        )
    
    else:
        return (
            f"I can help you with workflows, pricing, trials, support, and data management. "
            f"For specific questions about '{query[:50]}...', please contact our support team.",
            None
        )
