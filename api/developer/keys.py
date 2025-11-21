"""
Developer API Key Management
Endpoints for generating, managing, and tracking developer API keys
"""
from flask import Blueprint, request, jsonify
from uuid import uuid4
import hashlib
import secrets
from time import time
from datetime import datetime, timedelta
import sqlite3
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from scripts.helpers.notion_api_keys import log_api_key_creation, revoke_api_key_in_notion
    NOTION_AVAILABLE = True
except ImportError:
    NOTION_AVAILABLE = False
    print("⚠️ Notion helper not available")

bp = Blueprint("developer_keys", __name__, url_prefix="/api/developer")

TIER_LIMITS = {
    "sandbox": 1000,      # 1,000 calls/month
    "pro": 10000,         # 10,000 calls/month
    "enterprise": 999999999  # Unlimited
}

TIER_PRICES = {
    "sandbox": 0,
    "pro": 1900,  # $19.00 in cents
    "enterprise": 19900  # $199.00 in cents
}

def get_db():
    """Get database connection"""
    import os
    DB_PATH = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def hash_api_key(key: str) -> str:
    """Hash API key for secure storage"""
    return hashlib.sha256(key.encode()).hexdigest()

def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key
    Returns: (full_key, key_hash, key_prefix)
    """
    # Format: lvk_live_<32 random hex chars>
    random_part = secrets.token_hex(16)
    full_key = f"lvk_live_{random_part}"
    key_hash = hash_api_key(full_key)
    key_prefix = f"lvk_live_{random_part[:8]}..."
    
    return full_key, key_hash, key_prefix

def require_auth():
    """Require authenticated user via JWT token"""
    import jwt
    import os
    
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, (jsonify({"error": "unauthorized"}), 401)
    
    token = auth_header[7:]
    JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-in-prod")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            return None, (jsonify({"error": "invalid_token"}), 401)
        return user_id, None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "token_expired"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "invalid_token"}), 401)

@bp.post("/keys")
def create_api_key():
    """
    Generate a new API key for the authenticated user
    Limited to 1 active key per user (can revoke and recreate)
    
    Request body:
    {
      "tier": "sandbox" | "pro" | "enterprise"
    }
    
    Response:
    {
      "ok": true,
      "key": "lvk_live_...",
      "key_id": "uuid",
      "tier": "sandbox",
      "calls_limit": 1000,
      "reset_at": "2025-12-01T00:00:00Z"
    }
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        data = request.get_json() or {}
        tier = data.get("tier", "sandbox")
        
        if tier not in TIER_LIMITS:
            return jsonify({"error": "invalid_tier"}), 400
        
        # Check if user already has an active key
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) FROM developer_keys
            WHERE user_id = ? AND is_active = 1
        """, (user_id,))
        
        active_count = cursor.fetchone()[0]
        if active_count >= 1:
            return jsonify({"error": "key_limit_reached", "message": "You already have an active API key. Revoke it first to create a new one."}), 400
        
        # Generate new key
        full_key, key_hash, key_prefix = generate_api_key()
        key_id = str(uuid4())
        now = time()
        
        # Reset monthly on the 1st of next month
        next_month = datetime.utcnow().replace(day=1) + timedelta(days=32)
        reset_at = next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0).timestamp()
        
        # Insert into database
        cursor.execute("""
            INSERT INTO developer_keys (
                id, user_id, key_hash, key_prefix, tier,
                is_active, calls_used, calls_limit, reset_at, created_at
            ) VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?)
        """, (key_id, user_id, key_hash, key_prefix, tier, TIER_LIMITS[tier], reset_at, now))
        
        db.commit()
        db.close()
        
        # Log to Notion if available
        if NOTION_AVAILABLE:
            try:
                log_api_key_creation(user_id, key_id, tier, TIER_LIMITS[tier])
            except Exception as e:
                print(f"⚠️ Notion logging failed: {e}")
        
        return jsonify({
            "ok": True,
            "key": full_key,  # Only shown once!
            "key_id": key_id,
            "tier": tier,
            "calls_limit": TIER_LIMITS[tier],
            "reset_at": datetime.fromtimestamp(reset_at).isoformat() + "Z"
        }), 201
        
    except Exception as e:
        return jsonify({"error": "internal_error", "message": str(e)}), 500

@bp.get("/keys")
def list_api_keys():
    """
    List all API keys for the authenticated user
    
    Response:
    {
      "ok": true,
      "keys": [
        {
          "key_id": "uuid",
          "key_prefix": "lvk_live_abc123...",
          "tier": "sandbox",
          "is_active": true,
          "calls_used": 42,
          "calls_limit": 1000,
          "reset_at": "2025-12-01T00:00:00Z",
          "created_at": "2025-11-11T13:00:00Z",
          "last_used_at": "2025-11-11T14:30:00Z"
        }
      ]
    }
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT id, key_prefix, tier, is_active, calls_used, calls_limit,
                   reset_at, created_at, last_used_at
            FROM developer_keys
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        
        rows = cursor.fetchall()
        keys = []
        
        for row in rows:
            keys.append({
                "key_id": row[0],
                "key_prefix": row[1],
                "tier": row[2],
                "is_active": bool(row[3]),
                "calls_used": row[4],
                "calls_limit": row[5],
                "reset_at": datetime.fromtimestamp(row[6]).isoformat() + "Z",
                "created_at": datetime.fromtimestamp(row[7]).isoformat() + "Z",
                "last_used_at": datetime.fromtimestamp(row[8]).isoformat() + "Z" if row[8] else None
            })
        
        db.close()
        
        return jsonify({
            "ok": True,
            "keys": keys
        }), 200
        
    except Exception as e:
        return jsonify({"error": "internal_error", "message": str(e)}), 500

@bp.delete("/keys/<key_id>")
def revoke_api_key(key_id):
    """
    Revoke an API key
    
    Response:
    {
      "ok": true,
      "message": "API key revoked"
    }
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Verify ownership
        cursor.execute("""
            SELECT id FROM developer_keys
            WHERE id = ? AND user_id = ?
        """, (key_id, user_id))
        
        if not cursor.fetchone():
            return jsonify({"error": "not_found"}), 404
        
        # Deactivate the key
        cursor.execute("""
            UPDATE developer_keys
            SET is_active = 0
            WHERE id = ? AND user_id = ?
        """, (key_id, user_id))
        
        db.commit()
        db.close()
        
        # Log to Notion if available
        if NOTION_AVAILABLE:
            try:
                revoke_api_key_in_notion(key_id)
            except Exception as e:
                print(f"⚠️ Notion revoke logging failed: {e}")
        
        return jsonify({
            "ok": True,
            "message": "API key revoked"
        }), 200
        
    except Exception as e:
        return jsonify({"error": "internal_error", "message": str(e)}), 500

@bp.get("/usage")
def get_usage():
    """
    Get API usage statistics for authenticated user
    
    Response:
    {
      "ok": true,
      "current_period": {
        "calls_used": 42,
        "calls_limit": 1000,
        "calls_remaining": 958,
        "reset_at": "2025-12-01T00:00:00Z"
      },
      "tier": "sandbox"
    }
    """
    user_id, error = require_auth()
    if error:
        return error
    
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT tier, calls_used, calls_limit, reset_at
            FROM developer_keys
            WHERE user_id = ? AND is_active = 1
            LIMIT 1
        """, (user_id,))
        
        row = cursor.fetchone()
        db.close()
        
        if not row:
            return jsonify({"error": "no_active_key"}), 404
        
        tier, calls_used, calls_limit, reset_at = row
        
        return jsonify({
            "ok": True,
            "current_period": {
                "calls_used": calls_used,
                "calls_limit": calls_limit,
                "calls_remaining": max(0, calls_limit - calls_used),
                "reset_at": datetime.fromtimestamp(reset_at).isoformat() + "Z"
            },
            "tier": tier
        }), 200
        
    except Exception as e:
        return jsonify({"error": "internal_error", "message": str(e)}), 500
