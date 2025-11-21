"""
Intelligence API Endpoints
Provides access to intelligence layer data and insights with enhanced logging
"""
from flask import Blueprint, jsonify, request
from modules.auto_intel.db_adapter import (
    get_intelligence_summary,
    get_recent_events,
    get_recent_actions,
    get_recent_recommendations,
    get_recent_forecasts,
    get_recent_health_logs
)
from datetime import datetime
import os
import time
import uuid
import logging
import traceback

try:
    from sentry_sdk import capture_exception
except Exception:
    def capture_exception(_e):
        return None

bp = Blueprint('intelligence', __name__, url_prefix='/api/intelligence')
logger = logging.getLogger('levqor.intelligence')

@bp.route('/status', methods=['GET'])
def get_intelligence_status():
    """
    Get comprehensive intelligence dashboard status
    
    Returns:
        JSON with all intelligence metrics, correlation IDs, and timing data
    """
    t0 = time.time()
    cid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    reveal_errors = os.getenv("INTEL_DEBUG_ERRORS", "false").lower() in ("1", "true", "yes", "on")
    
    try:
        summary = get_intelligence_summary()
        events = get_recent_events(limit=5)
        actions = get_recent_actions(limit=5)
        recommendations = get_recent_recommendations(limit=3)
        
        duration_ms = int((time.time() - t0) * 1000)
        
        payload = {
            "ok": True,
            "status": "operational",
            "summary": summary,
            "recent_events": events,
            "recent_actions": actions,
            "recommendations": recommendations,
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms,
                "timestamp": datetime.utcnow().isoformat(),
                "version": "v8.0-burnin"
            }
        }
        
        logger.info(
            "intel_status.ok",
            extra={
                "cid": cid,
                "duration_ms": duration_ms,
                "anomalies_24h": summary.get("anomalies_24h", 0),
                "actions_24h": summary.get("actions_24h", 0),
                "health_error_rate": summary.get("health", {}).get("error_rate", 0)
            }
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        duration_ms = int((time.time() - t0) * 1000)
        trace_tail = traceback.format_exc().splitlines()[-6:]
        
        logger.error(
            "intel_status.error",
            extra={
                "cid": cid,
                "duration_ms": duration_ms,
                "error_type": e.__class__.__name__,
                "error_message": str(e)[:200]
            }
        )
        
        capture_exception(e)
        
        error_body = {
            "ok": False,
            "status": "error",
            "error": {
                "type": e.__class__.__name__,
                "message": str(e)[:500]
            },
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms,
                "timestamp": datetime.utcnow().isoformat(),
                "version": "v8.0-burnin"
            }
        }
        
        if reveal_errors:
            error_body["error"]["trace_tail"] = trace_tail
            
        return jsonify(error_body), 500

@bp.route('/anomalies', methods=['GET'])
def get_anomalies():
    """Get recent anomaly events"""
    t0 = time.time()
    cid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    
    try:
        limit = request.args.get('limit', 20, type=int)
        events = get_recent_events(limit=limit)
        duration_ms = int((time.time() - t0) * 1000)
        
        logger.info("intel_anomalies.ok", extra={"cid": cid, "count": len(events), "duration_ms": duration_ms})
        
        return jsonify({
            "ok": True,
            "events": events,
            "count": len(events),
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms
            }
        })
    except Exception as e:
        logger.error("intel_anomalies.error", extra={"cid": cid, "error": str(e)})
        capture_exception(e)
        return jsonify({"ok": False, "error": str(e)}), 500

@bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get recent decision engine recommendations"""
    t0 = time.time()
    cid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    
    try:
        limit = request.args.get('limit', 5, type=int)
        recs = get_recent_recommendations(limit=limit)
        duration_ms = int((time.time() - t0) * 1000)
        
        logger.info("intel_recommendations.ok", extra={"cid": cid, "count": len(recs), "duration_ms": duration_ms})
        
        return jsonify({
            "ok": True,
            "recommendations": recs,
            "count": len(recs),
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms
            }
        })
    except Exception as e:
        logger.error("intel_recommendations.error", extra={"cid": cid, "error": str(e)})
        capture_exception(e)
        return jsonify({"ok": False, "error": str(e)}), 500

@bp.route('/forecasts', methods=['GET'])
def get_forecasts():
    """Get AI forecasts (revenue, churn predictions)"""
    t0 = time.time()
    cid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    
    try:
        limit = request.args.get('limit', 10, type=int)
        forecasts = get_recent_forecasts(limit=limit)
        duration_ms = int((time.time() - t0) * 1000)
        
        logger.info("intel_forecasts.ok", extra={"cid": cid, "count": len(forecasts), "duration_ms": duration_ms})
        
        return jsonify({
            "ok": True,
            "forecasts": forecasts,
            "count": len(forecasts),
            "latest": forecasts[0] if forecasts else None,
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms
            }
        })
    except Exception as e:
        logger.error("intel_forecasts.error", extra={"cid": cid, "error": str(e)})
        capture_exception(e)
        return jsonify({"ok": False, "error": str(e)}), 500

@bp.route('/health', methods=['GET'])
def get_health_logs():
    """Get system health monitoring logs"""
    t0 = time.time()
    cid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    
    try:
        limit = request.args.get('limit', 50, type=int)
        logs = get_recent_health_logs(limit=limit)
        duration_ms = int((time.time() - t0) * 1000)
        
        logger.info("intel_health.ok", extra={"cid": cid, "count": len(logs), "duration_ms": duration_ms})
        
        return jsonify({
            "ok": True,
            "logs": logs,
            "count": len(logs),
            "meta": {
                "correlation_id": cid,
                "duration_ms": duration_ms
            }
        })
    except Exception as e:
        logger.error("intel_health.error", extra={"cid": cid, "error": str(e)})
        capture_exception(e)
        return jsonify({"ok": False, "error": str(e)}), 500
