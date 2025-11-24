from flask import Blueprint, request, jsonify
import json
import os
import logging
from datetime import datetime
from collections import defaultdict
import time

events_bp = Blueprint('events', __name__)
logger = logging.getLogger(__name__)

EVENTS_FILE = 'data/marketing_events.json'
ALLOWED_EVENT_TYPES = {"page_view", "cta_click", "cta_submit"}
ALLOWED_PAGES = {"/pricing", "/trial", "/dashboard/v2", "/status", "/", "/demo", "/contact"}

# Simple in-memory rate limiting (per-process)
# Format: {ip:minute} -> count
rate_limit_buckets = defaultdict(int)
RATE_LIMIT_PER_MINUTE = 100

def ensure_data_dir():
    os.makedirs('data', exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, 'w') as f:
            json.dump([], f)

def check_rate_limit(ip: str) -> bool:
    """Returns True if rate limit exceeded, False otherwise."""
    minute_bucket = int(time.time() / 60)
    key = f"{ip}:{minute_bucket}"
    
    # Simple cleanup: remove old buckets (keep last 5 minutes)
    current_minute = minute_bucket
    old_keys = [k for k in rate_limit_buckets.keys() 
                if int(k.split(':')[1]) < current_minute - 5]
    for k in old_keys:
        del rate_limit_buckets[k]
    
    rate_limit_buckets[key] += 1
    return rate_limit_buckets[key] > RATE_LIMIT_PER_MINUTE

@events_bp.route('/api/marketing/events', methods=['POST'])
def track_event():
    try:
        # Rate limiting
        client_ip = request.headers.get('X-Forwarded-For', request.remote_addr) or '0.0.0.0'
        if check_rate_limit(client_ip):
            logger.warning(f"RATE_LIMIT_EXCEEDED: ip={client_ip}")
            return jsonify({"success": False, "error": "rate limit exceeded"}), 429
        
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        event_type = data.get('event_type', '').strip()
        if not event_type:
            return jsonify({"success": False, "error": "event_type is required"}), 400
        
        # Validate event_type
        if event_type not in ALLOWED_EVENT_TYPES:
            return jsonify({
                "success": False, 
                "error": f"Invalid event_type. Allowed: {', '.join(ALLOWED_EVENT_TYPES)}"
            }), 400
        
        page = data.get('page', '').strip()
        if not page:
            return jsonify({"success": False, "error": "page is required"}), 400
        
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
        
        # Structured logging
        logger.info(f"EVENT_TRACKED: type={event_type} page={page} source={data.get('source', 'unknown')} timestamp={event['timestamp']}")
        
        return jsonify({
            "success": True,
            "message": "Event tracked successfully"
        }), 201
        
    except Exception as e:
        logger.error(f"EVENT_TRACKING_ERROR: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500
