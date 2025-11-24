"""
Privacy & Data Rights API Routes
Implements endpoints for GDPR data subject requests
"""
import logging
import json
import re
from datetime import datetime
from pathlib import Path
from flask import request, jsonify
from . import privacy_bp

log = logging.getLogger("levqor.privacy")

REQUESTS_FILE = Path("workspace-data/privacy_requests.json")


def mask_email(email):
    """Mask email for logging: test***@example.com"""
    if not email or "@" not in email:
        return "***invalid***"
    local, domain = email.split("@", 1)
    if len(local) <= 3:
        masked_local = local[0] + "***"
    else:
        masked_local = local[:3] + "***"
    return f"{masked_local}@{domain}"


def validate_email(email):
    """Basic email validation"""
    if not email or not isinstance(email, str):
        return False, "Email is required"
    
    email = email.strip()
    
    if len(email) < 3:
        return False, "Email too short"
    
    if "@" not in email:
        return False, "Invalid email format"
    
    # Basic regex check
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    return True, email


def atomic_append_request(request_type, email):
    """
    Atomically append privacy request to JSON file
    Uses temp file + rename pattern from omega operators
    """
    REQUESTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Read existing records
    if REQUESTS_FILE.exists():
        try:
            with REQUESTS_FILE.open("r") as f:
                records = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            log.error(f"Error reading privacy requests file: {e}")
            records = []
    else:
        records = []
    
    # Create new record
    record = {
        "id": f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{len(records):04d}",
        "type": request_type,
        "email": email,
        "received_at": datetime.utcnow().isoformat() + "Z",
        "status": "pending"
    }
    
    records.append(record)
    
    # Atomic write: temp file then rename
    temp_file = REQUESTS_FILE.parent / f"{REQUESTS_FILE.name}.tmp"
    try:
        with temp_file.open("w") as f:
            json.dump(records, f, indent=2)
        temp_file.rename(REQUESTS_FILE)
        log.info(f"Privacy request recorded: type={request_type} email={mask_email(email)}")
        return True, record["id"]
    except Exception as e:
        if temp_file.exists():
            temp_file.unlink()
        log.error(f"Error writing privacy request: {e}")
        raise e


@privacy_bp.route('/export', methods=['POST'])
def export_request():
    """
    POST /api/privacy/export
    Record data export request
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        email = data.get("email", "").strip()
        
        # Validate email
        is_valid, result = validate_email(email)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": result
            }), 400
        
        email = result  # normalized email
        
        # Record request
        try:
            success, request_id = atomic_append_request("export", email)
            
            log.info(f"PRIVACY_EXPORT_REQUEST: email={mask_email(email)} id={request_id}")
            
            return jsonify({
                "success": True,
                "message": "Your data export request has been recorded. We will process it and contact you by email.",
                "request_id": request_id
            }), 200
            
        except Exception as e:
            log.error(f"Failed to record export request: {e}")
            return jsonify({
                "success": False,
                "error": "An error occurred while processing your request. Please try again or contact support."
            }), 500
            
    except Exception as e:
        log.error(f"Export request handler error: {e}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500


@privacy_bp.route('/delete', methods=['POST'])
def delete_request():
    """
    POST /api/privacy/delete
    Record data deletion request
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        email = data.get("email", "").strip()
        
        # Validate email
        is_valid, result = validate_email(email)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": result
            }), 400
        
        email = result
        
        # Record request
        try:
            success, request_id = atomic_append_request("delete", email)
            
            log.info(f"PRIVACY_DELETE_REQUEST: email={mask_email(email)} id={request_id}")
            
            return jsonify({
                "success": True,
                "message": "Your deletion request has been recorded. We will process it and contact you by email.",
                "request_id": request_id
            }), 200
            
        except Exception as e:
            log.error(f"Failed to record delete request: {e}")
            return jsonify({
                "success": False,
                "error": "An error occurred while processing your request. Please try again or contact support."
            }), 500
            
    except Exception as e:
        log.error(f"Delete request handler error: {e}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500


@privacy_bp.route('/consent/withdraw', methods=['POST'])
def consent_withdraw():
    """
    POST /api/privacy/consent/withdraw
    Record consent withdrawal request
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        email = data.get("email", "").strip()
        
        # Validate email
        is_valid, result = validate_email(email)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": result
            }), 400
        
        email = result
        
        # Record request
        try:
            success, request_id = atomic_append_request("withdraw_consent", email)
            
            log.info(f"PRIVACY_CONSENT_WITHDRAW: email={mask_email(email)} id={request_id}")
            
            return jsonify({
                "success": True,
                "message": "Your consent withdrawal request has been recorded. We will process it and contact you by email.",
                "request_id": request_id
            }), 200
            
        except Exception as e:
            log.error(f"Failed to record consent withdrawal: {e}")
            return jsonify({
                "success": False,
                "error": "An error occurred while processing your request. Please try again or contact support."
            }), 500
            
    except Exception as e:
        log.error(f"Consent withdraw handler error: {e}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500


@privacy_bp.route('/requests/summary', methods=['GET'])
def requests_summary():
    """
    GET /api/privacy/requests/summary
    Returns anonymized summary of privacy requests
    NOTE: Protect with auth in production.
    """
    try:
        if not REQUESTS_FILE.exists():
            return jsonify({
                "success": True,
                "total": 0,
                "by_type": {},
                "by_status": {}
            }), 200
        
        with REQUESTS_FILE.open("r") as f:
            records = json.load(f)
        
        by_type = {}
        by_status = {}
        
        for record in records:
            req_type = record.get("type", "unknown")
            status = record.get("status", "unknown")
            
            by_type[req_type] = by_type.get(req_type, 0) + 1
            by_status[status] = by_status.get(status, 0) + 1
        
        return jsonify({
            "success": True,
            "total": len(records),
            "by_type": by_type,
            "by_status": by_status
        }), 200
        
    except Exception as e:
        log.error(f"Summary endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": "An error occurred while retrieving summary"
        }), 500
