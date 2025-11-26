"""
Alert threshold checks - wired to alert_router
"""
import os
import logging
import requests
from datetime import datetime

log = logging.getLogger("levqor.alerting")

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

ALERT_THRESHOLDS = {
    "error_rate_critical": 0.05,  # 5% error rate
    "p99_latency_critical_ms": 2000,  # 2 seconds
    "db_connection_failures": 3,
}


def send_alert(level: str, message: str) -> dict:
    """Send alert via configured channels."""
    try:
        from monitors.alert_router import send_alert as route_alert
        return route_alert(level, message)
    except Exception as e:
        log.error(f"Alert routing failed: {e}")
        return {"error": str(e)}


def check_backend_health() -> dict:
    """Check backend health and alert on issues."""
    try:
        resp = requests.get(f"{BACKEND_URL}/api/health/summary", timeout=10)
        data = resp.json()
        
        issues = []
        
        if not data.get("app_up"):
            issues.append("Backend application is DOWN")
        
        if not data.get("stripe_ok"):
            issues.append("Stripe integration is unhealthy")
        
        if data.get("status") == "error":
            issues.append(f"Health check error: {data.get('error', 'unknown')}")
        
        return {
            "status": "ok" if not issues else "alert",
            "issues": issues,
            "data": data
        }
    except Exception as e:
        return {
            "status": "error",
            "issues": [f"Health check failed: {e}"],
            "error": str(e)
        }


def run_alert_checks():
    """Check alert thresholds and trigger notifications if needed."""
    log.debug("Running alert threshold checks...")
    
    try:
        health_result = check_backend_health()
        
        if health_result.get("status") in ("alert", "error"):
            issues = health_result.get("issues", [])
            if issues:
                message = f"Backend Health Alert ({datetime.utcnow().isoformat()}):\n" + "\n".join(f"  - {i}" for i in issues)
                send_alert("warning", message)
                log.warning(f"Alert triggered: {issues}")
    except Exception as e:
        log.error(f"Alert check error: {e}")
