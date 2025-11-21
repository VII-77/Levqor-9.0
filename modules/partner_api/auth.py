"""
Partner API Authentication
Simple HMAC/JWT-based partner authentication (placeholder for future expansion)
"""
import os
import hmac
import hashlib
from flask import request, jsonify
from functools import wraps

PARTNER_API_SECRET = os.environ.get("PARTNER_API_SECRET", "change-in-production").strip()

def generate_partner_token(partner_id: str) -> str:
    """
    Generate a simple HMAC token for a partner
    
    Args:
        partner_id: Partner UUID
        
    Returns:
        HMAC token
    """
    message = f"partner:{partner_id}"
    signature = hmac.new(
        PARTNER_API_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{partner_id}:{signature}"

def verify_partner_token(token: str) -> tuple[bool, str | None]:
    """
    Verify a partner API token
    
    Args:
        token: Token in format "partner_id:signature"
        
    Returns:
        Tuple of (is_valid, partner_id)
    """
    try:
        parts = token.split(":")
        if len(parts) != 2:
            return False, None
        
        partner_id, provided_signature = parts
        expected_token = generate_partner_token(partner_id)
        expected_signature = expected_token.split(":")[1]
        
        # Use constant-time comparison to prevent timing attacks
        is_valid = hmac.compare_digest(provided_signature, expected_signature)
        
        if is_valid:
            return True, partner_id
        return False, None
        
    except Exception:
        return False, None

def require_partner_auth(f):
    """
    Decorator to require partner authentication
    
    Usage:
        @app.route("/api/partner/something")
        @require_partner_auth
        def partner_endpoint():
            partner_id = request.partner_id
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "missing_authorization"}), 401
        
        token = auth_header[7:]  # Remove "Bearer " prefix
        is_valid, partner_id = verify_partner_token(token)
        
        if not is_valid:
            return jsonify({"error": "invalid_token"}), 401
        
        # Attach partner_id to request context
        request.partner_id = partner_id
        
        return f(*args, **kwargs)
    
    return decorated_function

def issue_partner_credentials(partner_id: str) -> dict:
    """
    Issue API credentials for a newly verified partner
    
    Args:
        partner_id: Partner UUID
        
    Returns:
        Dict with token and usage instructions
    """
    token = generate_partner_token(partner_id)
    
    return {
        "partner_id": partner_id,
        "api_token": token,
        "usage": "Include in requests as: Authorization: Bearer <token>",
        "example": f"curl -H 'Authorization: Bearer {token}' https://api.levqor.ai/api/partner/..."
    }
