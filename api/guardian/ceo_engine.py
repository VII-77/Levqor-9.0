"""
Levqor Autopilot Wave 5: AI CEO Engine (Advisory Mode, Passive Only)
PASSIVE MODE ONLY - Strategic insights, predictions, and priority matrix.

This module provides a single CEO brain layer on top of Guardian + Revenue stack:
- Reads from: telemetry, upgrade_plans, sales_leads, dfy_requests, executive_summary, revenue_summary
- Produces: strategy actions, predictions, and a priority matrix
- 100% passive - no auto-fixes, no auto-charges, no direct config/code changes

All actions are ADVISORY ONLY. safe_mode is always true.
"""
import time
import logging
from flask import Blueprint, jsonify
from typing import Dict, Any, List, Tuple

log = logging.getLogger("levqor.guardian.ceo_engine")

ceo_bp = Blueprint("guardian_ceo_engine", __name__)

SAFE_MODE = True


def _get_db():
    """Get database utilities with error handling."""
    try:
        from modules.db_wrapper import execute_query
        return execute_query
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None


def get_telemetry_slice(window_minutes: int = 60) -> Dict[str, Any]:
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
            "warning_count": 0
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
        log.error(f"Error getting telemetry slice: {e}")
        return {
            "total_logs": 0,
            "error_count": 0,
            "error_rate": 0.0,
            "slow_count": 0,
            "warning_count": 0
        }


def get_upgrade_plans_slice() -> Dict[str, Any]:
    """
    Query upgrade_plans table for recent plans.
    
    Returns:
        Dict with total_plans, open_high_priority, open_count, sample_top
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "total_plans": 0,
            "open_high_priority": 0,
            "open_count": 0,
            "sample_top": []
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
        open_count = totals.get('open_cnt', 0) or 0
        open_high_priority = totals.get('high_priority', 0) or 0
        
        top_plans = execute_query("""
            SELECT id, category, title, priority, status
            FROM upgrade_plans 
            WHERE status = 'open'
            ORDER BY priority ASC, created_at DESC
            LIMIT 3
        """, fetch='all') or []
        
        sample_top = []
        for row in top_plans:
            sample_top.append({
                "id": row.get('id'),
                "category": row.get('category'),
                "title": row.get('title'),
                "priority": row.get('priority'),
                "status": row.get('status')
            })
        
        return {
            "total_plans": total_plans,
            "open_high_priority": open_high_priority,
            "open_count": open_count,
            "sample_top": sample_top
        }
        
    except Exception as e:
        log.error(f"Error getting upgrade plans slice: {e}")
        return {
            "total_plans": 0,
            "open_high_priority": 0,
            "open_count": 0,
            "sample_top": []
        }


def get_revenue_slice() -> Dict[str, Any]:
    """
    Query sales_leads and dfy_requests for counts.
    
    Returns:
        Dict with leads_7d, leads_30d, leads_14d, dfy_7d, dfy_30d, dfy_14d
    """
    execute_query = _get_db()
    if not execute_query:
        return {
            "leads_7d": 0,
            "leads_30d": 0,
            "leads_14d": 0,
            "dfy_7d": 0,
            "dfy_30d": 0,
            "dfy_14d": 0
        }
    
    try:
        now = time.time()
        cutoff_7d = now - (7 * 24 * 3600)
        cutoff_14d = now - (14 * 24 * 3600)
        cutoff_30d = now - (30 * 24 * 3600)
        
        leads_7 = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_7d,), fetch='one') or {}
        
        leads_14 = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_14d,), fetch='one') or {}
        
        leads_30 = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff_30d,), fetch='one') or {}
        
        dfy_7 = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_7d,), fetch='one') or {}
        
        dfy_14 = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_14d,), fetch='one') or {}
        
        dfy_30 = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff_30d,), fetch='one') or {}
        
        return {
            "leads_7d": leads_7.get('cnt', 0) or 0,
            "leads_14d": leads_14.get('cnt', 0) or 0,
            "leads_30d": leads_30.get('cnt', 0) or 0,
            "dfy_7d": dfy_7.get('cnt', 0) or 0,
            "dfy_14d": dfy_14.get('cnt', 0) or 0,
            "dfy_30d": dfy_30.get('cnt', 0) or 0
        }
        
    except Exception as e:
        log.error(f"Error getting revenue slice: {e}")
        return {
            "leads_7d": 0,
            "leads_30d": 0,
            "leads_14d": 0,
            "dfy_7d": 0,
            "dfy_30d": 0,
            "dfy_14d": 0
        }


def get_executive_summary_snapshot() -> Dict[str, Any]:
    """
    Get health_score and status from executive summary logic.
    Re-uses existing helpers when available, otherwise computes directly.
    
    Returns:
        Dict with health_score and status
    """
    try:
        from api.guardian.executive_summary import (
            get_telemetry_snapshot,
            get_upgrade_plans_snapshot,
            compute_health_score
        )
        
        telemetry_info = get_telemetry_snapshot(window_minutes=60)
        plans_info = get_upgrade_plans_snapshot()
        health_score, status = compute_health_score(telemetry_info, plans_info)
        
        return {
            "health_score": health_score,
            "status": status
        }
        
    except Exception as e:
        log.warning(f"Failed to get executive summary snapshot: {e}")
        return {
            "health_score": 70,
            "status": "warning"
        }


def get_revenue_summary_snapshot() -> Dict[str, Any]:
    """
    Get leads/DFY counts from revenue summary.
    
    Returns:
        Dict with leads_last_7_days, dfy_last_7_days
    """
    try:
        from api.guardian.revenue_summary import get_leads_snapshot, get_dfy_snapshot
        
        leads_7 = get_leads_snapshot(days=7)
        dfy_7 = get_dfy_snapshot(days=7)
        
        return {
            "leads_last_7_days": leads_7.get("total", 0),
            "dfy_last_7_days": dfy_7.get("total", 0)
        }
        
    except Exception as e:
        log.warning(f"Failed to get revenue summary snapshot: {e}")
        return {
            "leads_last_7_days": 0,
            "dfy_last_7_days": 0
        }


def infer_trend(recent: int, previous: int) -> str:
    """
    Infer trend direction based on recent vs previous counts.
    
    Args:
        recent: Count in recent period
        previous: Count in previous period
    
    Returns:
        "up", "down", or "flat"
    """
    if previous == 0:
        if recent == 0:
            return "flat"
        return "up"
    
    ratio = (recent - previous) / max(previous, 1)
    
    if ratio > 0.2:
        return "up"
    elif ratio < -0.2:
        return "down"
    else:
        return "flat"


def predict_next_7d(leads_7d: int, leads_30d: int, dfy_7d: int, dfy_30d: int) -> Tuple[int, int, float]:
    """
    Simple heuristic prediction for next 7 days.
    
    Uses recent trends to estimate future counts.
    Confidence is based on volume.
    
    Args:
        leads_7d, leads_30d: Lead counts for 7-day and 30-day windows
        dfy_7d, dfy_30d: DFY request counts for 7-day and 30-day windows
    
    Returns:
        Tuple of (expected_leads, expected_dfy, confidence)
    """
    expected_leads = leads_7d
    expected_dfy = dfy_7d
    
    if leads_30d > 0:
        daily_avg = leads_30d / 30
        expected_leads = max(leads_7d, int(daily_avg * 7))
    
    if dfy_30d > 0:
        daily_avg = dfy_30d / 30
        expected_dfy = max(dfy_7d, int(daily_avg * 7))
    
    total_volume = leads_7d + dfy_7d
    
    if total_volume < 5:
        confidence = 0.3
    elif total_volume < 20:
        confidence = 0.6
    else:
        confidence = 0.8
    
    return expected_leads, expected_dfy, confidence


def build_strategy_and_priority(
    health_score: int,
    telemetry: Dict[str, Any],
    plans: Dict[str, Any],
    revenue: Dict[str, Any]
) -> Tuple[Dict[str, List[Dict[str, Any]]], Dict[str, List[Dict[str, Any]]]]:
    """
    Build strategy actions and priority matrix based on current data.
    
    Uses deterministic rules to identify actionable recommendations.
    
    Args:
        health_score: Current system health score (0-100)
        telemetry: Telemetry slice data
        plans: Upgrade plans slice data
        revenue: Revenue slice data
    
    Returns:
        Tuple of (strategy dict, priority_matrix dict)
    """
    strategy = {
        "revenue_actions": [],
        "reliability_actions": [],
        "ux_actions": []
    }
    
    priority_matrix = {
        "critical": [],
        "high": [],
        "moderate": [],
        "low": []
    }
    
    error_rate = telemetry.get("error_rate", 0)
    slow_count = telemetry.get("slow_count", 0)
    open_high_priority = plans.get("open_high_priority", 0)
    leads_7d = revenue.get("leads_7d", 0)
    leads_30d = revenue.get("leads_30d", 0)
    dfy_7d = revenue.get("dfy_7d", 0)
    
    if error_rate > 10 or health_score < 70:
        action = {
            "title": "Stabilize core workflows",
            "reason": f"High error rate ({error_rate:.1f}%) in telemetry logs; system health at {health_score}.",
            "category": "reliability",
            "suggested_window": "now",
            "impact_score": 10
        }
        strategy["reliability_actions"].append(action)
        priority_matrix["critical"].append({
            "title": action["title"],
            "category": "reliability",
            "impact": 10
        })
    
    if slow_count > 5:
        action = {
            "title": "Optimize slow endpoints",
            "reason": f"{slow_count} requests exceeded 2s response time in the last hour.",
            "category": "reliability",
            "suggested_window": "7d",
            "impact_score": 7
        }
        strategy["reliability_actions"].append(action)
        priority_matrix["high"].append({
            "title": action["title"],
            "category": "reliability",
            "impact": 7
        })
    
    if open_high_priority > 0:
        top_plans = plans.get("sample_top", [])
        plan_titles = ", ".join([p.get("title", "")[:30] for p in top_plans[:2]])
        action = {
            "title": "Address high-priority upgrade plans",
            "reason": f"{open_high_priority} high-priority upgrade plans pending. Top: {plan_titles}",
            "category": "reliability",
            "suggested_window": "7d",
            "impact_score": 8
        }
        strategy["reliability_actions"].append(action)
        priority_matrix["high"].append({
            "title": action["title"],
            "category": "reliability",
            "impact": 8
        })
    
    if leads_30d > 0 and leads_7d < (leads_30d / 4):
        action = {
            "title": "Improve homepage/pricing conversion",
            "reason": f"Lead volume dropped: {leads_7d} leads in last 7 days vs {leads_30d} in last 30 days.",
            "category": "revenue",
            "suggested_window": "7d",
            "impact_score": 8
        }
        strategy["revenue_actions"].append(action)
        priority_matrix["high"].append({
            "title": action["title"],
            "category": "revenue",
            "impact": 8
        })
    
    if dfy_7d == 0 and leads_7d > 0:
        action = {
            "title": "Promote DFY offers to existing leads",
            "reason": f"No DFY requests in last 7 days, but {leads_7d} leads captured. Cross-sell opportunity.",
            "category": "revenue",
            "suggested_window": "7d",
            "impact_score": 6
        }
        strategy["revenue_actions"].append(action)
        priority_matrix["moderate"].append({
            "title": action["title"],
            "category": "revenue",
            "impact": 6
        })
    
    if leads_7d == 0 and leads_30d == 0:
        action = {
            "title": "Launch lead generation campaign",
            "reason": "No leads captured in the last 30 days. Consider SEO, content, or paid acquisition.",
            "category": "revenue",
            "suggested_window": "30d",
            "impact_score": 9
        }
        strategy["revenue_actions"].append(action)
        priority_matrix["critical"].append({
            "title": action["title"],
            "category": "revenue",
            "impact": 9
        })
    
    if leads_7d > 10 and health_score >= 85:
        action = {
            "title": "Consider UX improvements for conversion",
            "reason": f"Strong lead flow ({leads_7d}/week) with healthy system. Focus on checkout/onboarding UX.",
            "category": "ux",
            "suggested_window": "30d",
            "impact_score": 5
        }
        strategy["ux_actions"].append(action)
        priority_matrix["low"].append({
            "title": action["title"],
            "category": "ux",
            "impact": 5
        })
    
    if not strategy["reliability_actions"] and not strategy["revenue_actions"] and health_score >= 85:
        action = {
            "title": "System stable - focus on growth",
            "reason": f"Health score is {health_score}%, no critical issues. Consider expanding marketing or features.",
            "category": "revenue",
            "suggested_window": "30d",
            "impact_score": 4
        }
        strategy["revenue_actions"].append(action)
        priority_matrix["low"].append({
            "title": action["title"],
            "category": "revenue",
            "impact": 4
        })
    
    return strategy, priority_matrix


@ceo_bp.route("/api/guardian/ceo-summary", methods=["GET"])
def ceo_summary():
    """
    GET /api/guardian/ceo-summary
    
    Returns strategic CEO-level insights aggregating all Guardian and Revenue data.
    
    PASSIVE MODE: 100% read-only. No auto-fixes. No auto-charges. No config changes.
    
    Response:
    {
        "safe_mode": true,
        "generated_at": <unix_timestamp>,
        "overall": { "health_score": 0-100, "status": "healthy|warning|critical" },
        "revenue_snapshot": {
            "leads_7d": 0, "leads_30d": 0, "dfy_7d": 0, "dfy_30d": 0,
            "conversion_signals": { "lead_trend": "up|flat|down", "dfy_trend": "up|flat|down" }
        },
        "strategy": {
            "revenue_actions": [...],
            "reliability_actions": [...],
            "ux_actions": [...]
        },
        "predictions": {
            "next_7d": { "expected_leads": 0, "expected_dfy_requests": 0 },
            "confidence": 0.0
        },
        "priority_matrix": { "critical": [...], "high": [...], "moderate": [...], "low": [...] },
        "inputs": {
            "executive_summary": { ... },
            "guardian_revenue_summary": { ... }
        }
    }
    """
    now = int(time.time())
    
    try:
        telemetry = get_telemetry_slice(window_minutes=60)
        plans = get_upgrade_plans_slice()
        revenue = get_revenue_slice()
        exec_summary = get_executive_summary_snapshot()
        rev_summary = get_revenue_summary_snapshot()
    except Exception as e:
        log.error(f"CEO summary data gathering failed: {e}")
        return jsonify({
            "safe_mode": True,
            "generated_at": now,
            "overall": {
                "health_score": 60,
                "status": "warning"
            },
            "revenue_snapshot": {
                "leads_7d": 0,
                "leads_30d": 0,
                "dfy_7d": 0,
                "dfy_30d": 0,
                "conversion_signals": {
                    "lead_trend": "flat",
                    "dfy_trend": "flat"
                }
            },
            "strategy": {
                "revenue_actions": [],
                "reliability_actions": [],
                "ux_actions": []
            },
            "predictions": {
                "next_7d": {
                    "expected_leads": 0,
                    "expected_dfy_requests": 0
                },
                "confidence": 0.0
            },
            "priority_matrix": {
                "critical": [],
                "high": [],
                "moderate": [],
                "low": []
            },
            "inputs": {
                "executive_summary": {"error": "unavailable"},
                "guardian_revenue_summary": {"error": "unavailable"}
            }
        }), 200
    
    health_score = int(exec_summary.get("health_score", 70))
    status = exec_summary.get("status", "warning")
    
    leads_7d = int(revenue.get("leads_7d", 0))
    leads_14d = int(revenue.get("leads_14d", 0))
    leads_30d = int(revenue.get("leads_30d", 0))
    dfy_7d = int(revenue.get("dfy_7d", 0))
    dfy_14d = int(revenue.get("dfy_14d", 0))
    dfy_30d = int(revenue.get("dfy_30d", 0))
    
    leads_prev_7d = max(leads_14d - leads_7d, 0)
    dfy_prev_7d = max(dfy_14d - dfy_7d, 0)
    
    lead_trend = infer_trend(leads_7d, leads_prev_7d)
    dfy_trend = infer_trend(dfy_7d, dfy_prev_7d)
    
    expected_leads, expected_dfy, confidence = predict_next_7d(
        leads_7d, leads_30d, dfy_7d, dfy_30d
    )
    
    strategy, priority_matrix = build_strategy_and_priority(
        health_score, telemetry, plans, revenue
    )
    
    inputs = {
        "executive_summary": {
            "health_score": health_score,
            "status": status
        },
        "guardian_revenue_summary": {
            "leads_7d": leads_7d,
            "dfy_7d": dfy_7d
        }
    }
    
    return jsonify({
        "safe_mode": True,
        "generated_at": now,
        "overall": {
            "health_score": health_score,
            "status": status
        },
        "revenue_snapshot": {
            "leads_7d": leads_7d,
            "leads_30d": leads_30d,
            "dfy_7d": dfy_7d,
            "dfy_30d": dfy_30d,
            "conversion_signals": {
                "lead_trend": lead_trend,
                "dfy_trend": dfy_trend
            }
        },
        "strategy": strategy,
        "predictions": {
            "next_7d": {
                "expected_leads": int(expected_leads),
                "expected_dfy_requests": int(expected_dfy)
            },
            "confidence": float(confidence)
        },
        "priority_matrix": priority_matrix,
        "inputs": inputs
    }), 200
