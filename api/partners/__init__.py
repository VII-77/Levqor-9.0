"""
Partner Ecosystem API Blueprint - V10 Completion
REST endpoints for partner management.
"""
from flask import Blueprint, jsonify, request
import logging

from modules.partner_ecosystem import (
    register_partner,
    approve_partner,
    record_referral,
    record_conversion,
    get_partner_dashboard,
    get_all_partners
)

log = logging.getLogger("levqor.api.partners")

partners_bp = Blueprint("partners_v2", __name__, url_prefix="/api/partners")


@partners_bp.route("/register", methods=["POST"])
def register():
    """POST /api/partners/register - Register a new partner."""
    try:
        data = request.get_json() or {}
        
        company_name = data.get("company_name", "")
        contact_email = data.get("contact_email", "")
        tier = data.get("tier", "affiliate")
        
        if not company_name or not contact_email:
            return jsonify({"success": False, "error": "company_name and contact_email are required"}), 400
        
        result = register_partner(company_name, contact_email, tier)
        
        return jsonify(result), 201
    except Exception as e:
        log.error(f"Error registering partner: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@partners_bp.route("/<partner_id>/approve", methods=["POST"])
def approve(partner_id: str):
    """POST /api/partners/<partner_id>/approve - Approve a partner."""
    try:
        result = approve_partner(partner_id)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error approving partner: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@partners_bp.route("/<partner_id>/referral", methods=["POST"])
def referral(partner_id: str):
    """POST /api/partners/<partner_id>/referral - Record a partner referral."""
    try:
        data = request.get_json() or {}
        referred_user_id = data.get("referred_user_id", "")
        
        if not referred_user_id:
            return jsonify({"success": False, "error": "referred_user_id is required"}), 400
        
        result = record_referral(partner_id, referred_user_id)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error recording referral: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@partners_bp.route("/referral/<referral_id>/convert", methods=["POST"])
def convert(referral_id: str):
    """POST /api/partners/referral/<referral_id>/convert - Record referral conversion."""
    try:
        data = request.get_json() or {}
        revenue = float(data.get("revenue", 0))
        
        result = record_conversion(referral_id, revenue)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error recording conversion: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@partners_bp.route("/<partner_id>/dashboard", methods=["GET"])
def dashboard(partner_id: str):
    """GET /api/partners/<partner_id>/dashboard - Get partner dashboard."""
    try:
        result = get_partner_dashboard(partner_id)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        log.error(f"Error getting partner dashboard: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@partners_bp.route("/", methods=["GET"])
def list_partners():
    """GET /api/partners/ - List all partners (admin)."""
    try:
        status = request.args.get("status")
        result = get_all_partners(status)
        
        return jsonify({
            "success": True,
            "partners": result,
            "count": len(result)
        }), 200
    except Exception as e:
        log.error(f"Error listing partners: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
