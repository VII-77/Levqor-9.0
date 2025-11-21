"""
Partner Webhook System
Sends event notifications to registered partner webhooks
"""
import requests
from typing import Dict, Any, Optional
import json

def trigger_partner_event(
    partner: Dict[str, Any],
    event: str,
    payload: Dict[str, Any],
    timeout: int = 5
) -> bool:
    """
    Trigger a webhook event for a partner
    
    Args:
        partner: Partner dict with webhook_url
        event: Event name (e.g., "partner.verified", "job.completed")
        payload: Event data to send
        timeout: Request timeout in seconds
        
    Returns:
        True if successful, False otherwise
    """
    webhook_url = partner.get("webhook_url")
    
    if not webhook_url:
        print(f"⚠️ Partner {partner.get('id')} has no webhook URL")
        return False
    
    try:
        data = {
            "event": event,
            "partner_id": partner.get("id"),
            "timestamp": payload.get("timestamp", ""),
            "payload": payload
        }
        
        response = requests.post(
            webhook_url,
            json=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Levqor-Partner-Webhook/1.0"
            },
            timeout=timeout
        )
        
        if response.status_code == 200:
            print(f"✅ Webhook sent to partner {partner.get('id')}: {event}")
            return True
        else:
            print(f"⚠️ Webhook failed for partner {partner.get('id')}: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⚠️ Webhook timeout for partner {partner.get('id')}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Webhook error for partner {partner.get('id')}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error sending webhook to partner {partner.get('id')}: {e}")
        return False

def notify_all_partners(event: str, payload: Dict[str, Any]) -> int:
    """
    Send an event to all verified & active partners
    
    Args:
        event: Event name
        payload: Event data
        
    Returns:
        Number of successful webhook deliveries
    """
    import sqlite3
    import os
    
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    db = sqlite3.connect(db_path, check_same_thread=False)
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT id, name, webhook_url
        FROM partners
        WHERE is_verified = 1 AND is_active = 1 AND webhook_url IS NOT NULL
    """)
    
    rows = cursor.fetchall()
    db.close()
    
    success_count = 0
    
    for row in rows:
        partner = {
            "id": row[0],
            "name": row[1],
            "webhook_url": row[2]
        }
        
        if trigger_partner_event(partner, event, payload):
            success_count += 1
    
    print(f"📡 Notified {success_count}/{len(rows)} partners about event: {event}")
    return success_count
