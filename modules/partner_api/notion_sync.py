"""
Notion Partner Registry Sync
Logs partner registrations and updates to Notion for transparency
"""
import os
import requests
from datetime import datetime
from typing import Optional

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "").strip()
NOTION_PARTNER_REGISTRY_DB_ID = os.getenv("NOTION_PARTNER_REGISTRY_DB_ID", "").strip()

def log_partner_registration(
    partner_id: str,
    name: str,
    email: str,
    revenue_share: float = 0.7
) -> Optional[str]:
    """
    Log partner registration to Notion
    
    Args:
        partner_id: Partner UUID
        name: Partner name
        email: Partner email
        revenue_share: Revenue share percentage
        
    Returns:
        Notion page ID if successful, None otherwise
    """
    if not NOTION_TOKEN or not NOTION_PARTNER_REGISTRY_DB_ID:
        print("⚠️ Notion credentials not configured for partner registry")
        return None
    
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    data = {
        "parent": {"database_id": NOTION_PARTNER_REGISTRY_DB_ID},
        "properties": {
            "Name": {
                "title": [{"text": {"content": name}}]
            },
            "Partner ID": {
                "rich_text": [{"text": {"content": partner_id}}]
            },
            "Email": {
                "email": email
            },
            "Revenue Share": {
                "number": revenue_share * 100  # Convert to percentage
            },
            "Status": {
                "select": {"name": "Pending Approval"}
            },
            "Registered At": {
                "date": {"start": datetime.utcnow().isoformat()}
            }
        }
    }
    
    try:
        response = requests.post(
            "https://api.notion.com/v1/pages",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            page_id = response.json().get("id")
            print(f"✅ Logged partner {name} to Notion: {page_id}")
            return page_id
        else:
            print(f"❌ Failed to log to Notion: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Notion logging error: {e}")
        return None

def update_partner_status(
    partner_id: str,
    status: str
) -> bool:
    """
    Update partner status in Notion
    
    Args:
        partner_id: Partner UUID
        status: New status (e.g., "Verified", "Rejected", "Suspended")
        
    Returns:
        True if successful, False otherwise
    """
    if not NOTION_TOKEN or not NOTION_PARTNER_REGISTRY_DB_ID:
        return False
    
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    # Query for the partner page
    query_data = {
        "database_id": NOTION_PARTNER_REGISTRY_DB_ID,
        "filter": {
            "property": "Partner ID",
            "rich_text": {
                "equals": partner_id
            }
        }
    }
    
    try:
        query_response = requests.post(
            "https://api.notion.com/v1/databases/query",
            headers=headers,
            json=query_data
        )
        
        if query_response.status_code != 200:
            return False
        
        results = query_response.json().get("results", [])
        if not results:
            return False
        
        page_id = results[0]["id"]
        
        # Update the page
        update_data = {
            "properties": {
                "Status": {"select": {"name": status}}
            }
        }
        
        update_response = requests.patch(
            f"https://api.notion.com/v1/pages/{page_id}",
            headers=headers,
            json=update_data
        )
        
        if update_response.status_code == 200:
            print(f"✅ Updated partner {partner_id} status to {status} in Notion")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error updating Notion: {e}")
        return False
