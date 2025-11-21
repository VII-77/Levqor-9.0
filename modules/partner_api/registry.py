"""
Partner Registry System
Manages partner registration, CRUD operations, and verification
"""
from flask import Blueprint, request, jsonify
from uuid import uuid4
from time import time
import sqlite3
import os
import json

bp = Blueprint("partner_registry", __name__, url_prefix="/api/partners")

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

@bp.post("/register")
def register_partner():
    """
    Register a new partner
    
    Request body:
    {
      "name": "Partner Name",
      "email": "partner@example.com",
      "webhook_url": "https://partner.com/webhook" (optional),
      "revenue_share": 0.7 (optional, default 70%)
    }
    
    Response:
    {
      "ok": true,
      "partner_id": "uuid",
      "status": "pending_approval"
    }
    """
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        
        if not name or not email:
            return jsonify({"error": "name and email are required"}), 400
        
        # Validate webhook URL if provided
        webhook_url = data.get("webhook_url", "").strip()
        if webhook_url and not webhook_url.startswith("https://"):
            return jsonify({"error": "webhook_url must use HTTPS"}), 400
        
        # Validate revenue share
        revenue_share = float(data.get("revenue_share", 0.7))
        if not (0.0 <= revenue_share <= 1.0):
            return jsonify({"error": "revenue_share must be between 0 and 1"}), 400
        
        partner_id = str(uuid4())
        now = time()
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if email already registered
        cursor.execute("SELECT id FROM partners WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"error": "email_already_registered"}), 400
        
        # Insert partner
        cursor.execute("""
            INSERT INTO partners (
                id, name, email, webhook_url, revenue_share,
                is_verified, is_active, created_at, updated_at, metadata
            ) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?)
        """, (
            partner_id,
            name,
            email,
            webhook_url or None,
            revenue_share,
            now,
            now,
            json.dumps(data.get("metadata", {}))
        ))
        
        db.commit()
        db.close()
        
        # Log to Notion if available
        try:
            from modules.partner_api.notion_sync import log_partner_registration
            log_partner_registration(partner_id, name, email)
        except Exception as e:
            print(f"⚠️ Notion sync failed: {e}")
        
        return jsonify({
            "ok": True,
            "partner_id": partner_id,
            "status": "pending_approval",
            "message": "Partner registration submitted for review"
        }), 201
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "registration_failed",
            "message": str(e)
        }), 500

@bp.get("")
def list_partners():
    """
    List all partners (verified only by default)
    
    Query params:
    - include_unverified: include pending partners
    - include_inactive: include deactivated partners
    
    Response:
    {
      "ok": true,
      "partners": [...]
    }
    """
    try:
        include_unverified = request.args.get("include_unverified") == "true"
        include_inactive = request.args.get("include_inactive") == "true"
        
        db = get_db()
        cursor = db.cursor()
        
        query = "SELECT id, name, email, webhook_url, revenue_share, is_verified, is_active, created_at FROM partners WHERE 1=1"
        
        if not include_unverified:
            query += " AND is_verified = 1"
        
        if not include_inactive:
            query += " AND is_active = 1"
        
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        partners = []
        for row in rows:
            partners.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "webhook_url": row[3],
                "revenue_share": row[4],
                "is_verified": bool(row[5]),
                "is_active": bool(row[6]),
                "created_at": row[7]
            })
        
        db.close()
        
        return jsonify({
            "ok": True,
            "partners": partners,
            "count": len(partners)
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "fetch_failed",
            "message": str(e)
        }), 500

@bp.get("/<partner_id>")
def get_partner(partner_id):
    """
    Get partner details by ID
    
    Response:
    {
      "ok": true,
      "partner": {...}
    }
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT id, name, email, webhook_url, revenue_share,
                   is_verified, is_active, stripe_connect_id,
                   created_at, updated_at, metadata
            FROM partners
            WHERE id = ?
        """, (partner_id,))
        
        row = cursor.fetchone()
        db.close()
        
        if not row:
            return jsonify({"error": "partner_not_found"}), 404
        
        partner = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "webhook_url": row[3],
            "revenue_share": row[4],
            "is_verified": bool(row[5]),
            "is_active": bool(row[6]),
            "stripe_connect_id": row[7],
            "created_at": row[8],
            "updated_at": row[9],
            "metadata": json.loads(row[10]) if row[10] else {}
        }
        
        return jsonify({
            "ok": True,
            "partner": partner
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "fetch_failed",
            "message": str(e)
        }), 500

@bp.patch("/<partner_id>")
def update_partner(partner_id):
    """
    Update partner details (admin only in production)
    
    Request body:
    {
      "name": "New Name" (optional),
      "webhook_url": "https://new-url.com" (optional),
      "is_verified": true (optional),
      "is_active": true (optional),
      "stripe_connect_id": "acct_xxx" (optional)
    }
    """
    try:
        data = request.get_json() or {}
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if partner exists
        cursor.execute("SELECT id FROM partners WHERE id = ?", (partner_id,))
        if not cursor.fetchone():
            return jsonify({"error": "partner_not_found"}), 404
        
        # Build update query
        updates = []
        params = []
        
        if "name" in data:
            updates.append("name = ?")
            params.append(data["name"])
        
        if "webhook_url" in data:
            webhook = data["webhook_url"].strip()
            if webhook and not webhook.startswith("https://"):
                return jsonify({"error": "webhook_url must use HTTPS"}), 400
            updates.append("webhook_url = ?")
            params.append(webhook or None)
        
        if "is_verified" in data:
            updates.append("is_verified = ?")
            params.append(1 if data["is_verified"] else 0)
        
        if "is_active" in data:
            updates.append("is_active = ?")
            params.append(1 if data["is_active"] else 0)
        
        if "stripe_connect_id" in data:
            updates.append("stripe_connect_id = ?")
            params.append(data["stripe_connect_id"])
        
        if not updates:
            return jsonify({"error": "no_updates_provided"}), 400
        
        # Always update updated_at
        updates.append("updated_at = ?")
        params.append(time())
        params.append(partner_id)
        
        query = f"UPDATE partners SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        
        db.commit()
        db.close()
        
        return jsonify({
            "ok": True,
            "message": "Partner updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "update_failed",
            "message": str(e)
        }), 500

@bp.delete("/<partner_id>")
def delete_partner(partner_id):
    """
    Soft delete a partner (sets is_active = 0)
    
    Response:
    {
      "ok": true,
      "message": "Partner deactivated"
    }
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            UPDATE partners
            SET is_active = 0, updated_at = ?
            WHERE id = ?
        """, (time(), partner_id))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "partner_not_found"}), 404
        
        db.commit()
        db.close()
        
        return jsonify({
            "ok": True,
            "message": "Partner deactivated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "delete_failed",
            "message": str(e)
        }), 500
