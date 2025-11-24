"""
Omega Operator Advisor - MEGA-PHASE Ω LAYER 2
Reads metrics + health logs and produces actionable OMEGA TASKS
SAFE: Read-only analysis, NO auto-mutations
"""
import logging
import json
from datetime import datetime
from pathlib import Path

log = logging.getLogger("levqor.omega.operator")

# Use workspace-data for task outputs
TASKS_FILE = Path("workspace-data/omega_tasks.json")
TASKS_LOG = Path("workspace-data/omega_tasks.log")


def read_monitor_log():
    """Read latest omega_self_monitor.log entry (with safe default)"""
    log_file = Path("workspace-data/omega_self_monitor.log")
    if not log_file.exists():
        log.debug("Monitor log not found (first run) - using safe default")
        return {"SUMMARY": "No data yet"}
    
    try:
        content = log_file.read_text()
        # Parse the last entry (simple approach: split by separator)
        entries = content.split("========================================")
        if len(entries) > 1:
            last_entry = entries[-1].strip()
            # Extract basic status info
            lines = last_entry.split("\n")
            status_data = {}
            for line in lines:
                if "=" in line and not line.startswith("["):
                    key, val = line.split("=", 1)
                    status_data[key] = val
            return status_data
        return None
    except Exception as e:
        log.error(f"Error reading monitor log: {e}")
        return None


def get_current_metrics():
    """Get current metrics via internal call (with app context)"""
    try:
        from run import app
        with app.app_context():
            with app.test_client() as client:
                response = client.get('/api/metrics/app')
                if response.status_code == 200:
                    return response.get_json()
        log.warning("Metrics endpoint returned non-200 status")
        return None
    except Exception as e:
        log.error(f"Error getting metrics: {e}")
        return None


def analyze_ai_health(metrics):
    """Generate AI-related tasks"""
    tasks = []
    
    if not metrics:
        return tasks
    
    ai_errors_5m = metrics.get("errors_last_5m", 0)
    ai_requests_5m = metrics.get("ai_requests_last_5m", 0)
    
    # High error rate
    if ai_requests_5m > 0:
        error_rate = ai_errors_5m / ai_requests_5m
        if error_rate > 0.1:
            tasks.append({
                "id": f"ai_error_rate_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
                "severity": "critical" if error_rate > 0.2 else "warn",
                "category": "ai",
                "description": f"AI error rate elevated: {error_rate:.1%}",
                "recommended_action": "Inspect /api/ai/* endpoints logs. Check OpenAI API key validity and rate limits. Review error patterns in omega_self_monitor.log.",
                "evidence": {
                    "errors_last_5m": ai_errors_5m,
                    "requests_last_5m": ai_requests_5m,
                    "error_rate": round(error_rate, 3)
                }
            })
    
    # No AI activity (might be normal in dev)
    if ai_requests_5m == 0 and ai_errors_5m == 0:
        tasks.append({
            "id": f"ai_zero_activity_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
            "severity": "info",
            "category": "ai",
            "description": "Zero AI activity in last 5 minutes",
            "recommended_action": "Normal in dev/low-traffic periods. In production, verify AI endpoints are discoverable and CTAs are visible.",
            "evidence": {
                "requests_last_5m": 0
            }
        })
    
    return tasks


def analyze_gtm_health(metrics):
    """Generate GTM/marketing funnel tasks"""
    tasks = []
    
    if not metrics or "business_metrics" not in metrics:
        return tasks
    
    biz = metrics["business_metrics"]
    consultations = biz.get("consultations_booked", 0)
    pricing_cta = biz.get("pricing_cta_clicks", 0)
    trial_feedback = biz.get("trial_feedback_submissions", 0)
    
    # No consultations booked
    if consultations == 0:
        tasks.append({
            "id": f"gtm_zero_consultations_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
            "severity": "warn",
            "category": "gtm",
            "description": "No consultations booked since last restart",
            "recommended_action": "Review consultation CTA visibility on /pricing and /consultation pages. Check lifecycle nudges for trial users. Verify /api/marketing/consultation/book endpoint is functional.",
            "evidence": {
                "consultations_booked": consultations,
                "pricing_cta_clicks": pricing_cta
            }
        })
    
    # Low pricing CTA engagement
    if pricing_cta < 5:
        tasks.append({
            "id": f"gtm_low_cta_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
            "severity": "info",
            "category": "gtm",
            "description": "Low pricing CTA engagement",
            "recommended_action": "Normal in dev. In production, A/B test CTA copy (e.g., 'Start Free Trial' vs 'Get Started'). Consider adding urgency ('7-day trial, no commitment').",
            "evidence": {
                "pricing_cta_clicks": pricing_cta
            }
        })
    
    return tasks


def analyze_support_health(metrics):
    """Generate support/onboarding tasks"""
    tasks = []
    
    if not metrics or "business_metrics" not in metrics:
        return tasks
    
    biz = metrics["business_metrics"]
    support_requests = biz.get("support_auto_requests", 0)
    support_escalations = biz.get("support_auto_escalations", 0)
    
    # High escalation rate
    if support_requests > 0:
        escalation_rate = support_escalations / support_requests
        if escalation_rate > 0.3:
            tasks.append({
                "id": f"support_high_escalation_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
                "severity": "warn",
                "category": "support",
                "description": f"High support escalation rate: {escalation_rate:.1%}",
                "recommended_action": "Review AI support patterns. Improve knowledge base coverage. Add FAQ entries for common escalation triggers.",
                "evidence": {
                    "support_requests": support_requests,
                    "support_escalations": support_escalations,
                    "escalation_rate": round(escalation_rate, 3)
                }
            })
    
    return tasks


def build_omega_tasks():
    """Build comprehensive OMEGA_TASKS list"""
    log.info("Building Omega Operator tasks...")
    
    # Read data sources
    monitor_status = read_monitor_log()
    metrics = get_current_metrics()
    
    tasks = []
    
    # Analyze different health aspects
    tasks.extend(analyze_ai_health(metrics))
    tasks.extend(analyze_gtm_health(metrics))
    tasks.extend(analyze_support_health(metrics))
    
    # If no tasks, add a healthy status task
    if not tasks:
        tasks.append({
            "id": f"system_healthy_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
            "severity": "info",
            "category": "system",
            "description": "All systems operational",
            "recommended_action": "Continue monitoring. No immediate action required.",
            "evidence": {
                "monitor_status": monitor_status.get("SUMMARY", "OK") if monitor_status else "Unknown"
            }
        })
    
    return tasks


def write_tasks_json(tasks):
    """Write tasks to JSON file (atomic write with temp file)"""
    TASKS_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    output = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "task_count": len(tasks),
        "tasks": tasks
    }
    
    # Atomic write: write to temp file then rename
    temp_file = TASKS_FILE.parent / f"{TASKS_FILE.name}.tmp"
    try:
        with temp_file.open("w") as f:
            json.dump(output, f, indent=2)
        temp_file.rename(TASKS_FILE)
        log.info(f"Wrote {len(tasks)} omega tasks to {TASKS_FILE}")
    except Exception as e:
        if temp_file.exists():
            temp_file.unlink()
        raise e


def write_tasks_log(tasks):
    """Write human-readable task log (append)"""
    TASKS_LOG.parent.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    entry = f"""
========================================
OMEGA OPERATOR TASKS - {timestamp}
Task Count: {len(tasks)}

"""
    
    for task in tasks:
        entry += f"""
[{task['severity'].upper()}] {task['category'].upper()}
{task['description']}
→ {task['recommended_action']}
Evidence: {json.dumps(task['evidence'], indent=2)}

"""
    
    with TASKS_LOG.open("a") as f:
        f.write(entry)


def run():
    """Main entry point for omega operator advisor"""
    log.info("Omega Operator: Starting task analysis")
    
    tasks = build_omega_tasks()
    
    write_tasks_json(tasks)
    write_tasks_log(tasks)
    
    severity_counts = {}
    for task in tasks:
        sev = task["severity"]
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
    
    log.info(f"Omega Operator: Complete - {len(tasks)} tasks ({severity_counts})")
    
    return {
        "success": True,
        "task_count": len(tasks),
        "severity_counts": severity_counts
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = run()
    print(json.dumps(result, indent=2))
