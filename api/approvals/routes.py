"""
Approvals API Routes - MEGA PHASE v17
Endpoints for viewing and managing the approval queue
"""
import logging
from flask import jsonify, request, g
from . import approvals_bp

from modules.approvals import (
    list_pending_actions,
    approve_action,
    reject_action,
    get_action_by_id
)
from modules.approvals.queue import get_approval_stats
from modules.workflows.models import Workflow, WorkflowStep
from modules.workflows.storage import create_workflow

log = logging.getLogger("levqor.approvals.api")


@approvals_bp.route('', methods=['GET'])
def api_list_approvals():
    """
    GET /api/approvals - List pending approval actions (owner/admin only).
    Query params: tenant_id, limit
    """
    try:
        tenant_id = request.args.get('tenant_id') or getattr(g, 'tenant_id', None)
        limit = min(int(request.args.get('limit', 50)), 200)
        
        actions = list_pending_actions(tenant_id=tenant_id, limit=limit)
        stats = get_approval_stats(tenant_id=tenant_id)
        
        return jsonify({
            "actions": actions,
            "total": len(actions),
            "stats": stats
        }), 200
        
    except Exception as e:
        log.error(f"Error listing approvals: {e}")
        return jsonify({"error": "Failed to list approvals"}), 500


@approvals_bp.route('/<action_id>', methods=['GET'])
def api_get_approval(action_id: str):
    """
    GET /api/approvals/<id> - Get a specific approval action.
    """
    try:
        action = get_action_by_id(action_id)
        
        if not action:
            return jsonify({"error": "Approval action not found"}), 404
        
        return jsonify(action), 200
        
    except Exception as e:
        log.error(f"Error getting approval {action_id}: {e}")
        return jsonify({"error": "Failed to get approval"}), 500


@approvals_bp.route('/<action_id>/approve', methods=['POST'])
def api_approve_action(action_id: str):
    """
    POST /api/approvals/<id>/approve - Approve an action.
    
    For 'create_workflow' actions, this will create the workflow.
    """
    try:
        action = get_action_by_id(action_id)
        
        if not action:
            return jsonify({"error": "Approval action not found"}), 404
        
        if action.get('status') != 'pending':
            return jsonify({"error": "Action is not pending"}), 400
        
        processed_by = request.headers.get('X-User-Id', 'admin')
        
        success = approve_action(action_id, processed_by=processed_by)
        
        if not success:
            return jsonify({"error": "Failed to approve action"}), 500
        
        result = {"message": "Action approved"}
        
        if action.get('action_type') == 'create_workflow':
            try:
                workflow_data = action.get('payload', {})
                steps = [WorkflowStep.from_dict(s) for s in workflow_data.get('steps', [])]
                
                workflow = Workflow(
                    id=workflow_data.get('id', ''),
                    name=workflow_data.get('name', 'Untitled'),
                    description=workflow_data.get('description', ''),
                    steps=steps,
                    owner_id=action.get('owner_id', ''),
                    tenant_id=action.get('tenant_id', 'default'),
                    is_active=False
                )
                
                workflow_id = create_workflow(workflow)
                result["workflow_id"] = workflow_id
                result["message"] = "Action approved and workflow created"
                
            except Exception as e:
                log.error(f"Error creating workflow after approval: {e}")
                result["workflow_error"] = str(e)
        
        log.info(f"Action approved: {action_id}")
        
        return jsonify(result), 200
        
    except Exception as e:
        log.error(f"Error approving action {action_id}: {e}")
        return jsonify({"error": "Failed to approve action"}), 500


@approvals_bp.route('/<action_id>/reject', methods=['POST'])
def api_reject_action(action_id: str):
    """
    POST /api/approvals/<id>/reject - Reject an action.
    Body: { reason? }
    """
    try:
        action = get_action_by_id(action_id)
        
        if not action:
            return jsonify({"error": "Approval action not found"}), 404
        
        if action.get('status') != 'pending':
            return jsonify({"error": "Action is not pending"}), 400
        
        data = request.get_json() or {}
        reason = data.get('reason', '')
        processed_by = request.headers.get('X-User-Id', 'admin')
        
        success = reject_action(action_id, processed_by=processed_by, reason=reason)
        
        if success:
            log.info(f"Action rejected: {action_id}")
            return jsonify({"message": "Action rejected"}), 200
        else:
            return jsonify({"error": "Failed to reject action"}), 500
        
    except Exception as e:
        log.error(f"Error rejecting action {action_id}: {e}")
        return jsonify({"error": "Failed to reject action"}), 500


@approvals_bp.route('/stats', methods=['GET'])
def api_get_approval_stats():
    """
    GET /api/approvals/stats - Get approval queue statistics.
    """
    try:
        tenant_id = request.args.get('tenant_id') or getattr(g, 'tenant_id', None)
        stats = get_approval_stats(tenant_id=tenant_id)
        
        return jsonify(stats), 200
        
    except Exception as e:
        log.error(f"Error getting approval stats: {e}")
        return jsonify({"error": "Failed to get stats"}), 500
