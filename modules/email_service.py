"""
LEVQOR EMAIL SERVICE — Resend Integration
Centralized email sending for system alerts, autopilot notifications, and user communications.
"""
import os
import logging
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime

log = logging.getLogger("levqor.email")

RESEND_API_URL = "https://api.resend.com/emails"

FOUNDER_APPROVAL_REQUIRED_EMAILS = [
    "marketing_blast",
    "full_userbase",
    "pricing_update",
    "billing_adjustment",
    "compliance_terms",
    "legal_update"
]

AUTONOMOUS_EMAILS_ALLOWED = [
    "system_health_alert",
    "error_escalation",
    "backend_degraded",
    "webhook_retry_exceeded",
    "growth_weekly_report",
    "workflow_summary",
    "security_alert"
]


def get_resend_config() -> Dict[str, Optional[str]]:
    """Get Resend configuration from environment"""
    return {
        "api_key": os.environ.get("RESEND_API_KEY"),
        "from_email": os.environ.get("AUTH_FROM_EMAIL", "notifications@levqor.ai"),
        "founder_email": os.environ.get("FOUNDER_EMAIL", os.environ.get("AUTH_FROM_EMAIL")),
        "support_email": os.environ.get("NEXT_PUBLIC_SUPPORT_EMAIL", os.environ.get("AUTH_FROM_EMAIL"))
    }


def is_email_configured() -> bool:
    """Check if email service is properly configured"""
    config = get_resend_config()
    return bool(config["api_key"] and config["from_email"])


def send_email(
    to: str,
    subject: str,
    body: str,
    email_type: str = "system",
    html: Optional[str] = None,
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Send an email via Resend API.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Plain text body
        email_type: Type of email for categorization
        html: Optional HTML body
        dry_run: If True, validate payload without sending
    
    Returns:
        dict with status and details
    """
    config = get_resend_config()
    
    if not config["api_key"]:
        log.warning("RESEND_API_KEY not configured")
        return {"status": "error", "error": "email_not_configured"}
    
    if email_type in FOUNDER_APPROVAL_REQUIRED_EMAILS:
        log.warning(f"Email type '{email_type}' requires founder approval - queuing")
        return {
            "status": "queued",
            "reason": "founder_approval_required",
            "email_type": email_type
        }
    
    payload = {
        "from": config["from_email"],
        "to": to,
        "subject": subject,
        "text": body
    }
    
    if html:
        payload["html"] = html
    
    if dry_run:
        log.info(f"[DRY RUN] Email payload validated: {email_type} to {to}")
        return {
            "status": "validated",
            "dry_run": True,
            "payload": {
                "to": to,
                "subject": subject,
                "from": config["from_email"],
                "type": email_type
            }
        }
    
    try:
        response = requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            log.info(f"Email sent successfully: {email_type} to {to}")
            return {
                "status": "sent",
                "id": data.get("id"),
                "email_type": email_type
            }
        else:
            log.error(f"Email failed: {response.status_code} - {response.text}")
            return {
                "status": "failed",
                "error": response.text,
                "code": response.status_code
            }
            
    except Exception as e:
        log.error(f"Email send error: {e}")
        return {"status": "error", "error": str(e)}


def send_founder_alert(
    subject: str,
    message: str,
    alert_type: str = "system_health_alert",
    severity: str = "warning"
) -> Dict[str, Any]:
    """
    Send alert to founder (for autonomous autopilot notifications).
    """
    config = get_resend_config()
    founder_email = config.get("founder_email")
    
    if not founder_email:
        log.warning("Founder email not configured")
        return {"status": "error", "error": "founder_email_not_configured"}
    
    full_subject = f"[LEVQOR {severity.upper()}] {subject}"
    full_body = f"""
LEVQOR GUARDIAN AUTOPILOT ALERT
================================
Time: {datetime.now().isoformat()}
Type: {alert_type}
Severity: {severity}

{message}

---
This is an automated alert from Levqor Guardian-Autopilot Mode.
No action was taken automatically. Review recommended.
"""
    
    return send_email(
        to=founder_email,
        subject=full_subject,
        body=full_body,
        email_type=alert_type
    )


def send_system_alert(level: str, message: str) -> Dict[str, Any]:
    """
    Send system health alert (autonomous - no approval needed).
    """
    return send_founder_alert(
        subject=f"System Alert: {level}",
        message=message,
        alert_type="system_health_alert",
        severity=level
    )


def send_weekly_growth_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send weekly growth analytics report (autonomous).
    """
    config = get_resend_config()
    founder_email = config.get("founder_email")
    
    if not founder_email:
        return {"status": "error", "error": "founder_email_not_configured"}
    
    body = f"""
LEVQOR WEEKLY GROWTH REPORT
===========================
Week Ending: {datetime.now().strftime('%Y-%m-%d')}

METRICS:
- Signups: {report_data.get('signups', 'N/A')}
- Trials Started: {report_data.get('trials', 'N/A')}
- Conversions: {report_data.get('conversions', 'N/A')}
- Churn Rate: {report_data.get('churn_rate', 'N/A')}
- Revenue: {report_data.get('revenue', 'N/A')}

RECOMMENDATIONS:
{chr(10).join('- ' + r for r in report_data.get('recommendations', ['No recommendations']))}

---
Generated by Levqor Growth Engine Autopilot
"""
    
    return send_email(
        to=founder_email,
        subject="[LEVQOR] Weekly Growth Report",
        body=body,
        email_type="growth_weekly_report"
    )


def send_workflow_summary(summary_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send AI workflow execution summary (autonomous).
    """
    config = get_resend_config()
    founder_email = config.get("founder_email")
    
    if not founder_email:
        return {"status": "error", "error": "founder_email_not_configured"}
    
    body = f"""
LEVQOR WORKFLOW SUMMARY
=======================
Period: {summary_data.get('period', 'Weekly')}

EXECUTION STATS:
- Total Runs: {summary_data.get('total_runs', 0)}
- Successful: {summary_data.get('successful', 0)}
- Failed: {summary_data.get('failed', 0)}
- Success Rate: {summary_data.get('success_rate', '0%')}

TOP WORKFLOWS:
{chr(10).join('- ' + w for w in summary_data.get('top_workflows', ['No workflows']))}

---
Generated by Levqor Brain Autopilot
"""
    
    return send_email(
        to=founder_email,
        subject="[LEVQOR] Workflow Execution Summary",
        body=body,
        email_type="workflow_summary"
    )


def ping_resend_api() -> Dict[str, Any]:
    """
    Ping Resend API to verify connectivity (no email sent).
    """
    config = get_resend_config()
    
    if not config["api_key"]:
        return {"status": "error", "error": "api_key_not_configured"}
    
    try:
        response = requests.get(
            "https://api.resend.com/domains",
            headers={
                "Authorization": f"Bearer {config['api_key']}"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            domains = data.get("data", [])
            return {
                "status": "connected",
                "domains": len(domains),
                "verified": any(d.get("status") == "verified" for d in domains)
            }
        else:
            return {
                "status": "error",
                "code": response.status_code,
                "error": response.text[:100]
            }
            
    except Exception as e:
        return {"status": "error", "error": str(e)}
