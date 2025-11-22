"""
Stripe Checkout Session Creation
Creates checkout sessions for Levqor tier upgrades
Uses Replit Stripe connector for automatic credential management
"""
import os
import logging
from flask import Blueprint, request, jsonify

bp = Blueprint("billing_checkout", __name__, url_prefix="/api/billing")
log = logging.getLogger("levqor.checkout")

try:
    import stripe
    from modules.stripe_connector import get_stripe_secret_key, is_stripe_configured
    STRIPE_AVAILABLE = True
except ImportError as e:
    log.error(f"Stripe SDK not available: {e}")
    STRIPE_AVAILABLE = False
    stripe = None


def ensure_stripe_configured():
    """Ensure Stripe is configured with fresh credentials from connector"""
    if not STRIPE_AVAILABLE:
        return False
    try:
        stripe.api_key = get_stripe_secret_key()
        log.debug("Stripe API key refreshed from connector")
        return True
    except Exception as e:
        log.error(f"Failed to get Stripe credentials from connector: {e}")
        return False


def get_price_map():
    """Get price IDs from environment - DFY pricing tiers (Starter £9, Launch £29, Growth £59, Agency £149)"""
    return {
        # DFY Core Tiers (GBP pricing)
        "starter": os.environ.get("STRIPE_PRICE_STARTER", "").strip(),
        "starter_year": os.environ.get("STRIPE_PRICE_STARTER_YEAR", "").strip(),
        "launch": os.environ.get("STRIPE_PRICE_LAUNCH", "").strip(),
        "launch_year": os.environ.get("STRIPE_PRICE_LAUNCH_YEAR", "").strip(),
        "growth": os.environ.get("STRIPE_PRICE_GROWTH", "").strip(),
        "growth_year": os.environ.get("STRIPE_PRICE_GROWTH_YEAR", "").strip(),
        "agency": os.environ.get("STRIPE_PRICE_AGENCY", "").strip(),
        "agency_year": os.environ.get("STRIPE_PRICE_AGENCY_YEAR", "").strip(),
        # Legacy tier aliases (backward compatibility)
        "scale": os.environ.get("STRIPE_PRICE_SCALE", os.environ.get("STRIPE_PRICE_GROWTH", "")).strip(),
        "scale_year": os.environ.get("STRIPE_PRICE_SCALE_YEAR", os.environ.get("STRIPE_PRICE_GROWTH_YEAR", "")).strip(),
        "business": os.environ.get("STRIPE_PRICE_BUSINESS", os.environ.get("STRIPE_PRICE_AGENCY", "")).strip(),
        "business_year": os.environ.get("STRIPE_PRICE_BUSINESS_YEAR", os.environ.get("STRIPE_PRICE_AGENCY_YEAR", "")).strip(),
        # One-time DFY packages (if needed)
        "dfy_starter": os.environ.get("STRIPE_PRICE_DFY_STARTER", "").strip(),
        "dfy_professional": os.environ.get("STRIPE_PRICE_DFY_PROFESSIONAL", "").strip(),
        "dfy_enterprise": os.environ.get("STRIPE_PRICE_DFY_ENTERPRISE", "").strip(),
        # Add-ons
        "addon_priority_support": os.environ.get("STRIPE_PRICE_ADDON_PRIORITY_SUPPORT", "").strip(),
        "addon_sla_99_9": os.environ.get("STRIPE_PRICE_ADDON_SLA_99_9", "").strip(),
        "addon_white_label": os.environ.get("STRIPE_PRICE_ADDON_WHITE_LABEL", "").strip(),
    }


@bp.get("/health")
def billing_health():
    """Health check endpoint - verify LIVE billing configuration"""
    if not ensure_stripe_configured():
        return jsonify({"status": "failed", "error": "stripe_not_configured"}), 500
    
    price_map = get_price_map()
    required_prices = [
        "starter", "starter_year", "launch", "launch_year",
        "growth", "growth_year", "agency", "agency_year"
    ]
    
    missing_prices = [p for p in required_prices if not price_map.get(p)]
    
    if missing_prices:
        return jsonify({
            "status": "failed",
            "error": f"Missing price IDs: {', '.join(missing_prices)}"
        }), 500
    
    return jsonify({
        "status": "ok",
        "stripe_configured": True,
        "prices_configured": len([p for p in required_prices if price_map.get(p)]),
        "all_required_prices": len(required_prices),
        "tiers": {
            "starter": f"{price_map['starter']} (month), {price_map['starter_year']} (year)",
            "launch": f"{price_map['launch']} (month), {price_map['launch_year']} (year)",
            "growth": f"{price_map['growth']} (month), {price_map['growth_year']} (year)",
            "agency": f"{price_map['agency']} (month), {price_map['agency_year']} (year)"
        }
    }), 200


@bp.post("/checkout")
def create_checkout_session():
    """
    Create a Stripe Checkout session for tier upgrades
    
    DFY Pricing Tiers (GBP):
    - starter: £9/month, £90/year
    - launch: £29/month, £290/year
    - growth: £59/month, £590/year
    - agency: £149/month, £1490/year
    
    Request body:
    {
      "tier": "starter" | "launch" | "growth" | "agency",
      "billing_interval": "month" | "year" (optional, defaults to month)
    }
    
    Response:
    {
      "ok": true,
      "url": "https://checkout.stripe.com/...",
      "session_id": "cs_..."
    }
    """
    if not ensure_stripe_configured():
        log.error("Stripe not configured")
        return jsonify({"error": "stripe_not_configured"}), 500
    
    try:
        data = request.get_json() or {}
        tier = data.get("tier", "").lower().strip()
        billing_interval = data.get("billing_interval", "month").lower().strip()
        
        # Support both "tier" and "tier_year" formats
        if billing_interval == "year":
            price_key = f"{tier}_year"
        else:
            price_key = tier
        
        price_map = get_price_map()
        
        # Validate tier exists
        if price_key not in price_map:
            log.warning(f"Invalid tier requested: {price_key}")
            return jsonify({
                "error": "invalid_tier",
                "available_tiers": list(price_map.keys())
            }), 400
        
        price_id = price_map.get(price_key, "").strip()
        
        # Validate price ID is configured
        if not price_id:
            log.error(f"Price ID not configured for tier: {price_key}")
            return jsonify({
                "error": "price_not_configured",
                "tier": price_key
            }), 500
        
        # Get success/cancel URLs from env or use defaults
        site_url = os.environ.get("SITE_URL", "https://levqor.ai").strip()
        success_url = os.environ.get(
            "CHECKOUT_SUCCESS_URL",
            f"{site_url}/developer/keys?success=1"
        )
        cancel_url = os.environ.get(
            "CHECKOUT_CANCEL_URL",
            f"{site_url}/developer?canceled=1"
        )
        
        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            allow_promotion_codes=True,
            billing_address_collection="auto",
            metadata={
                "tier": tier,
                "billing_interval": billing_interval,
                "source": "developer_portal"
            }
        )
        
        log.info(f"Created checkout session for tier={tier}, interval={billing_interval}")
        
        return jsonify({
            "ok": True,
            "url": session.url,
            "session_id": session.id
        }), 200
        
    except stripe.error.InvalidRequestError as e:
        log.error(f"Stripe InvalidRequestError: {e}")
        return jsonify({"error": str(e)}), 400
    except stripe.error.AuthenticationError as e:
        log.error(f"Stripe authentication failed: {e}")
        return jsonify({"error": "stripe_auth_failed"}), 401
    except Exception as e:
        log.error(f"Checkout error: {e}", exc_info=True)
        return jsonify({"error": "checkout_failed", "message": str(e)}), 500
