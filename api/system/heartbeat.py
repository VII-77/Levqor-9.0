"""
System Heartbeat Endpoint - Autopilot Wave 1
Provides continuous health monitoring for AI agents and dashboards.
Safe Mode: DRY-RUN only, no destructive actions.
"""
import os
import time
import logging
from datetime import datetime
from flask import Blueprint, jsonify
from typing import Dict, Any, Optional

log = logging.getLogger("levqor.heartbeat")

heartbeat_bp = Blueprint("heartbeat", __name__, url_prefix="/api/system")

VERSION = os.environ.get("BUILD_ID", "v10.0")
_start_time = time.time()

RECENT_ERRORS_THRESHOLD = 10
DEGRADED_ERROR_THRESHOLD = 5


def _check_db_connection() -> bool:
    """Check database connectivity with a simple query."""
    try:
        from modules.db_wrapper import execute_query
        result = execute_query("SELECT 1 as ping", fetch="one")
        if result is not None:
            ping_val = result.get("ping")
            return ping_val == 1 or str(ping_val) == "1"
        return False
    except Exception as e:
        log.warning(f"DB heartbeat check failed: {e}")
        return False


def _check_stripe_configured() -> bool:
    """Check if Stripe keys are configured (no API calls)."""
    try:
        stripe_key = os.environ.get("STRIPE_SECRET_KEY")
        publishable_key = os.environ.get("STRIPE_PUBLISHABLE_KEY") or os.environ.get("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
        return bool(stripe_key and len(stripe_key) > 10) or bool(publishable_key and len(publishable_key) > 10)
    except Exception as e:
        log.warning(f"Stripe config check failed: {e}")
        return False


def _check_brain_api_ok() -> bool:
    """Check if Brain API is importable and ready (no external calls)."""
    try:
        openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
        if not openai_key or len(openai_key) < 10:
            return False
        from api.ai import brain_builder
        return hasattr(brain_builder, 'build_workflow')
    except Exception as e:
        log.warning(f"Brain API check failed: {e}")
        return False


def _get_recent_error_count() -> int:
    """Get recent error count from telemetry (last 60 minutes)."""
    try:
        from api.telemetry.events import get_telemetry_stats
        stats = get_telemetry_stats()
        return stats.get("total_errors", 0)
    except Exception as e:
        log.debug(f"Telemetry stats unavailable: {e}")
        return 0


def _compute_status(db_ok: bool, stripe_ok: bool, brain_ok: bool, error_count: int) -> str:
    """Compute overall system status."""
    if not db_ok:
        return "error"
    if not stripe_ok:
        return "error"
    if not brain_ok:
        return "degraded"
    if error_count >= RECENT_ERRORS_THRESHOLD:
        return "degraded"
    if error_count >= DEGRADED_ERROR_THRESHOLD:
        return "degraded"
    return "ok"


def get_heartbeat_data() -> Dict[str, Any]:
    """
    Get heartbeat data - can be called internally by scheduler.
    Returns structured health data without HTTP response wrapper.
    """
    db_ok = _check_db_connection()
    stripe_ok = _check_stripe_configured()
    brain_ok = _check_brain_api_ok()
    error_count = _get_recent_error_count()
    
    status = _compute_status(db_ok, stripe_ok, brain_ok, error_count)
    
    uptime_seconds = int(time.time() - _start_time)
    
    return {
        "status": status,
        "db_ok": db_ok,
        "stripe_ok": stripe_ok,
        "brain_ok": brain_ok,
        "error_count_recent": error_count,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": VERSION,
        "uptime_seconds": uptime_seconds
    }


def run_heartbeat_check() -> Dict[str, Any]:
    """
    Run heartbeat check and log telemetry.
    Called by both HTTP endpoint and scheduler job.
    Returns heartbeat data.
    """
    data = get_heartbeat_data()
    
    try:
        from api.telemetry.events import log_event
        log_event(
            event_type="heartbeat",
            payload={
                "status": data["status"],
                "db_ok": data["db_ok"],
                "stripe_ok": data["stripe_ok"],
                "brain_ok": data["brain_ok"],
                "error_count": data["error_count_recent"]
            },
            endpoint="/api/system/heartbeat"
        )
    except Exception as e:
        log.debug(f"Telemetry logging failed (non-critical): {e}")
    
    if data["status"] != "ok":
        try:
            from api.telemetry.events import log_event
            log_event(
                event_type="heartbeat_alert",
                payload={
                    "status": data["status"],
                    "db_ok": data["db_ok"],
                    "stripe_ok": data["stripe_ok"],
                    "brain_ok": data["brain_ok"],
                    "error_count": data["error_count_recent"],
                    "alert_reason": _get_alert_reason(data)
                },
                endpoint="/api/system/heartbeat"
            )
        except Exception as e:
            log.warning(f"Heartbeat alert logging failed: {e}")
    
    return data


def _get_alert_reason(data: Dict[str, Any]) -> str:
    """Determine the reason for heartbeat alert."""
    reasons = []
    if not data.get("db_ok"):
        reasons.append("database_unreachable")
    if not data.get("stripe_ok"):
        reasons.append("stripe_not_configured")
    if not data.get("brain_ok"):
        reasons.append("brain_api_unavailable")
    if data.get("error_count_recent", 0) >= RECENT_ERRORS_THRESHOLD:
        reasons.append("high_error_rate")
    return ",".join(reasons) if reasons else "unknown"


@heartbeat_bp.route("/heartbeat", methods=["GET"])
def heartbeat():
    """
    GET /api/system/heartbeat
    
    Returns current system health status.
    Cheap to call - no expensive external API calls.
    
    Response:
    {
        "status": "ok" | "degraded" | "error",
        "db_ok": true,
        "stripe_ok": true,
        "brain_ok": true,
        "error_count_recent": 0,
        "timestamp": "2025-11-27T12:00:00Z",
        "version": "v10.0",
        "uptime_seconds": 3600
    }
    """
    try:
        data = run_heartbeat_check()
        return jsonify(data), 200
    except Exception as e:
        log.error(f"Heartbeat endpoint error: {e}")
        return jsonify({
            "status": "error",
            "error": "Failed to generate heartbeat",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@heartbeat_bp.route("/pulse", methods=["GET"])
def pulse():
    """
    GET /api/system/pulse
    
    Minimal health check - just confirms the server is running.
    Even cheaper than heartbeat.
    """
    return jsonify({
        "alive": True,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), 200
