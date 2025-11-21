"""
Sandbox API - Mock/Test endpoints for developer testing
All sandbox endpoints return fake data for safe testing
"""
from flask import Blueprint, request, jsonify
from uuid import uuid4
from time import time
from datetime import datetime, timedelta

bp = Blueprint("developer_sandbox", __name__, url_prefix="/api/sandbox")

def require_dev_key():
    """Validate developer API key (sandbox or production)"""
    import hashlib
    import sqlite3
    import os
    
    key = request.headers.get("x-api-key") or request.headers.get("X-Api-Key")
    
    if not key:
        return None, (jsonify({"error": "missing_api_key"}), 401)
    
    # Hash the provided key
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    
    # Look up in database
    DB_PATH = os.environ.get("SQLITE_PATH", "levqor.db")
    db = sqlite3.connect(DB_PATH, check_same_thread=False)
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT id, user_id, tier, calls_used, calls_limit, reset_at, is_active
        FROM developer_keys
        WHERE key_hash = ?
    """, (key_hash,))
    
    row = cursor.fetchone()
    
    if not row:
        db.close()
        return None, (jsonify({"error": "invalid_api_key"}), 401)
    
    key_id, user_id, tier, calls_used, calls_limit, reset_at, is_active = row
    
    if not is_active:
        db.close()
        return None, (jsonify({"error": "api_key_revoked"}), 401)
    
    # Check if reset needed
    now = time()
    if now >= reset_at:
        # Reset monthly counter
        from datetime import datetime, timedelta
        next_month = datetime.utcnow().replace(day=1) + timedelta(days=32)
        new_reset_at = next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0).timestamp()
        
        cursor.execute("""
            UPDATE developer_keys
            SET calls_used = 0, reset_at = ?
            WHERE id = ?
        """, (new_reset_at, key_id))
        db.commit()
        calls_used = 0
    
    # Check quota
    if calls_used >= calls_limit:
        db.close()
        return None, (jsonify({"error": "quota_exceeded", "reset_at": datetime.fromtimestamp(reset_at).isoformat()}), 429)
    
    # Increment usage
    cursor.execute("""
        UPDATE developer_keys
        SET calls_used = calls_used + 1, last_used_at = ?
        WHERE id = ?
    """, (now, key_id))
    
    db.commit()
    db.close()
    
    return {"key_id": key_id, "user_id": user_id, "tier": tier}, None

@bp.post("/jobs")
def sandbox_create_job():
    """
    Sandbox endpoint: Create a mock job
    
    Request:
    {
      "workflow": "data-enrichment",
      "payload": {...}
    }
    
    Response:
    {
      "ok": true,
      "job_id": "mock-uuid",
      "status": "queued",
      "message": "Sandbox job created (no actual processing)"
    }
    """
    key_info, error = require_dev_key()
    if error:
        return error
    
    data = request.get_json() or {}
    
    job_id = f"sandbox_{str(uuid4())}"
    
    return jsonify({
        "ok": True,
        "job_id": job_id,
        "status": "queued",
        "workflow": data.get("workflow", "unknown"),
        "message": "Sandbox job created (no actual processing)",
        "sandbox_mode": True
    }), 202

@bp.get("/jobs/<job_id>")
def sandbox_get_job(job_id):
    """
    Sandbox endpoint: Get mock job status
    
    Response:
    {
      "ok": true,
      "job_id": "sandbox_...",
      "status": "completed",
      "result": {...}
    }
    """
    key_info, error = require_dev_key()
    if error:
        return error
    
    # Always return completed with mock data
    return jsonify({
        "ok": True,
        "job_id": job_id,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "completed_at": datetime.utcnow().isoformat() + "Z",
        "result": {
            "message": "Sandbox job completed successfully",
            "data": {
                "processed": True,
                "items_enriched": 42,
                "cost_saved": 12.50
            }
        },
        "sandbox_mode": True
    }), 200

@bp.get("/users/<user_id>")
def sandbox_get_user(user_id):
    """
    Sandbox endpoint: Get mock user
    
    Response:
    {
      "ok": true,
      "user": {
        "id": "...",
        "email": "mock@example.com",
        ...
      }
    }
    """
    key_info, error = require_dev_key()
    if error:
        return error
    
    return jsonify({
        "ok": True,
        "user": {
            "id": user_id,
            "email": "sandbox.user@example.com",
            "name": "Sandbox User",
            "created_at": "2025-01-01T00:00:00Z",
            "plan": "pro",
            "sandbox_mode": True
        }
    }), 200

@bp.get("/metrics")
def sandbox_metrics():
    """
    Sandbox endpoint: Get mock metrics
    
    Response:
    {
      "ok": true,
      "metrics": {
        "jobs_completed": 1234,
        "uptime": 99.99,
        ...
      }
    }
    """
    key_info, error = require_dev_key()
    if error:
        return error
    
    return jsonify({
        "ok": True,
        "metrics": {
            "jobs_completed": 1234,
            "jobs_queued": 5,
            "uptime_7d": 99.99,
            "uptime_30d": 99.95,
            "avg_response_time_ms": 120,
            "total_users": 567,
            "active_users_today": 89,
            "sandbox_mode": True
        }
    }), 200
