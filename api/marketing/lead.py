from flask import Blueprint, request, jsonify
import json
import os
import logging
from datetime import datetime

lead_bp = Blueprint('lead', __name__)
logger = logging.getLogger(__name__)

LEADS_FILE = 'data/marketing_leads.json'

def ensure_data_dir():
    os.makedirs('data', exist_ok=True)
    if not os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, 'w') as f:
            json.dump([], f)

@lead_bp.route('/api/marketing/lead', methods=['POST'])
def capture_lead():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        email = data.get('email', '').strip()
        if not email:
            return jsonify({"success": False, "error": "email is required"}), 400
        
        # Email format validation
        if '@' not in email or len(email) < 3:
            return jsonify({"success": False, "error": "Invalid email format"}), 400
        
        lead = {
            "email": email,
            "name": data.get('name', ''),
            "company": data.get('company', ''),
            "companySize": data.get('companySize', ''),
            "useCase": data.get('useCase', ''),
            "timePreference": data.get('timePreference', ''),
            "source": data.get('source', 'unknown'),
            "timestamp": data.get('timestamp', datetime.utcnow().isoformat()),
            "metadata": {
                "ip": request.headers.get('X-Forwarded-For', request.remote_addr),
                "user_agent": request.headers.get('User-Agent', '')
            }
        }
        
        ensure_data_dir()
        
        leads = []
        if os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, 'r') as f:
                try:
                    leads = json.load(f)
                except json.JSONDecodeError:
                    leads = []
        
        leads.append(lead)
        
        with open(LEADS_FILE, 'w') as f:
            json.dump(leads, f, indent=2)
        
        # Structured logging with masked email
        email_masked = f"{email.split('@')[0][:3]}***@{email.split('@')[1]}"
        logger.info(f"LEAD_CAPTURED: source={lead['source']} email={email_masked} timestamp={lead['timestamp']}")
        
        return jsonify({
            "success": True,
            "message": "Lead captured successfully"
        }), 201
        
    except Exception as e:
        logger.error(f"LEAD_CAPTURE_ERROR: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500
