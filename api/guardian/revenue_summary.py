"""
Levqor Revenue Autopilot Wave v1: Guardian Revenue Summary
PASSIVE MODE ONLY - Aggregates lead and DFY request data.
No auto-charges, no Stripe changes, no billing modifications.
"""
import time
import logging
from flask import Blueprint, jsonify
from modules.db_wrapper import execute_query

log = logging.getLogger("levqor.guardian.revenue_summary")

revenue_summary_bp = Blueprint("guardian_revenue_summary", __name__)

SAFE_MODE = True


def get_leads_snapshot(days: int = 30) -> dict:
    """Query sales_leads for aggregated data."""
    try:
        cutoff = time.time() - (days * 24 * 3600)
        
        total = execute_query("""
            SELECT COUNT(*) as cnt FROM sales_leads WHERE created_at >= ?
        """, (cutoff,), fetch='one') or {}
        total_leads = total.get('cnt', 0) or 0
        
        by_stage_rows = execute_query("""
            SELECT stage, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ? GROUP BY stage
        """, (cutoff,), fetch='all') or []
        by_stage = {row['stage']: row['cnt'] for row in by_stage_rows}
        
        by_source_rows = execute_query("""
            SELECT source, COUNT(*) as cnt FROM sales_leads 
            WHERE created_at >= ? GROUP BY source ORDER BY cnt DESC LIMIT 5
        """, (cutoff,), fetch='all') or []
        by_source = {row['source']: row['cnt'] for row in by_source_rows}
        
        return {
            "total": total_leads,
            "by_stage": by_stage,
            "by_source": by_source,
            "days": days
        }
    except Exception as e:
        log.error(f"Error getting leads snapshot: {e}")
        return {"total": 0, "by_stage": {}, "by_source": {}, "error": str(e)[:100]}


def get_dfy_snapshot(days: int = 30) -> dict:
    """Query dfy_requests for aggregated data."""
    try:
        cutoff = time.time() - (days * 24 * 3600)
        
        total = execute_query("""
            SELECT COUNT(*) as cnt FROM dfy_requests WHERE created_at >= ?
        """, (cutoff,), fetch='one') or {}
        total_requests = total.get('cnt', 0) or 0
        
        by_status_rows = execute_query("""
            SELECT status, COUNT(*) as cnt FROM dfy_requests 
            WHERE created_at >= ? GROUP BY status
        """, (cutoff,), fetch='all') or []
        by_status = {row['status']: row['cnt'] for row in by_status_rows}
        
        by_use_case_rows = execute_query("""
            SELECT use_case, COUNT(*) as cnt FROM dfy_requests 
            WHERE created_at >= ? GROUP BY use_case ORDER BY cnt DESC LIMIT 5
        """, (cutoff,), fetch='all') or []
        by_use_case = [{"use_case": row['use_case'], "count": row['cnt']} for row in by_use_case_rows]
        
        return {
            "total": total_requests,
            "by_status": by_status,
            "by_use_case": by_use_case,
            "days": days
        }
    except Exception as e:
        log.error(f"Error getting DFY snapshot: {e}")
        return {"total": 0, "by_status": {}, "by_use_case": [], "error": str(e)[:100]}


@revenue_summary_bp.route("/api/guardian/revenue/summary", methods=["GET"])
def get_revenue_summary():
    """
    GET /api/guardian/revenue/summary
    
    Returns aggregated revenue pipeline data for Guardian dashboards.
    
    PASSIVE MODE: Read-only, no auto-charges, no Stripe modifications.
    
    Response:
    {
        "safe_mode": true,
        "generated_at": <unix_timestamp>,
        "leads": {
            "last_30_days": ...,
            "last_7_days": ...,
            "by_stage": {...},
            "by_source": {...}
        },
        "dfy_requests": {
            "last_30_days": ...,
            "last_7_days": ...,
            "by_status": {...},
            "by_use_case": [...]
        }
    }
    """
    try:
        now = int(time.time())
        
        leads_30 = get_leads_snapshot(days=30)
        leads_7 = get_leads_snapshot(days=7)
        dfy_30 = get_dfy_snapshot(days=30)
        dfy_7 = get_dfy_snapshot(days=7)
        
        response = {
            "safe_mode": SAFE_MODE,
            "generated_at": now,
            "leads": {
                "last_30_days": leads_30.get("total", 0),
                "last_7_days": leads_7.get("total", 0),
                "by_stage": leads_30.get("by_stage", {}),
                "by_source": leads_30.get("by_source", {})
            },
            "dfy_requests": {
                "last_30_days": dfy_30.get("total", 0),
                "last_7_days": dfy_7.get("total", 0),
                "by_status": dfy_30.get("by_status", {}),
                "by_use_case": dfy_30.get("by_use_case", [])
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        log.error(f"Revenue summary error: {e}")
        return jsonify({
            "safe_mode": SAFE_MODE,
            "generated_at": int(time.time()),
            "error": str(e)[:100],
            "leads": {"last_30_days": 0, "last_7_days": 0, "by_stage": {}, "by_source": {}},
            "dfy_requests": {"last_30_days": 0, "last_7_days": 0, "by_status": {}, "by_use_case": []}
        }), 500
