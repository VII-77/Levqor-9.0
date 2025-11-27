"""
Levqor Autopilot Wave 2 - Daily Report Generator
Generates comprehensive daily reports with improvement suggestions.
PASSIVE MODE: All suggestions are dry-run only, no automated fixes.
"""
import logging
import json
from time import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List

log = logging.getLogger("levqor.guardian.daily_report")

daily_report_bp = Blueprint('daily_report', __name__, url_prefix='/api/guardian')


def _get_db():
    """Get database connection with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def generate_daily_report(hours: int = 24) -> Dict[str, Any]:
    """
    Generate a comprehensive daily report with suggestions.
    
    Args:
        hours: Number of hours to include in report (default: 24)
    
    Returns:
        Dict with daily metrics and improvement suggestions
    """
    execute_query = _get_db()
    if not execute_query:
        return {"status": "error", "message": "Database not available"}
    
    cutoff = time() - (hours * 3600)
    suggestions = []
    
    try:
        totals_query = """
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors,
                SUM(CASE WHEN level = 'warning' THEN 1 ELSE 0 END) as warnings,
                SUM(CASE WHEN level = 'info' THEN 1 ELSE 0 END) as info
            FROM telemetry_logs 
            WHERE created_at >= ?
        """
        totals = execute_query(totals_query, (cutoff,), fetch='one') or {}
        
        total_logs = totals.get('total', 0)
        total_errors = totals.get('errors', 0)
        total_warnings = totals.get('warnings', 0)
        
        sources_query = """
            SELECT source, COUNT(*) as cnt 
            FROM telemetry_logs 
            WHERE created_at >= ?
            GROUP BY source
        """
        sources = {}
        for row in execute_query(sources_query, (cutoff,), fetch='all') or []:
            sources[row.get('source', 'unknown')] = row['cnt']
        
        perf_query = """
            SELECT endpoint, 
                   COUNT(*) as cnt, 
                   AVG(duration_ms) as avg_ms, 
                   MAX(duration_ms) as max_ms,
                   MIN(duration_ms) as min_ms
            FROM telemetry_logs 
            WHERE created_at >= ? AND duration_ms IS NOT NULL
            GROUP BY endpoint
            ORDER BY avg_ms DESC
            LIMIT 15
        """
        performance = {}
        slowest_endpoints = []
        
        for row in execute_query(perf_query, (cutoff,), fetch='all') or []:
            endpoint = row.get('endpoint')
            if endpoint:
                avg_ms = row.get('avg_ms', 0)
                performance[endpoint] = {
                    "count": row['cnt'],
                    "avg_ms": round(avg_ms, 2),
                    "max_ms": round(row.get('max_ms', 0), 2),
                    "min_ms": round(row.get('min_ms', 0), 2)
                }
                
                if avg_ms > 5000:
                    slowest_endpoints.append({
                        "endpoint": endpoint,
                        "avg_ms": round(avg_ms, 2)
                    })
                    suggestions.append({
                        "type": "performance",
                        "priority": "high",
                        "message": f"Slow endpoint: {endpoint} (avg {round(avg_ms)}ms)",
                        "action": f"Optimize {endpoint} - consider caching, query optimization, or async processing",
                        "auto_applicable": False
                    })
        
        errors_query = """
            SELECT error_type, error_message, COUNT(*) as cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND level = 'error'
            GROUP BY error_type, error_message
            ORDER BY cnt DESC
            LIMIT 10
        """
        top_errors = []
        for row in execute_query(errors_query, (cutoff,), fetch='all') or []:
            error_info = {
                "type": row.get('error_type', 'Unknown'),
                "message": (row.get('error_message', '')[:100] + '...') if len(row.get('error_message', '')) > 100 else row.get('error_message', ''),
                "count": row['cnt']
            }
            top_errors.append(error_info)
            
            if row['cnt'] >= 3:
                suggestions.append({
                    "type": "error",
                    "priority": "high" if row['cnt'] >= 10 else "medium",
                    "message": f"Repeated error: {row.get('error_type', 'Unknown')} ({row['cnt']} occurrences)",
                    "action": "Investigate root cause and implement fix",
                    "auto_applicable": False
                })
        
        events_query = """
            SELECT event_type, COUNT(*) as cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND event_type IS NOT NULL
            GROUP BY event_type
            ORDER BY cnt DESC
            LIMIT 10
        """
        top_events = {}
        for row in execute_query(events_query, (cutoff,), fetch='all') or []:
            if row.get('event_type'):
                top_events[row['event_type']] = row['cnt']
        
        health_score = 100
        
        if total_logs > 0:
            error_rate = (total_errors / total_logs) * 100
            if error_rate > 5:
                health_score -= min(30, int(error_rate * 2))
                suggestions.append({
                    "type": "reliability",
                    "priority": "high",
                    "message": f"Error rate is {round(error_rate, 2)}% - above 5% threshold",
                    "action": "Review and address top error causes",
                    "auto_applicable": False
                })
        else:
            error_rate = 0
        
        if len(slowest_endpoints) > 3:
            health_score -= 15
            suggestions.append({
                "type": "performance",
                "priority": "medium",
                "message": f"{len(slowest_endpoints)} endpoints are critically slow (>5s avg)",
                "action": "Prioritize optimization of slowest endpoints",
                "auto_applicable": False
            })
        
        if sources.get('frontend', 0) == 0 and total_logs > 10:
            suggestions.append({
                "type": "observability",
                "priority": "low",
                "message": "No frontend telemetry received",
                "action": "Verify frontend telemetry integration is configured",
                "auto_applicable": False
            })
        
        health_score = max(0, min(100, health_score))
        
        return {
            "status": "passive",
            "mode": "dry_run",
            "report_period_hours": hours,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "health_score": health_score,
            "summary": {
                "total_logs": total_logs,
                "errors": total_errors,
                "warnings": total_warnings,
                "error_rate_percent": round(error_rate, 2) if total_logs > 0 else 0
            },
            "sources": sources,
            "performance": performance,
            "slowest_endpoints": slowest_endpoints[:5],
            "top_errors": top_errors,
            "top_events": top_events,
            "improvement_suggestions": suggestions,
            "suggestion_count": len(suggestions)
        }
        
    except Exception as e:
        log.error(f"Daily report generation failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@daily_report_bp.route('/daily-report', methods=['GET'])
def daily_report_endpoint():
    """
    GET /api/guardian/daily-report
    
    Generate comprehensive daily telemetry report with improvement suggestions.
    PASSIVE MODE: All suggestions are dry-run only.
    
    Query params:
        hours: Report period in hours (default: 24, max: 168)
    
    Response:
    {
        "status": "passive",
        "mode": "dry_run",
        "health_score": 0-100,
        "summary": { total_logs, errors, error_rate_percent },
        "performance": { endpoint: { avg_ms, max_ms } },
        "top_errors": [ { type, message, count } ],
        "improvement_suggestions": [ { type, priority, message, action } ],
        "generated_at": "ISO timestamp"
    }
    """
    try:
        hours = min(int(request.args.get('hours', 24)), 168)
        
        report = generate_daily_report(hours=hours)
        
        return jsonify(report), 200 if report.get('status') != 'error' else 500
        
    except Exception as e:
        log.error(f"Daily report endpoint error: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to generate daily report"
        }), 500


@daily_report_bp.route('/daily-report/summary', methods=['GET'])
def daily_report_summary():
    """
    GET /api/guardian/daily-report/summary
    
    Quick summary of daily report (lightweight endpoint).
    """
    try:
        hours = min(int(request.args.get('hours', 24)), 168)
        report = generate_daily_report(hours=hours)
        
        return jsonify({
            "status": report.get('status', 'unknown'),
            "health_score": report.get('health_score', 0),
            "error_count": report.get('summary', {}).get('errors', 0),
            "suggestion_count": report.get('suggestion_count', 0),
            "report_period_hours": hours
        }), 200
        
    except Exception as e:
        log.error(f"Daily report summary error: {e}")
        return jsonify({"status": "error", "health_score": 0}), 500
