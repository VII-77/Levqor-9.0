"""
Levqor Autopilot Wave 2 - Telemetry Summary
Provides aggregated telemetry analysis from database storage.
"""
import logging
import json
from time import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List

log = logging.getLogger("levqor.guardian.telemetry_summary")

telemetry_summary_bp = Blueprint('guardian_telemetry_summary', __name__, url_prefix='/api/guardian')


def _get_db():
    """Get database connection with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def get_telemetry_summary(max_age_minutes: int = 60) -> Dict[str, Any]:
    """
    Generate a comprehensive telemetry summary from the database.
    
    Args:
        max_age_minutes: Time window in minutes
    
    Returns:
        Dict with aggregated telemetry metrics
    """
    execute_query = _get_db()
    if not execute_query:
        return {"status": "error", "message": "Database not available"}
    
    try:
        cutoff = time() - (max_age_minutes * 60)
        
        total_query = """
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors,
                SUM(CASE WHEN level = 'warning' THEN 1 ELSE 0 END) as warnings
            FROM telemetry_logs 
            WHERE created_at >= ?
        """
        totals = execute_query(total_query, (cutoff,), fetch='one') or {}
        
        total_logs = totals.get('total', 0)
        total_errors = totals.get('errors', 0)
        total_warnings = totals.get('warnings', 0)
        
        events_query = """
            SELECT event_type, COUNT(*) as cnt 
            FROM telemetry_logs 
            WHERE created_at >= ? AND event_type IS NOT NULL
            GROUP BY event_type
            ORDER BY cnt DESC
            LIMIT 20
        """
        events_by_type = {}
        events_result = execute_query(events_query, (cutoff,), fetch='all') or []
        for row in events_result:
            if row.get('event_type'):
                events_by_type[row['event_type']] = row['cnt']
        
        sources_query = """
            SELECT source, COUNT(*) as cnt 
            FROM telemetry_logs 
            WHERE created_at >= ?
            GROUP BY source
        """
        sources = {}
        sources_result = execute_query(sources_query, (cutoff,), fetch='all') or []
        for row in sources_result:
            sources[row.get('source', 'unknown')] = row['cnt']
        
        endpoints_query = """
            SELECT endpoint, COUNT(*) as cnt, AVG(duration_ms) as avg_ms, MAX(duration_ms) as max_ms
            FROM telemetry_logs 
            WHERE created_at >= ? AND endpoint IS NOT NULL AND duration_ms IS NOT NULL
            GROUP BY endpoint
            ORDER BY avg_ms DESC
            LIMIT 20
        """
        perf_summary = {}
        perf_result = execute_query(endpoints_query, (cutoff,), fetch='all') or []
        for row in perf_result:
            endpoint = row.get('endpoint')
            if endpoint:
                perf_summary[endpoint] = {
                    "count": row['cnt'],
                    "avg_ms": round(row['avg_ms'] or 0, 2),
                    "max_ms": round(row['max_ms'] or 0, 2)
                }
        
        errors_query = """
            SELECT error_type, COUNT(*) as cnt 
            FROM telemetry_logs 
            WHERE created_at >= ? AND error_type IS NOT NULL
            GROUP BY error_type
            ORDER BY cnt DESC
            LIMIT 10
        """
        error_types = {}
        errors_result = execute_query(errors_query, (cutoff,), fetch='all') or []
        for row in errors_result:
            if row.get('error_type'):
                error_types[row['error_type']] = row['cnt']
        
        error_rate = 0
        if total_logs > 0:
            error_rate = round(total_errors / total_logs * 100, 2)
        
        return {
            "status": "ok",
            "time_window_minutes": max_age_minutes,
            "summary": {
                "total_logs": total_logs,
                "total_errors": total_errors,
                "total_warnings": total_warnings,
                "error_rate_percent": error_rate
            },
            "events_by_type": events_by_type,
            "sources": sources,
            "error_types": error_types,
            "performance": perf_summary,
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        log.error(f"Failed to generate telemetry summary: {e}")
        return {"status": "error", "message": str(e)}


@telemetry_summary_bp.route('/telemetry', methods=['GET'])
def telemetry_summary_endpoint():
    """
    GET /api/guardian/telemetry
    
    Returns aggregated telemetry summary from database.
    
    Query params:
        window: Time window in minutes (default: 60, max: 1440)
    
    Response:
    {
        "status": "ok",
        "summary": { total_logs, total_errors, error_rate_percent },
        "events_by_type": { event: count },
        "sources": { source: count },
        "performance": { endpoint: { avg_ms, max_ms, count } },
        "generated_at": "ISO timestamp"
    }
    """
    try:
        window = min(int(request.args.get('window', 60)), 1440)
        
        summary = get_telemetry_summary(max_age_minutes=window)
        
        return jsonify(summary), 200 if summary.get('status') == 'ok' else 500
        
    except Exception as e:
        log.error(f"Telemetry summary error: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to generate telemetry summary"
        }), 500


@telemetry_summary_bp.route('/telemetry/stats', methods=['GET'])
def telemetry_stats():
    """
    GET /api/guardian/telemetry/stats
    
    Returns quick stats about telemetry storage.
    """
    execute_query = _get_db()
    if not execute_query:
        return jsonify({"status": "error", "message": "Database not available"}), 503
    
    try:
        result = execute_query("""
            SELECT 
                COUNT(*) as total,
                MIN(created_at) as oldest,
                MAX(created_at) as newest
            FROM telemetry_logs
        """, fetch='one') or {}
        
        total = result.get('total', 0)
        oldest_ts = result.get('oldest')
        newest_ts = result.get('newest')
        
        return jsonify({
            "status": "ok",
            "total_logs": total,
            "oldest_log": datetime.fromtimestamp(oldest_ts).isoformat() + "Z" if oldest_ts else None,
            "newest_log": datetime.fromtimestamp(newest_ts).isoformat() + "Z" if newest_ts else None
        }), 200
        
    except Exception as e:
        log.error(f"Telemetry stats error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
