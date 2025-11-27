"""
Levqor Autopilot Wave 4 Layer L4: Guardian Executive Summary
PASSIVE MODE ONLY - Aggregates health data from multiple sources.

This module provides a single endpoint that aggregates:
- Heartbeat / pulse status
- Healing plan
- Telemetry summary  
- Upgrade plans

All data is READ-ONLY. No auto-fixes. No behavior changes.
"""
import logging
import time
from datetime import datetime
from flask import Blueprint, jsonify
from typing import Dict, Any, Optional, Tuple

log = logging.getLogger("levqor.guardian.executive_summary")

executive_bp = Blueprint("guardian_executive_summary", __name__)

SAFE_MODE = True


def _get_db():
    """Get database utilities with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def get_telemetry_snapshot(window_minutes: int = 60) -> Dict[str, Any]:
    """
    Query telemetry_logs for last N minutes.
    
    Returns:
        Dict with total_logs, error_count, error_rate, slow_count
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "total_logs": 0,
            "error_count": 0,
            "error_rate": 0.0,
            "slow_count": 0,
            "warning_count": 0,
            "error": "database_unavailable"
        }
    
    try:
        cutoff = time.time() - (window_minutes * 60)
        
        totals = execute_query("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors,
                SUM(CASE WHEN level = 'warning' THEN 1 ELSE 0 END) as warnings,
                SUM(CASE WHEN duration_ms > 2000 THEN 1 ELSE 0 END) as slow
            FROM telemetry_logs 
            WHERE created_at >= ?
        """, (cutoff,), fetch='one') or {}
        
        total_logs = totals.get('total', 0) or 0
        error_count = totals.get('errors', 0) or 0
        warning_count = totals.get('warnings', 0) or 0
        slow_count = totals.get('slow', 0) or 0
        
        error_rate = 0.0
        if total_logs > 0:
            error_rate = round((error_count / total_logs) * 100, 2)
        
        return {
            "total_logs": total_logs,
            "error_count": error_count,
            "warning_count": warning_count,
            "error_rate": error_rate,
            "slow_count": slow_count,
            "time_window_minutes": window_minutes
        }
        
    except Exception as e:
        log.error(f"Error getting telemetry snapshot: {e}")
        return {
            "total_logs": 0,
            "error_count": 0,
            "error_rate": 0.0,
            "slow_count": 0,
            "warning_count": 0,
            "error": str(e)[:100]
        }


def get_upgrade_plans_snapshot() -> Dict[str, Any]:
    """
    Query upgrade_plans table for recent plans.
    
    Returns:
        Dict with total_plans, open_plans, high_priority_open, and top 3 open plans
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "total_plans": 0,
            "open_plans": 0,
            "high_priority_open": 0,
            "top_open_plans": [],
            "error": "database_unavailable"
        }
    
    try:
        totals = execute_query("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cnt,
                SUM(CASE WHEN status = 'open' AND priority <= 2 THEN 1 ELSE 0 END) as high_priority
            FROM upgrade_plans
        """, fetch='one') or {}
        
        total_plans = totals.get('total', 0) or 0
        open_plans = totals.get('open_cnt', 0) or 0
        high_priority_open = totals.get('high_priority', 0) or 0
        
        top_plans = execute_query("""
            SELECT id, category, title, priority, risk_level
            FROM upgrade_plans 
            WHERE status = 'open'
            ORDER BY priority ASC, created_at DESC
            LIMIT 3
        """, fetch='all') or []
        
        top_open_plans = []
        for row in top_plans:
            top_open_plans.append({
                "id": row.get('id'),
                "category": row.get('category'),
                "title": row.get('title'),
                "priority": row.get('priority'),
                "risk_level": row.get('risk_level')
            })
        
        return {
            "total_plans": total_plans,
            "open_plans": open_plans,
            "high_priority_open": high_priority_open,
            "top_open_plans": top_open_plans
        }
        
    except Exception as e:
        log.error(f"Error getting upgrade plans snapshot: {e}")
        return {
            "total_plans": 0,
            "open_plans": 0,
            "high_priority_open": 0,
            "top_open_plans": [],
            "error": str(e)[:100]
        }


def _get_heartbeat_info() -> Optional[Dict[str, Any]]:
    """Get heartbeat data from internal function."""
    try:
        from api.system.heartbeat import get_heartbeat_data
        return get_heartbeat_data()
    except Exception as e:
        log.warning(f"Failed to get heartbeat data: {e}")
        return None


def _get_healing_info() -> Optional[Dict[str, Any]]:
    """Get healing plan summary from internal function."""
    try:
        from api.guardian.healing import build_healing_plan
        plan = build_healing_plan()
        return {
            "status": plan.get("status"),
            "summary": plan.get("summary"),
            "heartbeat_status": plan.get("heartbeat_status"),
            "safe_mode": plan.get("safe_mode", True)
        }
    except Exception as e:
        log.warning(f"Failed to get healing info: {e}")
        return None


def compute_health_score(telemetry: Dict[str, Any], plans: Dict[str, Any]) -> Tuple[int, str]:
    """
    Compute overall health score and status.
    
    Combines:
    - error_rate (up to -30 points)
    - slow_count (up to -30 points)
    - high_priority_open plans (up to -40 points)
    
    Args:
        telemetry: Telemetry snapshot dict
        plans: Upgrade plans snapshot dict
    
    Returns:
        Tuple of (health_score: int 0-100, status: str)
    """
    score = 100
    
    error_rate = telemetry.get("error_rate", 0)
    if error_rate > 0:
        error_penalty = min(30, error_rate * 3)
        score -= error_penalty
    
    slow_count = telemetry.get("slow_count", 0)
    if slow_count > 0:
        slow_penalty = min(30, slow_count * 5)
        score -= slow_penalty
    
    high_priority = plans.get("high_priority_open", 0)
    if high_priority > 0:
        priority_penalty = min(40, high_priority * 10)
        score -= priority_penalty
    
    score = max(0, min(100, int(score)))
    
    if score >= 85:
        status = "healthy"
    elif score >= 70:
        status = "warning"
    else:
        status = "critical"
    
    return score, status


@executive_bp.route("/api/guardian/executive-summary", methods=["GET"])
def get_executive_summary():
    """
    GET /api/guardian/executive-summary
    
    Returns a comprehensive snapshot of system health by aggregating:
    - Heartbeat status
    - Healing plan
    - Telemetry summary
    - Upgrade plans
    
    PASSIVE MODE: Read-only, no auto-fixes applied.
    
    Response:
    {
        "safe_mode": true,
        "health_score": 0-100,
        "status": "healthy" | "warning" | "critical",
        "sections": {
            "heartbeat": {...} or null,
            "healing": {...} or null,
            "telemetry": {...},
            "upgrade_plans": {...}
        },
        "generated_at": <unix_timestamp>
    }
    """
    now = int(time.time())
    
    try:
        telemetry_info = get_telemetry_snapshot(window_minutes=60)
        plans_info = get_upgrade_plans_snapshot()
        
        heartbeat_info = _get_heartbeat_info()
        healing_info = _get_healing_info()
        
        health_score, status = compute_health_score(telemetry_info, plans_info)
        
        response = {
            "safe_mode": SAFE_MODE,
            "health_score": health_score,
            "status": status,
            "sections": {
                "heartbeat": heartbeat_info,
                "healing": healing_info,
                "telemetry": telemetry_info,
                "upgrade_plans": plans_info
            },
            "generated_at": now,
            "generated_at_iso": datetime.utcnow().isoformat() + "Z"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        log.error(f"Executive summary endpoint error: {e}")
        return jsonify({
            "safe_mode": SAFE_MODE,
            "health_score": 0,
            "status": "critical",
            "sections": {
                "heartbeat": None,
                "healing": None,
                "telemetry": {"error": str(e)[:100]},
                "upgrade_plans": {"error": str(e)[:100]}
            },
            "error": "Failed to generate executive summary",
            "generated_at": now,
            "generated_at_iso": datetime.utcnow().isoformat() + "Z"
        }), 500
