"""
Growth Summary Metrics - HYPERGROWTH CYCLE 7
Read-only API that aggregates existing app metrics into growth summary
"""
from flask import Blueprint, jsonify
from datetime import datetime
import logging

log = logging.getLogger("levqor.metrics.growth")

growth_metrics_bp = Blueprint("growth_metrics", __name__, url_prefix="/api/metrics")


def get_metrics_store():
    """Import metrics store from app.py to avoid circular imports"""
    from api.metrics.app import _metrics_store
    return _metrics_store


def calculate_growth_stage(consultations, referrals, pricing_clicks):
    """
    Simple deterministic growth stage classification
    
    Args:
        consultations: Total consultations booked
        referrals: Total referrals created
        pricing_clicks: Total pricing CTA clicks
    
    Returns:
        tuple: (stage, notes)
    """
    combined_activity = consultations + referrals + pricing_clicks
    
    if combined_activity < 10:
        return "early", "Platform in early adoption phase with initial user activity"
    elif combined_activity < 50:
        return "growing", "Steady growth with increasing user engagement"
    else:
        return "hot", "Strong growth momentum across all channels"


@growth_metrics_bp.route('/growth-summary', methods=['GET'])
def get_growth_summary():
    """
    Get aggregated growth summary metrics
    
    Returns comprehensive growth KPIs aggregated from existing metrics:
    - AI requests and consultations
    - Referral and community activity
    - Lifecycle and conversion metrics
    - Growth stage classification
    
    All metrics default to 0 if not available (graceful degradation).
    """
    try:
        metrics = get_metrics_store()
        
        # Safely extract metrics with defaults
        ai_requests = metrics.get("ai_requests_total", 0)
        ai_errors = metrics.get("errors_total", 0)
        consultations_booked = metrics.get("consultations_booked", 0)
        consultations_run = metrics.get("consultations_run", 0)
        referrals_created = metrics.get("referrals_created", 0)
        support_requests = metrics.get("support_auto_requests", 0)
        lifecycle_ticks = metrics.get("lifecycle_ticks", 0)
        pricing_cta_clicks = metrics.get("pricing_cta_clicks", 0)
        trial_feedback = metrics.get("trial_feedback_submissions", 0)
        
        # Calculate growth stage
        growth_stage, notes = calculate_growth_stage(
            consultations_booked,
            referrals_created,
            pricing_cta_clicks
        )
        
        # Compose response
        response = {
            "status": "ok",
            "kpis": {
                "ai_requests": ai_requests,
                "ai_errors": ai_errors,
                "consultations_booked": consultations_booked,
                "consultations_run": consultations_run,
                "referrals_created": referrals_created,
                "support_requests": support_requests,
                "workflows_templates": 50,  # Static count from workflow library
                "lifecycle_ticks": lifecycle_ticks,
                "pricing_cta_clicks": pricing_cta_clicks,
                "trial_feedback": trial_feedback
            },
            "summary": {
                "growth_stage": growth_stage,
                "notes": notes
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Log summary for observability
        log.info(
            f"GROWTH_SUMMARY: stage={growth_stage} "
            f"ai_requests={ai_requests} consultations={consultations_booked} "
            f"referrals={referrals_created} pricing_clicks={pricing_cta_clicks}"
        )
        
        return jsonify(response), 200
        
    except Exception as e:
        log.error(f"Error generating growth summary: {e}")
        # Graceful degradation: return safe default response
        return jsonify({
            "status": "ok",
            "kpis": {
                "ai_requests": 0,
                "ai_errors": 0,
                "consultations_booked": 0,
                "consultations_run": 0,
                "referrals_created": 0,
                "support_requests": 0,
                "workflows_templates": 50,
                "lifecycle_ticks": 0,
                "pricing_cta_clicks": 0,
                "trial_feedback": 0
            },
            "summary": {
                "growth_stage": "early",
                "notes": "Growth metrics temporarily unavailable, using defaults"
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
