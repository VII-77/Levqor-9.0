"""
Guardian Healing Plan Endpoint - Autopilot Wave 1
Safe Mode: DRY-RUN ONLY, no destructive actions.

Analyzes system health and proposes healing actions without applying them.
All suggested actions are logged for future AI agents and dashboards.
"""
import os
import logging
from datetime import datetime
from flask import Blueprint, jsonify
from typing import Dict, Any, List, Optional

log = logging.getLogger("levqor.healing")

healing_bp = Blueprint("healing", __name__, url_prefix="/api/guardian")

SAFE_MODE = True
TELEMETRY_LOG_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "logs", "telemetry.log"
)


def _get_heartbeat_data() -> Dict[str, Any]:
    """Get latest heartbeat data from internal function."""
    try:
        from api.system.heartbeat import get_heartbeat_data
        return get_heartbeat_data()
    except Exception as e:
        log.warning(f"Failed to get heartbeat data: {e}")
        return {
            "status": "unknown",
            "db_ok": None,
            "stripe_ok": None,
            "brain_ok": None,
            "error_count_recent": 0
        }


def _get_telemetry_anomalies() -> Dict[str, Any]:
    """Get anomalies from Guardian summary."""
    try:
        from api.guardian.summary import _read_recent_telemetry, _aggregate_telemetry
        entries = _read_recent_telemetry(max_lines=200, max_age_minutes=30)
        aggregated = _aggregate_telemetry(entries)
        return {
            "anomalies": aggregated.get("anomalies", []),
            "error_types": aggregated.get("error_types", {}),
            "errors_by_location": aggregated.get("errors_by_location", {}),
            "performance": aggregated.get("performance", {}),
            "summary": aggregated.get("summary", {})
        }
    except Exception as e:
        log.warning(f"Failed to get telemetry anomalies: {e}")
        return {
            "anomalies": [],
            "error_types": {},
            "errors_by_location": {},
            "performance": {},
            "summary": {}
        }


def _check_db_connection() -> Dict[str, Any]:
    """Check database connection health."""
    check = {
        "id": "db_connection",
        "name": "Database Connection",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    try:
        from modules.db_wrapper import execute_query
        result = execute_query("SELECT 1 as ping", fetch="one")
        if result and (result.get("ping") == 1 or str(result.get("ping")) == "1"):
            check["status"] = "ok"
            check["details"] = "Database connection is healthy"
        else:
            check["status"] = "warning"
            check["details"] = "Database query returned unexpected result"
            check["suggested_actions"].append({
                "action_id": "verify_db_query",
                "description": "Verify database query execution (dry-run only)",
                "auto_applicable": False,
                "severity": "low"
            })
    except Exception as e:
        check["status"] = "error"
        check["details"] = f"Database connection failed: {str(e)[:100]}"
        check["suggested_actions"].append({
            "action_id": "restart_db_connection_pool",
            "description": "Restart database connection pool (dry-run only)",
            "auto_applicable": False,
            "severity": "high"
        })
        check["suggested_actions"].append({
            "action_id": "check_db_credentials",
            "description": "Verify DATABASE_URL environment variable (dry-run only)",
            "auto_applicable": False,
            "severity": "high"
        })
    
    return check


def _check_stripe_config() -> Dict[str, Any]:
    """Check Stripe configuration."""
    check = {
        "id": "stripe_config",
        "name": "Stripe Configuration",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    publishable_key = os.environ.get("STRIPE_PUBLISHABLE_KEY") or os.environ.get("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
    
    if stripe_key and len(stripe_key) > 10:
        check["status"] = "ok"
        check["details"] = "Stripe secret key is configured"
    elif publishable_key and len(publishable_key) > 10:
        check["status"] = "warning"
        check["details"] = "Only publishable key found, secret key missing"
        check["suggested_actions"].append({
            "action_id": "configure_stripe_secret",
            "description": "Add STRIPE_SECRET_KEY to environment (dry-run only)",
            "auto_applicable": False,
            "severity": "medium"
        })
    else:
        check["status"] = "error"
        check["details"] = "Stripe keys not configured"
        check["suggested_actions"].append({
            "action_id": "configure_stripe_keys",
            "description": "Configure STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY (dry-run only)",
            "auto_applicable": False,
            "severity": "critical"
        })
    
    return check


def _check_brain_api() -> Dict[str, Any]:
    """Check AI Brain API availability."""
    check = {
        "id": "brain_api",
        "name": "AI Brain API",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
    
    if not openai_key or len(openai_key) < 10:
        check["status"] = "error"
        check["details"] = "OpenAI API key not configured"
        check["suggested_actions"].append({
            "action_id": "configure_openai_key",
            "description": "Add OPENAI_API_KEY to environment (dry-run only)",
            "auto_applicable": False,
            "severity": "high"
        })
        return check
    
    try:
        from api.ai import brain_builder
        if hasattr(brain_builder, 'build_workflow'):
            check["status"] = "ok"
            check["details"] = "Brain API module is importable and ready"
        else:
            check["status"] = "warning"
            check["details"] = "Brain API module loaded but build_workflow not found"
            check["suggested_actions"].append({
                "action_id": "verify_brain_module",
                "description": "Verify brain_builder module integrity (dry-run only)",
                "auto_applicable": False,
                "severity": "medium"
            })
    except Exception as e:
        check["status"] = "error"
        check["details"] = f"Brain API import failed: {str(e)[:100]}"
        check["suggested_actions"].append({
            "action_id": "fix_brain_import",
            "description": "Fix brain_builder module import errors (dry-run only)",
            "auto_applicable": False,
            "severity": "high"
        })
    
    return check


def _check_error_rate(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Check recent error rate."""
    check = {
        "id": "error_rate",
        "name": "Error Rate",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    summary = telemetry.get("summary", {})
    error_rate = summary.get("error_rate_percent", 0)
    total_errors = summary.get("total_errors", 0)
    
    if error_rate > 25:
        check["status"] = "error"
        check["details"] = f"Critical error rate: {error_rate}% ({total_errors} errors)"
        check["suggested_actions"].append({
            "action_id": "investigate_error_spike",
            "description": "Investigate recent error spike in telemetry logs (dry-run only)",
            "auto_applicable": False,
            "severity": "critical"
        })
        check["suggested_actions"].append({
            "action_id": "enable_circuit_breaker",
            "description": "Consider enabling circuit breaker for failing endpoints (dry-run only)",
            "auto_applicable": False,
            "severity": "high"
        })
    elif error_rate > 10:
        check["status"] = "warning"
        check["details"] = f"Elevated error rate: {error_rate}% ({total_errors} errors)"
        check["suggested_actions"].append({
            "action_id": "review_error_logs",
            "description": "Review recent error logs for patterns (dry-run only)",
            "auto_applicable": False,
            "severity": "medium"
        })
    else:
        check["status"] = "ok"
        check["details"] = f"Error rate normal: {error_rate}% ({total_errors} errors)"
    
    return check


def _check_slow_endpoints(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Check for slow endpoints."""
    check = {
        "id": "slow_endpoints",
        "name": "Endpoint Performance",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    performance = telemetry.get("performance", {})
    slow_endpoints = []
    
    for endpoint, stats in performance.items():
        avg_ms = stats.get("avg_ms", 0)
        if avg_ms > 5000:
            slow_endpoints.append({"endpoint": endpoint, "avg_ms": avg_ms, "severity": "critical"})
        elif avg_ms > 2000:
            slow_endpoints.append({"endpoint": endpoint, "avg_ms": avg_ms, "severity": "warning"})
    
    if slow_endpoints:
        critical_count = sum(1 for e in slow_endpoints if e["severity"] == "critical")
        if critical_count > 0:
            check["status"] = "error"
            check["details"] = f"{len(slow_endpoints)} slow endpoint(s) detected, {critical_count} critical"
        else:
            check["status"] = "warning"
            check["details"] = f"{len(slow_endpoints)} slow endpoint(s) detected"
        
        for slow in slow_endpoints[:3]:
            check["suggested_actions"].append({
                "action_id": f"optimize_{slow['endpoint'].replace('/', '_').strip('_')}",
                "description": f"Optimize {slow['endpoint']} (avg: {slow['avg_ms']:.0f}ms) (dry-run only)",
                "auto_applicable": False,
                "severity": slow["severity"]
            })
    else:
        check["status"] = "ok"
        check["details"] = "All endpoints performing within thresholds"
    
    return check


def _check_repeated_errors(telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Check for repeated error patterns."""
    check = {
        "id": "repeated_errors",
        "name": "Repeated Error Patterns",
        "status": "ok",
        "details": "",
        "suggested_actions": []
    }
    
    error_types = telemetry.get("error_types", {})
    errors_by_location = telemetry.get("errors_by_location", {})
    
    repeated = []
    for error_type, count in error_types.items():
        if count >= 5:
            repeated.append({"type": error_type, "count": count})
    
    for location, count in errors_by_location.items():
        if count >= 3:
            repeated.append({"location": location, "count": count})
    
    if repeated:
        check["status"] = "warning"
        check["details"] = f"{len(repeated)} repeated error pattern(s) detected"
        
        for r in repeated[:3]:
            if "type" in r:
                check["suggested_actions"].append({
                    "action_id": f"fix_{r['type'].lower().replace(' ', '_')}",
                    "description": f"Investigate {r['type']} errors ({r['count']} occurrences) (dry-run only)",
                    "auto_applicable": False,
                    "severity": "medium"
                })
            else:
                check["suggested_actions"].append({
                    "action_id": f"fix_{r['location'].replace(':', '_').replace('/', '_')}",
                    "description": f"Fix errors at {r['location']} ({r['count']} occurrences) (dry-run only)",
                    "auto_applicable": False,
                    "severity": "medium"
                })
    else:
        check["status"] = "ok"
        check["details"] = "No repeated error patterns detected"
    
    return check


def build_healing_plan() -> Dict[str, Any]:
    """
    Analyze recent telemetry + heartbeat data and return a dry-run healing plan.
    
    This MUST NOT perform any actual changes.
    Safe Mode is enforced - all actions are proposals only.
    
    Returns:
        Dict with:
        - status: "ok" | "needs_attention" | "critical"
        - checks: List of health checks with suggested actions
        - summary: Aggregate statistics
        - safe_mode: Always True (enforced)
    """
    heartbeat = _get_heartbeat_data()
    telemetry = _get_telemetry_anomalies()
    
    checks = []
    
    checks.append(_check_db_connection())
    checks.append(_check_stripe_config())
    checks.append(_check_brain_api())
    checks.append(_check_error_rate(telemetry))
    checks.append(_check_slow_endpoints(telemetry))
    checks.append(_check_repeated_errors(telemetry))
    
    error_checks = sum(1 for c in checks if c["status"] == "error")
    warning_checks = sum(1 for c in checks if c["status"] == "warning")
    ok_checks = sum(1 for c in checks if c["status"] == "ok")
    
    if error_checks > 0:
        overall_status = "critical"
    elif warning_checks > 0:
        overall_status = "needs_attention"
    else:
        overall_status = "ok"
    
    total_actions = sum(len(c.get("suggested_actions", [])) for c in checks)
    critical_actions = sum(
        1 for c in checks 
        for a in c.get("suggested_actions", []) 
        if a.get("severity") == "critical"
    )
    
    plan = {
        "status": overall_status,
        "safe_mode": SAFE_MODE,
        "checks": checks,
        "summary": {
            "total_checks": len(checks),
            "ok_count": ok_checks,
            "warning_count": warning_checks,
            "error_count": error_checks,
            "total_suggested_actions": total_actions,
            "critical_actions": critical_actions
        },
        "heartbeat_status": heartbeat.get("status", "unknown"),
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }
    
    return plan


@healing_bp.route("/healing-plan", methods=["GET"])
def get_healing_plan():
    """
    GET /api/guardian/healing-plan
    
    Returns a dry-run healing plan with suggested actions.
    Safe Mode: No actions are applied automatically.
    
    Response:
    {
        "status": "ok" | "needs_attention" | "critical",
        "safe_mode": true,
        "checks": [
            {
                "id": "db_connection",
                "name": "Database Connection",
                "status": "ok" | "warning" | "error",
                "details": "...",
                "suggested_actions": [
                    {
                        "action_id": "restart_db_connection_pool",
                        "description": "Restart DB connection pool (dry-run only)",
                        "auto_applicable": false,
                        "severity": "high"
                    }
                ]
            }
        ],
        "summary": {
            "total_checks": 6,
            "ok_count": 5,
            "warning_count": 1,
            "error_count": 0,
            "total_suggested_actions": 2,
            "critical_actions": 0
        },
        "heartbeat_status": "ok",
        "generated_at": "2025-11-27T12:00:00Z"
    }
    """
    try:
        plan = build_healing_plan()
        
        try:
            from api.telemetry.events import log_event
            log_event(
                event_type="healing_plan_generated",
                payload={
                    "status": plan["status"],
                    "total_checks": plan["summary"]["total_checks"],
                    "error_count": plan["summary"]["error_count"],
                    "warning_count": plan["summary"]["warning_count"],
                    "total_actions": plan["summary"]["total_suggested_actions"],
                    "critical_actions": plan["summary"]["critical_actions"]
                },
                endpoint="/api/guardian/healing-plan"
            )
        except Exception as e:
            log.debug(f"Telemetry logging failed (non-critical): {e}")
        
        return jsonify(plan), 200
        
    except Exception as e:
        log.error(f"Healing plan endpoint error: {e}")
        return jsonify({
            "status": "error",
            "safe_mode": SAFE_MODE,
            "error": "Failed to generate healing plan",
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }), 500


@healing_bp.route("/healing-plan/summary", methods=["GET"])
def get_healing_summary():
    """
    GET /api/guardian/healing-plan/summary
    
    Returns a compact summary of the healing plan.
    Useful for dashboards and quick checks.
    """
    try:
        plan = build_healing_plan()
        
        return jsonify({
            "status": plan["status"],
            "safe_mode": SAFE_MODE,
            "summary": plan["summary"],
            "heartbeat_status": plan["heartbeat_status"],
            "generated_at": plan["generated_at"]
        }), 200
        
    except Exception as e:
        log.error(f"Healing summary endpoint error: {e}")
        return jsonify({
            "status": "error",
            "safe_mode": SAFE_MODE,
            "error": "Failed to generate healing summary"
        }), 500
