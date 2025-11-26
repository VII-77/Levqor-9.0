"""
Recovery API Blueprint - V10 Completion
REST endpoints for retry, recovery, and workflow healing.
"""
from flask import Blueprint, jsonify, request, g
import logging

from modules.recovery import (
    record_failure,
    attempt_retry,
    get_pending_recoveries,
    get_recovery_stats,
    process_recovery_queue,
    heal_stalled_workflows,
    RetryConfig
)

log = logging.getLogger("levqor.api.recovery")

recovery_bp = Blueprint("recovery", __name__, url_prefix="/api/recovery")


@recovery_bp.route("/status", methods=["GET"])
def get_status():
    """GET /api/recovery/status - Get recovery system status."""
    try:
        stats = get_recovery_stats()
        pending = get_pending_recoveries()
        
        return jsonify({
            "success": True,
            "stats": stats,
            "pending_count": len(pending),
            "pending": pending[:10]
        }), 200
    except Exception as e:
        log.error(f"Error getting recovery status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@recovery_bp.route("/record", methods=["POST"])
def record():
    """POST /api/recovery/record - Record a failure for recovery."""
    try:
        data = request.get_json() or {}
        
        workflow_id = data.get("workflow_id", "")
        run_id = data.get("run_id", "")
        step_id = data.get("step_id", "")
        error_type = data.get("error_type", "unknown")
        error_message = data.get("error_message", "")
        
        if not workflow_id:
            return jsonify({"success": False, "error": "workflow_id is required"}), 400
        
        event_id = record_failure(
            workflow_id=workflow_id,
            run_id=run_id,
            step_id=step_id,
            error_type=error_type,
            error_message=error_message
        )
        
        return jsonify({
            "success": True,
            "event_id": event_id
        }), 201
    except Exception as e:
        log.error(f"Error recording failure: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@recovery_bp.route("/retry/<event_id>", methods=["POST"])
def retry(event_id: str):
    """POST /api/recovery/retry/<event_id> - Attempt retry for a specific event."""
    try:
        data = request.get_json() or {}
        
        config = RetryConfig(
            max_attempts=data.get("max_attempts", 3),
            initial_delay_seconds=data.get("initial_delay", 5),
            backoff_multiplier=data.get("backoff_multiplier", 2.0)
        )
        
        result = attempt_retry(event_id, config)
        
        status_code = 200 if result.get("success") else 422
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error attempting retry: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@recovery_bp.route("/process", methods=["POST"])
def process():
    """POST /api/recovery/process - Process pending recovery queue."""
    try:
        data = request.get_json() or {}
        max_items = min(data.get("max_items", 10), 50)
        
        result = process_recovery_queue(max_items)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error processing recovery queue: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@recovery_bp.route("/heal", methods=["POST"])
def heal():
    """POST /api/recovery/heal - Heal stalled workflows."""
    try:
        data = request.get_json() or {}
        max_age_hours = data.get("max_age_hours", 24)
        
        result = heal_stalled_workflows(max_age_hours)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error healing stalled workflows: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
