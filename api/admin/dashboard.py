"""
Admin Dashboard API - Founder Analytics Suite
READ-ONLY endpoints for admin dashboards
"""
import os
import logging
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from pathlib import Path

log = logging.getLogger("levqor.admin.dashboard")
bp = Blueprint("admin_dashboard", __name__, url_prefix="/api/admin")

ADMIN_LOG_FILE = Path("logs/admin_api.log")


def _is_authorized(req):
    """Check if request has valid admin token"""
    token = (req.headers.get("Authorization") or "").replace("Bearer ", "")
    admin_token = os.getenv("ADMIN_TOKEN", "")
    return token and token == admin_token


def _log_admin_access(endpoint: str, success: bool):
    """Log admin API access"""
    try:
        ADMIN_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().isoformat()
        ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"
        status = "SUCCESS" if success else "DENIED"
        with open(ADMIN_LOG_FILE, 'a') as f:
            f.write(f"[{timestamp}] {status} | {endpoint} | IP: {ip}\n")
    except Exception as e:
        log.warning(f"Failed to log admin access: {e}")


def _require_admin(endpoint: str):
    """Decorator helper for admin auth"""
    if not _is_authorized(request):
        _log_admin_access(endpoint, False)
        return jsonify({"error": "unauthorized"}), 401
    _log_admin_access(endpoint, True)
    return None


@bp.get("/summary")
def get_admin_summary():
    """
    GET /api/admin/summary
    Returns high-level system summary for admin dashboard
    """
    auth_error = _require_admin("/api/admin/summary")
    if auth_error:
        return auth_error
    
    try:
        from modules.db_wrapper import execute_query
        
        total_users = 0
        active_users_7d = 0
        workflows_count = 0
        
        try:
            users_result = execute_query("SELECT COUNT(*) FROM users", fetch="one")
            total_users = users_result[0] if users_result else 0
        except:
            pass
        
        try:
            active_result = execute_query(
                "SELECT COUNT(*) FROM users WHERE last_seen_at > NOW() - INTERVAL '7 days'",
                fetch="one"
            )
            active_users_7d = active_result[0] if active_result else 0
        except:
            pass
        
        try:
            workflows_result = execute_query("SELECT COUNT(*) FROM workflows", fetch="one")
            workflows_count = workflows_result[0] if workflows_result else 0
        except:
            pass
        
        from modules.growth_engine.templates import get_all_templates
        templates = get_all_templates()
        templates_count = len(templates)
        
        health_status = "healthy"
        autopilot_status = "active"
        error_rate = 0.0
        
        try:
            import requests
            health_resp = requests.get("http://localhost:8000/api/health/summary", timeout=5)
            if health_resp.status_code == 200:
                health_data = health_resp.json()
                health_status = health_data.get("status", "unknown")
        except:
            pass
        
        autopilot_log = Path("/home/runner/workspace-data/autopilot/logs/guardian_health.log")
        if autopilot_log.exists():
            autopilot_status = "active"
        
        return jsonify({
            "total_users": total_users,
            "active_users_7d": active_users_7d,
            "workflows_count": workflows_count,
            "templates_count": templates_count,
            "error_rate": error_rate,
            "health_status": health_status,
            "autopilot_status": autopilot_status,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Admin summary error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


@bp.get("/revenue")
def get_admin_revenue():
    """
    GET /api/admin/revenue
    Returns revenue analytics (READ-ONLY from Stripe)
    """
    auth_error = _require_admin("/api/admin/revenue")
    if auth_error:
        return auth_error
    
    try:
        range_param = request.args.get("range", "30d")
        
        mrr = 0
        arr = 0
        arpu = 0
        active_subscriptions = 0
        trial_count = 0
        churn_rate = 0.0
        revenue_trend = []
        
        try:
            from modules.stripe_connector import get_stripe_secret_key
            import stripe
            stripe.api_key = get_stripe_secret_key()
            
            subscriptions = stripe.Subscription.list(status="active", limit=100)
            active_subscriptions = len(subscriptions.data)
            
            for sub in subscriptions.data:
                for item in sub.get("items", {}).get("data", []):
                    price = item.get("price", {})
                    amount = price.get("unit_amount", 0) / 100
                    interval = price.get("recurring", {}).get("interval", "month")
                    if interval == "month":
                        mrr += amount
                    elif interval == "year":
                        mrr += amount / 12
            
            arr = mrr * 12
            arpu = mrr / active_subscriptions if active_subscriptions > 0 else 0
            
            trials = stripe.Subscription.list(status="trialing", limit=100)
            trial_count = len(trials.data)
            
        except Exception as e:
            log.warning(f"Stripe data fetch failed: {e}")
        
        return jsonify({
            "mrr": round(mrr, 2),
            "arr": round(arr, 2),
            "arpu": round(arpu, 2),
            "active_subscriptions": active_subscriptions,
            "trial_count": trial_count,
            "churn_rate": churn_rate,
            "revenue_trend": revenue_trend,
            "range": range_param,
            "currency": "GBP",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Admin revenue error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


@bp.get("/users")
def get_admin_users():
    """
    GET /api/admin/users
    Returns paginated user list (READ-ONLY)
    """
    auth_error = _require_admin("/api/admin/users")
    if auth_error:
        return auth_error
    
    try:
        page = int(request.args.get("page", 1))
        limit = min(int(request.args.get("limit", 20)), 100)
        plan_filter = request.args.get("plan")
        status_filter = request.args.get("status")
        offset = (page - 1) * limit
        
        users = []
        total = 0
        
        try:
            from modules.db_wrapper import execute_query
            
            count_result = execute_query("SELECT COUNT(*) FROM users", fetch="one")
            total = count_result[0] if count_result else 0
            
            users_result = execute_query(
                """SELECT id, email, created_at, subscription_status, subscription_tier, last_seen_at 
                   FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s""",
                (limit, offset),
                fetch="all"
            )
            
            if users_result:
                for row in users_result:
                    users.append({
                        "id": row[0],
                        "email": _mask_email(row[1]) if row[1] else None,
                        "created_at": row[2].isoformat() if row[2] else None,
                        "status": row[3] or "free",
                        "plan": row[4] or "free",
                        "last_seen_at": row[5].isoformat() if row[5] else None
                    })
        except Exception as e:
            log.warning(f"User fetch failed: {e}")
        
        return jsonify({
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if limit > 0 else 0,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Admin users error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


def _mask_email(email: str) -> str:
    """Mask email for privacy in logs"""
    if not email or "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 3:
        return f"{local[0]}***@{domain}"
    return f"{local[:3]}***@{domain}"


@bp.get("/users/<user_id>")
def get_admin_user_detail(user_id):
    """
    GET /api/admin/users/<user_id>
    Returns detailed user info (READ-ONLY)
    """
    auth_error = _require_admin(f"/api/admin/users/{user_id}")
    if auth_error:
        return auth_error
    
    try:
        from modules.db_wrapper import execute_query
        
        user_result = execute_query(
            """SELECT id, email, created_at, subscription_status, subscription_tier, 
                      last_seen_at, stripe_customer_id
               FROM users WHERE id = %s""",
            (user_id,),
            fetch="one"
        )
        
        if not user_result:
            return jsonify({"error": "user_not_found"}), 404
        
        workflows_result = execute_query(
            "SELECT COUNT(*) FROM workflows WHERE user_id = %s",
            (user_id,),
            fetch="one"
        )
        workflows_count = workflows_result[0] if workflows_result else 0
        
        user = {
            "id": user_result[0],
            "email": _mask_email(user_result[1]),
            "created_at": user_result[2].isoformat() if user_result[2] else None,
            "status": user_result[3] or "free",
            "plan": user_result[4] or "free",
            "last_seen_at": user_result[5].isoformat() if user_result[5] else None,
            "has_stripe": bool(user_result[6]),
            "workflows_count": workflows_count
        }
        
        return jsonify({"user": user, "timestamp": datetime.now().isoformat()})
        
    except Exception as e:
        log.exception("Admin user detail error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


@bp.get("/activity")
def get_admin_activity():
    """
    GET /api/admin/activity
    Returns recent system activity (READ-ONLY)
    """
    auth_error = _require_admin("/api/admin/activity")
    if auth_error:
        return auth_error
    
    try:
        range_param = request.args.get("range", "24h")
        
        events = []
        summary = {
            "workflow_runs": 0,
            "errors": 0,
            "approvals": 0,
            "logins": 0,
            "signups": 0
        }
        
        try:
            from modules.db_wrapper import execute_query
            
            if range_param == "24h":
                interval = "1 day"
            elif range_param == "7d":
                interval = "7 days"
            elif range_param == "30d":
                interval = "30 days"
            else:
                interval = "1 day"
            
            try:
                wf_result = execute_query(
                    f"SELECT COUNT(*) FROM workflow_runs WHERE created_at > NOW() - INTERVAL '{interval}'",
                    fetch="one"
                )
                summary["workflow_runs"] = wf_result[0] if wf_result else 0
            except:
                pass
            
            try:
                signup_result = execute_query(
                    f"SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '{interval}'",
                    fetch="one"
                )
                summary["signups"] = signup_result[0] if signup_result else 0
            except:
                pass
            
        except Exception as e:
            log.warning(f"Activity fetch failed: {e}")
        
        autopilot_log = Path("/home/runner/workspace-data/autopilot/logs/guardian_health.log")
        if autopilot_log.exists():
            try:
                content = autopilot_log.read_text()
                lines = content.strip().split("\n")[-20:]
                for line in lines:
                    if line.strip():
                        events.append({
                            "type": "autopilot",
                            "message": line.strip()[:200],
                            "timestamp": datetime.now().isoformat()
                        })
            except:
                pass
        
        hourly_distribution = []
        for hour in range(24):
            hourly_distribution.append({
                "hour": hour,
                "count": 0
            })
        
        return jsonify({
            "events": events[:50],
            "summary": summary,
            "range": range_param,
            "hourly_distribution": hourly_distribution,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Admin activity error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


@bp.post("/health-check")
def trigger_health_check():
    """
    POST /api/admin/health-check
    Triggers a non-destructive health scan
    """
    auth_error = _require_admin("/api/admin/health-check")
    if auth_error:
        return auth_error
    
    try:
        import subprocess
        result = subprocess.run(
            ["python", "scripts/autopilot/guardian_monitor.py"],
            capture_output=True,
            text=True,
            timeout=60,
            cwd="/home/runner/workspace"
        )
        
        return jsonify({
            "status": "completed",
            "output": result.stdout[-2000:] if result.stdout else "",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Health check trigger error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500


@bp.get("/autopilot-status")
def get_autopilot_status():
    """
    GET /api/admin/autopilot-status
    Returns current autopilot status summary
    """
    auth_error = _require_admin("/api/admin/autopilot-status")
    if auth_error:
        return auth_error
    
    try:
        status = {
            "guardian_active": False,
            "growth_engine_active": False,
            "compliance_active": False,
            "last_health_check": None,
            "pending_approvals": 0
        }
        
        guardian_log = Path("/home/runner/workspace-data/autopilot/logs/guardian_health.log")
        if guardian_log.exists():
            status["guardian_active"] = True
            try:
                content = guardian_log.read_text()
                lines = content.strip().split("\n")
                if lines:
                    last_line = lines[-1]
                    if "[" in last_line:
                        timestamp_str = last_line.split("]")[0].replace("[", "")
                        status["last_health_check"] = timestamp_str
            except:
                pass
        
        growth_log = Path("/home/runner/workspace-data/autopilot/logs/autopilot_growth.log")
        if growth_log.exists():
            status["growth_engine_active"] = True
        
        compliance_log = Path("/home/runner/workspace-data/autopilot/logs/autopilot_compliance.log")
        if compliance_log.exists():
            status["compliance_active"] = True
        
        try:
            import requests
            approvals_resp = requests.get("http://localhost:8000/api/approvals", timeout=5)
            if approvals_resp.status_code == 200:
                approvals_data = approvals_resp.json()
                status["pending_approvals"] = approvals_data.get("stats", {}).get("pending", 0)
        except:
            pass
        
        return jsonify({
            "autopilot": status,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        log.exception("Autopilot status error")
        return jsonify({"error": "internal_error", "message": str(e)}), 500
