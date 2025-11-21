"""
Stripe Checkout Session Creation
Creates checkout sessions for Developer Portal tier upgrades
"""
import os
from flask import Blueprint, request, jsonify

bp = Blueprint("billing_checkout", __name__, url_prefix="/api/billing")

try:
    import stripe
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False

def get_price_map():
    """Get price IDs from environment"""
    return {
        "pro": os.environ.get("STRIPE_PRICE_DEV_PRO", "").strip(),
        "enterprise": os.environ.get("STRIPE_PRICE_DEV_ENTERPRISE", "").strip(),
    }

@bp.post("/checkout")
def create_checkout_session():
    """
    Create a Stripe Checkout session for tier upgrades
    
    Request body:
    {
      "tier": "pro" | "enterprise"
    }
    
    Response:
    {
      "url": "https://checkout.stripe.com/..."
    }
    """
    if not STRIPE_AVAILABLE:
        return jsonify({"error": "stripe_not_configured"}), 500
    
    try:
        data = request.get_json() or {}
        tier = data.get("tier", "")
        
        price_map = get_price_map()
        if tier not in price_map:
            return jsonify({"error": "invalid_tier"}), 400
        
        price_id = price_map.get(tier, "")
        if not price_id:
            return jsonify({"error": "price_not_configured"}), 500
        
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
                "source": "developer_portal"
            }
        )
        
        return jsonify({
            "ok": True,
            "url": session.url,
            "session_id": session.id
        }), 200
        
    except Exception as e:
        if "stripe" in str(type(e)).lower():
            return jsonify({"error": "stripe_error", "message": str(e)}), 500
        return jsonify({"error": "internal_error", "message": str(e)}), 500
