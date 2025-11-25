"""
User Data Routes - MEGA PHASE Legal-0
Endpoints for data export and deletion (Class C operations).
"""
import logging
from flask import jsonify, request, g
from . import me_bp
from modules.compliance import export_user_data, get_exportable_data_summary
from modules.compliance.delete_utils import schedule_deletion
from modules.approvals import enqueue_action

log = logging.getLogger("levqor.api.me")


def _get_current_user():
    """Get current authenticated user from request context."""
    if hasattr(g, 'user_id') and g.user_id:
        return g.user_id
    
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
        return token[:36] if len(token) >= 36 else None
    
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return user_id
    
    return None


def _get_tenant_id():
    """Get current tenant ID from request context."""
    if hasattr(g, 'tenant_id') and g.tenant_id:
        return g.tenant_id
    return request.headers.get('X-Tenant-ID', 'default')


@me_bp.route('/export-data', methods=['GET'])
def api_export_data():
    """
    GET /api/me/export-data
    
    Request a data export bundle (GDPR/CCPA right to access).
    This is a Class C operation that may require approval for bulk exports.
    
    For immediate small exports, returns data directly.
    For large exports, enqueues an approval request.
    """
    user_id = _get_current_user()
    if not user_id:
        return jsonify({
            "error": "Authentication required",
            "message": "Please sign in to export your data."
        }), 401
    
    tenant_id = _get_tenant_id()
    
    try:
        summary = get_exportable_data_summary(user_id, tenant_id)
        total_items = sum(summary.values())
        
        if total_items > 10000:
            action_id = enqueue_action(
                action_type="export_data",
                payload={
                    "user_id": user_id,
                    "tenant_id": tenant_id,
                    "summary": summary,
                    "format": "json"
                },
                reason=f"Large data export request ({total_items} items)",
                impact_level="C",
                tenant_id=tenant_id,
                owner_id=user_id
            )
            
            log.info(f"Large export queued for user {user_id[:8]}***, action_id: {action_id}")
            
            return jsonify({
                "status": "queued",
                "action_id": action_id,
                "summary": summary,
                "message": "Your data export request has been queued for processing. You will receive a notification when it's ready."
            }), 202
        
        export_data = export_user_data(user_id, tenant_id)
        
        log.info(f"Immediate export completed for user {user_id[:8]}***")
        
        return jsonify({
            "status": "complete",
            "data": export_data
        }), 200
        
    except Exception as e:
        log.error(f"Export error for user {user_id[:8]}***: {e}")
        return jsonify({
            "error": "Export failed",
            "message": "Unable to export data. Please try again or contact support."
        }), 500


@me_bp.route('/export-summary', methods=['GET'])
def api_export_summary():
    """
    GET /api/me/export-summary
    
    Get a summary of exportable data without triggering the full export.
    Useful for showing users what data they have before requesting export.
    """
    user_id = _get_current_user()
    if not user_id:
        return jsonify({
            "error": "Authentication required"
        }), 401
    
    tenant_id = _get_tenant_id()
    
    try:
        summary = get_exportable_data_summary(user_id, tenant_id)
        return jsonify({
            "user_id": user_id,
            "tenant_id": tenant_id,
            "data_summary": summary,
            "total_items": sum(summary.values())
        }), 200
    except Exception as e:
        log.error(f"Summary error: {e}")
        return jsonify({
            "error": "Failed to get summary"
        }), 500


@me_bp.route('/delete-data', methods=['POST'])
def api_delete_data():
    """
    POST /api/me/delete-data
    
    Request account and data deletion (GDPR/CCPA right to erasure).
    This is a Class C operation that always requires approval.
    
    Request body (optional):
    {
        "scope": ["account", "workflows", "activity"],  // default: all
        "confirm": true  // required
    }
    """
    user_id = _get_current_user()
    if not user_id:
        return jsonify({
            "error": "Authentication required",
            "message": "Please sign in to delete your data."
        }), 401
    
    tenant_id = _get_tenant_id()
    
    try:
        body = request.get_json() or {}
    except Exception:
        body = {}
    
    if not body.get("confirm"):
        return jsonify({
            "error": "Confirmation required",
            "message": "Please set 'confirm': true in the request body to proceed with deletion.",
            "warning": "This action will permanently delete your account and all associated data."
        }), 400
    
    scope = body.get("scope", ["account", "workflows", "activity"])
    valid_scopes = ["account", "workflows", "activity", "billing"]
    scope = [s for s in scope if s in valid_scopes]
    
    try:
        result = schedule_deletion(
            user_id=user_id,
            tenant_id=tenant_id,
            grace_period_days=30
        )
        
        if result.get("status") == "scheduled":
            log.info(f"Deletion scheduled for user {user_id[:8]}***")
            return jsonify({
                "status": "scheduled",
                "action_id": result.get("action_id"),
                "grace_period_days": 30,
                "scope": scope,
                "message": "Your deletion request has been scheduled. You have 30 days to cancel this request. After that, your data will be permanently removed."
            }), 202
        else:
            return jsonify({
                "status": "error",
                "message": result.get("message", "Failed to schedule deletion.")
            }), 500
            
    except Exception as e:
        log.error(f"Delete error for user {user_id[:8]}***: {e}")
        return jsonify({
            "error": "Deletion request failed",
            "message": "Unable to process deletion request. Please contact support."
        }), 500


@me_bp.route('/delete-data/cancel', methods=['POST'])
def api_cancel_deletion():
    """
    POST /api/me/delete-data/cancel
    
    Cancel a pending deletion request during the grace period.
    """
    user_id = _get_current_user()
    if not user_id:
        return jsonify({
            "error": "Authentication required"
        }), 401
    
    from modules.approvals import list_pending_actions, reject_action
    
    try:
        pending = list_pending_actions(
            tenant_id=_get_tenant_id()
        )
        
        user_deletions = [
            a for a in pending
            if a.get("action_type") == "delete_data" and a.get("payload", {}).get("user_id") == user_id
        ]
        
        if not user_deletions:
            return jsonify({
                "status": "not_found",
                "message": "No pending deletion request found."
            }), 404
        
        for action in user_deletions:
            reject_action(
                action["id"],
                processed_by="user",
                reason="Cancelled by user"
            )
        
        log.info(f"Deletion cancelled for user {user_id[:8]}***")
        
        return jsonify({
            "status": "cancelled",
            "message": "Your deletion request has been cancelled. Your account and data will be preserved."
        }), 200
        
    except Exception as e:
        log.error(f"Cancel deletion error: {e}")
        return jsonify({
            "error": "Failed to cancel deletion"
        }), 500
