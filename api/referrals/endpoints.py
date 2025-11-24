"""
Referral Endpoints - HYPERGROWTH CYCLE 6
Safe stub endpoints for referral/invite growth loop
"""
from flask import Blueprint, request, jsonify
import logging
import uuid
from datetime import datetime
from .storage import get_referrals_for_email, append_referral, get_referral_stats

log = logging.getLogger("levqor.referrals.endpoints")

referrals_bp = Blueprint("referrals_v2", __name__, url_prefix="/api/referrals")


def _mask_email(email: str) -> str:
    """Mask email for logging (PII protection)."""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 3:
        return f"{local[0]}***@{domain}"
    return f"{local[:3]}***@{domain}"


@referrals_bp.route('/create', methods=['POST'])
def create_referral():
    """
    Create a new referral invite.
    
    Request: {
        "referrer_email": string,
        "invited_email": string,
        "source"?: "dashboard" | "pricing" | "community" | "manual"
    }
    
    Response: {
        "success": true,
        "referral_id": string,
        "message": string
    }
    """
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400
    
    referrer_email = (data.get('referrer_email') or '').strip()
    invited_email = (data.get('invited_email') or '').strip()
    source = (data.get('source') or 'manual').strip()
    
    # Validate required fields
    if not referrer_email:
        return jsonify({"success": False, "error": "referrer_email is required"}), 400
    
    if not invited_email:
        return jsonify({"success": False, "error": "invited_email is required"}), 400
    
    # Validate email format (basic check)
    if "@" not in referrer_email or "@" not in invited_email:
        return jsonify({"success": False, "error": "Invalid email format"}), 400
    
    # Validate source
    if source not in ["dashboard", "pricing", "community", "manual", "library"]:
        source = "manual"
    
    # Generate referral record
    referral_id = f"{int(datetime.utcnow().timestamp())}-{uuid.uuid4().hex[:8]}"
    
    referral = {
        "id": referral_id,
        "referrer_email": referrer_email,
        "invited_email": invited_email,
        "created_at": datetime.utcnow().isoformat() + 'Z',
        "source": source,
        "status": "created"
    }
    
    # Save to storage
    try:
        append_referral(referral)
    except Exception as e:
        log.error(f"Failed to save referral: {e}")
        return jsonify({"success": False, "error": "Failed to save referral"}), 500
    
    log.info(f"Referral created: {_mask_email(referrer_email)} -> {_mask_email(invited_email)} (source={source})")
    
    # Increment metrics (if metrics module exists)
    try:
        from api.metrics.app import increment_metric
        increment_metric('referrals_created')
    except ImportError:
        pass
    
    return jsonify({
        "success": True,
        "referral_id": referral_id,
        "message": "Referral recorded"
    }), 201


@referrals_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Get referral statistics.
    
    Query params:
        - email (optional): Get stats for specific referrer
    
    Response:
        - If email provided: { "success": true, "email": string, "total_sent": int, "last_10": [...] }
        - If no email: { "success": true, "total_referrals": int, "unique_referrers": int }
    """
    try:
        # Increment metrics
        try:
            from api.metrics.app import increment_metric
            increment_metric('referrals_stats_requests')
        except ImportError:
            pass
        
        email = request.args.get('email', '').strip()
        
        if email:
            # User-specific stats
            referrals = get_referrals_for_email(email)
            last_10 = referrals[-10:] if len(referrals) > 10 else referrals
            
            # Mask emails in response
            safe_last_10 = []
            for r in last_10:
                safe_r = r.copy()
                safe_r['invited_email'] = _mask_email(r.get('invited_email', ''))
                safe_last_10.append(safe_r)
            
            log.info(f"Referral stats for {_mask_email(email)}: {len(referrals)} sent")
            
            return jsonify({
                "success": True,
                "email": _mask_email(email),
                "total_sent": len(referrals),
                "last_10": safe_last_10
            }), 200
        else:
            # Global stats
            stats = get_referral_stats()
            
            log.info(f"Global referral stats: {stats['total_referrals']} total, {stats['unique_referrers']} referrers")
            
            return jsonify({
                "success": True,
                "total_referrals": stats['total_referrals'],
                "unique_referrers": stats['unique_referrers']
            }), 200
            
    except Exception as e:
        log.error(f"Error in referral stats: {e}")
        return jsonify({"success": False, "error": "Failed to get stats"}), 500
