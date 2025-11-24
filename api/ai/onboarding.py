"""
AI Onboarding Assistant Endpoint - Interactive user guidance
Currently uses pattern matching; designed for easy OpenAI integration
"""
from flask import Blueprint, request, jsonify
import logging

bp = Blueprint("ai_onboarding", __name__, url_prefix="/api/ai/onboarding")
log = logging.getLogger("levqor.ai.onboarding")


@bp.post("/next-step")
def get_next_step():
    """
    Get next onboarding step based on user progress
    
    Request: { "current_step": string, "context": { progress?, userTier?, ... } }
    Response: { "success": boolean, "step": object, "meta": object }
    """
    from api.metrics.app import increment_ai_request, increment_error
    
    increment_ai_request()
    
    try:
        data = request.get_json()
        
        if not data or "current_step" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: current_step"
            }), 400
        
        current_step = data.get("current_step", "").strip()
        context = data.get("context", {})
        
        log.info(f"AI onboarding request: current_step={current_step}")
        
        next_step = _get_next_onboarding_step(current_step, context)
        
        return jsonify({
            "success": True,
            "step": next_step,
            "meta": {
                "pattern_based": True
            }
        }), 200
        
    except Exception as e:
        from api.metrics.app import increment_error
        increment_error()
        log.error(f"AI onboarding error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _get_next_onboarding_step(current_step: str, context: dict) -> dict:
    """
    Pattern-based onboarding flow
    TODO: Replace with OpenAI API call for personalized guidance
    """
    onboarding_flow = {
        "welcome": {
            "id": "profile-setup",
            "title": "Set Up Your Profile",
            "description": "Let's personalize your Levqor experience",
            "action": "Complete your profile in Settings",
            "estimated_time": "2 minutes",
            "tips": [
                "Add your company name for team collaboration",
                "Set your timezone for accurate scheduling",
                "Choose notification preferences"
            ]
        },
        "profile-setup": {
            "id": "first-workflow",
            "title": "Create Your First Workflow",
            "description": "Experience the power of automation",
            "action": "Use the Natural Language Builder to create a workflow",
            "estimated_time": "5 minutes",
            "tips": [
                "Start simple - try a basic backup workflow",
                "Use plain English to describe what you want",
                "Test your workflow in preview mode first"
            ]
        },
        "first-workflow": {
            "id": "explore-features",
            "title": "Explore Key Features",
            "description": "Discover what Levqor can do for you",
            "action": "Tour the Dashboard sections",
            "estimated_time": "10 minutes",
            "tips": [
                "Check the Workflows tab for templates",
                "Review Usage metrics to track your progress",
                "Explore AI Assistant for contextual help"
            ]
        },
        "explore-features": {
            "id": "invite-team",
            "title": "Invite Your Team",
            "description": "Collaborate with teammates (Business+ plans)",
            "action": "Send invitations from Team Settings",
            "estimated_time": "3 minutes",
            "tips": [
                "Assign roles based on responsibilities",
                "Share your first workflow as a demo",
                "Set up team notification preferences"
            ]
        },
        "invite-team": {
            "id": "optimize-plan",
            "title": "Optimize Your Plan",
            "description": "Ensure you're on the right tier",
            "action": "Review your usage and upgrade if needed",
            "estimated_time": "5 minutes",
            "tips": [
                "Check your monthly run usage",
                "Compare plan limits with your needs",
                "Consider annual billing for 20% savings"
            ]
        },
        "optimize-plan": {
            "id": "completed",
            "title": "Onboarding Complete!",
            "description": "You're all set to use Levqor",
            "action": "Start building powerful workflows",
            "estimated_time": "Ongoing",
            "tips": [
                "Explore our Knowledge Base for advanced tips",
                "Join our community forum for best practices",
                "Contact support anytime you need help"
            ]
        }
    }
    
    next_step = onboarding_flow.get(current_step, onboarding_flow["welcome"])
    
    return next_step
