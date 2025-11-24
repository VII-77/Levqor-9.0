from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime

lead_bp = Blueprint('lead', __name__)

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
            return jsonify({"error": "No data provided"}), 400
        
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
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
        
        return jsonify({
            "success": True,
            "message": "Lead captured successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
