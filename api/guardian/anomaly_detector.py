"""
Levqor Autopilot Wave 2 - Anomaly Detector
Detects patterns, repeated errors, and performance anomalies from telemetry.
PASSIVE MODE: No automated fixes, only detection and suggestions.
"""
import logging
import json
from time import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List

log = logging.getLogger("levqor.guardian.anomaly_detector")

anomaly_detector_bp = Blueprint('anomaly_detector', __name__, url_prefix='/api/guardian')

SLOW_ENDPOINT_THRESHOLD_MS = 2000
HIGH_ERROR_RATE_THRESHOLD = 10.0
REPEATED_ERROR_THRESHOLD = 3
CRITICAL_ENDPOINT_THRESHOLD_MS = 5000


def _get_db():
    """Get database connection with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def detect_anomalies(max_age_minutes: int = 60) -> Dict[str, Any]:
    """
    Analyze telemetry for anomalies and patterns.
    
    Args:
        max_age_minutes: Time window in minutes
    
    Returns:
        Dict with detected anomalies and suggestions
    """
    execute_query = _get_db()
    if not execute_query:
        return {"status": "error", "message": "Database not available", "anomalies": []}
    
    anomalies = []
    cutoff = time() - (max_age_minutes * 60)
    
    try:
        repeated_query = """
            SELECT message, COUNT(*) as cnt, MAX(level) as level, MAX(error_type) as error_type
            FROM telemetry_logs 
            WHERE created_at >= ? AND message IS NOT NULL AND message != ''
            GROUP BY message
            HAVING COUNT(*) >= ?
            ORDER BY cnt DESC
            LIMIT 20
        """
        repeated = execute_query(repeated_query, (cutoff, REPEATED_ERROR_THRESHOLD), fetch='all') or []
        
        for row in repeated:
            severity = "warning"
            if row.get('level') == 'error' or row.get('error_type'):
                severity = "critical" if row['cnt'] >= 10 else "warning"
            
            anomalies.append({
                "id": f"repeated_{hash(row.get('message', ''))%100000}",
                "type": "repeated_message",
                "severity": severity,
                "message": f"Message repeated {row['cnt']} times",
                "detail": {
                    "text": (row.get('message', '')[:200] + '...') if len(row.get('message', '')) > 200 else row.get('message', ''),
                    "count": row['cnt'],
                    "level": row.get('level'),
                    "error_type": row.get('error_type')
                },
                "suggestion": "Review and address root cause of repeated message",
                "auto_applicable": False
            })
        
        slow_query = """
            SELECT endpoint, AVG(duration_ms) as avg_ms, MAX(duration_ms) as max_ms, COUNT(*) as cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND duration_ms IS NOT NULL AND duration_ms > ?
            GROUP BY endpoint
            ORDER BY avg_ms DESC
            LIMIT 10
        """
        slow_endpoints = execute_query(slow_query, (cutoff, SLOW_ENDPOINT_THRESHOLD_MS), fetch='all') or []
        
        for row in slow_endpoints:
            avg_ms = row.get('avg_ms', 0)
            severity = "critical" if avg_ms > CRITICAL_ENDPOINT_THRESHOLD_MS else "warning"
            
            anomalies.append({
                "id": f"slow_{hash(row.get('endpoint', ''))%100000}",
                "type": "slow_endpoint",
                "severity": severity,
                "message": f"Slow endpoint detected: {row.get('endpoint', 'unknown')}",
                "detail": {
                    "endpoint": row.get('endpoint'),
                    "avg_ms": round(avg_ms, 2),
                    "max_ms": round(row.get('max_ms', 0), 2),
                    "call_count": row['cnt']
                },
                "suggestion": f"Optimize endpoint - average response time is {round(avg_ms)}ms",
                "auto_applicable": False
            })
        
        error_types_query = """
            SELECT error_type, COUNT(*) as cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND error_type IS NOT NULL
            GROUP BY error_type
            HAVING COUNT(*) >= ?
            ORDER BY cnt DESC
            LIMIT 10
        """
        error_types = execute_query(error_types_query, (cutoff, REPEATED_ERROR_THRESHOLD), fetch='all') or []
        
        for row in error_types:
            anomalies.append({
                "id": f"error_type_{hash(row.get('error_type', ''))%100000}",
                "type": "repeated_error_type",
                "severity": "critical" if row['cnt'] >= 10 else "warning",
                "message": f"Error type '{row.get('error_type', 'unknown')}' occurred {row['cnt']} times",
                "detail": {
                    "error_type": row.get('error_type'),
                    "count": row['cnt']
                },
                "suggestion": "Investigate and fix the root cause of this error type",
                "auto_applicable": False
            })
        
        error_rate_query = """
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors
            FROM telemetry_logs 
            WHERE created_at >= ?
        """
        rate_result = execute_query(error_rate_query, (cutoff,), fetch='one') or {}
        
        total = rate_result.get('total', 0)
        errors = rate_result.get('errors', 0)
        
        if total > 0:
            error_rate = (errors / total) * 100
            if error_rate > HIGH_ERROR_RATE_THRESHOLD:
                anomalies.append({
                    "id": "high_error_rate",
                    "type": "high_error_rate",
                    "severity": "critical" if error_rate > 25 else "warning",
                    "message": f"High error rate detected: {round(error_rate, 2)}%",
                    "detail": {
                        "error_rate_percent": round(error_rate, 2),
                        "total_logs": total,
                        "error_count": errors,
                        "threshold": HIGH_ERROR_RATE_THRESHOLD
                    },
                    "suggestion": "Review error logs and address most frequent error causes",
                    "auto_applicable": False
                })
        
        return {
            "status": "ok",
            "mode": "passive",
            "time_window_minutes": max_age_minutes,
            "anomaly_count": len(anomalies),
            "anomalies": anomalies,
            "thresholds": {
                "slow_endpoint_ms": SLOW_ENDPOINT_THRESHOLD_MS,
                "critical_endpoint_ms": CRITICAL_ENDPOINT_THRESHOLD_MS,
                "high_error_rate_percent": HIGH_ERROR_RATE_THRESHOLD,
                "repeated_message_count": REPEATED_ERROR_THRESHOLD
            },
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        log.error(f"Anomaly detection failed: {e}")
        return {
            "status": "error",
            "message": str(e),
            "anomalies": []
        }


@anomaly_detector_bp.route('/anomalies', methods=['GET'])
def anomalies_endpoint():
    """
    GET /api/guardian/anomalies
    
    Detect and return anomalies from telemetry data.
    PASSIVE MODE: No automated fixes applied.
    
    Query params:
        window: Time window in minutes (default: 60, max: 1440)
    
    Response:
    {
        "status": "ok",
        "mode": "passive",
        "anomaly_count": N,
        "anomalies": [
            {
                "type": "repeated_message|slow_endpoint|high_error_rate",
                "severity": "warning|critical",
                "message": "...",
                "suggestion": "...",
                "auto_applicable": false
            }
        ],
        "generated_at": "ISO timestamp"
    }
    """
    try:
        window = min(int(request.args.get('window', 60)), 1440)
        
        result = detect_anomalies(max_age_minutes=window)
        
        return jsonify(result), 200 if result.get('status') == 'ok' else 500
        
    except Exception as e:
        log.error(f"Anomalies endpoint error: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to detect anomalies",
            "anomalies": []
        }), 500


@anomaly_detector_bp.route('/anomalies/count', methods=['GET'])
def anomalies_count():
    """
    GET /api/guardian/anomalies/count
    
    Quick count of detected anomalies (lightweight endpoint).
    """
    try:
        window = min(int(request.args.get('window', 60)), 1440)
        result = detect_anomalies(max_age_minutes=window)
        
        critical = sum(1 for a in result.get('anomalies', []) if a.get('severity') == 'critical')
        warning = sum(1 for a in result.get('anomalies', []) if a.get('severity') == 'warning')
        
        return jsonify({
            "status": "ok",
            "total": result.get('anomaly_count', 0),
            "critical": critical,
            "warning": warning
        }), 200
        
    except Exception as e:
        log.error(f"Anomaly count error: {e}")
        return jsonify({"status": "error", "total": 0}), 500
