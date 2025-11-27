"""
Levqor Autopilot Wave 3 - Auto-Upgrade Planner
DESIGN-ONLY MODE: Generates structured upgrade plans WITHOUT auto-applying any fixes.

This module:
- Reads telemetry, heartbeat, and healing-plan data
- Analyzes anomalies and identifies improvement opportunities
- Creates structured "upgrade plans" stored in the database
- Exposes APIs to list and manage plans
- NEVER modifies application code, config, or services automatically

All actions are PASSIVE: create plans, not changes.
"""
import logging
import json
from time import time
from uuid import uuid4
from datetime import datetime
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List, Optional

log = logging.getLogger("levqor.guardian.upgrade_planner")

upgrade_planner_bp = Blueprint('guardian_upgrade_planner', __name__, url_prefix='/api/guardian/upgrade')

SAFE_MODE = True
SLOW_ENDPOINT_THRESHOLD_MS = 2000
CRITICAL_ENDPOINT_THRESHOLD_MS = 5000
HIGH_ERROR_RATE_THRESHOLD = 5.0
REPEATED_ERROR_THRESHOLD = 3
MIN_VOLUME_FOR_PERF_ANALYSIS = 5


def _get_db():
    """Get database utilities with error handling."""
    try:
        from modules.db_wrapper import execute_query, commit, rollback
        return execute_query, commit, rollback
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None, None, None


def _get_telemetry_data(execute_query, cutoff: float) -> Dict[str, Any]:
    """
    Gather telemetry data for analysis.
    Returns performance, error rates, and event patterns.
    """
    data = {
        "endpoints": {},
        "error_types": {},
        "error_rate": 0.0,
        "total_logs": 0,
        "total_errors": 0,
        "repeated_messages": []
    }
    
    try:
        totals = execute_query("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors
            FROM telemetry_logs 
            WHERE created_at >= ?
        """, (cutoff,), fetch='one') or {}
        
        data["total_logs"] = totals.get('total', 0) or 0
        data["total_errors"] = totals.get('errors', 0) or 0
        if data["total_logs"] > 0:
            data["error_rate"] = (data["total_errors"] / data["total_logs"]) * 100
        
        endpoints = execute_query("""
            SELECT endpoint, AVG(duration_ms) as avg_ms, MAX(duration_ms) as max_ms, 
                   COUNT(*) as cnt,
                   SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as error_cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND endpoint IS NOT NULL AND duration_ms IS NOT NULL
            GROUP BY endpoint
            ORDER BY avg_ms DESC
            LIMIT 30
        """, (cutoff,), fetch='all') or []
        
        for row in endpoints:
            endpoint = row.get('endpoint')
            if endpoint:
                cnt = row.get('cnt', 0) or 0
                error_cnt = row.get('error_cnt', 0) or 0
                data["endpoints"][endpoint] = {
                    "avg_ms": round(row.get('avg_ms', 0) or 0, 2),
                    "max_ms": round(row.get('max_ms', 0) or 0, 2),
                    "call_count": cnt,
                    "error_count": error_cnt,
                    "error_rate": round((error_cnt / cnt * 100) if cnt > 0 else 0, 2)
                }
        
        error_types = execute_query("""
            SELECT error_type, COUNT(*) as cnt
            FROM telemetry_logs 
            WHERE created_at >= ? AND error_type IS NOT NULL
            GROUP BY error_type
            ORDER BY cnt DESC
            LIMIT 15
        """, (cutoff,), fetch='all') or []
        
        for row in error_types:
            etype = row.get('error_type')
            if etype:
                data["error_types"][etype] = row.get('cnt', 0) or 0
        
        repeated = execute_query("""
            SELECT message, COUNT(*) as cnt, MAX(level) as level
            FROM telemetry_logs 
            WHERE created_at >= ? AND message IS NOT NULL AND message != ''
            GROUP BY message
            HAVING COUNT(*) >= ?
            ORDER BY cnt DESC
            LIMIT 10
        """, (cutoff, REPEATED_ERROR_THRESHOLD), fetch='all') or []
        
        for row in repeated:
            data["repeated_messages"].append({
                "message": row.get('message', '')[:200],
                "count": row.get('cnt', 0) or 0,
                "level": row.get('level', 'info')
            })
        
    except Exception as e:
        log.error(f"Error gathering telemetry data: {e}")
    
    return data


def _get_heartbeat_data() -> Dict[str, Any]:
    """Get current heartbeat status."""
    try:
        from api.system.heartbeat import get_heartbeat_data
        return get_heartbeat_data()
    except Exception as e:
        log.warning(f"Failed to get heartbeat data: {e}")
        return {"status": "unknown"}


def _get_healing_suggestions() -> List[Dict[str, Any]]:
    """Get healing suggestions from healing-plan."""
    try:
        from api.guardian.healing import build_healing_plan
        plan = build_healing_plan()
        suggestions = []
        
        for check in plan.get("checks", []):
            for action in check.get("suggested_actions", []):
                suggestions.append({
                    "check_id": check.get("id"),
                    "check_name": check.get("name"),
                    "check_status": check.get("status"),
                    "action_id": action.get("action_id"),
                    "description": action.get("description"),
                    "severity": action.get("severity", "medium")
                })
        
        return suggestions
    except Exception as e:
        log.warning(f"Failed to get healing suggestions: {e}")
        return []


def compute_upgrade_plans(time_window_minutes: int = 60) -> List[Dict[str, Any]]:
    """
    Analyze telemetry, heartbeat, and healing data to produce upgrade plans.
    
    This function ONLY generates structured plan proposals.
    It does NOT modify any code, config, or services.
    
    Args:
        time_window_minutes: Time window for telemetry analysis
    
    Returns:
        List of upgrade plan dictionaries ready for DB insertion
    """
    execute_query, _, _ = _get_db()
    if not execute_query:
        log.error("Database unavailable for upgrade planning")
        return []
    
    cutoff = time() - (time_window_minutes * 60)
    plans = []
    
    telemetry = _get_telemetry_data(execute_query, cutoff)
    heartbeat = _get_heartbeat_data()
    healing_suggestions = _get_healing_suggestions()
    
    for endpoint, stats in telemetry.get("endpoints", {}).items():
        avg_ms = stats.get("avg_ms", 0)
        call_count = stats.get("call_count", 0)
        
        if avg_ms > CRITICAL_ENDPOINT_THRESHOLD_MS and call_count >= MIN_VOLUME_FOR_PERF_ANALYSIS:
            plans.append({
                "category": "performance",
                "title": f"Critical: Optimize slow endpoint {endpoint}",
                "description": f"Endpoint averages {avg_ms:.0f}ms (critical threshold: {CRITICAL_ENDPOINT_THRESHOLD_MS}ms) over {call_count} calls. Consider: adding caching, reducing payload size, optimizing database queries, or using background processing.",
                "priority": 1,
                "risk_level": "high",
                "source": "telemetry",
                "metadata": {
                    "endpoint": endpoint,
                    "avg_duration_ms": avg_ms,
                    "max_duration_ms": stats.get("max_ms", 0),
                    "call_count": call_count,
                    "error_rate": stats.get("error_rate", 0),
                    "time_window_minutes": time_window_minutes,
                    "auto_applicable": False
                }
            })
        elif avg_ms > SLOW_ENDPOINT_THRESHOLD_MS and call_count >= MIN_VOLUME_FOR_PERF_ANALYSIS:
            plans.append({
                "category": "performance",
                "title": f"Optimize slow endpoint {endpoint}",
                "description": f"Endpoint averages {avg_ms:.0f}ms (threshold: {SLOW_ENDPOINT_THRESHOLD_MS}ms) over {call_count} calls. Suggest: review query performance, add indexes, or implement response caching.",
                "priority": 2,
                "risk_level": "medium",
                "source": "telemetry",
                "metadata": {
                    "endpoint": endpoint,
                    "avg_duration_ms": avg_ms,
                    "max_duration_ms": stats.get("max_ms", 0),
                    "call_count": call_count,
                    "error_rate": stats.get("error_rate", 0),
                    "time_window_minutes": time_window_minutes,
                    "auto_applicable": False
                }
            })
    
    for endpoint, stats in telemetry.get("endpoints", {}).items():
        error_rate = stats.get("error_rate", 0)
        call_count = stats.get("call_count", 0)
        
        if error_rate > HIGH_ERROR_RATE_THRESHOLD and call_count >= MIN_VOLUME_FOR_PERF_ANALYSIS:
            priority = 1 if error_rate > 20 else 2
            plans.append({
                "category": "reliability",
                "title": f"Fix high error rate on {endpoint}",
                "description": f"Endpoint has {error_rate:.1f}% error rate ({stats.get('error_count', 0)} errors in {call_count} calls). Investigate error patterns, add better error handling, and implement retry logic.",
                "priority": priority,
                "risk_level": "high" if error_rate > 20 else "medium",
                "source": "telemetry",
                "metadata": {
                    "endpoint": endpoint,
                    "error_rate": error_rate,
                    "error_count": stats.get("error_count", 0),
                    "call_count": call_count,
                    "time_window_minutes": time_window_minutes,
                    "auto_applicable": False
                }
            })
    
    for error_type, count in telemetry.get("error_types", {}).items():
        if count >= REPEATED_ERROR_THRESHOLD:
            severity = "critical" if count >= 10 else "warning"
            plans.append({
                "category": "reliability",
                "title": f"Address repeated error type: {error_type[:50]}",
                "description": f"Error type '{error_type}' occurred {count} times. Root cause analysis recommended. Check exception handling and add specific error recovery.",
                "priority": 2 if count >= 10 else 3,
                "risk_level": "high" if count >= 10 else "medium",
                "source": "telemetry",
                "metadata": {
                    "error_type": error_type,
                    "occurrence_count": count,
                    "severity": severity,
                    "time_window_minutes": time_window_minutes,
                    "auto_applicable": False
                }
            })
    
    if telemetry.get("error_rate", 0) > HIGH_ERROR_RATE_THRESHOLD:
        error_rate = telemetry["error_rate"]
        plans.append({
            "category": "reliability",
            "title": "System-wide error rate elevated",
            "description": f"Overall error rate is {error_rate:.1f}% (threshold: {HIGH_ERROR_RATE_THRESHOLD}%). Review recent deployments, check for infrastructure issues, and consider rolling back recent changes.",
            "priority": 1,
            "risk_level": "high",
            "source": "telemetry",
            "metadata": {
                "error_rate_percent": error_rate,
                "total_logs": telemetry.get("total_logs", 0),
                "total_errors": telemetry.get("total_errors", 0),
                "time_window_minutes": time_window_minutes,
                "auto_applicable": False
            }
        })
    
    for msg_data in telemetry.get("repeated_messages", []):
        if msg_data.get("level") == "error" and msg_data.get("count", 0) >= 5:
            plans.append({
                "category": "reliability",
                "title": f"Investigate repeated error message",
                "description": f"Error message repeated {msg_data['count']} times: \"{msg_data['message'][:100]}...\". Identify root cause and implement fix.",
                "priority": 2,
                "risk_level": "medium",
                "source": "telemetry",
                "metadata": {
                    "message_preview": msg_data["message"],
                    "occurrence_count": msg_data["count"],
                    "level": msg_data["level"],
                    "auto_applicable": False
                }
            })
    
    if heartbeat.get("status") != "ok":
        status = heartbeat.get("status", "unknown")
        reasons = []
        if not heartbeat.get("db_ok"):
            reasons.append("database")
        if not heartbeat.get("stripe_ok"):
            reasons.append("stripe")
        if not heartbeat.get("brain_ok"):
            reasons.append("brain_api")
        
        plans.append({
            "category": "reliability",
            "title": f"Heartbeat status degraded: {status}",
            "description": f"System heartbeat indicates {status} status. Affected components: {', '.join(reasons) if reasons else 'unknown'}. Investigate and restore services.",
            "priority": 1 if status == "error" else 2,
            "risk_level": "high" if status == "error" else "medium",
            "source": "heartbeat",
            "metadata": {
                "heartbeat_status": status,
                "db_ok": heartbeat.get("db_ok"),
                "stripe_ok": heartbeat.get("stripe_ok"),
                "brain_ok": heartbeat.get("brain_ok"),
                "error_count_recent": heartbeat.get("error_count_recent", 0),
                "auto_applicable": False
            }
        })
    
    for suggestion in healing_suggestions:
        if suggestion.get("check_status") == "error":
            plans.append({
                "category": "reliability",
                "title": f"Healing: {suggestion.get('description', 'Unknown action')[:80]}",
                "description": f"Healing plan suggests: {suggestion.get('description')}. Source check: {suggestion.get('check_name')} (status: {suggestion.get('check_status')})",
                "priority": 2 if suggestion.get("severity") == "critical" else 3,
                "risk_level": "medium" if suggestion.get("severity") in ["high", "critical"] else "low",
                "source": "healing",
                "metadata": {
                    "check_id": suggestion.get("check_id"),
                    "check_name": suggestion.get("check_name"),
                    "action_id": suggestion.get("action_id"),
                    "severity": suggestion.get("severity"),
                    "auto_applicable": False
                }
            })
    
    return plans


def _get_existing_open_plans(execute_query) -> set:
    """Get set of (category, title) for existing open plans to avoid duplicates."""
    try:
        existing = execute_query("""
            SELECT category, title FROM upgrade_plans WHERE status = 'open'
        """, fetch='all') or []
        return {(row.get('category'), row.get('title')) for row in existing}
    except Exception as e:
        log.warning(f"Failed to get existing plans: {e}")
        return set()


def write_plans_to_db(plans: List[Dict[str, Any]], deduplicate: bool = True) -> int:
    """
    Write upgrade plans to the database.
    
    Args:
        plans: List of plan dictionaries from compute_upgrade_plans()
        deduplicate: Skip plans that already exist as 'open'
    
    Returns:
        Number of plans successfully written
    """
    execute_query, commit, rollback = _get_db()
    if not execute_query:
        log.error("Database unavailable for writing plans")
        return 0
    
    existing = set()
    if deduplicate:
        existing = _get_existing_open_plans(execute_query)
    
    written = 0
    now = time()
    
    for plan in plans:
        key = (plan.get("category"), plan.get("title"))
        if deduplicate and key in existing:
            log.debug(f"Skipping duplicate plan: {plan.get('title')[:50]}")
            continue
        
        try:
            plan_id = str(uuid4())
            metadata_json = json.dumps(plan.get("metadata", {}))
            
            execute_query("""
                INSERT INTO upgrade_plans 
                (id, created_at, status, priority, category, title, description, risk_level, source, metadata)
                VALUES (?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)
            """, (
                plan_id,
                now,
                plan.get("priority", 3),
                plan.get("category", "other"),
                plan.get("title", "Untitled Plan"),
                plan.get("description", ""),
                plan.get("risk_level", "medium"),
                plan.get("source", "manual"),
                metadata_json
            ), fetch=None)
            
            existing.add(key)
            written += 1
            
        except Exception as e:
            log.error(f"Failed to write plan '{plan.get('title', 'unknown')[:30]}': {e}")
    
    if written > 0:
        try:
            commit()
        except Exception as e:
            log.error(f"Failed to commit plans: {e}")
            try:
                rollback()
            except:
                pass
            return 0
    
    return written


def get_plans_from_db(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    include_metadata: bool = True
) -> List[Dict[str, Any]]:
    """
    Retrieve upgrade plans from the database.
    
    Args:
        status: Filter by status (open, in_progress, applied, archived)
        category: Filter by category (performance, reliability, etc.)
        limit: Maximum number of plans to return
        include_metadata: Whether to parse and include metadata JSON
    
    Returns:
        List of plan dictionaries
    """
    execute_query, _, _ = _get_db()
    if not execute_query:
        return []
    
    try:
        query = "SELECT * FROM upgrade_plans WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        query += " ORDER BY priority ASC, created_at DESC LIMIT ?"
        params.append(limit)
        
        results = execute_query(query, tuple(params), fetch='all') or []
        
        plans = []
        for row in results:
            plan = dict(row)
            plan["created_at_iso"] = datetime.fromtimestamp(
                plan.get("created_at", 0)
            ).isoformat() + "Z"
            
            if include_metadata and plan.get("metadata"):
                try:
                    plan["metadata"] = json.loads(plan["metadata"])
                except:
                    pass
            
            plans.append(plan)
        
        return plans
        
    except Exception as e:
        log.error(f"Failed to retrieve plans: {e}")
        return []


def get_plan_by_id(plan_id: str) -> Optional[Dict[str, Any]]:
    """Get a single plan by ID."""
    execute_query, _, _ = _get_db()
    if not execute_query:
        return None
    
    try:
        result = execute_query(
            "SELECT * FROM upgrade_plans WHERE id = ?",
            (plan_id,),
            fetch='one'
        )
        
        if not result:
            return None
        
        plan = dict(result)
        plan["created_at_iso"] = datetime.fromtimestamp(
            plan.get("created_at", 0)
        ).isoformat() + "Z"
        
        if plan.get("metadata"):
            try:
                plan["metadata"] = json.loads(plan["metadata"])
            except:
                pass
        
        return plan
        
    except Exception as e:
        log.error(f"Failed to retrieve plan {plan_id}: {e}")
        return None


def archive_old_open_plans(max_age_hours: int = 72) -> int:
    """
    Archive old open plans that are no longer relevant.
    
    Args:
        max_age_hours: Plans older than this are archived
    
    Returns:
        Number of plans archived
    """
    execute_query, commit, _ = _get_db()
    if not execute_query:
        return 0
    
    try:
        cutoff = time() - (max_age_hours * 3600)
        
        execute_query("""
            UPDATE upgrade_plans 
            SET status = 'archived' 
            WHERE status = 'open' AND created_at < ?
        """, (cutoff,), fetch=None)
        
        commit()
        
        result = execute_query(
            "SELECT COUNT(*) as cnt FROM upgrade_plans WHERE status = 'archived' AND created_at < ?",
            (cutoff,),
            fetch='one'
        ) or {}
        
        return result.get('cnt', 0) or 0
        
    except Exception as e:
        log.error(f"Failed to archive old plans: {e}")
        return 0


@upgrade_planner_bp.route('/plans/rebuild', methods=['POST'])
def rebuild_upgrade_plans():
    """
    POST /api/guardian/upgrade/plans/rebuild
    
    Regenerate upgrade plans from current telemetry data.
    Old open plans remain (they're de-duplicated).
    
    Request body (optional):
    {
        "time_window_minutes": 60,
        "archive_old": false
    }
    
    Response:
    {
        "ok": true,
        "created": 5,
        "archived": 0,
        "plans": [ ... ]
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        time_window = min(int(body.get("time_window_minutes", 60)), 1440)
        archive_old = body.get("archive_old", False)
        
        archived_count = 0
        if archive_old:
            archived_count = archive_old_open_plans(max_age_hours=72)
        
        plans = compute_upgrade_plans(time_window_minutes=time_window)
        created = write_plans_to_db(plans, deduplicate=True)
        
        recent_plans = get_plans_from_db(status="open", limit=20)
        
        try:
            from api.guardian.telemetry_ingest import store_telemetry
            store_telemetry(
                source="guardian",
                level="info",
                event_type="upgrade_plans_rebuilt",
                message=f"Upgrade planner generated {created} new plans",
                metadata={
                    "plans_created": created,
                    "plans_archived": archived_count,
                    "time_window_minutes": time_window,
                    "total_open_plans": len(recent_plans)
                }
            )
        except Exception as e:
            log.debug(f"Telemetry logging failed: {e}")
        
        return jsonify({
            "ok": True,
            "created": created,
            "archived": archived_count,
            "time_window_minutes": time_window,
            "safe_mode": SAFE_MODE,
            "plans": recent_plans
        }), 200
        
    except Exception as e:
        log.error(f"Rebuild plans error: {e}")
        return jsonify({
            "ok": False,
            "error": "Failed to rebuild upgrade plans",
            "safe_mode": SAFE_MODE
        }), 500


@upgrade_planner_bp.route('/plans', methods=['GET'])
def list_upgrade_plans():
    """
    GET /api/guardian/upgrade/plans
    
    List upgrade plans from the database.
    
    Query params:
        status: Filter by status (open, in_progress, applied, archived)
        category: Filter by category (performance, reliability, ux, i18n, pricing, security)
        limit: Maximum results (default: 50, max: 200)
    
    Response:
    {
        "ok": true,
        "count": 5,
        "plans": [ ... ]
    }
    """
    try:
        status = request.args.get("status")
        category = request.args.get("category")
        limit = min(int(request.args.get("limit", 50)), 200)
        
        plans = get_plans_from_db(status=status, category=category, limit=limit)
        
        return jsonify({
            "ok": True,
            "count": len(plans),
            "filters": {
                "status": status,
                "category": category,
                "limit": limit
            },
            "safe_mode": SAFE_MODE,
            "plans": plans
        }), 200
        
    except Exception as e:
        log.error(f"List plans error: {e}")
        return jsonify({
            "ok": False,
            "error": "Failed to list upgrade plans"
        }), 500


@upgrade_planner_bp.route('/plans/<plan_id>', methods=['GET'])
def get_upgrade_plan(plan_id: str):
    """
    GET /api/guardian/upgrade/plans/<plan_id>
    
    Get a single upgrade plan by ID.
    
    Response:
    {
        "ok": true,
        "plan": { ... }
    }
    """
    try:
        plan = get_plan_by_id(plan_id)
        
        if not plan:
            return jsonify({
                "ok": False,
                "error": "Plan not found"
            }), 404
        
        return jsonify({
            "ok": True,
            "safe_mode": SAFE_MODE,
            "plan": plan
        }), 200
        
    except Exception as e:
        log.error(f"Get plan error: {e}")
        return jsonify({
            "ok": False,
            "error": "Failed to get upgrade plan"
        }), 500


@upgrade_planner_bp.route('/plans/<plan_id>/status', methods=['PATCH'])
def update_plan_status(plan_id: str):
    """
    PATCH /api/guardian/upgrade/plans/<plan_id>/status
    
    Update the status of a plan (manual status tracking only).
    NOTE: This does NOT apply any fixes - it's just for tracking.
    
    Request body:
    {
        "status": "in_progress" | "applied" | "archived"
    }
    
    Response:
    {
        "ok": true,
        "plan": { ... }
    }
    """
    try:
        body = request.get_json(silent=True) or {}
        new_status = body.get("status")
        
        valid_statuses = ["open", "in_progress", "applied", "archived"]
        if new_status not in valid_statuses:
            return jsonify({
                "ok": False,
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }), 400
        
        execute_query, commit, _ = _get_db()
        if not execute_query:
            return jsonify({"ok": False, "error": "Database unavailable"}), 503
        
        existing = get_plan_by_id(plan_id)
        if not existing:
            return jsonify({"ok": False, "error": "Plan not found"}), 404
        
        execute_query(
            "UPDATE upgrade_plans SET status = ? WHERE id = ?",
            (new_status, plan_id),
            fetch=None
        )
        commit()
        
        updated_plan = get_plan_by_id(plan_id)
        
        return jsonify({
            "ok": True,
            "safe_mode": SAFE_MODE,
            "note": "Status updated for tracking only - no fixes applied",
            "plan": updated_plan
        }), 200
        
    except Exception as e:
        log.error(f"Update plan status error: {e}")
        return jsonify({
            "ok": False,
            "error": "Failed to update plan status"
        }), 500


@upgrade_planner_bp.route('/summary', methods=['GET'])
def upgrade_planner_summary():
    """
    GET /api/guardian/upgrade/summary
    
    Get a summary of all upgrade plans by status and category.
    
    Response:
    {
        "ok": true,
        "total": 15,
        "by_status": { "open": 5, "in_progress": 2, ... },
        "by_category": { "performance": 3, "reliability": 7, ... },
        "by_priority": { "1": 2, "2": 5, ... }
    }
    """
    try:
        execute_query, _, _ = _get_db()
        if not execute_query:
            return jsonify({"ok": False, "error": "Database unavailable"}), 503
        
        status_counts = {}
        status_result = execute_query(
            "SELECT status, COUNT(*) as cnt FROM upgrade_plans GROUP BY status",
            fetch='all'
        ) or []
        for row in status_result:
            status_counts[row.get('status', 'unknown')] = row.get('cnt', 0) or 0
        
        category_counts = {}
        category_result = execute_query(
            "SELECT category, COUNT(*) as cnt FROM upgrade_plans WHERE status = 'open' GROUP BY category",
            fetch='all'
        ) or []
        for row in category_result:
            category_counts[row.get('category', 'other')] = row.get('cnt', 0) or 0
        
        priority_counts = {}
        priority_result = execute_query(
            "SELECT priority, COUNT(*) as cnt FROM upgrade_plans WHERE status = 'open' GROUP BY priority",
            fetch='all'
        ) or []
        for row in priority_result:
            priority_counts[str(row.get('priority', 3))] = row.get('cnt', 0) or 0
        
        total = execute_query(
            "SELECT COUNT(*) as cnt FROM upgrade_plans",
            fetch='one'
        ) or {}
        
        return jsonify({
            "ok": True,
            "total": total.get('cnt', 0) or 0,
            "by_status": status_counts,
            "by_category": category_counts,
            "by_priority": priority_counts,
            "safe_mode": SAFE_MODE,
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        log.error(f"Summary error: {e}")
        return jsonify({
            "ok": False,
            "error": "Failed to generate summary"
        }), 500
