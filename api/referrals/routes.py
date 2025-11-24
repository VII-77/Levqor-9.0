"""
Referral Engine - MEGA-PHASE 6
Lightweight referral system with JSON storage (no DB changes)
"""
from flask import Blueprint, request, jsonify
import json
import os
import datetime
import re
import uuid
import logging

bp = Blueprint("referrals", __name__, url_prefix="/api/referrals")
log = logging.getLogger("levqor.referrals")

DATA_PATH = os.path.join(os.getcwd(), "workspace-data", "referrals.json")
EMAIL_RE = re.compile(r".+@.+\..+")


def _load_referrals():
    """Load referrals from JSON file."""
    if not os.path.exists(DATA_PATH):
        return []
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log.error(f"Failed to load referrals: {e}")
        return []


def _save_referrals(data):
    """Save referrals to JSON file."""
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    try:
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log.error(f"Failed to save referrals: {e}")


def _generate_code():
    """Generate a short URL-safe referral code."""
    return uuid.uuid4().hex[:10]


@bp.post("/create")
def create_referral():
    """
    Create a new referral code for a user.
    
    Request: { "email": "user@example.com" }
    Response: { "success": bool, "referral_code": str, "referral_url": str }
    """
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"success": False, "error": "invalid_json"}), 400
    
    email = (data.get("email") or "").strip()
    
    if not email:
        return jsonify({"success": False, "error": "email is required"}), 400
    
    if not EMAIL_RE.match(email):
        return jsonify({"success": False, "error": "invalid_email"}), 400
    
    # Check if email already has a referral code
    referrals = _load_referrals()
    existing = next((r for r in referrals if r["email"] == email), None)
    
    if existing:
        # Return existing code
        code = existing["code"]
    else:
        # Generate new code
        code = _generate_code()
        
        record = {
            "code": code,
            "email": email,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "visits": 0,
            "signups": 0
        }
        
        referrals.append(record)
        _save_referrals(referrals)
        
        log.info(f"Referral created: code={code}, email={email[:3]}***")
    
    referral_url = f"https://levqor.ai/?ref={code}"
    
    return jsonify({
        "success": True,
        "referral_code": code,
        "referral_url": referral_url
    }), 200


@bp.post("/track")
def track_referral():
    """
    Track referral events (visit or signup).
    
    Request: { "code": "abc123xyz", "event": "visit" | "signup" }
    Response: { "success": bool }
    """
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"success": False, "error": "invalid_json"}), 400
    
    code = (data.get("code") or "").strip()
    event = (data.get("event") or "").strip().lower()  # Normalize to lowercase
    
    if not code:
        return jsonify({"success": False, "error": "code is required"}), 400
    
    # CRITICAL FIX: Strict validation - only accept "visit" or "signup"
    if event not in ("visit", "signup"):
        return jsonify({"success": False, "error": "event must be 'visit' or 'signup'"}), 400
    
    # Load referrals and find matching code
    referrals = _load_referrals()
    found = False
    
    for referral in referrals:
        if referral["code"] == code:
            # CRITICAL FIX: Only increment the specific counter for the valid event
            if event == "visit":
                referral["visits"] = referral.get("visits", 0) + 1
            elif event == "signup":
                referral["signups"] = referral.get("signups", 0) + 1
            found = True
            break
    
    if not found:
        return jsonify({"success": False, "error": "referral code not found"}), 404
    
    _save_referrals(referrals)
    
    log.info(f"Referral tracked: code={code}, event={event}")
    
    return jsonify({"success": True}), 200


@bp.get("/stats/<code>")
def get_referral_stats(code):
    """
    Get stats for a specific referral code (optional endpoint).
    
    Response: { "success": bool, "stats": { "visits": int, "signups": int } }
    """
    referrals = _load_referrals()
    referral = next((r for r in referrals if r["code"] == code), None)
    
    if not referral:
        return jsonify({"success": False, "error": "referral code not found"}), 404
    
    return jsonify({
        "success": True,
        "stats": {
            "visits": referral.get("visits", 0),
            "signups": referral.get("signups", 0)
        }
    }), 200
