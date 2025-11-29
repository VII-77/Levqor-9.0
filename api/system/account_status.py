"""
Account Status API - Subscription and Onboarding Status
Returns user subscription status for frontend routing decisions.
"""
import os
import logging
import json
from datetime import datetime
from flask import Blueprint, jsonify, request
from time import time as _time

try:
    from api.telemetry import log_event, log_error, log_performance
    TELEMETRY_ENABLED = True
except ImportError:
    TELEMETRY_ENABLED = False
    def log_event(*args, **kwargs): pass
    def log_error(*args, **kwargs): pass
    def log_performance(*args, **kwargs): pass

bp = Blueprint("account_status", __name__, url_prefix="/api/system")
log = logging.getLogger("levqor.account_status")

try:
    import stripe
    from modules.stripe_connector import ensure_stripe_configured
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    log.warning("Stripe not available for account status checks")

try:
    from modules.db_utils import get_db_connection
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False
    log.warning("Database module not available")


def _get_user_from_db(email: str) -> dict:
    """Get user record from database, create if not exists."""
    if not DB_AVAILABLE:
        return {"exists": False, "onboarding_completed": False}
    
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            
            cur.execute(
                "SELECT id, email, name, onboarding_completed, onboarding_data FROM users WHERE LOWER(email) = LOWER(%s) LIMIT 1",
                (email,)
            )
            row = cur.fetchone()
            
            if row:
                if hasattr(row, 'get'):
                    return {
                        "exists": True,
                        "id": row.get('id'),
                        "email": row.get('email'),
                        "name": row.get('name'),
                        "onboarding_completed": bool(row.get('onboarding_completed')) if row.get('onboarding_completed') is not None else False,
                        "onboarding_data": row.get('onboarding_data') or {}
                    }
                else:
                    return {
                        "exists": True,
                        "id": row[0],
                        "email": row[1],
                        "name": row[2],
                        "onboarding_completed": bool(row[3]) if row[3] is not None else False,
                        "onboarding_data": row[4] if row[4] else {}
                    }
            
            return {"exists": False, "onboarding_completed": False}
        
    except Exception as e:
        log.error(f"DB lookup error for user: {e}")
        return {"exists": False, "onboarding_completed": False, "error": str(e)}


def _create_or_update_user(email: str, name: str = None, onboarding_completed: bool = False, onboarding_data: dict = None) -> bool:
    """Create or update user in database."""
    if not DB_AVAILABLE:
        return False
    
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            existing = cur.fetchone()
            
            now = datetime.utcnow().timestamp()
            onboarding_json = json.dumps(onboarding_data) if onboarding_data else '{}'
            
            if existing:
                cur.execute(
                    """UPDATE users 
                       SET onboarding_completed = %s, 
                           onboarding_data = %s::jsonb,
                           updated_at = %s,
                           name = COALESCE(%s, name)
                       WHERE LOWER(email) = LOWER(%s)""",
                    (onboarding_completed, onboarding_json, now, name, email)
                )
            else:
                import uuid
                user_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO users (id, email, name, onboarding_completed, onboarding_data, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)""",
                    (user_id, email.lower(), name or '', onboarding_completed, onboarding_json, now, now)
                )
            
            return True
        
    except Exception as e:
        log.error(f"DB write error for user: {e}")
        return False


def _get_user_email_from_request():
    """Extract user email from request headers or body."""
    data = request.get_json(silent=True) or {}
    email = data.get("email") or ""
    
    if not email:
        email = request.headers.get("X-User-Email", "")
    
    if not email:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            email = auth_header[7:][:100]
    
    return email.strip().lower() if email else None


def _get_stripe_subscription_status(email: str) -> dict:
    """
    Look up Stripe subscription status by customer email.
    Returns subscription details or default 'none' status.
    """
    if not STRIPE_AVAILABLE or not ensure_stripe_configured():
        return {
            "has_active_subscription": False,
            "subscription_status": "none",
            "trial_ends_at": None,
            "plan_name": None,
            "stripe_available": False
        }
    
    try:
        customers = stripe.Customer.list(email=email, limit=1)
        
        if not customers.data:
            return {
                "has_active_subscription": False,
                "subscription_status": "none",
                "trial_ends_at": None,
                "plan_name": None,
                "stripe_available": True
            }
        
        customer = customers.data[0]
        subscriptions = stripe.Subscription.list(customer=customer.id, status="all", limit=5)
        
        if not subscriptions.data:
            return {
                "has_active_subscription": False,
                "subscription_status": "none",
                "trial_ends_at": None,
                "plan_name": None,
                "stripe_available": True,
                "customer_id": customer.id
            }
        
        active_sub = None
        for sub in subscriptions.data:
            if sub.status in ["active", "trialing"]:
                active_sub = sub
                break
        
        if active_sub:
            trial_end = None
            if active_sub.trial_end:
                trial_end = datetime.utcfromtimestamp(active_sub.trial_end).isoformat()
            
            plan_name = None
            if active_sub.items.data:
                plan_name = active_sub.items.data[0].price.nickname or "Pro"
            
            return {
                "has_active_subscription": True,
                "subscription_status": active_sub.status,
                "trial_ends_at": trial_end,
                "plan_name": plan_name,
                "stripe_available": True,
                "customer_id": customer.id,
                "subscription_id": active_sub.id
            }
        
        latest_sub = subscriptions.data[0]
        return {
            "has_active_subscription": False,
            "subscription_status": latest_sub.status,
            "trial_ends_at": None,
            "plan_name": None,
            "stripe_available": True,
            "customer_id": customer.id
        }
        
    except Exception as e:
        log.error(f"Stripe lookup error: {e}")
        return {
            "has_active_subscription": False,
            "subscription_status": "error",
            "trial_ends_at": None,
            "plan_name": None,
            "stripe_available": True,
            "error": str(e)[:100]
        }


@bp.get("/account-status")
def get_account_status():
    """
    GET /api/system/account-status
    
    Returns the account status for routing decisions:
    - has_tenant: bool (always true for now, can be extended)
    - has_active_subscription: bool
    - subscription_status: "trialing" | "active" | "canceled" | "none" | "expired" | "past_due"
    - trial_ends_at: ISO timestamp or null
    - onboarding_completed: bool (stored in localStorage on frontend for now)
    - plan_name: string or null
    
    Query params:
    - email: user email (or pass in body or X-User-Email header)
    """
    _start = _time()
    
    email = request.args.get("email") or _get_user_email_from_request()
    
    if not email:
        return jsonify({
            "ok": False,
            "error": "email_required",
            "message": "Please provide an email address to check account status.",
            "has_tenant": False,
            "has_active_subscription": False,
            "subscription_status": "none",
            "trial_ends_at": None,
            "onboarding_completed": False,
            "plan_name": None
        }), 400
    
    try:
        subscription_info = _get_stripe_subscription_status(email)
        user_info = _get_user_from_db(email)
        
        result = {
            "ok": True,
            "email": email,
            "has_tenant": user_info.get("exists", True),
            "has_active_subscription": subscription_info.get("has_active_subscription", False),
            "subscription_status": subscription_info.get("subscription_status", "none"),
            "trial_ends_at": subscription_info.get("trial_ends_at"),
            "onboarding_completed": user_info.get("onboarding_completed", False),
            "plan_name": subscription_info.get("plan_name"),
            "stripe_available": subscription_info.get("stripe_available", False)
        }
        
        log.info(f"Account status for {email[:3]}***: status={result['subscription_status']}")
        log_event("account_status_check", {
            "status": result["subscription_status"],
            "has_subscription": result["has_active_subscription"]
        }, endpoint="/api/system/account-status")
        log_performance("/api/system/account-status", (_time() - _start) * 1000, 200)
        
        return jsonify(result), 200
        
    except Exception as e:
        log_error("account_status.general", e)
        log_performance("/api/system/account-status", (_time() - _start) * 1000, 500)
        log.error(f"Account status error: {e}", exc_info=True)
        return jsonify({
            "ok": False,
            "error": "status_check_failed",
            "message": str(e)[:100],
            "has_tenant": False,
            "has_active_subscription": False,
            "subscription_status": "error",
            "trial_ends_at": None,
            "onboarding_completed": False,
            "plan_name": None
        }), 500


@bp.post("/onboarding")
def submit_onboarding():
    """
    POST /api/system/onboarding
    
    Store onboarding data for a new user.
    
    Request body:
    {
        "email": "user@example.com",
        "full_name": "John Doe",
        "company_name": "Acme Inc",
        "role": "Founder",
        "use_case": "Agency automation",
        "phone": "+44 123 456 7890",
        "urgency": 2,
        "consent": true
    }
    """
    _start = _time()
    
    try:
        data = request.get_json() or {}
    except Exception:
        data = {}
    
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({
            "ok": False,
            "error": "email_required"
        }), 400
    
    full_name = data.get("full_name", "")
    company_name = data.get("company_name", "")
    role = data.get("role", "")
    use_case = data.get("use_case", "")
    phone = data.get("phone", "")
    urgency = data.get("urgency", 1)
    consent = data.get("consent", False)
    
    if not consent:
        return jsonify({
            "ok": False,
            "error": "consent_required",
            "message": "Please agree to the terms to continue."
        }), 400
    
    onboarding_data = {
        "full_name": full_name,
        "company_name": company_name,
        "role": role,
        "use_case": use_case,
        "phone": phone,
        "urgency": urgency,
        "completed_at": datetime.utcnow().isoformat()
    }
    
    db_saved = _create_or_update_user(
        email=email,
        name=full_name,
        onboarding_completed=True,
        onboarding_data=onboarding_data
    )
    
    log.info(f"Onboarding submitted for {email[:3]}***: role={role}, use_case={use_case}, db_saved={db_saved}")
    log_event("onboarding_submitted", {
        "role": role,
        "use_case": use_case,
        "urgency": urgency,
        "has_phone": bool(phone),
        "db_saved": db_saved
    }, endpoint="/api/system/onboarding")
    log_performance("/api/system/onboarding", (_time() - _start) * 1000, 200)
    
    return jsonify({
        "ok": True,
        "message": "Onboarding completed successfully.",
        "email": email,
        "next_step": "trial",
        "db_saved": db_saved
    }), 200


@bp.post("/templates/launch")
def launch_template():
    """
    POST /api/system/templates/launch
    
    Launch an AI template for the user's account.
    
    Request body:
    {
        "template_id": "ai-guardian-fragile",
        "email": "user@example.com"
    }
    """
    _start = _time()
    
    try:
        data = request.get_json() or {}
    except Exception:
        data = {}
    
    template_id = data.get("template_id", "")
    email = (data.get("email") or "").strip().lower()
    
    if not template_id:
        return jsonify({
            "ok": False,
            "error": "template_id_required"
        }), 400
    
    TEMPLATES = {
        "ai-guardian-fragile": {
            "name": "AI Guardian for Fragile Workflows",
            "description": "Monitors workflow health and auto-heals failures",
            "steps": ["Enable error monitoring", "Configure auto-heal thresholds", "Set up Slack/email alerts"]
        },
        "ai-revenue-radar": {
            "name": "AI Revenue Radar for DFY Agencies",
            "description": "Track leads, conversions, and DFY pipeline",
            "steps": ["Connect CRM", "Configure lead scoring", "Enable revenue dashboard"]
        },
        "ai-incident-storyboard": {
            "name": "AI Post-Incident Storyboard",
            "description": "Auto-generate incident reports with AI narrative",
            "steps": ["Enable incident detection", "Configure report templates", "Set distribution list"]
        },
        "agency-onboarding": {
            "name": "Agency Client Onboarding",
            "description": "Automate client intake and project setup",
            "steps": ["Create intake form", "Configure document collection", "Set up project template"]
        },
        "client-reporting": {
            "name": "Client Weekly Reporting",
            "description": "Automated weekly performance reports",
            "steps": ["Connect data sources", "Configure report template", "Schedule delivery"]
        },
        "ops-health-check": {
            "name": "Ops Health Check",
            "description": "Monitor operational metrics and alerts",
            "steps": ["Define KPIs", "Set thresholds", "Configure notifications"]
        }
    }
    
    template = TEMPLATES.get(template_id)
    if not template:
        return jsonify({
            "ok": False,
            "error": "template_not_found",
            "available_templates": list(TEMPLATES.keys())
        }), 404
    
    log.info(f"Template launched: {template_id} for {email[:3] if email else 'unknown'}***")
    log_event("template_launched", {
        "template_id": template_id
    }, endpoint="/api/system/templates/launch")
    log_performance("/api/system/templates/launch", (_time() - _start) * 1000, 200)
    
    return jsonify({
        "ok": True,
        "template_id": template_id,
        "template": template,
        "message": f"AI is wiring '{template['name']}' for your account...",
        "status": "configuring",
        "next_steps": template.get("steps", [])
    }), 200
