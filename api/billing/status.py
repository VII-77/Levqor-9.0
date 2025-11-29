"""
Billing Status API - Unified subscription status endpoint
Returns billing status for frontend access gating decisions.
"""
import os
import logging
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request

log = logging.getLogger("levqor.billing.status")

billing_status_bp = Blueprint("billing_status", __name__, url_prefix="/api/billing")

SAFE_MODE = True

try:
    import stripe
    from modules.stripe_connector import ensure_stripe_configured
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False

try:
    from modules.db_utils import get_db_connection
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False


def _get_subscription_from_stripe(email: str) -> dict:
    """Look up subscription status from Stripe by email."""
    if not STRIPE_AVAILABLE:
        return None
    
    try:
        ensure_stripe_configured()
        customers = stripe.Customer.list(email=email, limit=1)
        
        if not customers.data:
            return None
        
        customer = customers.data[0]
        subscriptions = stripe.Subscription.list(customer=customer.id, status="all", limit=1)
        
        if not subscriptions.data:
            return {
                "has_active_subscription": False,
                "is_on_trial": False,
                "trial_days_remaining": 0,
                "plan": None,
                "status": "no_subscription",
                "customer_id": customer.id
            }
        
        sub = subscriptions.data[0]
        is_trial = sub.status == "trialing"
        is_active = sub.status in ["active", "trialing"]
        
        trial_days = 0
        if is_trial and sub.trial_end:
            trial_end = datetime.fromtimestamp(sub.trial_end)
            trial_days = max(0, (trial_end - datetime.utcnow()).days)
        
        plan_name = None
        if sub.items and sub.items.data:
            item = sub.items.data[0]
            if item.price and item.price.nickname:
                plan_name = item.price.nickname
            elif item.price and item.price.product:
                try:
                    product = stripe.Product.retrieve(item.price.product)
                    plan_name = product.name
                except Exception:
                    plan_name = "Pro"
        
        return {
            "has_active_subscription": is_active,
            "is_on_trial": is_trial,
            "trial_days_remaining": trial_days,
            "plan": plan_name or ("Trial" if is_trial else "Pro"),
            "status": sub.status,
            "customer_id": customer.id,
            "subscription_id": sub.id,
            "current_period_end": sub.current_period_end
        }
        
    except Exception as e:
        log.error(f"Stripe lookup failed for {email}: {e}")
        return None


def _get_user_onboarding_status(email: str) -> dict:
    """Get onboarding status from database."""
    if not DB_AVAILABLE:
        return {"onboarding_completed": False, "has_seen_launchpad": False}
    
    try:
        from modules.db_utils import get_db_connection
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT onboarding_completed, onboarding_data FROM users WHERE LOWER(email) = LOWER(%s) LIMIT 1",
                (email,)
            )
            row = cur.fetchone()
            
            if row:
                onboarding_completed = row.get('onboarding_completed', False) if hasattr(row, 'get') else (row[0] if len(row) > 0 else False)
                onboarding_data = row.get('onboarding_data', {}) if hasattr(row, 'get') else (row[1] if len(row) > 1 else {})
                has_seen_launchpad = False
                if isinstance(onboarding_data, dict):
                    has_seen_launchpad = onboarding_data.get('has_seen_launchpad', False)
                return {
                    "onboarding_completed": bool(onboarding_completed),
                    "has_seen_launchpad": bool(has_seen_launchpad)
                }
            
            return {"onboarding_completed": False, "has_seen_launchpad": False}
            
    except Exception as e:
        log.error(f"DB lookup failed: {e}")
        return {"onboarding_completed": False, "has_seen_launchpad": False}


@billing_status_bp.route("/status", methods=["GET"])
def get_billing_status():
    """
    GET /api/billing/status
    
    Returns unified billing/subscription status for a user.
    
    Query params:
    - email: user email address
    
    Response:
    {
        "safe_mode": true,
        "has_active_subscription": bool,
        "is_on_trial": bool,
        "trial_days_remaining": int,
        "plan": string | null,
        "status": string,
        "onboarding_completed": bool,
        "has_seen_launchpad": bool,
        "can_access_dashboard": bool
    }
    """
    email = request.args.get("email", "").strip().lower()
    
    if not email or "@" not in email:
        return jsonify({
            "safe_mode": SAFE_MODE,
            "has_active_subscription": False,
            "is_on_trial": False,
            "trial_days_remaining": 0,
            "plan": None,
            "status": "no_user",
            "onboarding_completed": False,
            "has_seen_launchpad": False,
            "can_access_dashboard": False,
            "error": "email_required"
        }), 400
    
    stripe_status = _get_subscription_from_stripe(email)
    onboarding_status = _get_user_onboarding_status(email)
    
    if stripe_status:
        has_active = stripe_status.get("has_active_subscription", False)
        is_trial = stripe_status.get("is_on_trial", False)
        trial_days = stripe_status.get("trial_days_remaining", 0)
        plan = stripe_status.get("plan")
        status = stripe_status.get("status", "unknown")
    else:
        has_active = False
        is_trial = True
        trial_days = 14
        plan = "Free Trial"
        status = "new_user"
    
    can_access = has_active or is_trial or (status == "new_user")
    
    return jsonify({
        "safe_mode": SAFE_MODE,
        "has_active_subscription": has_active,
        "is_on_trial": is_trial,
        "trial_days_remaining": trial_days,
        "plan": plan,
        "status": status,
        "onboarding_completed": onboarding_status.get("onboarding_completed", False),
        "has_seen_launchpad": onboarding_status.get("has_seen_launchpad", False),
        "can_access_dashboard": can_access
    }), 200


@billing_status_bp.route("/start-trial", methods=["POST"])
def start_trial():
    """
    POST /api/billing/start-trial
    
    Start a free trial for a new user. Creates user record if needed.
    
    Request body:
    {
        "email": "user@example.com",
        "name": "User Name" (optional)
    }
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    
    if not email or "@" not in email:
        return jsonify({"ok": False, "error": "valid_email_required"}), 400
    
    if not DB_AVAILABLE:
        return jsonify({
            "ok": True,
            "message": "Trial started (db unavailable)",
            "trial_days": 14
        }), 200
    
    try:
        from modules.db_utils import get_db_connection
        import uuid
        
        with get_db_connection() as conn:
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            existing = cur.fetchone()
            
            if existing:
                return jsonify({
                    "ok": True,
                    "message": "User already exists",
                    "trial_days": 14
                }), 200
            
            user_id = str(uuid.uuid4())
            now = datetime.utcnow().timestamp()
            
            cur.execute(
                """INSERT INTO users (id, email, name, onboarding_completed, onboarding_data, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)""",
                (user_id, email, name or '', False, '{"trial_started": true}', now, now)
            )
            
            log.info(f"Trial started for user: {email}")
            
            return jsonify({
                "ok": True,
                "message": "Trial started",
                "user_id": user_id,
                "trial_days": 14
            }), 201
            
    except Exception as e:
        log.error(f"Error starting trial: {e}")
        return jsonify({"ok": False, "error": str(e)[:100]}), 500
