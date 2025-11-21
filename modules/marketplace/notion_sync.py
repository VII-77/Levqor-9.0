"""
Notion Marketplace Sync
Logs marketplace listings and sales to Notion for transparency
"""
import os
import requests
from datetime import datetime
from typing import Optional

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "").strip()
NOTION_MARKETPLACE_CATALOG_DB_ID = os.getenv("NOTION_MARKETPLACE_CATALOG_DB_ID", "").strip()
NOTION_MARKETPLACE_SALES_DB_ID = os.getenv("NOTION_MARKETPLACE_SALES_DB_ID", "").strip()

def log_new_listing(
    listing_id: str,
    name: str,
    partner_id: str,
    category: str,
    price: float
) -> Optional[str]:
    """
    Log new marketplace listing to Notion
    
    Args:
        listing_id: Listing UUID
        name: Listing name
        partner_id: Partner UUID
        category: Listing category
        price: Price in dollars
        
    Returns:
        Notion page ID if successful, None otherwise
    """
    if not NOTION_TOKEN or not NOTION_MARKETPLACE_CATALOG_DB_ID:
        print("⚠️ Notion credentials not configured for marketplace catalog")
        return None
    
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    data = {
        "parent": {"database_id": NOTION_MARKETPLACE_CATALOG_DB_ID},
        "properties": {
            "Name": {
                "title": [{"text": {"content": name}}]
            },
            "Listing ID": {
                "rich_text": [{"text": {"content": listing_id}}]
            },
            "Partner ID": {
                "rich_text": [{"text": {"content": partner_id}}]
            },
            "Category": {
                "select": {"name": category.capitalize()}
            },
            "Price": {
                "number": price
            },
            "Status": {
                "select": {"name": "Pending Review"}
            },
            "Created At": {
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
            print(f"✅ Logged listing {name} to Notion: {page_id}")
            return page_id
        else:
            print(f"❌ Failed to log to Notion: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Notion logging error: {e}")
        return None

def log_marketplace_sale(
    order_id: str,
    listing_name: str,
    amount: float,
    partner_name: str
) -> Optional[str]:
    """
    Log marketplace sale to Notion
    
    Args:
        order_id: Order UUID
        listing_name: Name of listing sold
        amount: Sale amount in dollars
        partner_name: Partner name
        
    Returns:
        Notion page ID if successful, None otherwise
    """
    if not NOTION_TOKEN or not NOTION_MARKETPLACE_SALES_DB_ID:
        return None
    
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    data = {
        "parent": {"database_id": NOTION_MARKETPLACE_SALES_DB_ID},
        "properties": {
            "Order ID": {
                "title": [{"text": {"content": order_id}}]
            },
            "Listing": {
                "rich_text": [{"text": {"content": listing_name}}]
            },
            "Partner": {
                "rich_text": [{"text": {"content": partner_name}}]
            },
            "Amount": {
                "number": amount
            },
            "Sale Date": {
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
            print(f"✅ Logged sale {order_id} to Notion")
            return response.json().get("id")
        
        return None
        
    except Exception as e:
        print(f"❌ Notion sale logging error: {e}")
        return None
