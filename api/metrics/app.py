"""
Application Metrics Endpoint
Provides lightweight observability without external SaaS dependencies
"""
from flask import Blueprint, jsonify
from time import time
import logging

bp = Blueprint("app_metrics", __name__, url_prefix="/api/metrics")
log = logging.getLogger("levqor.metrics")

# In-memory counters (production would use Redis or similar)
# MEGA-PHASE 5: Extended with GTM Engine metrics
# MEGA-PHASE 8: Extended with OpenAI-specific metrics
_metrics_store = {
    "ai_requests_total": 0,
    "ai_requests_last_5m": 0,
    "errors_total": 0,
    "errors_last_5m": 0,
    "ai_openai_calls_total": 0,
    "ai_openai_errors_total": 0,
    "ai_openai_calls_last_5m": 0,
    "ai_openai_errors_last_5m": 0,
    "consultations_booked": 0,
    "consultations_run": 0,
    "support_auto_requests": 0,
    "support_auto_escalations": 0,
    "lifecycle_ticks": 0,
    "pricing_cta_clicks": 0,
    "trial_feedback_submissions": 0,
    "last_reset": time(),
}

START_TIME = time()


def increment_ai_request():
    """Increment AI request counter"""
    _metrics_store["ai_requests_total"] += 1
    _metrics_store["ai_requests_last_5m"] += 1


def increment_error():
    """Increment error counter"""
    _metrics_store["errors_total"] += 1
    _metrics_store["errors_last_5m"] += 1


# MEGA-PHASE 5: GTM Engine metric incrementers
def increment_consultation_booked():
    """Increment consultation booking counter"""
    _metrics_store["consultations_booked"] += 1


def increment_consultation_run():
    """Increment consultation run counter"""
    _metrics_store["consultations_run"] += 1


def increment_support_auto_request():
    """Increment AI support automation request counter"""
    _metrics_store["support_auto_requests"] += 1


def increment_support_auto_escalation():
    """Increment AI support escalation counter"""
    _metrics_store["support_auto_escalations"] += 1


def increment_lifecycle_tick():
    """Increment lifecycle engine tick counter"""
    _metrics_store["lifecycle_ticks"] += 1


def increment_pricing_cta_click():
    """Increment pricing CTA click counter"""
    _metrics_store["pricing_cta_clicks"] += 1


def increment_trial_feedback():
    """Increment trial feedback submission counter"""
    _metrics_store["trial_feedback_submissions"] += 1


# MEGA-PHASE 8: OpenAI-specific metric incrementers
def increment_openai_call():
    """Increment OpenAI API call counter"""
    _metrics_store["ai_openai_calls_total"] += 1
    _metrics_store["ai_openai_calls_last_5m"] += 1


def increment_openai_error():
    """Increment OpenAI error counter"""
    _metrics_store["ai_openai_errors_total"] += 1
    _metrics_store["ai_openai_errors_last_5m"] += 1


def reset_5min_counters():
    """Reset 5-minute rolling counters"""
    current_time = time()
    if current_time - _metrics_store["last_reset"] >= 300:  # 5 minutes
        _metrics_store["ai_requests_last_5m"] = 0
        _metrics_store["errors_last_5m"] = 0
        _metrics_store["ai_openai_calls_last_5m"] = 0
        _metrics_store["ai_openai_errors_last_5m"] = 0
        _metrics_store["last_reset"] = current_time


@bp.get("/app")
def get_app_metrics():
    """
    Get application metrics
    
    Returns lightweight metrics for observability:
    - Uptime
    - AI request counts
    - Error counts
    - Status
    """
    reset_5min_counters()
    
    uptime_seconds = int(time() - START_TIME)
    
    return jsonify({
        "status": "ok",
        "uptime_seconds": uptime_seconds,
        "ai_requests_last_5m": _metrics_store["ai_requests_last_5m"],
        "ai_requests_total": _metrics_store["ai_requests_total"],
        "errors_last_5m": _metrics_store["errors_last_5m"],
        "errors_total": _metrics_store["errors_total"],
        "ai_openai_calls_last_5m": _metrics_store["ai_openai_calls_last_5m"],
        "ai_openai_calls_total": _metrics_store["ai_openai_calls_total"],
        "ai_openai_errors_last_5m": _metrics_store["ai_openai_errors_last_5m"],
        "ai_openai_errors_total": _metrics_store["ai_openai_errors_total"],
        "business_metrics": {
            "consultations_booked": _metrics_store["consultations_booked"],
            "consultations_run": _metrics_store["consultations_run"],
            "support_auto_requests": _metrics_store["support_auto_requests"],
            "support_auto_escalations": _metrics_store["support_auto_escalations"],
            "lifecycle_ticks": _metrics_store["lifecycle_ticks"],
            "pricing_cta_clicks": _metrics_store["pricing_cta_clicks"],
            "trial_feedback_submissions": _metrics_store["trial_feedback_submissions"]
        },
        "metrics_type": "in_memory",
        "note": "Production should use persistent metrics store (Redis/TimescaleDB)"
    }), 200
