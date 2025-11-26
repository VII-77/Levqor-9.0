"""
Tenants API Blueprint - V10 Completion
REST endpoints for tenant management, usage metering, and lifecycle.
"""
from flask import Blueprint, jsonify, request, g
import logging

from modules.tenant_usage import (
    get_usage_summary,
    set_tenant_limits,
    unblock_tenant,
    reset_usage,
    get_all_tenants_usage,
    record_workflow_run,
    record_api_call,
    record_ai_credits
)
from modules.tenant_lifecycle import (
    suspend_tenant,
    restore_tenant,
    soft_delete_tenant,
    get_tenant_status,
    is_tenant_operational,
    get_audit_log,
    get_pending_deletions,
    process_scheduled_deletions
)

log = logging.getLogger("levqor.api.tenants")

tenants_bp = Blueprint("tenants", __name__, url_prefix="/api/tenants")


@tenants_bp.route("/usage", methods=["GET"])
def get_usage():
    """GET /api/tenants/usage - Get usage for current tenant."""
    try:
        tenant_id = getattr(g, 'tenant_id', 'default')
        usage = get_usage_summary(tenant_id)
        
        return jsonify({
            "success": True,
            **usage
        }), 200
    except Exception as e:
        log.error(f"Error getting tenant usage: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/usage/<tenant_id>", methods=["GET"])
def get_tenant_usage(tenant_id: str):
    """GET /api/tenants/usage/<tenant_id> - Get usage for specific tenant (admin)."""
    try:
        usage = get_usage_summary(tenant_id)
        
        return jsonify({
            "success": True,
            **usage
        }), 200
    except Exception as e:
        log.error(f"Error getting tenant usage: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/usage/all", methods=["GET"])
def get_all_usage():
    """GET /api/tenants/usage/all - Get usage for all tenants (admin)."""
    try:
        result = get_all_tenants_usage()
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting all tenants usage: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/limits/<tenant_id>", methods=["PUT"])
def update_limits(tenant_id: str):
    """PUT /api/tenants/limits/<tenant_id> - Update tenant limits (admin)."""
    try:
        data = request.get_json() or {}
        
        result = set_tenant_limits(
            tenant_id=tenant_id,
            run_limit=data.get("run_limit"),
            api_limit=data.get("api_limit"),
            ai_credits_limit=data.get("ai_credits_limit")
        )
        
        return jsonify(result), 200
    except Exception as e:
        log.error(f"Error updating tenant limits: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/unblock/<tenant_id>", methods=["POST"])
def unblock(tenant_id: str):
    """POST /api/tenants/unblock/<tenant_id> - Unblock a tenant (admin)."""
    try:
        result = unblock_tenant(tenant_id)
        return jsonify(result), 200
    except Exception as e:
        log.error(f"Error unblocking tenant: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/reset/<tenant_id>", methods=["POST"])
def reset(tenant_id: str):
    """POST /api/tenants/reset/<tenant_id> - Reset tenant usage counters (admin)."""
    try:
        result = reset_usage(tenant_id)
        return jsonify(result), 200
    except Exception as e:
        log.error(f"Error resetting tenant usage: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/status/<tenant_id>", methods=["GET"])
def status(tenant_id: str):
    """GET /api/tenants/status/<tenant_id> - Get tenant lifecycle status."""
    try:
        result = get_tenant_status(tenant_id)
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting tenant status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/suspend/<tenant_id>", methods=["POST"])
def suspend(tenant_id: str):
    """POST /api/tenants/suspend/<tenant_id> - Suspend a tenant."""
    try:
        data = request.get_json() or {}
        reason = data.get("reason", "Manual suspension")
        
        result = suspend_tenant(tenant_id, reason)
        
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error suspending tenant: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/restore/<tenant_id>", methods=["POST"])
def restore(tenant_id: str):
    """POST /api/tenants/restore/<tenant_id> - Restore a suspended/deleted tenant."""
    try:
        result = restore_tenant(tenant_id)
        
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error restoring tenant: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/delete/<tenant_id>", methods=["DELETE"])
def delete(tenant_id: str):
    """DELETE /api/tenants/delete/<tenant_id> - Soft delete a tenant."""
    try:
        data = request.get_json() or {}
        reason = data.get("reason", "User requested")
        grace_period = data.get("grace_period_days", 30)
        
        result = soft_delete_tenant(tenant_id, reason, grace_period)
        
        status_code = 200 if result.get("success") else 400
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error deleting tenant: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/audit", methods=["GET"])
def audit():
    """GET /api/tenants/audit - Get tenant audit log."""
    try:
        tenant_id = request.args.get("tenant_id")
        limit = min(int(request.args.get("limit", 100)), 500)
        
        logs = get_audit_log(tenant_id, limit)
        
        return jsonify({
            "success": True,
            "logs": logs,
            "count": len(logs)
        }), 200
    except Exception as e:
        log.error(f"Error getting audit log: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/pending-deletions", methods=["GET"])
def pending_deletions():
    """GET /api/tenants/pending-deletions - Get tenants pending deletion."""
    try:
        pending = get_pending_deletions()
        
        return jsonify({
            "success": True,
            "pending": pending,
            "count": len(pending)
        }), 200
    except Exception as e:
        log.error(f"Error getting pending deletions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tenants_bp.route("/process-deletions", methods=["POST"])
def process_deletions():
    """POST /api/tenants/process-deletions - Process scheduled tenant deletions (admin)."""
    try:
        result = process_scheduled_deletions()
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error processing deletions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
