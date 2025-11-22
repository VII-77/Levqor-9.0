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


def _clean_price_id(price_id: str) -> str:
    """Clean price ID by removing any text after the actual ID"""
    if not price_id:
        return ""
    price_id = price_id.strip()
    if " " in price_id:
        price_id = price_id.split()[0]
    return price_id


def get_price_map():
    """Get price IDs from environment - DFY pricing tiers (Starter £9, Launch £29, Growth £59, Agency £149)"""
    return {
        # DFY Core Tiers (GBP pricing)
        "starter": _clean_price_id(os.environ.get("STRIPE_PRICE_STARTER", "")),
        "starter_year": _clean_price_id(os.environ.get("STRIPE_PRICE_STARTER_YEAR", "")),
        "launch": _clean_price_id(os.environ.get("STRIPE_PRICE_LAUNCH", "")),
        "launch_year": _clean_price_id(os.environ.get("STRIPE_PRICE_LAUNCH_YEAR", "")),
        "growth": _clean_price_id(os.environ.get("STRIPE_PRICE_GROWTH", "")),
        "growth_year": _clean_price_id(os.environ.get("STRIPE_PRICE_GROWTH_YEAR", "")),
        "agency": _clean_price_id(os.environ.get("STRIPE_PRICE_AGENCY", "")),
        "agency_year": _clean_price_id(os.environ.get("STRIPE_PRICE_AGENCY_YEAR", "")),
        # Legacy tier aliases (backward compatibility)
        "scale": _clean_price_id(os.environ.get("STRIPE_PRICE_SCALE", os.environ.get("STRIPE_PRICE_GROWTH", ""))),
        "scale_year": _clean_price_id(os.environ.get("STRIPE_PRICE_SCALE_YEAR", os.environ.get("STRIPE_PRICE_GROWTH_YEAR", ""))),
        "business": _clean_price_id(os.environ.get("STRIPE_PRICE_BUSINESS", os.environ.get("STRIPE_PRICE_AGENCY", ""))),
        "business_year": _clean_price_id(os.environ.get("STRIPE_PRICE_BUSINESS_YEAR", os.environ.get("STRIPE_PRICE_AGENCY_YEAR", ""))),
        # One-time DFY packages (if needed)
        "dfy_starter": _clean_price_id(os.environ.get("STRIPE_PRICE_DFY_STARTER", "")),
        "dfy_professional": _clean_price_id(os.environ.get("STRIPE_PRICE_DFY_PROFESSIONAL", "")),
        "dfy_enterprise": _clean_price_id(os.environ.get("STRIPE_PRICE_DFY_ENTERPRISE", "")),
        # Recurring Add-ons (monthly subscriptions)
        "addon_priority_support": _clean_price_id(os.environ.get("STRIPE_PRICE_ADDON_PRIORITY_SUPPORT", "")),
        "addon_sla_99": _clean_price_id(os.environ.get("STRIPE_PRICE_ADDON_SLA_99_9", "")),
        "addon_white_label": _clean_price_id(os.environ.get("STRIPE_PRICE_ADDON_WHITE_LABEL", "")),
        "addon_extra_workflows": _clean_price_id(os.environ.get("STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS", "")),
    }


@bp.get("/health")
def billing_health():
    """Health check endpoint - verify LIVE billing configuration"""
    if not ensure_stripe_configured():
        return jsonify({"status": "failed", "error": "stripe_not_configured"}), 500
    
    price_map = get_price_map()
    
    # Check subscription tiers
    required_subscription_prices = [
        "starter", "starter_year", "launch", "launch_year",
        "growth", "growth_year", "agency", "agency_year"
    ]
    
    # Check DFY packages
    required_dfy_packages = ["dfy_starter", "dfy_professional", "dfy_enterprise"]
    
    # Check Add-ons
    required_addons = ["addon_priority_support", "addon_sla_99", "addon_white_label", "addon_extra_workflows"]
    
    missing_subscription = [p for p in required_subscription_prices if not price_map.get(p)]
    missing_dfy = [p for p in required_dfy_packages if not price_map.get(p)]
    missing_addons = [p for p in required_addons if not price_map.get(p)]
    
    if missing_subscription:
        return jsonify({
            "status": "failed",
            "error": f"Missing subscription price IDs: {', '.join(missing_subscription)}"
        }), 500
    
    if missing_dfy:
        return jsonify({
            "status": "failed",
            "error": f"Missing DFY package price IDs: {', '.join(missing_dfy)}"
        }), 500
    
    if missing_addons:
        return jsonify({
            "status": "failed",
            "error": f"Missing add-on price IDs: {', '.join(missing_addons)}"
        }), 500
    
    return jsonify({
        "status": "ok",
        "stripe_configured": True,
        "subscription_tiers": {
            "starter": f"{price_map['starter']} (month), {price_map['starter_year']} (year)",
            "launch": f"{price_map['launch']} (month), {price_map['launch_year']} (year)",
            "growth": f"{price_map['growth']} (month), {price_map['growth_year']} (year)",
            "agency": f"{price_map['agency']} (month), {price_map['agency_year']} (year)"
        },
        "dfy_packages": {
            "dfy_starter": price_map.get('dfy_starter', 'NOT_CONFIGURED'),
            "dfy_professional": price_map.get('dfy_professional', 'NOT_CONFIGURED'),
            "dfy_enterprise": price_map.get('dfy_enterprise', 'NOT_CONFIGURED')
        },
        "dfy_packages_configured": len([p for p in required_dfy_packages if price_map.get(p)]),
        "dfy_packages_total": len(required_dfy_packages),
        "addons": {
            "addon_priority_support": price_map.get('addon_priority_support', 'NOT_CONFIGURED'),
            "addon_sla_99": price_map.get('addon_sla_99', 'NOT_CONFIGURED'),
            "addon_white_label": price_map.get('addon_white_label', 'NOT_CONFIGURED'),
            "addon_extra_workflows": price_map.get('addon_extra_workflows', 'NOT_CONFIGURED')
        },
        "addons_configured": len([p for p in required_addons if price_map.get(p)]),
        "addons_total": len(required_addons)
    }), 200


@bp.post("/checkout")
def create_checkout_session():
    """
    Create a Stripe Checkout session for tier upgrades, DFY packages, or add-ons
    
    Subscription Tiers (GBP):
    - starter: £9/month, £90/year
    - launch: £29/month, £290/year
    - growth: £59/month, £590/year
    - agency: £149/month, £1490/year
    
    DFY One-Time Packages (GBP):
    - dfy_starter: £149
    - dfy_professional: £299
    - dfy_enterprise: £499
    
    Add-ons (Recurring Monthly, GBP):
    - addon_priority_support: £29/month
    - addon_sla_99: £49/month
    - addon_white_label: £99/month
    - addon_extra_workflows: £10/month
    
    Request body (Subscriptions):
    {
      "purchase_type": "subscription",
      "tier": "starter" | "launch" | "growth" | "agency",
      "billing_interval": "month" | "year" (optional, defaults to month)
    }
    
    Request body (DFY Packages):
    {
      "purchase_type": "dfy",
      "dfy_pack": "dfy_starter" | "dfy_professional" | "dfy_enterprise"
    }
    
    Request body (Add-ons):
    {
      "addons": "addon_priority_support,addon_sla_99" (comma-separated or single value)
    }
    OR
    {
      "addons": ["addon_priority_support", "addon_sla_99"]
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
        purchase_type = data.get("purchase_type", "subscription").lower().strip()
        price_map = get_price_map()
        
        # Get success/cancel URLs from env or use defaults
        site_url = os.environ.get("SITE_URL", "https://levqor.ai").strip()
        
        # Handle Add-ons (standalone checkout for add-on subscriptions)
        addons_param = data.get("addons")
        if addons_param:
            # Parse addons (can be string "addon1,addon2" or list ["addon1", "addon2"])
            if isinstance(addons_param, str):
                addon_codes = [a.strip() for a in addons_param.split(",") if a.strip()]
            elif isinstance(addons_param, list):
                addon_codes = [str(a).strip() for a in addons_param if a]
            else:
                return jsonify({"error": "invalid_addons_format"}), 400
            
            if not addon_codes:
                return jsonify({"error": "no_addons_specified"}), 400
            
            # Validate and collect price IDs for requested add-ons
            line_items = []
            addon_names = []
            valid_addon_codes = ["addon_priority_support", "addon_sla_99", "addon_white_label", "addon_extra_workflows"]
            
            for addon_code in addon_codes:
                if addon_code not in valid_addon_codes:
                    return jsonify({
                        "error": "invalid_addon",
                        "addon": addon_code,
                        "valid_addons": valid_addon_codes
                    }), 400
                
                price_id = price_map.get(addon_code, "").strip()
                if not price_id:
                    return jsonify({
                        "error": "addon_not_configured",
                        "addon": addon_code
                    }), 500
                
                line_items.append({"price": price_id, "quantity": 1})
                addon_names.append(addon_code)
            
            success_url = os.environ.get(
                "CHECKOUT_SUCCESS_URL",
                f"{site_url}/dashboard?addons_added=1"
            )
            cancel_url = os.environ.get(
                "CHECKOUT_CANCEL_URL",
                f"{site_url}/pricing?canceled=1"
            )
            
            # Create subscription checkout for add-ons
            session = stripe.checkout.Session.create(
                mode="subscription",
                line_items=line_items,
                success_url=success_url,
                cancel_url=cancel_url,
                allow_promotion_codes=True,
                billing_address_collection="auto",
                metadata={
                    "purchase_type": "addons",
                    "addons": ",".join(addon_names),
                    "source": "pricing_page"
                }
            )
            
            log.info(f"Created add-on checkout session for addons={','.join(addon_names)}")
            
            return jsonify({
                "ok": True,
                "url": session.url,
                "session_id": session.id,
                "purchase_type": "addons",
                "addons": addon_names
            }), 200
        
        # Handle DFY one-time packages
        if purchase_type == "dfy":
            dfy_pack = data.get("dfy_pack", "").lower().strip()
            
            if dfy_pack not in ["dfy_starter", "dfy_professional", "dfy_enterprise"]:
                log.warning(f"Invalid DFY package: {dfy_pack}")
                return jsonify({
                    "error": "invalid_dfy_package",
                    "available_packages": ["dfy_starter", "dfy_professional", "dfy_enterprise"]
                }), 400
            
            price_id = price_map.get(dfy_pack, "").strip()
            
            if not price_id:
                log.error(f"Price ID not configured for DFY package: {dfy_pack}")
                return jsonify({
                    "error": "price_not_configured",
                    "package": dfy_pack
                }), 500
            
            success_url = os.environ.get(
                "CHECKOUT_SUCCESS_URL",
                f"{site_url}/dfy/success?package={dfy_pack}"
            )
            cancel_url = os.environ.get(
                "CHECKOUT_CANCEL_URL",
                f"{site_url}/pricing?canceled=1"
            )
            
            # Create one-time payment session
            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                success_url=success_url,
                cancel_url=cancel_url,
                allow_promotion_codes=True,
                billing_address_collection="required",
                metadata={
                    "purchase_type": "dfy",
                    "package": dfy_pack,
                    "source": "pricing_page"
                }
            )
            
            log.info(f"Created DFY checkout session for package={dfy_pack}")
            
            return jsonify({
                "ok": True,
                "url": session.url,
                "session_id": session.id,
                "purchase_type": "dfy"
            }), 200
        
        # Handle subscription tiers (existing logic)
        tier = data.get("tier", "").lower().strip()
        billing_interval = data.get("billing_interval", "month").lower().strip()
        
        # Support both "tier" and "tier_year" formats
        if billing_interval == "year":
            price_key = f"{tier}_year"
        else:
            price_key = tier
        
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
        
        success_url = os.environ.get(
            "CHECKOUT_SUCCESS_URL",
            f"{site_url}/developer/keys?success=1"
        )
        cancel_url = os.environ.get(
            "CHECKOUT_CANCEL_URL",
            f"{site_url}/developer?canceled=1"
        )
        
        # Create subscription checkout session
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
                "purchase_type": "subscription",
                "tier": tier,
                "billing_interval": billing_interval,
                "source": "developer_portal"
            }
        )
        
        log.info(f"Created subscription checkout session for tier={tier}, interval={billing_interval}")
        
        return jsonify({
            "ok": True,
            "url": session.url,
            "session_id": session.id,
            "purchase_type": "subscription"
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
