"""
Omega Dashboard API - MEGA-PHASE Ω LAYER 4
Unified dashboard combining all Omega layers
"""
from flask import Blueprint, jsonify
import json
from pathlib import Path
import logging
from datetime import datetime

bp = Blueprint("omega_dashboard", __name__, url_prefix="/api/omega")
log = logging.getLogger("levqor.api.omega.dashboard")

MONITOR_LOG = Path("workspace-data/omega_self_monitor.log")
TASKS_FILE = Path("workspace-data/omega_tasks.json")
OPTIMIZATIONS_FILE = Path("workspace-data/omega_optimizations.json")


def parse_monitor_log():
    """Parse latest omega_self_monitor.log entry"""
    if not MONITOR_LOG.exists():
        return None
    
    try:
        content = MONITOR_LOG.read_text()
        entries = content.split("========================================")
        if len(entries) > 1:
            last_entry = entries[-1].strip()
            lines = last_entry.split("\n")
            
            status_data = {}
            for line in lines:
                if "=" in line and not line.startswith("["):
                    key, val = line.split("=", 1)
                    status_data[key] = val
            
            return status_data
        return None
    except Exception as e:
        log.error(f"Error parsing monitor log: {e}")
        return None


def read_json_file(file_path):
    """Read JSON file with error handling"""
    if not file_path.exists():
        return None
    
    try:
        with file_path.open("r") as f:
            return json.load(f)
    except Exception as e:
        log.error(f"Error reading {file_path}: {e}")
        return None


@bp.get("/dashboard")
def get_omega_dashboard():
    """
    Unified Omega Dashboard
    Combines self-monitor status, tasks, and optimizations
    
    Returns:
        Comprehensive JSON with all omega layers
    """
    try:
        # Layer 1: Self-Monitor Status
        monitor_status = parse_monitor_log()
        
        # Layer 2: Operator Tasks
        tasks_data = read_json_file(TASKS_FILE)
        
        # Layer 3: Optimizations
        optimizations_data = read_json_file(OPTIMIZATIONS_FILE)
        
        # Get current metrics for context (with app context)
        from run import app as flask_app
        with flask_app.app_context():
            with flask_app.test_client() as client:
                metrics_response = client.get('/api/metrics/app')
                metrics = metrics_response.get_json() if metrics_response.status_code == 200 else None
        
        # Build dashboard response
        dashboard = {
            "status": "ok",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "layers": {
                "layer_1_monitor": {
                    "name": "Omega Self-Monitor",
                    "status": monitor_status.get("SUMMARY", "Unknown") if monitor_status else "Not run yet",
                    "last_run": monitor_status.get("TIMESTAMP") if monitor_status else None,
                    "health_checks": {
                        "system": monitor_status.get("SYSTEM_HEALTH") if monitor_status else "Unknown",
                        "ai": monitor_status.get("AI_HEALTH") if monitor_status else "Unknown",
                        "gtm": monitor_status.get("GTM_HEALTH") if monitor_status else "Unknown",
                        "security": monitor_status.get("SECURITY_HEALTH") if monitor_status else "Unknown"
                    }
                },
                "layer_2_tasks": {
                    "name": "Omega Operator Advisor",
                    "task_count": tasks_data.get("task_count", 0) if tasks_data else 0,
                    "last_run": tasks_data.get("generated_at") if tasks_data else None,
                    "tasks": tasks_data.get("tasks", []) if tasks_data else [],
                    "severity_summary": {
                        "critical": len([t for t in (tasks_data.get("tasks", []) if tasks_data else []) if isinstance(t, dict) and t.get("severity") == "critical"]),
                        "warn": len([t for t in (tasks_data.get("tasks", []) if tasks_data else []) if isinstance(t, dict) and t.get("severity") == "warn"]),
                        "info": len([t for t in (tasks_data.get("tasks", []) if tasks_data else []) if isinstance(t, dict) and t.get("severity") == "info"])
                    }
                },
                "layer_3_optimizations": {
                    "name": "Omega Optimization Engine",
                    "optimization_count": optimizations_data.get("optimization_count", 0) if optimizations_data else 0,
                    "last_run": optimizations_data.get("generated_at") if optimizations_data else None,
                    "optimizations": optimizations_data.get("optimizations", []) if optimizations_data else [],
                    "priority_summary": optimizations_data.get("by_priority", {}) if optimizations_data else {}
                }
            },
            "system_metrics": {
                "uptime_seconds": metrics.get("uptime_seconds") if metrics else None,
                "ai_requests_total": metrics.get("ai_requests_total", 0) if metrics else 0,
                "ai_errors_total": metrics.get("ai_errors_total", 0) if metrics else 0,
                "region": metrics.get("region") if metrics else "unknown"
            },
            "summary": {
                "overall_health": monitor_status.get("SUMMARY", "Unknown") if monitor_status else "Unknown",
                "critical_tasks": len([t for t in (tasks_data.get("tasks", []) if tasks_data else []) if isinstance(t, dict) and t.get("severity") == "critical"]),
                "high_priority_optimizations": len([o for o in (optimizations_data.get("optimizations", []) if optimizations_data else []) if isinstance(o, dict) and o.get("priority") in ["critical", "high"]]),
                "action_required": False
            }
        }
        
        # Set action_required flag
        if dashboard["summary"]["critical_tasks"] > 0 or dashboard["summary"]["high_priority_optimizations"] > 0:
            dashboard["summary"]["action_required"] = True
        
        return jsonify(dashboard), 200
        
    except Exception as e:
        log.error(f"Error building omega dashboard: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }), 500
