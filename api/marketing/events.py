from flask import Blueprint, request, jsonify
import json
import os
from datetime import datetime

events_bp = Blueprint('events', __name__)

EVENTS_FILE = 'data/marketing_events.json'

def ensure_data_dir():
    os.makedirs('data', exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, 'w') as f:
            json.dump([], f)

@events_bp.route('/api/marketing/events', methods=['POST'])
def track_event():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        event_type = data.get('event_type')
        if not event_type:
            return jsonify({"error": "event_type is required"}), 400
        
        event = {
            "event_type": event_type,
            "email": data.get('email', ''),
            "user_id": data.get('user_id', ''),
            "properties": data.get('properties', {}),
            "timestamp": data.get('timestamp', datetime.utcnow().isoformat()),
            "metadata": {
                "ip": request.headers.get('X-Forwarded-For', request.remote_addr),
                "user_agent": request.headers.get('User-Agent', ''),
                "referrer": request.headers.get('Referer', '')
            }
        }
        
        ensure_data_dir()
        
        events = []
        if os.path.exists(EVENTS_FILE):
            with open(EVENTS_FILE, 'r') as f:
                try:
                    events = json.load(f)
                except json.JSONDecodeError:
                    events = []
        
        events.append(event)
        
        with open(EVENTS_FILE, 'w') as f:
            json.dump(events, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Event tracked successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
