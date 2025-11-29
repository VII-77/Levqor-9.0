"""
Auth Debug Endpoint - Safe diagnostic for cookie/token issues
safe_mode: true - Read-only, no secrets exposed
"""
from flask import Blueprint, jsonify, request

auth_debug_bp = Blueprint("auth_debug", __name__)

@auth_debug_bp.route("/api/system/auth-debug", methods=["GET"])
def auth_debug():
    """
    Returns diagnostic info about auth cookies received by the backend.
    Does NOT expose actual cookie values, only presence checks.
    """
    headers = dict(request.headers)
    cookies = request.cookies
    
    auth_cookie_names = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "authjs.csrf-token",
        "__Host-authjs.csrf-token",
        "next-auth.csrf-token",
        "__Host-next-auth.csrf-token",
    ]
    
    found_cookies = {}
    for name in auth_cookie_names:
        value = cookies.get(name)
        if value:
            found_cookies[name] = {
                "present": True,
                "length": len(value),
                "starts_with": value[:10] + "..." if len(value) > 10 else value,
            }
    
    return jsonify({
        "safe_mode": True,
        "host": headers.get("Host", "unknown"),
        "origin": headers.get("Origin", "unknown"),
        "referer": headers.get("Referer", "unknown"),
        "has_any_auth_cookie": len(found_cookies) > 0,
        "found_cookies": found_cookies,
        "cookie_count": len(found_cookies),
        "all_cookie_names": list(cookies.keys()),
        "user_agent_short": (headers.get("User-Agent", "")[:50] + "...") if headers.get("User-Agent") else None,
    })
