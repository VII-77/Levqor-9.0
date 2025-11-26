"""
Support Feedback API Blueprint - V10 Completion
REST endpoints for support automation feedback.
"""
from flask import Blueprint, jsonify, request
import logging

from modules.support_feedback import (
    analyze_ticket,
    get_feedback_summary,
    get_ai_suggestions,
    get_improvement_recommendations,
    get_feedback_items
)

log = logging.getLogger("levqor.api.support_feedback")

support_feedback_bp = Blueprint("support_feedback", __name__, url_prefix="/api/support/feedback")


@support_feedback_bp.route("/analyze", methods=["POST"])
def analyze():
    """POST /api/support/feedback/analyze - Analyze a support ticket."""
    try:
        data = request.get_json() or {}
        
        ticket_id = data.get("ticket_id", "")
        subject = data.get("subject", "")
        body = data.get("body", "")
        
        if not ticket_id or not body:
            return jsonify({"success": False, "error": "ticket_id and body are required"}), 400
        
        feedback = analyze_ticket(ticket_id, subject, body)
        
        return jsonify({
            "success": True,
            "feedback": {
                "id": feedback.id,
                "ticket_id": feedback.ticket_id,
                "category": feedback.category,
                "sentiment": feedback.sentiment,
                "keywords": feedback.keywords,
                "suggestion": feedback.suggestion
            }
        }), 200
    except Exception as e:
        log.error(f"Error analyzing ticket: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@support_feedback_bp.route("/summary", methods=["GET"])
def summary():
    """GET /api/support/feedback/summary - Get feedback summary."""
    try:
        result = get_feedback_summary()
        return jsonify({"success": True, **result}), 200
    except Exception as e:
        log.error(f"Error getting feedback summary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@support_feedback_bp.route("/suggestions", methods=["GET"])
def suggestions():
    """GET /api/support/feedback/suggestions - Get AI suggestions."""
    try:
        result = get_ai_suggestions()
        return jsonify({"success": True, "suggestions": result}), 200
    except Exception as e:
        log.error(f"Error getting suggestions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@support_feedback_bp.route("/recommendations", methods=["GET"])
def recommendations():
    """GET /api/support/feedback/recommendations - Get improvement recommendations."""
    try:
        result = get_improvement_recommendations()
        return jsonify({"success": True, "recommendations": result}), 200
    except Exception as e:
        log.error(f"Error getting recommendations: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@support_feedback_bp.route("/items", methods=["GET"])
def items():
    """GET /api/support/feedback/items - Get feedback items."""
    try:
        limit = min(int(request.args.get("limit", 50)), 200)
        result = get_feedback_items(limit)
        return jsonify({"success": True, "items": result, "count": len(result)}), 200
    except Exception as e:
        log.error(f"Error getting feedback items: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
