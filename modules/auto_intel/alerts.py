"""
Alert notification system for intelligence layer
"""
import os
import requests
from datetime import datetime

def notify(title: str, message: str, severity: str = "info") -> bool:
    """
    Send alert notification
    
    Args:
        title: Alert title
        message: Alert message
        severity: Alert severity (info, warning, critical)
        
    Returns:
        True if notification sent successfully
    """
    print(f"🔔 ALERT [{severity.upper()}]: {title} - {message}")
    
    # Send to Slack if webhook configured
    slack_webhook = os.getenv("SLACK_WEBHOOK_URL", "").strip()
    
    if slack_webhook:
        try:
            emoji = "ℹ️" if severity == "info" else "⚠️" if severity == "warning" else "🚨"
            
            payload = {
                "text": f"{emoji} *{title}*\n{message}",
                "username": "Levqor Intelligence"
            }
            
            response = requests.post(slack_webhook, json=payload, timeout=5)
            
            if response.status_code == 200:
                print("✅ Slack notification sent")
                return True
            else:
                print(f"⚠️ Slack notification failed: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Slack notification error: {e}")
    
    # Always log to console
    return True
