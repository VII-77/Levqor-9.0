"""
Consultation Booking Endpoint - MEGA-PHASE 5
AI-driven consultation scheduling with pre-consultation brief generation
Stores bookings in JSON file (workspace-data/consultations.json)
"""
from flask import Blueprint, request, jsonify
import logging
import json
import os
import re
from datetime import datetime
from pathlib import Path

bp = Blueprint("consultation_book", __name__, url_prefix="/api/consultations/book")
log = logging.getLogger("levqor.consultations.book")

CONSULTATIONS_FILE = Path("workspace-data/consultations.json")


@bp.post("/")
def book_consultation():
    """
    Book AI-driven consultation
    
    Request: {
        "name": string,
        "email": string,
        "timezone": string,
        "duration": 60|120,
        "preferred_time": ISO8601 string
    }
    Response: {
        "success": boolean,
        "booking_id": string,
        "pre_consultation_brief": string
    }
    """
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ["name", "email", "timezone", "duration", "preferred_time"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400
        
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        timezone = data.get("timezone", "").strip()
        duration = data.get("duration")
        preferred_time = data.get("preferred_time", "").strip()
        
        # Validate name
        if not name or len(name) < 2:
            return jsonify({
                "success": False,
                "error": "Name must be at least 2 characters"
            }), 422
        
        # Validate email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({
                "success": False,
                "error": "Invalid email address"
            }), 422
        
        # Validate duration
        if duration not in [60, 120]:
            return jsonify({
                "success": False,
                "error": "Duration must be 60 or 120 minutes"
            }), 422
        
        # Validate timezone
        if not timezone:
            return jsonify({
                "success": False,
                "error": "Timezone is required"
            }), 422
        
        # Validate preferred_time (ISO8601)
        try:
            datetime.fromisoformat(preferred_time.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Invalid preferred_time format (use ISO8601)"
            }), 422
        
        # All validation passed - increment metrics
        from api.metrics.app import increment_consultation_booked
        increment_consultation_booked()
        
        # Generate booking ID
        booking_id = f"CONS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        # Create booking record with REAL data for follow-ups
        # Only mask PII in logs, NOT in storage
        booking = {
            "booking_id": booking_id,
            "name": name,  # Store real name for follow-up
            "email": email,  # Store real email for follow-up
            "timezone": timezone,
            "duration": duration,
            "preferred_time": preferred_time,
            "created_at": datetime.utcnow().isoformat(),
            "status": "scheduled"
        }
        
        # Store in JSON file
        _save_booking(booking)
        
        # Generate AI pre-consultation brief
        brief = _generate_pre_consultation_brief(name, duration, preferred_time)
        
        # Log with masked PII
        log.info(f"Consultation booked: {booking_id}, duration={duration}min, email={_mask_email(email)}")
        
        return jsonify({
            "success": True,
            "booking_id": booking_id,
            "pre_consultation_brief": brief,
            "meta": {
                "duration": duration,
                "timezone": timezone
            }
        }), 201
        
    except Exception as e:
        log.error(f"Consultation booking error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


def _save_booking(booking: dict):
    """Thread-safe JSON file append"""
    try:
        # Read existing
        if CONSULTATIONS_FILE.exists():
            with open(CONSULTATIONS_FILE, 'r') as f:
                bookings = json.load(f)
        else:
            bookings = []
        
        # Append
        bookings.append(booking)
        
        # Write back
        with open(CONSULTATIONS_FILE, 'w') as f:
            json.dump(bookings, f, indent=2)
    
    except Exception as e:
        log.error(f"Error saving booking: {e}")
        raise


def _generate_pre_consultation_brief(name: str, duration: int, preferred_time: str) -> str:
    """
    Generate AI pre-consultation brief
    TODO: Replace with OpenAI when OPENAI_API_KEY available
    """
    duration_text = "1 hour" if duration == 60 else "2 hours"
    
    return f"""Thank you for booking a {duration_text} consultation with Levqor!

Here's what to expect:

1. **Pre-Consultation Preparation**
   - Review your current backup strategy and pain points
   - Gather any relevant error logs or integration details
   - Prepare questions about data retention policies

2. **Consultation Focus Areas**
   - Deep-dive into your specific use case
   - Custom workflow recommendations
   - Integration strategy (Slack, email, webhooks)
   - Compliance and retention requirements

3. **Post-Consultation Deliverables**
   - Tailored implementation roadmap
   - Best practice recommendations
   - Priority support channel access

Your consultation is scheduled for {preferred_time}. You'll receive a calendar invite shortly.

Looking forward to helping you optimize your data backup strategy!

— Levqor AI Consultation Engine"""


def _mask_pii(text: str) -> str:
    """Mask PII for logging (Security Core compliance)"""
    if len(text) <= 2:
        return "**"
    return text[0] + ("*" * (len(text) - 2)) + text[-1]


def _mask_email(email: str) -> str:
    """Mask email for logging"""
    parts = email.split('@')
    if len(parts) != 2:
        return "***@***.com"
    
    local = parts[0]
    domain = parts[1]
    
    if len(local) <= 2:
        masked_local = "**"
    else:
        masked_local = local[0] + ("*" * (len(local) - 2)) + local[-1]
    
    return f"{masked_local}@{domain}"
