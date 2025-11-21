"""
Marketplace Listings Management
Handles partner-created modules, templates, and integrations
"""
from flask import Blueprint, request, jsonify
from uuid import uuid4
from time import time
import sqlite3
import os
import json

bp = Blueprint("marketplace_listings", __name__, url_prefix="/api/marketplace")

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

@bp.get("/listings")
def get_listings():
    """
    Get marketplace listings
    
    Query params:
    - category: Filter by category
    - partner_id: Filter by partner
    - verified_only: Only show verified listings (default: true)
    - limit: Max results (default: 50)
    - offset: Pagination offset (default: 0)
    
    Response:
    {
      "ok": true,
      "listings": [...],
      "count": 10,
      "total": 100
    }
    """
    try:
        category = request.args.get("category")
        partner_id = request.args.get("partner_id")
        verified_only = request.args.get("verified_only", "true") == "true"
        limit = min(int(request.args.get("limit", 50)), 100)
        offset = int(request.args.get("offset", 0))
        
        db = get_db()
        cursor = db.cursor()
        
        # Build query
        query = """
            SELECT l.id, l.partner_id, l.name, l.description, l.category,
                   l.price_cents, l.is_verified, l.is_active, l.downloads,
                   l.rating, l.created_at, p.name as partner_name
            FROM listings l
            JOIN partners p ON l.partner_id = p.id
            WHERE l.is_active = 1
        """
        params = []
        
        if verified_only:
            query += " AND l.is_verified = 1 AND p.is_verified = 1"
        
        if category:
            query += " AND l.category = ?"
            params.append(category)
        
        if partner_id:
            query += " AND l.partner_id = ?"
            params.append(partner_id)
        
        # Get total count
        count_query = query.replace("SELECT l.id, l.partner_id, l.name, l.description, l.category, l.price_cents, l.is_verified, l.is_active, l.downloads, l.rating, l.created_at, p.name as partner_name", "SELECT COUNT(*)")
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Add ordering and pagination
        query += " ORDER BY l.downloads DESC, l.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        listings = []
        for row in rows:
            listings.append({
                "id": row[0],
                "partner_id": row[1],
                "name": row[2],
                "description": row[3],
                "category": row[4],
                "price": row[5] / 100.0,  # Convert to dollars
                "is_verified": bool(row[6]),
                "is_active": bool(row[7]),
                "downloads": row[8],
                "rating": row[9],
                "created_at": row[10],
                "partner_name": row[11]
            })
        
        db.close()
        
        return jsonify({
            "ok": True,
            "listings": listings,
            "count": len(listings),
            "total": total
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "fetch_failed",
            "message": str(e)
        }), 500

@bp.post("/listings")
def create_listing():
    """
    Create a new marketplace listing (partner only)
    
    Request body:
    {
      "partner_id": "uuid",
      "name": "My Integration",
      "description": "...",
      "category": "automation|template|integration|module",
      "price": 29.99
    }
    
    Response:
    {
      "ok": true,
      "listing_id": "uuid",
      "status": "pending_review"
    }
    """
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        partner_id = data.get("partner_id", "").strip()
        name = data.get("name", "").strip()
        category = data.get("category", "").strip()
        price = float(data.get("price", 0))
        
        if not all([partner_id, name, category]):
            return jsonify({"error": "partner_id, name, and category are required"}), 400
        
        # Validate category
        valid_categories = ["automation", "template", "integration", "module", "workflow"]
        if category not in valid_categories:
            return jsonify({"error": f"category must be one of: {', '.join(valid_categories)}"}), 400
        
        # Validate price
        if price < 0:
            return jsonify({"error": "price must be non-negative"}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Verify partner exists and is active
        cursor.execute("SELECT id, is_verified FROM partners WHERE id = ? AND is_active = 1", (partner_id,))
        partner = cursor.fetchone()
        
        if not partner:
            return jsonify({"error": "partner_not_found_or_inactive"}), 404
        
        listing_id = str(uuid4())
        now = time()
        price_cents = int(price * 100)
        
        cursor.execute("""
            INSERT INTO listings (
                id, partner_id, name, description, category,
                price_cents, is_verified, is_active, downloads,
                rating, created_at, updated_at, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, 0, 1, 0, NULL, ?, ?, ?)
        """, (
            listing_id,
            partner_id,
            name,
            data.get("description", ""),
            category,
            price_cents,
            now,
            now,
            json.dumps(data.get("metadata", {}))
        ))
        
        db.commit()
        db.close()
        
        # Log to Notion if available
        try:
            from modules.marketplace.notion_sync import log_new_listing
            log_new_listing(listing_id, name, partner_id, category, price)
        except Exception as e:
            print(f"⚠️ Notion sync failed: {e}")
        
        return jsonify({
            "ok": True,
            "listing_id": listing_id,
            "status": "pending_review",
            "message": "Listing created and pending verification"
        }), 201
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "creation_failed",
            "message": str(e)
        }), 500

@bp.get("/listings/<listing_id>")
def get_listing(listing_id):
    """
    Get listing details
    
    Response:
    {
      "ok": true,
      "listing": {...}
    }
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT l.id, l.partner_id, l.name, l.description, l.category,
                   l.price_cents, l.is_verified, l.is_active, l.downloads,
                   l.rating, l.created_at, l.updated_at, l.metadata,
                   p.name as partner_name, p.email as partner_email
            FROM listings l
            JOIN partners p ON l.partner_id = p.id
            WHERE l.id = ?
        """, (listing_id,))
        
        row = cursor.fetchone()
        db.close()
        
        if not row:
            return jsonify({"error": "listing_not_found"}), 404
        
        listing = {
            "id": row[0],
            "partner_id": row[1],
            "name": row[2],
            "description": row[3],
            "category": row[4],
            "price": row[5] / 100.0,
            "is_verified": bool(row[6]),
            "is_active": bool(row[7]),
            "downloads": row[8],
            "rating": row[9],
            "created_at": row[10],
            "updated_at": row[11],
            "metadata": json.loads(row[12]) if row[12] else {},
            "partner": {
                "name": row[13],
                "email": row[14]
            }
        }
        
        return jsonify({
            "ok": True,
            "listing": listing
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "fetch_failed",
            "message": str(e)
        }), 500

@bp.patch("/listings/<listing_id>")
def update_listing(listing_id):
    """
    Update listing (admin or partner owner)
    
    Request body:
    {
      "name": "Updated Name" (optional),
      "description": "..." (optional),
      "price": 39.99 (optional),
      "is_verified": true (admin only),
      "is_active": true (optional)
    }
    """
    try:
        data = request.get_json() or {}
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if listing exists
        cursor.execute("SELECT id FROM listings WHERE id = ?", (listing_id,))
        if not cursor.fetchone():
            return jsonify({"error": "listing_not_found"}), 404
        
        # Build update query
        updates = []
        params = []
        
        if "name" in data:
            updates.append("name = ?")
            params.append(data["name"])
        
        if "description" in data:
            updates.append("description = ?")
            params.append(data["description"])
        
        if "price" in data:
            price_cents = int(float(data["price"]) * 100)
            updates.append("price_cents = ?")
            params.append(price_cents)
        
        if "is_verified" in data:
            updates.append("is_verified = ?")
            params.append(1 if data["is_verified"] else 0)
        
        if "is_active" in data:
            updates.append("is_active = ?")
            params.append(1 if data["is_active"] else 0)
        
        if not updates:
            return jsonify({"error": "no_updates_provided"}), 400
        
        # Always update updated_at
        updates.append("updated_at = ?")
        params.append(time())
        params.append(listing_id)
        
        query = f"UPDATE listings SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        
        db.commit()
        db.close()
        
        return jsonify({
            "ok": True,
            "message": "Listing updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "update_failed",
            "message": str(e)
        }), 500

@bp.delete("/listings/<listing_id>")
def delete_listing(listing_id):
    """
    Soft delete a listing
    
    Response:
    {
      "ok": true,
      "message": "Listing deactivated"
    }
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            UPDATE listings
            SET is_active = 0, updated_at = ?
            WHERE id = ?
        """, (time(), listing_id))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "listing_not_found"}), 404
        
        db.commit()
        db.close()
        
        return jsonify({
            "ok": True,
            "message": "Listing deactivated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "delete_failed",
            "message": str(e)
        }), 500
