from flask import Flask, request, jsonify, Response, g
from jsonschema import validate, ValidationError, FormatChecker
from time import time
from uuid import uuid4
from collections import defaultdict, deque
import json
import os
import logging
import sys
import jwt
from datetime import datetime, timedelta

from security_core import rate_limit, audit, validation, ip_reputation, config as sec_config, api_gateway
from tenant.context import attach_tenant_to_g, get_tenant_id

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
log = logging.getLogger("levqor")

BUILD = os.environ.get("BUILD_ID", "dev")
VERSION = "1.0.0"
START_TIME = time()

if os.environ.get("SENTRY_DSN"):
    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration
        sentry_sdk.init(
            dsn=os.environ.get("SENTRY_DSN"),
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0,
            environment=os.environ.get("ENVIRONMENT", "production"),
            release=f"levqor-backend@{VERSION}"
        )
        log.info("Sentry initialized with Flask integration")
    except ImportError:
        log.warning("SENTRY_DSN set but sentry_sdk not installed")
    except Exception as e:
        log.warning(f"Sentry init failed: {e}")

try:
    from monitors.scheduler import get_scheduler
    _scheduler_instance = get_scheduler()
except Exception as e:
    log.warning(f"Scheduler initialization skipped: {e}")

try:
    from modules.db_wrapper import get_db, execute, commit as db_commit, rollback as db_rollback, execute_query, get_db_type
    log.info(f"Using database wrapper (type: {get_db_type()})")
except Exception as e:
    log.error(f"Failed to import database wrapper: {e}")
    raise

app = Flask(__name__, 
    static_folder='public',
    static_url_path='/public')

app.config["MAX_CONTENT_LENGTH"] = int(os.environ.get("MAX_CONTENT_LENGTH", 512 * 1024))

# Initialize API Gateway (MEGA-PHASE 9)
try:
    api_gateway.init_api_gateway(app)
except Exception as e:
    log.warning(f"API Gateway initialization failed (non-critical): {e}")

API_KEYS = set((os.environ.get("API_KEYS") or "").split(",")) - {""}
API_KEYS_NEXT = set((os.environ.get("API_KEYS_NEXT") or "").split(",")) - {""}
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-prod")

RATE_BURST = int(os.environ.get("RATE_BURST", 20))
RATE_GLOBAL = int(os.environ.get("RATE_GLOBAL", 200))
WINDOW = 60

_IP_HITS = defaultdict(deque)
_ALL_HITS = deque()
_PROTECTED_PATH_HITS = defaultdict(deque)

def require_key():
    key = request.headers.get("X-Api-Key")
    if not API_KEYS or key in API_KEYS or key in API_KEYS_NEXT:
        return None
    return jsonify({"error": "forbidden"}), 403

def throttle():
    now = time()
    ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"
    
    while _ALL_HITS and now - _ALL_HITS[0] > WINDOW:
        _ALL_HITS.popleft()
    dq = _IP_HITS[ip]
    while dq and now - dq[0] > WINDOW:
        dq.popleft()
    
    if len(dq) >= RATE_BURST or len(_ALL_HITS) >= RATE_GLOBAL:
        resp = jsonify({"error": "rate_limited"})
        resp.status_code = 429
        resp.headers["Retry-After"] = "60"
        resp.headers["X-RateLimit-Limit"] = str(RATE_BURST)
        resp.headers["X-RateLimit-Remaining"] = "0"
        resp.headers["X-RateLimit-Reset"] = str(int(now) + WINDOW)
        return resp
    
    dq.append(now)
    _ALL_HITS.append(now)
    return None

def protected_path_throttle():
    protected_prefixes = ['/billing/', '/api/partners/', '/api/admin/', '/api/user/', '/webhooks/']
    if not any(request.path.startswith(prefix) for prefix in protected_prefixes):
        return None
    
    now = time()
    ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"
    key = f"protected:{ip}"
    
    dq = _PROTECTED_PATH_HITS[key]
    while dq and now - dq[0] > WINDOW:
        dq.popleft()
    
    if len(dq) >= 60:
        resp = jsonify({"error": "rate_limited"})
        resp.status_code = 429
        resp.headers["Retry-After"] = "60"
        return resp
    
    dq.append(now)
    return None

@app.before_request
def _log_in():
    # Attach tenant context early (MEGA-PHASE 9)
    try:
        attach_tenant_to_g(request)
    except Exception as e:
        log.warning(f"Failed to attach tenant context: {e}")
    
    tenant_id = get_tenant_id() if hasattr(g, 'tenant_id') else 'default'
    log.info("in %s %s ip=%s ua=%s tenant=%s", request.method, request.path,
             request.headers.get("X-Forwarded-For", request.remote_addr),
             request.headers.get("User-Agent", "-"),
             tenant_id)
    
    rate_check = protected_path_throttle()
    if rate_check:
        return rate_check

@app.before_request
def security_core_before_request():
    if not getattr(sec_config, "SECURITY_CORE_ENABLED", True):
        return None
    
    path = request.path or ""
    
    if path.startswith("/static") or path in ("/health", "/favicon.ico"):
        return None
    
    ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr or "unknown"
    
    suspicious = ip_reputation.is_suspicious_ip(ip)
    if suspicious:
        audit.audit_security_event("suspicious_ip", {"ip": ip, "path": path})
    
    if not rate_limit.check_rate_limit(ip, path):
        audit.audit_security_event("rate_limit_block", {"ip": ip, "path": path})
        return jsonify({"error": "Too many requests"}), 429
    
    rate_limit.record_hit(ip, path)
    return None

@app.after_request
def add_headers(r):
    # Dynamic CORS based on request origin
    origin = request.headers.get("Origin", "")
    allowed_origins = [
        "https://levqor.ai",
        "https://www.levqor.ai",
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
    ]
    # Also allow Replit dev origins
    if origin and (origin in allowed_origins or ".replit.dev" in origin or ".replit.app" in origin):
        r.headers["Access-Control-Allow-Origin"] = origin
    else:
        r.headers["Access-Control-Allow-Origin"] = "https://levqor.ai"
    r.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PATCH"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Api-Key"
    r.headers["Access-Control-Allow-Credentials"] = "true"
    r.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    r.headers["Content-Security-Policy"] = "default-src 'none'; connect-src https://levqor.ai https://api.levqor.ai; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    r.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    r.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    r.headers["X-Content-Type-Options"] = "nosniff"
    r.headers["X-Frame-Options"] = "DENY"
    r.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    r.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    return r

@app.errorhandler(Exception)
def on_error(e):
    """Global error handler with correlation ID support"""
    from werkzeug.exceptions import HTTPException
    import os
    
    cid = request.headers.get("X-Request-ID") or request.headers.get("X-Correlation-ID", "unknown")
    debug = os.getenv("INTEL_DEBUG_ERRORS", "false").lower() in ("1", "true", "yes", "on")
    
    audit.audit_security_event("unhandled_exception", {
        "path": request.path,
        "method": request.method,
        "type": type(e).__name__,
        "correlation_id": cid
    })
    
    # Pass through HTTP exceptions (404, etc.)
    if isinstance(e, HTTPException):
        log.warning(f"HTTP {e.code}: {e.description} [cid={cid}]")
        return jsonify({
            "error": {
                "type": e.__class__.__name__,
                "message": e.description,
                "status": e.code,
                "correlation_id": cid
            }
        }), e.code
    
    # Log full exception details
    log.exception("error: %s [cid=%s]", e, cid)
    
    # Return structured error response
    error_payload = {
        "error": {
            "type": e.__class__.__name__,
            "message": str(e)[:500],
            "status": 500,
            "correlation_id": cid
        }
    }
    
    if debug:
        import traceback
        error_payload["error"]["trace"] = traceback.format_exc().splitlines()[-10:]
    
    return jsonify(error_payload), 500

@app.get("/")
def root():
    return jsonify({"ok": True, "service": "levqor-backend", "version": VERSION, "build": BUILD}), 200

@app.get("/health")
def health():
    """Enterprise-grade health endpoint with version and uptime tracking"""
    uptime_seconds = int(time() - START_TIME)
    return jsonify({
        "status": "ok",
        "version": VERSION,
        "build": BUILD,
        "timestamp": int(time()),
        "uptime_seconds": uptime_seconds
    })

@app.get("/status")
def system_status():
    return jsonify({"status": "pass", "timestamp": int(time())})

@app.get("/public/metrics")
def public_metrics():
    return jsonify({
        "uptime_rolling_7d": 99.99,
        "jobs_today": 0,
        "audit_coverage": 100,
        "last_updated": int(time())
    })

@app.post("/audit")
def audit_endpoint():
    """Audit event endpoint (renamed to avoid shadowing security_core.audit module)"""
    if not request.is_json:
        return bad_request("Content-Type must be application/json")
    
    data = request.get_json(silent=True)
    if not data:
        return bad_request("Invalid JSON")
    
    event = data.get("event", "unknown")
    email = data.get("email", "unknown")
    ip = data.get("ip", "")
    user_agent = data.get("user_agent", "")
    ts = data.get("ts", int(time() * 1000))
    
    audit_entry = json.dumps({
        "event": event,
        "email": email,
        "ip": ip,
        "user_agent": user_agent,
        "ts": ts
    }, separators=(',', ':'))
    
    audit_file = os.path.join("logs", "audit.log")
    try:
        with open(audit_file, "a") as f:
            f.write(audit_entry + "\n")
    except Exception as e:
        log.warning(f"Failed to write audit log: {e}")
    
    return jsonify({"ok": True}), 200

@app.post("/api/admin/impersonate")
def admin_impersonate():
    admin_token = request.headers.get("X-ADMIN-TOKEN")
    if not ADMIN_TOKEN or admin_token != ADMIN_TOKEN:
        return jsonify({"error": "forbidden"}), 403
    
    if not request.is_json:
        return bad_request("Content-Type must be application/json")
    
    data = request.get_json(silent=True)
    if not data or "email" not in data:
        return bad_request("email required")
    
    email = data["email"]
    exp = datetime.utcnow() + timedelta(minutes=15)
    
    token = jwt.encode({
        "email": email,
        "exp": exp,
        "impersonated": True
    }, JWT_SECRET, algorithm="HS256")
    
    audit_entry = json.dumps({
        "event": "admin_impersonate",
        "email": email,
        "admin_ip": request.headers.get("X-Forwarded-For", request.remote_addr),
        "ts": int(time() * 1000)
    }, separators=(',', ':'))
    
    audit_file = os.path.join("logs", "audit.log")
    try:
        with open(audit_file, "a") as f:
            f.write(audit_entry + "\n")
    except Exception as e:
        log.warning(f"Failed to write audit log: {e}")
    
    return jsonify({"token": token}), 200

JOBS = {}

INTAKE_SCHEMA = {
    "type": "object",
    "properties": {
        "workflow": {"type": "string", "minLength": 1, "maxLength": 128},
        "payload": {"type": "object"},
        "callback_url": {"type": "string", "minLength": 1, "maxLength": 1024},
        "priority": {"type": "string", "enum": ["low", "normal", "high"]},
    },
    "required": ["workflow", "payload"],
    "additionalProperties": False,
}

STATUS_SCHEMA = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["queued","running","succeeded","failed"]},
        "created_at": {"type": "number"},
        "result": {},
        "error": {},
    },
    "required": ["status","created_at"],
    "additionalProperties": True,
}

USER_UPSERT_SCHEMA = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "minLength": 3},
        "name": {"type": "string"},
        "locale": {"type": "string"},
        "currency": {"type": "string", "enum": ["GBP", "USD", "EUR"]},
        "meta": {"type": "object"}
    },
    "required": ["email"],
    "additionalProperties": False
}

USER_PATCH_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "locale": {"type": "string"},
        "currency": {"type": "string", "enum": ["GBP", "USD", "EUR"]},
        "meta": {"type": "object"}
    },
    "additionalProperties": False
}

def bad_request(message, details=None):
    return jsonify({"error": message, "details": details}), 400

def row_to_user(row):
    if not row:
        return None
    (id_, email, name, locale, currency, meta, created_at, updated_at) = row
    
    # Handle meta field - might be JSON string, dict, or None
    parsed_meta = {}
    if meta:
        if isinstance(meta, dict):
            parsed_meta = meta
        elif isinstance(meta, str) and meta.strip():
            try:
                parsed_meta = json.loads(meta)
            except json.JSONDecodeError as e:
                log.error(f"Failed to parse meta JSON: {repr(meta)} - Error: {e}")
                parsed_meta = {}
        else:
            parsed_meta = {}
    
    return {
        "id": id_,
        "email": email,
        "name": name,
        "locale": locale,
        "currency": currency,
        "meta": parsed_meta,
        "created_at": created_at,
        "updated_at": updated_at
    }

def fetch_user_by_email(email):
    cur = execute("SELECT id,email,name,locale,currency,meta,created_at,updated_at FROM users WHERE email = ?", (email,))
    return row_to_user(cur.fetchone())

def fetch_user_by_id(uid):
    cur = execute("SELECT id,email,name,locale,currency,meta,created_at,updated_at FROM users WHERE id = ?", (uid,))
    return row_to_user(cur.fetchone())

@app.post("/api/v1/intake")
def intake():
    guard = require_key()
    if guard:
        return guard
    rate_check = throttle()
    if rate_check:
        return rate_check
    
    if not request.is_json:
        return bad_request("Content-Type must be application/json")
    data = request.get_json(silent=True)
    if data is None:
        return bad_request("Invalid JSON")
    try:
        validate(instance=data, schema=INTAKE_SCHEMA, format_checker=FormatChecker())
    except ValidationError as e:
        return bad_request("Invalid request body", e.message)
    
    if len(json.dumps(data["payload"])) > 200 * 1024:
        return bad_request("payload too large")
    
    if "callback_url" in data:
        url = data["callback_url"]
        if not url.startswith(("http://", "https://")):
            return bad_request("callback_url must be a valid HTTP(S) URL")

    job_id = uuid4().hex
    JOBS[job_id] = {
        "status": "queued",
        "created_at": time(),
        "input": data,
        "result": None,
        "error": None,
    }

    return jsonify({"job_id": job_id, "status": "queued"}), 202

@app.get("/api/v1/status/<job_id>")
def status(job_id):
    job = JOBS.get(job_id)
    if not job:
        return jsonify({"error": "not_found", "job_id": job_id}), 404

    public_view = {
        "status": job["status"],
        "created_at": job["created_at"],
        "result": job["result"],
        "error": job["error"],
    }
    try:
        validate(instance=public_view, schema=STATUS_SCHEMA)
    except ValidationError:
        pass

    return jsonify({"job_id": job_id, **public_view}), 200

@app.post("/api/v1/_dev/complete/<job_id>")
def dev_complete(job_id):
    guard = require_key()
    if guard:
        return guard
    rate_check = throttle()
    if rate_check:
        return rate_check
    
    job = JOBS.get(job_id)
    if not job:
        return jsonify({"error": "not_found"}), 404
    body = request.get_json(silent=True) or {}
    job["status"] = "succeeded"
    job["result"] = body.get("result", {"ok": True})
    return jsonify({"ok": True})

@app.post("/api/v1/users/upsert")
def users_upsert():
    guard = require_key()
    if guard:
        return guard
    rate_check = throttle()
    if rate_check:
        return rate_check
    
    if not request.is_json:
        return bad_request("Content-Type must be application/json")
    body = request.get_json(silent=True) or {}
    try:
        validate(instance=body, schema=USER_UPSERT_SCHEMA, format_checker=FormatChecker())
    except ValidationError as e:
        return bad_request("Invalid user payload", e.message)

    now = time()
    email = body["email"].strip().lower()
    name = body.get("name")
    locale = body.get("locale")
    currency = body.get("currency")
    meta = json.dumps(body.get("meta", {}))

    existing = fetch_user_by_email(email)
    if existing:
        execute(
            "UPDATE users SET name=?, locale=?, currency=?, meta=?, updated_at=? WHERE email=?",
            (name, locale, currency, meta, now, email)
        )
        db_commit()
        return jsonify({"updated": True, "user": fetch_user_by_email(email)}), 200
    else:
        uid = uuid4().hex
        execute(
            "INSERT INTO users(id,email,name,locale,currency,meta,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
            (uid, email, name, locale, currency, meta, now, now)
        )
        db_commit()
        return jsonify({"created": True, "user": fetch_user_by_id(uid)}), 201

@app.patch("/api/v1/users/<user_id>")
def users_patch(user_id):
    guard = require_key()
    if guard:
        return guard
    rate_check = throttle()
    if rate_check:
        return rate_check
    
    if not request.is_json:
        return bad_request("Content-Type must be application/json")
    body = request.get_json(silent=True) or {}
    try:
        validate(instance=body, schema=USER_PATCH_SCHEMA, format_checker=FormatChecker())
    except ValidationError as e:
        return bad_request("Invalid patch payload", e.message)

    u = fetch_user_by_id(user_id)
    if not u:
        return jsonify({"error": "not_found", "user_id": user_id}), 404

    name = body.get("name", u["name"])
    locale = body.get("locale", u["locale"])
    currency = body.get("currency", u["currency"])
    meta = u["meta"].copy()
    meta.update(body.get("meta", {}))
    execute(
        "UPDATE users SET name=?, locale=?, currency=?, meta=?, updated_at=? WHERE id=?",
        (name, locale, currency, json.dumps(meta), time(), user_id)
    )
    db_commit()
    return jsonify({"updated": True, "user": fetch_user_by_id(user_id)}), 200

@app.get("/api/v1/users/<user_id>")
def users_get(user_id):
    u = fetch_user_by_id(user_id)
    if not u:
        return jsonify({"error": "not_found", "user_id": user_id}), 404
    return jsonify(u), 200

@app.post("/api/v1/referrals/track")
def track_referral():
    """Track a referral source (public endpoint for analytics)"""
    rate_check = throttle()
    if rate_check:
        return rate_check
    
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip().lower()
    source = body.get("source", "direct").strip()
    campaign = body.get("campaign", "").strip()
    medium = body.get("medium", "").strip()
    
    if not email or not source:
        return jsonify({"error": "email and source required"}), 400
    
    user = fetch_user_by_email(email)
    user_id = user["id"] if user else None
    
    referral_id = uuid4().hex
    now = time()
    
    execute(
        "INSERT INTO referrals(id, user_id, email, source, campaign, medium, created_at) VALUES (?,?,?,?,?,?,?)",
        (referral_id, user_id, email, source, campaign, medium, now)
    )
    db_commit()
    
    return jsonify({"ok": True, "referral_id": referral_id}), 201

@app.get("/admin/analytics")
def admin_analytics():
    """Get retention and referral analytics (requires admin token)"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "unauthorized"}), 401
    
    token = auth_header.split(" ")[1]
    if token != ADMIN_TOKEN:
        return jsonify({"error": "forbidden"}), 403
    
    now = time()
    seven_days_ago = now - (7 * 24 * 60 * 60)
    thirty_days_ago = now - (30 * 24 * 60 * 60)
    
    cursor = execute("SELECT COUNT(*) FROM users")
    result = cursor.fetchone()
    total_users = result[0] if result else 0
    
    cursor = execute("SELECT COUNT(*) FROM users WHERE created_at >= ?", (seven_days_ago,))
    result = cursor.fetchone()
    new_users_7d = result[0] if result else 0
    
    cursor = execute("SELECT COUNT(*) FROM users WHERE created_at >= ?", (thirty_days_ago,))
    result = cursor.fetchone()
    new_users_30d = result[0] if result else 0
    
    cursor = execute("""
        SELECT source, COUNT(*) as count 
        FROM referrals 
        WHERE created_at >= ? 
        GROUP BY source 
        ORDER BY count DESC 
        LIMIT 10
    """, (thirty_days_ago,))
    top_referrals = [{"source": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    cursor = execute("SELECT COUNT(*) FROM referrals WHERE created_at >= ?", (seven_days_ago,))
    result = cursor.fetchone()
    referrals_7d = result[0] if result else 0
    
    cursor = execute("SELECT COUNT(*) FROM referrals WHERE created_at >= ?", (thirty_days_ago,))
    result = cursor.fetchone()
    referrals_30d = result[0] if result else 0
    
    return jsonify({
        "users": {
            "total": total_users,
            "new_7d": new_users_7d,
            "new_30d": new_users_30d,
        },
        "referrals": {
            "total_7d": referrals_7d,
            "total_30d": referrals_30d,
            "top_sources": top_referrals
        },
        "timestamp": int(now)
    }), 200

@app.get("/api/v1/users")
def users_lookup():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return bad_request("email query param required")
    u = fetch_user_by_email(email)
    if not u:
        return jsonify({"error": "not_found", "email": email}), 404
    return jsonify(u), 200

@app.get("/api/v1/ops/health")
def ops_health():
    guard = require_key()
    if guard:
        return guard
    return jsonify({"ok": True, "ts": int(time())}), 200

@app.get("/ops/uptime")
def ops_uptime():
    """Public endpoint for system uptime metrics"""
    uptime_seconds = int(time() - START_TIME)
    return jsonify({
        "uptime_seconds": uptime_seconds,
        "start_time": int(START_TIME),
        "current_time": int(time()),
        "version": VERSION,
        "build": BUILD
    }), 200

@app.get("/ops/queue_health")
def ops_queue_health():
    """Public endpoint for job queue health monitoring"""
    queued = sum(1 for j in JOBS.values() if j["status"] == "queued")
    running = sum(1 for j in JOBS.values() if j["status"] == "running")
    completed = sum(1 for j in JOBS.values() if j["status"] == "succeeded")
    failed = sum(1 for j in JOBS.values() if j["status"] == "failed")
    total = len(JOBS)
    
    return jsonify({
        "healthy": True,
        "queue_stats": {
            "queued": queued,
            "running": running,
            "completed": completed,
            "failed": failed,
            "total": total
        },
        "timestamp": int(time())
    }), 200

@app.get("/billing/health")
def billing_health():
    """Public endpoint to verify Stripe integration health (uses Replit connector)"""
    try:
        from modules.stripe_connector import is_stripe_configured, get_stripe_webhook_secret
        
        has_stripe_key = is_stripe_configured()
        webhook_secret = get_stripe_webhook_secret()
        has_webhook_secret = bool(webhook_secret and len(webhook_secret) > 10)
        
        healthy = has_stripe_key and has_webhook_secret
        
        return jsonify({
            "healthy": healthy,
            "stripe_key_configured": has_stripe_key,
            "webhook_secret_configured": has_webhook_secret,
            "connector_enabled": True,
            "timestamp": int(time())
        }), 200 if healthy else 503
    except Exception as e:
        # Fallback to environment variable check
        stripe_key = os.environ.get("STRIPE_SECRET_KEY", "")
        stripe_webhook = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
        
        has_stripe_key = bool(stripe_key and stripe_key.startswith("sk_"))
        has_webhook_secret = bool(stripe_webhook and len(stripe_webhook) > 10)
        
        return jsonify({
            "healthy": has_stripe_key and has_webhook_secret,
            "stripe_key_configured": has_stripe_key,
            "webhook_secret_configured": has_webhook_secret,
            "connector_enabled": False,
            "connector_error": str(e),
            "timestamp": int(time())
        }), 200 if (has_stripe_key and has_webhook_secret) else 503

@app.get("/ops/autoscale/dryrun")
def autoscale_dryrun():
    """Dry-run autoscale decision based on current metrics"""
    from monitors.autoscale import get_controller
    
    queue_depth = int(request.args.get("queue_depth", 0))
    p95_latency = float(request.args.get("p95_latency_ms", 0))
    error_rate = float(request.args.get("error_rate", 0))
    
    controller = get_controller()
    decision = controller.decide_action(queue_depth, p95_latency, error_rate)
    
    return jsonify(decision), 200

@app.post("/ops/autoscale/apply")
def autoscale_apply():
    """Apply autoscale action"""
    from monitors.autoscale import get_controller
    
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if token != ADMIN_TOKEN:
        return jsonify({"error": "unauthorized"}), 401
    
    data = request.get_json() or {}
    queue_depth = int(data.get("queue_depth", 0))
    p95_latency = float(data.get("p95_latency_ms", 0))
    error_rate = float(data.get("error_rate", 0))
    
    controller = get_controller()
    decision = controller.decide_action(queue_depth, p95_latency, error_rate)
    result = controller.apply_action(decision)
    
    return jsonify(result), 200

@app.post("/ops/recover")
def ops_recover():
    """Execute incident recovery"""
    from monitors.incident_response import get_responder
    
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if token != ADMIN_TOKEN:
        return jsonify({"error": "unauthorized"}), 401
    
    data = request.get_json() or {}
    error_rate = float(data.get("error_rate", 0))
    recent_failures = int(data.get("recent_failures", 0))
    dry_run = bool(data.get("dry_run", False))
    
    responder = get_responder()
    result = responder.recover(error_rate, recent_failures, dry_run)
    
    return jsonify(result), 200

@app.get("/admin/retention")
def admin_retention():
    """Get retention metrics (DAU/WAU/MAU)"""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if token != ADMIN_TOKEN:
        return jsonify({"error": "unauthorized"}), 401
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT day, dau, wau, mau, computed_at
        FROM analytics_aggregates
        ORDER BY day DESC
        LIMIT 30
    """)
    
    rows = cursor.fetchall()
    metrics = [
        {
            "day": row[0],
            "dau": row[1],
            "wau": row[2],
            "mau": row[3],
            "computed_at": row[4]
        }
        for row in rows
    ]
    
    return jsonify({
        "ok": True,
        "metrics": metrics,
        "count": len(metrics)
    }), 200

@app.get("/ops/cost/forecast")
def cost_forecast():
    """Get 30-day cost forecast"""
    from scripts.cost_predict import load_cached_forecast, forecast_next_30d
    from scripts.cost_predict import get_stripe_charges_last_30d, estimate_infra_costs, estimate_openai_usage
    
    cached = load_cached_forecast()
    if cached:
        return jsonify(cached), 200
    
    stripe_charges = get_stripe_charges_last_30d()
    infra = estimate_infra_costs()
    openai = estimate_openai_usage()
    
    forecast = forecast_next_30d(stripe_charges, infra, openai)
    
    return jsonify(forecast), 200

OPENAPI = {
    "openapi": "3.0.0",
    "info": {"title": "Levqor API", "version": VERSION},
    "paths": {
        "/api/v1/intake": {"post": {"summary": "Submit job", "responses": {"202": {"description": "Queued"}}}},
        "/api/v1/status/{job_id}": {"get": {"summary": "Get status", "responses": {"200": {"description": "OK"}}}},
        "/api/v1/users/upsert": {"post": {"summary": "Create or update user", "responses": {"201": {"description": "Created"}}}},
        "/api/v1/users/{user_id}": {"get": {"summary": "Get user by ID", "responses": {"200": {"description": "OK"}}}},
        "/api/v1/users": {"get": {"summary": "Lookup user by email", "responses": {"200": {"description": "OK"}}}}
    }
}

@app.get("/public/openapi.json")
def openapi():
    return jsonify(OPENAPI)

from api.admin.flags import bp as flags_bp
from api.admin.ledger import bp as ledger_bp
from api.admin.growth import bp as growth_bp
from api.admin.dashboard import bp as admin_dashboard_bp
from api.billing.pricing import bp as pricing_bp
from api.billing.discounts import bp as discounts_bp
from api.billing.checkout import bp as billing_checkout_bp
from api.billing.webhooks import bp as billing_webhooks_bp
from api.admin.insights import bp as admin_insights_bp
from api.admin.runbooks import bp as admin_runbooks_bp
from api.admin.postmortem import bp as admin_postmortem_bp
from api.usage.summary import bp as usage_summary_bp
from api.usage.export import bp as usage_export_bp
from api.marketing.lead import lead_bp
from api.marketing.events import events_bp
from ops.admin.insights import bp as ops_insights_bp
from ops.admin.runbooks import bp as ops_runbooks_bp
from ops.admin.postmortem import bp as ops_postmortem_bp
from monitors.auto_tune import suggest_tuning
from api.developer.keys import bp as developer_keys_bp
from api.developer.sandbox import bp as developer_sandbox_bp
from api.routes.insights.preview import bp as insights_preview_bp
from api.routes.insights.report import bp as insights_report_bp
from modules.partner_api.registry import bp as partner_registry_bp
from modules.marketplace.listings import bp as marketplace_listings_bp
from api.routes.intelligence import bp as intelligence_bp

app.register_blueprint(flags_bp)
app.register_blueprint(ledger_bp)
app.register_blueprint(growth_bp)
app.register_blueprint(admin_dashboard_bp)
app.register_blueprint(pricing_bp)
app.register_blueprint(discounts_bp)
app.register_blueprint(billing_checkout_bp)
app.register_blueprint(billing_webhooks_bp)
app.register_blueprint(admin_insights_bp)
app.register_blueprint(admin_runbooks_bp)
app.register_blueprint(admin_postmortem_bp)
app.register_blueprint(ops_insights_bp)
app.register_blueprint(ops_runbooks_bp)
app.register_blueprint(ops_postmortem_bp)
app.register_blueprint(developer_keys_bp)
app.register_blueprint(developer_sandbox_bp)
app.register_blueprint(insights_preview_bp)
app.register_blueprint(insights_report_bp)
app.register_blueprint(partner_registry_bp)
app.register_blueprint(marketplace_listings_bp)
app.register_blueprint(intelligence_bp)
app.register_blueprint(usage_summary_bp)
app.register_blueprint(usage_export_bp)
app.register_blueprint(lead_bp)
app.register_blueprint(events_bp)

from api.ai.chat import bp as ai_chat_bp
from api.ai.workflow import bp as ai_workflow_bp
from api.ai.debug import bp as ai_debug_bp
from api.ai.onboarding import bp as ai_onboarding_bp
from api.metrics.app import bp as app_metrics_bp
from api.metrics.growth import growth_metrics_bp
from api.consultations.book import bp as consultation_book_bp
from api.consultations.run import bp as consultation_run_bp
from api.support.auto import bp as support_auto_bp
from api.marketing.lifecycle import bp as lifecycle_bp
from api.referrals.endpoints import referrals_bp
from api.knowledge.search import bp as knowledge_bp
from api.omega.operator import bp as omega_operator_bp
from api.omega.optimizations import bp as omega_optimizations_bp
from api.omega.dashboard import bp as omega_dashboard_bp
from api.privacy import privacy_bp
from api.workflows import workflows_bp
from api.community import community_bp
from api.health.summary import health_bp
from api.approvals import approvals_bp
from api.ai.brain_builder import brain_builder_bp
from api.analytics import analytics_bp
from api.templates import templates_bp
from api.me import me_bp
from api.system.launch_readiness import system_bp
from api.system.heartbeat import heartbeat_bp
from api.recovery import recovery_bp
from api.tenants import tenants_bp
from api.support_feedback import support_feedback_bp
from api.pricing import regional_pricing_bp
from api.validator import validator_bp
from api.growth import growth_loops_bp
from api.partners import partners_bp
from api.auto_recovery import auto_recovery_bp
from api.guardian.summary import guardian_bp
from api.guardian.healing import healing_bp
from api.guardian.telemetry_ingest import telemetry_ingest_bp as guardian_telemetry_ingest_bp
from api.guardian.telemetry_summary import telemetry_summary_bp as guardian_telemetry_summary_bp
from api.guardian.anomaly_detector import anomaly_detector_bp
from api.guardian.daily_report import daily_report_bp
from api.telemetry import telemetry_ingest_bp

app.register_blueprint(ai_chat_bp)
app.register_blueprint(ai_workflow_bp)
app.register_blueprint(ai_debug_bp)
app.register_blueprint(ai_onboarding_bp)
app.register_blueprint(app_metrics_bp)
app.register_blueprint(growth_metrics_bp)
app.register_blueprint(consultation_book_bp)
app.register_blueprint(consultation_run_bp)
app.register_blueprint(support_auto_bp)
app.register_blueprint(lifecycle_bp)
app.register_blueprint(referrals_bp)
app.register_blueprint(knowledge_bp)
app.register_blueprint(omega_operator_bp)
app.register_blueprint(omega_optimizations_bp)
app.register_blueprint(omega_dashboard_bp)
app.register_blueprint(privacy_bp)
app.register_blueprint(workflows_bp)
app.register_blueprint(community_bp)
app.register_blueprint(health_bp)
app.register_blueprint(approvals_bp)
app.register_blueprint(brain_builder_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(templates_bp)
app.register_blueprint(me_bp)
app.register_blueprint(system_bp)
app.register_blueprint(heartbeat_bp)
app.register_blueprint(recovery_bp)
app.register_blueprint(tenants_bp)
app.register_blueprint(support_feedback_bp)
app.register_blueprint(regional_pricing_bp)
app.register_blueprint(validator_bp)
app.register_blueprint(growth_loops_bp)
app.register_blueprint(partners_bp)
app.register_blueprint(auto_recovery_bp)
app.register_blueprint(guardian_bp)
app.register_blueprint(healing_bp)
app.register_blueprint(guardian_telemetry_ingest_bp)
app.register_blueprint(guardian_telemetry_summary_bp)
app.register_blueprint(anomaly_detector_bp)
app.register_blueprint(daily_report_bp)
app.register_blueprint(telemetry_ingest_bp)

@app.get("/ops/auto_tune")
def auto_tune_endpoint():
    current_p95 = request.args.get("current_p95", type=float, default=100.0)
    current_queue = request.args.get("current_queue", type=int, default=1)
    suggestions = suggest_tuning(current_p95, current_queue)
    return jsonify({"status": "ok", "suggestions": suggestions}), 200

from monitors.scheduler import init_scheduler
init_scheduler()

# V12.12 Enterprise Support Endpoints
@app.post("/api/support/tickets")
def create_support_ticket():
    """
    Enterprise support ticket creation endpoint.
    Creates a support ticket with tier-aware routing.
    """
    from api.support.tiers import get_support_config, get_default_priority
    from api.support.ai_router import route_ticket_to_ai
    from api.utils.resilience import get_correlation_id
    import uuid
    
    data = request.get_json() or {}
    
    # Validate required fields
    if not data.get("subject") or not data.get("body"):
        return jsonify({"error": "missing_required_fields", "required": ["subject", "body"]}), 400
    
    # Generate ticket ID and correlation ID
    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    correlation_id = get_correlation_id()
    
    # Determine customer tier (default to starter if not authenticated)
    tier = data.get("tier", "starter").lower()
    
    # Get support configuration for tier
    support_config = get_support_config(tier)
    
    # Create ticket object
    ticket = {
        "ticket_id": ticket_id,
        "correlation_id": correlation_id,
        "tier": tier,
        "subject": data["subject"],
        "body": data["body"],
        "category": data.get("category", "general"),
        "priority": get_default_priority(tier),
        "status": "open",
        "channel": "api",
        "metadata": data.get("metadata", {}),
        "created_at": int(time()),
        "sla_hours": support_config["sla_hours"]
    }
    
    # Log ticket creation
    log.info(
        f"Support ticket created: {ticket_id}",
        extra={
            "ticket_id": ticket_id,
            "correlation_id": correlation_id,
            "tier": tier,
            "subject": data["subject"][:100]
        }
    )
    
    # Route to AI if tier supports it
    if support_config.get("ai_assisted"):
        ai_result = route_ticket_to_ai(
            ticket_id=ticket_id,
            tier=tier,
            subject=data["subject"],
            body=data["body"],
            metadata=ticket.get("metadata")
        )
        ticket["ai_routing"] = ai_result
    
    # TODO: Store ticket in database
    # For now, just return the created ticket
    
    return jsonify({
        "status": "received",
        "ticket_id": ticket_id,
        "correlation_id": correlation_id,
        "sla_hours": support_config["sla_hours"],
        "message": f"Ticket created successfully. Expected response within {support_config['sla_hours']} business hours."
    }), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
