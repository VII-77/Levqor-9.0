"""
Levqor Autopilot Wave 6: Founder Briefing & Alerts Autopilot
PASSIVE MODE ONLY - Proactive founder notifications and daily briefings.

This module provides:
- Structured "Founder Briefing" payload for daily digests
- Integration with existing Guardian + Revenue + CEO stack
- All data is READ-ONLY, no auto-fixes, no auto-charges

safe_mode is always true.
"""
import time
import logging
from flask import Blueprint, jsonify
from typing import Dict, Any, List

log = logging.getLogger("levqor.guardian.founder_briefing")

founder_briefing_bp = Blueprint("guardian_founder_briefing", __name__)

SAFE_MODE = True


def _get_db():
    """Get database utilities with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def get_revenue_24h_and_7d() -> Dict[str, Any]:
    """
    Query sales_leads and dfy_requests for 24h and 7d counts.
    
    Returns:
        Dict with leads_24h, dfy_24h, leads_7d, dfy_7d, top_sources
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "leads_24h": 0,
            "dfy_24h": 0,
            "leads_7d": 0,
            "dfy_7d": 0,
            "top_sources": [],
            "notes": []
        }
    
    try:
        now = time.time()
        cutoff_24h = now - (24 * 3600)
        cutoff_7d = now - (7 * 24 * 3600)
        
        leads_24h_result = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_24h,), fetch='one') or {}
        leads_24h = leads_24h_result.get('cnt', 0) or 0
        
        leads_7d_result = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_7d,), fetch='one') or {}
        leads_7d = leads_7d_result.get('cnt', 0) or 0
        
        dfy_24h_result = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_24h,), fetch='one') or {}
        dfy_24h = dfy_24h_result.get('cnt', 0) or 0
        
        dfy_7d_result = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_7d,), fetch='one') or {}
        dfy_7d = dfy_7d_result.get('cnt', 0) or 0
        
        top_sources_rows = execute_query("""
            SELECT source, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ?
            GROUP BY source 
            ORDER BY cnt DESC 
            LIMIT 3
        """, (cutoff_24h,), fetch='all') or []
        
        top_sources = [
            {"source": row.get('source', 'unknown'), "count": row.get('cnt', 0)}
            for row in top_sources_rows
        ]
        
        notes = []
        if leads_24h > 0:
            notes.append(f"{leads_24h} new lead(s) captured today.")
        if dfy_24h > 0:
            notes.append(f"{dfy_24h} DFY request(s) received today.")
        if leads_24h == 0 and dfy_24h == 0:
            notes.append("No new activity in the last 24 hours.")
        
        return {
            "leads_24h": leads_24h,
            "dfy_24h": dfy_24h,
            "leads_7d": leads_7d,
            "dfy_7d": dfy_7d,
            "top_sources": top_sources,
            "notes": notes
        }
        
    except Exception as e:
        log.error(f"Error getting revenue slice: {e}")
        return {
            "leads_24h": 0,
            "dfy_24h": 0,
            "leads_7d": 0,
            "dfy_7d": 0,
            "top_sources": [],
            "notes": ["Error retrieving revenue data."]
        }


def get_system_24h() -> Dict[str, Any]:
    """
    Query telemetry_logs and upgrade_plans for system health.
    
    Returns:
        Dict with error_rate_24h, slow_endpoints_24h, open_high_priority_plans, heartbeat_status
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "error_rate_24h": 0.0,
            "slow_endpoints_24h": 0,
            "open_high_priority_plans": 0,
            "heartbeat_status": "unknown"
        }
    
    try:
        now = time.time()
        cutoff_24h = now - (24 * 3600)
        
        telemetry_result = execute_query("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors,
                SUM(CASE WHEN duration_ms > 2000 THEN 1 ELSE 0 END) as slow
            FROM telemetry_logs 
            WHERE created_at >= ?
        """, (cutoff_24h,), fetch='one') or {}
        
        total_24h = telemetry_result.get('total', 0) or 0
        error_24h = telemetry_result.get('errors', 0) or 0
        slow_24h = telemetry_result.get('slow', 0) or 0
        
        error_rate_24h = 0.0
        if total_24h > 0:
            error_rate_24h = round((error_24h / total_24h) * 100, 2)
        
        plans_result = execute_query("""
            SELECT COUNT(*) as cnt 
            FROM upgrade_plans 
            WHERE status = 'open' AND priority <= 2
        """, fetch='one') or {}
        open_high_priority = plans_result.get('cnt', 0) or 0
        
        heartbeat_status = "ok"
        if error_rate_24h > 10 or open_high_priority > 3:
            heartbeat_status = "failed"
        elif error_rate_24h > 5 or open_high_priority > 0:
            heartbeat_status = "degraded"
        
        return {
            "error_rate_24h": error_rate_24h,
            "slow_endpoints_24h": slow_24h,
            "open_high_priority_plans": open_high_priority,
            "heartbeat_status": heartbeat_status
        }
        
    except Exception as e:
        log.error(f"Error getting system slice: {e}")
        return {
            "error_rate_24h": 0.0,
            "slow_endpoints_24h": 0,
            "open_high_priority_plans": 0,
            "heartbeat_status": "unknown"
        }


def get_ceo_slice() -> Dict[str, Any]:
    """
    Get CEO summary data for strategy extraction.
    
    Returns:
        Dict with health_score, status, strategy, priority_matrix
    """
    try:
        from api.guardian.ceo_engine import (
            get_telemetry_slice,
            get_upgrade_plans_slice,
            get_revenue_slice,
            get_executive_summary_snapshot,
            build_strategy_and_priority
        )
        
        telemetry = get_telemetry_slice(window_minutes=60)
        plans = get_upgrade_plans_slice()
        revenue = get_revenue_slice()
        exec_summary = get_executive_summary_snapshot()
        
        health_score = int(exec_summary.get("health_score", 70))
        status = exec_summary.get("status", "warning")
        
        strategy, priority_matrix = build_strategy_and_priority(
            health_score, telemetry, plans, revenue
        )
        
        return {
            "health_score": health_score,
            "status": status,
            "strategy": strategy,
            "priority_matrix": priority_matrix
        }
        
    except Exception as e:
        log.warning(f"Failed to get CEO slice: {e}")
        return {
            "health_score": 70,
            "status": "warning",
            "strategy": {
                "revenue_actions": [],
                "reliability_actions": [],
                "ux_actions": []
            },
            "priority_matrix": {
                "critical": [],
                "high": [],
                "moderate": [],
                "low": []
            }
        }


def build_strategy_timeline(
    ceo_strategy: Dict[str, List],
    priority_matrix: Dict[str, List]
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Extract strategy timeline from CEO data.
    
    Args:
        ceo_strategy: Strategy dict from CEO engine
        priority_matrix: Priority matrix from CEO engine
    
    Returns:
        Dict with today (urgent) and this_week (moderate) action lists
    """
    today = []
    this_week = []
    
    for item in priority_matrix.get("critical", []):
        today.append({
            "title": item.get("title", ""),
            "reason": f"Critical priority ({item.get('category', 'other')})",
            "category": item.get("category", "other"),
            "priority": "critical"
        })
    
    for item in priority_matrix.get("high", []):
        if len(today) < 5:
            today.append({
                "title": item.get("title", ""),
                "reason": f"High priority ({item.get('category', 'other')})",
                "category": item.get("category", "other"),
                "priority": "high"
            })
        else:
            this_week.append({
                "title": item.get("title", ""),
                "reason": f"High priority overflow ({item.get('category', 'other')})",
                "category": item.get("category", "other"),
                "priority": "high"
            })
    
    for item in priority_matrix.get("moderate", []):
        if len(this_week) < 5:
            this_week.append({
                "title": item.get("title", ""),
                "reason": f"Moderate priority ({item.get('category', 'other')})",
                "category": item.get("category", "other"),
                "priority": "moderate"
            })
    
    for item in priority_matrix.get("low", []):
        if len(this_week) < 5:
            this_week.append({
                "title": item.get("title", ""),
                "reason": f"Low priority ({item.get('category', 'other')})",
                "category": item.get("category", "other"),
                "priority": "low"
            })
    
    if not today and not this_week:
        for action in ceo_strategy.get("reliability_actions", [])[:2]:
            today.append({
                "title": action.get("title", "Check system health"),
                "reason": action.get("reason", "Routine check"),
                "category": action.get("category", "reliability"),
                "priority": "moderate"
            })
        for action in ceo_strategy.get("revenue_actions", [])[:2]:
            this_week.append({
                "title": action.get("title", "Review revenue pipeline"),
                "reason": action.get("reason", "Routine review"),
                "category": action.get("category", "revenue"),
                "priority": "moderate"
            })
    
    return {
        "today": today[:5],
        "this_week": this_week[:5]
    }


def build_headline(
    health_status: str,
    leads_24h: int,
    dfy_24h: int,
    error_rate: float
) -> str:
    """
    Build a human-readable headline for the briefing.
    
    Args:
        health_status: System health status
        leads_24h: Lead count in last 24h
        dfy_24h: DFY request count in last 24h
        error_rate: Error rate percentage
    
    Returns:
        Headline string
    """
    if health_status == "critical":
        return "System needs attention: errors high, check Guardian."
    
    if health_status == "warning" and error_rate > 5:
        return f"Moderate issues detected: {error_rate:.1f}% error rate."
    
    if leads_24h == 0 and dfy_24h == 0:
        if health_status == "healthy":
            return "Quiet day: no new leads, but system is stable."
        return "Quiet day: no new leads in last 24h."
    
    activity_parts = []
    if leads_24h > 0:
        activity_parts.append(f"{leads_24h} new lead{'s' if leads_24h != 1 else ''}")
    if dfy_24h > 0:
        activity_parts.append(f"{dfy_24h} DFY request{'s' if dfy_24h != 1 else ''}")
    
    activity_text = " and ".join(activity_parts)
    
    if health_status == "healthy" and error_rate < 5:
        return f"Good day: {activity_text}, system stable."
    
    return f"Activity: {activity_text}. System status: {health_status}."


@founder_briefing_bp.route("/api/guardian/founder-briefing", methods=["GET"])
def founder_briefing():
    """
    GET /api/guardian/founder-briefing
    
    Returns a structured founder briefing payload for daily digests.
    
    PASSIVE MODE: 100% read-only. No auto-fixes. No auto-charges.
    
    Response:
    {
        "safe_mode": true,
        "generated_at": <unix_timestamp>,
        "window": { "from": ..., "to": ..., "label": "last_24h" },
        "summary": {
            "headline": "...",
            "health_status": "healthy|warning|critical",
            "health_score": 0-100,
            "key_signals": [...]
        },
        "revenue": {
            "leads_24h": 0, "dfy_24h": 0, "leads_7d": 0, "dfy_7d": 0,
            "top_sources": [...], "notes": [...]
        },
        "system": {
            "error_rate_24h": 0.0,
            "slow_endpoints_24h": 0,
            "open_high_priority_plans": 0,
            "heartbeat_status": "ok|degraded|failed"
        },
        "strategy": { "today": [...], "this_week": [...] },
        "raw_inputs": { "ceo_summary": {...} }
    }
    """
    now = int(time.time())
    window = {
        "from": now - (24 * 3600),
        "to": now,
        "label": "last_24h"
    }
    
    try:
        revenue = get_revenue_24h_and_7d()
        system = get_system_24h()
        ceo = get_ceo_slice()
    except Exception as e:
        log.error(f"Founder briefing data gathering failed: {e}")
        return jsonify({
            "safe_mode": True,
            "generated_at": now,
            "window": window,
            "summary": {
                "headline": "Founder briefing unavailable (fallback).",
                "health_status": "warning",
                "health_score": 60,
                "key_signals": [
                    "Failed to retrieve full briefing data."
                ]
            },
            "revenue": {
                "leads_24h": 0,
                "dfy_24h": 0,
                "leads_7d": 0,
                "dfy_7d": 0,
                "top_sources": [],
                "notes": []
            },
            "system": {
                "error_rate_24h": 0.0,
                "slow_endpoints_24h": 0,
                "open_high_priority_plans": 0,
                "heartbeat_status": "warning"
            },
            "strategy": {
                "today": [],
                "this_week": []
            },
            "raw_inputs": {
                "ceo_summary": {"error": "unavailable"}
            }
        }), 200
    
    health_score = int(ceo.get("health_score", 70))
    health_status = ceo.get("status", "warning")
    
    error_rate = float(system.get("error_rate_24h", 0.0))
    leads_24h = int(revenue.get("leads_24h", 0))
    dfy_24h = int(revenue.get("dfy_24h", 0))
    
    ceo_strategy = ceo.get("strategy", {})
    ceo_priority = ceo.get("priority_matrix", {})
    strategy_timeline = build_strategy_timeline(ceo_strategy, ceo_priority)
    
    headline = build_headline(health_status, leads_24h, dfy_24h, error_rate)
    
    key_signals = []
    if leads_24h > 0:
        key_signals.append(f"{leads_24h} new lead{'s' if leads_24h != 1 else ''} in last 24h.")
    if dfy_24h > 0:
        key_signals.append(f"{dfy_24h} DFY request{'s' if dfy_24h != 1 else ''} in last 24h.")
    if error_rate > 5:
        key_signals.append(f"Error rate {error_rate:.1f}% in last 24h.")
    if system.get("open_high_priority_plans", 0) > 0:
        key_signals.append(f"{system['open_high_priority_plans']} high-priority upgrade plan(s) pending.")
    if system.get("slow_endpoints_24h", 0) > 3:
        key_signals.append(f"{system['slow_endpoints_24h']} slow requests (>2s) in last 24h.")
    
    if not key_signals:
        if health_status == "healthy":
            key_signals.append("All systems running smoothly.")
        else:
            key_signals.append("No critical signals detected.")
    
    summary = {
        "headline": headline,
        "health_status": health_status,
        "health_score": health_score,
        "key_signals": key_signals
    }
    
    return jsonify({
        "safe_mode": True,
        "generated_at": now,
        "window": window,
        "summary": summary,
        "revenue": revenue,
        "system": system,
        "strategy": strategy_timeline,
        "raw_inputs": {
            "ceo_summary": {
                "health_score": health_score,
                "status": health_status
            }
        }
    }), 200


def generate_briefing_alert_text() -> str:
    """
    Generate a short text summary for alert channels (Telegram/Slack).
    
    Returns:
        Single-line text summary suitable for notifications
    """
    try:
        revenue = get_revenue_24h_and_7d()
        system = get_system_24h()
        ceo = get_ceo_slice()
        
        health_status = ceo.get("status", "warning")
        health_score = ceo.get("health_score", 70)
        leads_24h = revenue.get("leads_24h", 0)
        dfy_24h = revenue.get("dfy_24h", 0)
        error_rate = system.get("error_rate_24h", 0.0)
        
        headline = build_headline(health_status, leads_24h, dfy_24h, error_rate)
        
        return (
            f"[Levqor Founder Briefing] {headline} | "
            f"Health: {health_status} ({health_score}%) | "
            f"Leads 24h: {leads_24h} | DFY 24h: {dfy_24h}"
        )
        
    except Exception as e:
        log.error(f"Error generating briefing alert text: {e}")
        return "[Levqor Founder Briefing] Unable to generate summary. Check Guardian dashboard."
