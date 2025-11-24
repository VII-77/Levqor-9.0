"""
Omega Self Monitor - MEGA-PHASE Ω LAYER 1
Continuously watches health, metrics, and anomalies
SAFE: Read-only monitoring, no auto-mutations
"""
import logging
import json
from datetime import datetime
from pathlib import Path

log = logging.getLogger("levqor.omega.monitor")

# Use workspace-data for logs
LOG_FILE = Path("workspace-data/omega_self_monitor.log")


def get_health_status():
    """Check backend health via internal function call (no external network)"""
    try:
        from run import app
        with app.test_client() as client:
            response = client.get('/health')
            if response.status_code == 200:
                return {"status": "OK", "data": response.get_json()}
            return {"status": "WARN", "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "CRITICAL", "error": str(e)}


def get_metrics_status():
    """Check metrics endpoint via internal call"""
    try:
        from run import app
        with app.test_client() as client:
            response = client.get('/api/metrics/app')
            if response.status_code == 200:
                data = response.get_json()
                return {"status": "OK", "data": data}
            return {"status": "WARN", "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"status": "CRITICAL", "error": str(e)}


def check_ai_health(metrics_data):
    """Analyze AI endpoint health from metrics"""
    if not metrics_data:
        return {"status": "UNKNOWN", "reason": "No metrics data"}
    
    ai_errors = metrics_data.get("errors_last_5m", 0)
    ai_requests = metrics_data.get("ai_requests_last_5m", 0)
    
    if ai_requests > 0 and ai_errors / ai_requests > 0.1:
        return {
            "status": "WARN",
            "reason": f"High error rate: {ai_errors}/{ai_requests}",
            "errors": ai_errors,
            "requests": ai_requests
        }
    
    if ai_errors > 5:
        return {
            "status": "WARN",
            "reason": f"Elevated errors: {ai_errors} in last 5 min",
            "errors": ai_errors
        }
    
    return {"status": "OK", "errors": ai_errors, "requests": ai_requests}


def check_gtm_health(metrics_data):
    """Analyze GTM/marketing funnel health"""
    if not metrics_data or "business_metrics" not in metrics_data:
        return {"status": "UNKNOWN", "reason": "No business metrics"}
    
    biz = metrics_data["business_metrics"]
    consultations_booked = biz.get("consultations_booked", 0)
    pricing_cta_clicks = biz.get("pricing_cta_clicks", 0)
    trial_feedback = biz.get("trial_feedback_submissions", 0)
    
    warnings = []
    
    # Very low activity might indicate issue
    if consultations_booked == 0 and pricing_cta_clicks == 0:
        warnings.append("Zero GTM activity (consultations + CTA clicks)")
    
    if consultations_booked == 0:
        warnings.append("No consultations booked")
    
    if warnings:
        return {
            "status": "INFO",
            "warnings": warnings,
            "metrics": {
                "consultations_booked": consultations_booked,
                "pricing_cta_clicks": pricing_cta_clicks,
                "trial_feedback": trial_feedback
            }
        }
    
    return {
        "status": "OK",
        "metrics": {
            "consultations_booked": consultations_booked,
            "pricing_cta_clicks": pricing_cta_clicks,
            "trial_feedback": trial_feedback
        }
    }


def check_security_health():
    """Verify security_core is operational"""
    try:
        from security_core import config as sec_config
        enabled = sec_config.SECURITY_CORE_ENABLED
        return {
            "status": "OK" if enabled else "WARN",
            "enabled": enabled,
            "reason": "Security core active" if enabled else "Security core disabled"
        }
    except Exception as e:
        return {"status": "CRITICAL", "error": str(e)}


def write_log_entry(timestamp, system_health, ai_health, gtm_health, security_health):
    """Write consolidated health log entry"""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Determine overall summary
    statuses = [
        system_health.get("status", "UNKNOWN"),
        ai_health.get("status", "UNKNOWN"),
        gtm_health.get("status", "UNKNOWN"),
        security_health.get("status", "UNKNOWN")
    ]
    
    critical_count = statuses.count("CRITICAL")
    warn_count = statuses.count("WARN")
    
    if critical_count > 0:
        summary = f"CRITICAL: {critical_count} critical issues detected"
    elif warn_count > 0:
        summary = f"WARN: {warn_count} warnings detected"
    else:
        summary = "OK: All systems operational"
    
    # Build log entry
    entry = f"""
========================================
TIMESTAMP={timestamp}
SYSTEM_HEALTH={system_health.get("status", "UNKNOWN")}
AI_HEALTH={ai_health.get("status", "UNKNOWN")}
GTM_HEALTH={gtm_health.get("status", "UNKNOWN")}
SECURITY_HEALTH={security_health.get("status", "UNKNOWN")}
SUMMARY={summary}

[SYSTEM_HEALTH]
{json.dumps(system_health, indent=2)}

[AI_HEALTH]
{json.dumps(ai_health, indent=2)}

[GTM_HEALTH]
{json.dumps(gtm_health, indent=2)}

[SECURITY_HEALTH]
{json.dumps(security_health, indent=2)}

"""
    
    with LOG_FILE.open("a") as f:
        f.write(entry)
    
    log.info(f"Omega self-monitor: {summary}")
    return summary


def run():
    """Main entry point for omega self-monitor"""
    log.info("Omega Self Monitor: Starting health check")
    
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Collect health data
    system_health = get_health_status()
    metrics_response = get_metrics_status()
    
    metrics_data = metrics_response.get("data") if metrics_response.get("status") == "OK" else None
    
    ai_health = check_ai_health(metrics_data)
    gtm_health = check_gtm_health(metrics_data)
    security_health = check_security_health()
    
    # Write consolidated log
    summary = write_log_entry(
        timestamp,
        system_health,
        ai_health,
        gtm_health,
        security_health
    )
    
    log.info(f"Omega Self Monitor: Complete - {summary}")
    return {
        "success": True,
        "timestamp": timestamp,
        "summary": summary
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = run()
    print(json.dumps(result, indent=2))
