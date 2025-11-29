"""
Trial Management API
Endpoints for starting and managing free trials with Stripe
"""
import os
import time
import uuid
from flask import Blueprint, request, jsonify

trial_bp = Blueprint("trial", __name__, url_prefix="/api/billing/trial")

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_PRICE_STARTER = os.environ.get("STRIPE_PRICE_STARTER")
APP_URL = os.environ.get("NEXT_PUBLIC_APP_URL", "https://www.levqor.ai")

stripe = None
if STRIPE_SECRET_KEY:
    try:
        import stripe as stripe_lib
        stripe_lib.api_key = STRIPE_SECRET_KEY
        stripe = stripe_lib
    except ImportError:
        pass

from modules.db_wrapper import execute, execute_query, commit


def ensure_trial_table():
    execute("""
        CREATE TABLE IF NOT EXISTS user_trials (
            user_id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            trial_started_at REAL,
            trial_ends_at REAL,
            status TEXT DEFAULT 'pending',
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        )
    """)
    commit()


@trial_bp.route("/start", methods=["POST"])
def start_trial():
    """Create a Stripe Checkout Session for trial signup"""
    if not stripe:
        return jsonify({"ok": False, "error": "Stripe not configured"}), 500
    
    data = request.get_json() or {}
    email = data.get("email")
    locale = data.get("locale", "en")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_trial_table()
    
    existing = execute_query(
        "SELECT * FROM user_trials WHERE email = ?", (email,), fetch='one'
    )
    
    if existing and existing["status"] in ("active", "trialing"):
        return jsonify({
            "ok": True,
            "already_active": True,
            "status": existing["status"],
            "trial_ends_at": existing["trial_ends_at"]
        })
    
    try:
        price_id = STRIPE_PRICE_STARTER or os.environ.get("STRIPE_PRICE_LAUNCH")
        
        checkout_session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            subscription_data={
                "trial_period_days": 14,
                "metadata": {"email": email}
            },
            customer_email=email,
            success_url=f"{APP_URL}/{locale}/trial/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{APP_URL}/{locale}/trial/error",
            metadata={"email": email, "locale": locale}
        )
        
        now = time.time()
        user_id = str(uuid.uuid4())
        
        if existing:
            execute("""
                UPDATE user_trials 
                SET status = 'checkout_pending', updated_at = ?
                WHERE email = ?
            """, (now, email))
        else:
            execute("""
                INSERT INTO user_trials (user_id, email, status, created_at, updated_at)
                VALUES (?, ?, 'checkout_pending', ?, ?)
            """, (user_id, email, now, now))
        commit()
        
        return jsonify({
            "ok": True,
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        })
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@trial_bp.route("/status", methods=["GET"])
def trial_status():
    """Check if user has an active trial or subscription"""
    email = request.args.get("email")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_trial_table()
    
    user = execute_query(
        "SELECT * FROM user_trials WHERE email = ?", (email,), fetch='one'
    )
    
    now = time.time()
    
    if not user:
        return jsonify({
            "ok": True,
            "has_trial": False,
            "is_active": False,
            "status": "no_trial",
            "needs_trial_start": True
        })
    
    status = user["status"]
    trial_ends_at = user["trial_ends_at"]
    
    is_trialing = status == "trialing" and trial_ends_at and trial_ends_at > now
    is_active = status == "active" or is_trialing
    
    return jsonify({
        "ok": True,
        "has_trial": status in ("trialing", "active", "past_due"),
        "is_active": is_active,
        "status": status,
        "trial_ends_at": trial_ends_at,
        "trial_days_remaining": max(0, int((trial_ends_at - now) / 86400)) if trial_ends_at else 0,
        "needs_trial_start": not is_active
    })


@trial_bp.route("/confirm", methods=["POST"])
def confirm_trial():
    """Confirm trial after Stripe checkout success"""
    data = request.get_json() or {}
    session_id = data.get("session_id")
    email = data.get("email")
    
    if not session_id:
        return jsonify({"ok": False, "error": "Session ID required"}), 400
    
    if not stripe:
        return jsonify({"ok": False, "error": "Stripe not configured"}), 500
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != "no_payment_required" and session.status != "complete":
            return jsonify({"ok": False, "error": "Session not complete"}), 400
        
        customer_id = session.customer
        subscription_id = session.subscription
        customer_email = session.customer_email or email
        
        ensure_trial_table()
        now = time.time()
        trial_ends = now + (14 * 86400)
        
        existing = execute_query(
            "SELECT * FROM user_trials WHERE email = ?", (customer_email,), fetch='one'
        )
        
        if existing:
            execute("""
                UPDATE user_trials 
                SET stripe_customer_id = ?, stripe_subscription_id = ?,
                    trial_started_at = ?, trial_ends_at = ?, status = 'trialing', updated_at = ?
                WHERE email = ?
            """, (customer_id, subscription_id, now, trial_ends, now, customer_email))
        else:
            user_id = str(uuid.uuid4())
            execute("""
                INSERT INTO user_trials 
                (user_id, email, stripe_customer_id, stripe_subscription_id, trial_started_at, trial_ends_at, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'trialing', ?, ?)
            """, (user_id, customer_email, customer_id, subscription_id, now, trial_ends, now, now))
        
        commit()
        
        return jsonify({
            "ok": True,
            "status": "trialing",
            "trial_ends_at": trial_ends,
            "subscription_id": subscription_id
        })
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@trial_bp.route("/portal", methods=["POST"])
def customer_portal():
    """Create Stripe Customer Portal session for managing subscription"""
    if not stripe:
        return jsonify({"ok": False, "error": "Stripe not configured"}), 500
    
    data = request.get_json() or {}
    email = data.get("email")
    locale = data.get("locale", "en")
    
    if not email:
        return jsonify({"ok": False, "error": "Email required"}), 400
    
    ensure_trial_table()
    
    user = execute_query(
        "SELECT stripe_customer_id FROM user_trials WHERE email = ?", (email,), fetch='one'
    )
    
    if not user or not user["stripe_customer_id"]:
        return jsonify({"ok": False, "error": "No subscription found"}), 404
    
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=user["stripe_customer_id"],
            return_url=f"{APP_URL}/{locale}/billing"
        )
        
        return jsonify({
            "ok": True,
            "portal_url": portal_session.url
        })
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
