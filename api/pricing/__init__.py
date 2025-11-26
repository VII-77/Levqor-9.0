"""
Regional Pricing API Blueprint - V10 Completion
REST endpoints for region-aware pricing.
"""
from flask import Blueprint, jsonify, request
import logging

from modules.region_pricing import (
    detect_region_from_ip,
    get_region_config,
    calculate_regional_price,
    get_pricing_tiers,
    get_available_regions,
    format_price_for_display
)

log = logging.getLogger("levqor.api.pricing")

regional_pricing_bp = Blueprint("regional_pricing", __name__, url_prefix="/api/pricing")


@regional_pricing_bp.route("/detect-region", methods=["GET"])
def detect_region():
    """GET /api/pricing/detect-region - Detect user's region from IP."""
    try:
        ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "127.0.0.1"
        region_code = detect_region_from_ip(ip)
        config = get_region_config(region_code)
        
        return jsonify({
            "success": True,
            "region": region_code,
            "region_name": config.name,
            "currency": config.currency,
            "currency_symbol": config.currency_symbol,
            "ppp_supported": config.supports_ppp
        }), 200
    except Exception as e:
        log.error(f"Error detecting region: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@regional_pricing_bp.route("/calculate", methods=["GET"])
def calculate():
    """GET /api/pricing/calculate - Calculate regional price."""
    try:
        base_price = float(request.args.get("price", 0))
        region = request.args.get("region", "US")
        apply_ppp = request.args.get("ppp", "true").lower() == "true"
        include_tax = request.args.get("tax", "false").lower() == "true"
        
        if base_price <= 0:
            return jsonify({"success": False, "error": "price must be positive"}), 400
        
        result = calculate_regional_price(base_price, region, apply_ppp, include_tax)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error calculating price: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@regional_pricing_bp.route("/tiers", methods=["GET"])
def tiers():
    """GET /api/pricing/tiers - Get all pricing tiers for a region."""
    try:
        region = request.args.get("region", "US")
        result = get_pricing_tiers(region)
        
        return jsonify({
            "success": True,
            **result
        }), 200
    except Exception as e:
        log.error(f"Error getting pricing tiers: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@regional_pricing_bp.route("/regions", methods=["GET"])
def regions():
    """GET /api/pricing/regions - Get all available regions."""
    try:
        result = get_available_regions()
        
        return jsonify({
            "success": True,
            "regions": result,
            "count": len(result)
        }), 200
    except Exception as e:
        log.error(f"Error getting regions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
