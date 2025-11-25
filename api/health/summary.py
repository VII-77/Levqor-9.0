"""
Health Summary Endpoint - MEGA PHASE v11-v14
Provides lightweight health status for dashboard integration
"""
import os
import time
import logging
from flask import Blueprint, jsonify
from modules.db_wrapper import get_db, get_db_type

log = logging.getLogger("levqor.health")

health_bp = Blueprint("health", __name__, url_prefix="/api/health")

INCIDENTS_FILE = os.path.join(os.getcwd(), "workspace-data", "incidents", "incidents.jsonl")


def _check_db_connection() -> bool:
    try:
        from modules.db_wrapper import execute_query
        result = execute_query("SELECT 1 as ping", fetch='one')
        return result is not None and result.get('ping') == 1
    except Exception as e:
        log.warning(f"DB health check failed: {e}")
        return False


def _check_stripe_config() -> bool:
    stripe_key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_PUBLISHABLE_KEY")
    return stripe_key is not None and len(stripe_key) > 10


def _get_error_count() -> int:
    log_file = os.path.join(os.getcwd(), "logs", "levqor.log")
    if not os.path.exists(log_file):
        return 0
    
    try:
        error_count = 0
        cutoff_time = time.time() - (24 * 60 * 60)
        
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                if 'ERROR' in line or 'error' in line.lower():
                    error_count += 1
                    if error_count >= 100:
                        break
        return min(error_count, 999)
    except Exception:
        return 0


def _get_last_incident_time() -> str:
    import json
    
    if not os.path.exists(INCIDENTS_FILE):
        return None
    
    try:
        last_incident = None
        with open(INCIDENTS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        if 'created_at' in record:
                            last_incident = record['created_at']
                    except json.JSONDecodeError:
                        pass
        return last_incident
    except Exception:
        return None


@health_bp.route("/summary", methods=["GET"])
def health_summary():
    app_up = True
    db_ok = _check_db_connection()
    stripe_ok = _check_stripe_config()
    error_count = _get_error_count()
    last_incident = _get_last_incident_time()
    
    overall_status = "healthy"
    if not db_ok:
        overall_status = "degraded"
    if not stripe_ok:
        overall_status = "warning"
    if error_count > 50:
        overall_status = "warning"
    if not db_ok and not stripe_ok:
        overall_status = "critical"
    
    return jsonify({
        "status": overall_status,
        "app_up": app_up,
        "db_ok": db_ok,
        "stripe_ok": stripe_ok,
        "error_count_24h": error_count,
        "last_incident_time": last_incident,
        "db_type": get_db_type(),
        "timestamp": time.time()
    })


@health_bp.route("/ping", methods=["GET"])
def health_ping():
    return jsonify({"status": "ok", "timestamp": time.time()})
