"""
API Gateway Module for Zero-Trust Security Layer

Provides request fingerprinting, geo-aware tracking, and enhanced security monitoring
without breaking existing endpoints. Integrates with existing security_core modules.
"""

import logging
import hashlib
import json
from typing import Dict, Any, Optional
from flask import Request, g
from . import rate_limit, ip_reputation, audit, config

logger = logging.getLogger("security_gateway")

# Configuration
ENABLE_API_GATEWAY = True
BLOCK_HIGH_RISK_IPS = False  # Default to False to avoid breaking existing traffic
GEO_HINT_HEADERS = ["CF-IPCountry", "X-Country-Code", "CloudFront-Viewer-Country"]


def get_request_fingerprint(request: Request) -> str:
    """Generate a lightweight fingerprint for the request."""
    components = [
        request.method or "",
        request.path or "",
        request.headers.get("User-Agent", "")[:100],  # Truncate UA
    ]
    
    fingerprint_str = "|".join(components)
    return hashlib.sha256(fingerprint_str.encode()).hexdigest()[:16]


def get_geo_hint(request: Request) -> Optional[str]:
    """Extract geographic hint from headers if available."""
    for header in GEO_HINT_HEADERS:
        geo = request.headers.get(header)
        if geo and len(geo) == 2:  # Country codes are 2 chars
            return geo.upper()
    return None


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def attach_gateway_context(request: Request):
    """Attach API gateway context to Flask's g object for use in handlers."""
    try:
        g.gateway_fingerprint = get_request_fingerprint(request)
        g.gateway_ip = get_client_ip(request)
        g.gateway_geo = get_geo_hint(request)
    except Exception as e:
        logger.error(f"Failed to attach gateway context: {e}")


def log_suspicious_pattern(ip: str, path: str, reason: str, meta: Optional[Dict[str, Any]] = None):
    """Log suspicious patterns for security monitoring."""
    event_data = {
        "ip": ip,
        "path": path,
        "reason": reason,
    }
    
    if meta:
        event_data["meta_json"] = json.dumps(meta)
    
    audit.audit_security_event("SECURITY_EVENT", event_data)
    logger.warning(f"SECURITY_EVENT: ip={ip} path={path} reason={reason}")


def check_request_security(request: Request) -> Optional[tuple]:
    """
    Check request security using existing security_core modules.
    Returns (error_response, status_code) tuple if request should be blocked, else None.
    """
    if not ENABLE_API_GATEWAY:
        return None
    
    # Skip static resources and health checks
    path = request.path or ""
    if path.startswith(("/static", "/public", "/favicon.ico")) or path in ("/health",):
        return None
    
    ip = get_client_ip(request)
    
    # Check IP reputation using existing module
    if ip_reputation.is_suspicious_ip(ip):
        log_suspicious_pattern(ip, path, "suspicious_ip_reputation")
        
        # Only block if explicitly enabled
        if BLOCK_HIGH_RISK_IPS:
            return {"error": "Access denied", "reason": "security_check_failed"}, 403
    
    # Rate limiting is already handled by security_core_before_request in run.py
    # We just add extra logging here for gateway-level visibility
    
    return None


def track_response_metrics(request: Request, response, duration_ms: float):
    """Track response metrics for security monitoring."""
    try:
        ip = get_client_ip(request)
        path = request.path or ""
        status = response.status_code
        
        # Track errors for IP reputation
        if status >= 400:
            ip_reputation.record_error(ip)
            
            # Log patterns of repeated errors
            if status in (401, 403, 404):
                fingerprint = get_request_fingerprint(request)
                log_suspicious_pattern(
                    ip, path, f"repeated_{status}_errors",
                    {"status": status, "fingerprint": fingerprint, "duration_ms": duration_ms}
                )
    except Exception as e:
        logger.error(f"Failed to track response metrics: {e}")


def init_api_gateway(app):
    """
    Initialize API Gateway hooks into Flask app.
    Called from run.py after app creation.
    """
    if not ENABLE_API_GATEWAY:
        logger.info("API Gateway disabled via config")
        return
    
    @app.before_request
    def gateway_before_request():
        """Attach gateway context to each request."""
        try:
            from flask import request as flask_request
            attach_gateway_context(flask_request)
            
            # Perform security checks (non-blocking by default)
            security_result = check_request_security(flask_request)
            if security_result:
                error_response, status_code = security_result
                from flask import jsonify
                return jsonify(error_response), status_code
        except Exception as e:
            logger.error(f"API Gateway before_request error: {e}")
            # Never break the app - just log and continue
            return None
    
    @app.after_request
    def gateway_after_request(response):
        """Track response metrics after request completes."""
        try:
            from flask import request as flask_request
            from time import time
            
            # Calculate duration if start_time was set
            duration_ms = 0.0
            if hasattr(g, 'request_start_time'):
                duration_ms = (time() - g.request_start_time) * 1000
            
            track_response_metrics(flask_request, response, duration_ms)
        except Exception as e:
            logger.error(f"API Gateway after_request error: {e}")
        
        return response
    
    logger.info("✅ API Gateway initialized (ENABLED=True, BLOCK_HIGH_RISK_IPS=False)")
