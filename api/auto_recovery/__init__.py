"""
Auto-Recovery Worker API Blueprint - V10 Completion
REST endpoints for background recovery worker management.
"""
from flask import Blueprint, jsonify, request
import logging

from modules.auto_recovery_worker import (
    start_worker,
    stop_worker,
    get_worker_status,
    run_manual_health_check
)

log = logging.getLogger("levqor.api.auto_recovery")

auto_recovery_bp = Blueprint("auto_recovery", __name__, url_prefix="/api/auto-recovery")


@auto_recovery_bp.route("/status", methods=["GET"])
def status():
    """GET /api/auto-recovery/status - Get auto-recovery worker status."""
    try:
        result = get_worker_status()
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting worker status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@auto_recovery_bp.route("/start", methods=["POST"])
def start():
    """POST /api/auto-recovery/start - Start auto-recovery worker."""
    try:
        result = start_worker()
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error starting worker: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@auto_recovery_bp.route("/stop", methods=["POST"])
def stop():
    """POST /api/auto-recovery/stop - Stop auto-recovery worker."""
    try:
        result = stop_worker()
        return jsonify(result), 200
    except Exception as e:
        log.error(f"Error stopping worker: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@auto_recovery_bp.route("/check", methods=["POST"])
def check():
    """POST /api/auto-recovery/check - Run manual health check."""
    try:
        result = run_manual_health_check()
        status_code = 200 if result.get("success") else 500
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error running health check: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
