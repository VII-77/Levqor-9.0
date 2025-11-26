"""
Growth Loops API Blueprint - V10 Completion
REST endpoints for sharing, virality, referrals.
"""
from flask import Blueprint, jsonify, request, g
import logging

from modules.growth_loops import (
    create_share_link,
    record_share_click,
    record_share_conversion,
    copy_as_template,
    get_share_stats,
    get_template_copy_stats,
    get_viral_coefficient,
    get_growth_leaderboard
)

log = logging.getLogger("levqor.api.growth")

growth_loops_bp = Blueprint("growth_loops", __name__, url_prefix="/api/growth")


@growth_loops_bp.route("/share", methods=["POST"])
def share():
    """POST /api/growth/share - Create a share link for a workflow."""
    try:
        data = request.get_json() or {}
        
        workflow_id = data.get("workflow_id", "")
        share_type = data.get("share_type", "link")
        user_id = getattr(g, 'user_id', 'anonymous')
        
        if not workflow_id:
            return jsonify({"success": False, "error": "workflow_id is required"}), 400
        
        result = create_share_link(workflow_id, user_id, share_type)
        
        return jsonify(result), 201
    except Exception as e:
        log.error(f"Error creating share link: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/share/<share_id>/click", methods=["POST"])
def click(share_id: str):
    """POST /api/growth/share/<share_id>/click - Record a share click."""
    try:
        result = record_share_click(share_id)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error recording click: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/share/<share_id>/convert", methods=["POST"])
def convert(share_id: str):
    """POST /api/growth/share/<share_id>/convert - Record a share conversion."""
    try:
        result = record_share_conversion(share_id)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error recording conversion: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/copy-template", methods=["POST"])
def copy_template():
    """POST /api/growth/copy-template - Copy a workflow as a template."""
    try:
        data = request.get_json() or {}
        
        workflow_id = data.get("workflow_id", "")
        template_name = data.get("template_name", "")
        source_owner = data.get("source_owner", "")
        copied_by = getattr(g, 'user_id', 'anonymous')
        
        if not workflow_id or not template_name:
            return jsonify({"success": False, "error": "workflow_id and template_name are required"}), 400
        
        result = copy_as_template(workflow_id, source_owner, copied_by, template_name)
        
        return jsonify(result), 201
    except Exception as e:
        log.error(f"Error copying template: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/stats", methods=["GET"])
def stats():
    """GET /api/growth/stats - Get share statistics."""
    try:
        user_id = request.args.get("user_id")
        result = get_share_stats(user_id)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting share stats: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/template-stats", methods=["GET"])
def template_stats():
    """GET /api/growth/template-stats - Get template copy statistics."""
    try:
        result = get_template_copy_stats()
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting template stats: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/viral-coefficient", methods=["GET"])
def viral_coefficient():
    """GET /api/growth/viral-coefficient - Get viral coefficient (K-factor)."""
    try:
        result = get_viral_coefficient()
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting viral coefficient: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@growth_loops_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    """GET /api/growth/leaderboard - Get growth leaderboard."""
    try:
        limit = min(int(request.args.get("limit", 10)), 50)
        result = get_growth_leaderboard(limit)
        
        return jsonify({
            "success": True,
            "leaderboard": result,
            "count": len(result)
        }), 200
    except Exception as e:
        log.error(f"Error getting leaderboard: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
