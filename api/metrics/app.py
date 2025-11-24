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
_metrics_store = {
    "ai_requests_total": 0,
    "ai_requests_last_5m": 0,
    "errors_total": 0,
    "errors_last_5m": 0,
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


def reset_5min_counters():
    """Reset 5-minute rolling counters"""
    current_time = time()
    if current_time - _metrics_store["last_reset"] >= 300:  # 5 minutes
        _metrics_store["ai_requests_last_5m"] = 0
        _metrics_store["errors_last_5m"] = 0
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
        "metrics_type": "in_memory",
        "note": "Production should use persistent metrics store (Redis/TimescaleDB)"
    }), 200
