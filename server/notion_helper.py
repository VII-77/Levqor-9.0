"""
Notion API Helper for Levqor Automation
Provides utilities to log data to Notion databases
"""
import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, Optional

class NotionHelper:
    """Helper class for Notion API interactions"""
    
    def __init__(self):
        self.hostname = os.getenv("REPLIT_CONNECTORS_HOSTNAME")
        self.repl_token = self._get_repl_token()
        self._access_token = None
        self._token_expiry = None
        
    def _get_repl_token(self) -> str:
        """Get Replit identity token"""
        repl_identity = os.getenv("REPL_IDENTITY")
        web_renewal = os.getenv("WEB_REPL_RENEWAL")
        
        if repl_identity:
            return f"repl {repl_identity}"
        elif web_renewal:
            return f"depl {web_renewal}"
        else:
            raise Exception("No REPL_IDENTITY or WEB_REPL_RENEWAL found")
    
    def _get_access_token(self) -> str:
        """Get Notion access token via Replit Connectors API"""
        if self._access_token and self._token_expiry:
            if datetime.now().timestamp() < self._token_expiry:
                return self._access_token
        
        url = f"https://{self.hostname}/api/v2/connection"
        params = {
            "include_secrets": "true",
            "connector_names": "notion"
        }
        headers = {
            "Accept": "application/json",
            "X_REPLIT_TOKEN": self.repl_token
        }
        
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            raise Exception("Notion not connected")
        
        connection = items[0]
        settings = connection.get("settings", {})
        
        # Try different token locations
        access_token = (
            settings.get("access_token") or
            settings.get("oauth", {}).get("credentials", {}).get("access_token")
        )
        
        if not access_token:
            raise Exception("No access token found in Notion connection")
        
        self._access_token = access_token
        
        # Set expiry if available
        expires_at = settings.get("expires_at")
        if expires_at:
            self._token_expiry = datetime.fromisoformat(expires_at.replace('Z', '+00:00')).timestamp()
        
        return access_token
    
    def create_page(self, database_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new page in a Notion database
        
        Args:
            database_id: The Notion database ID
            properties: Page properties as a dict
        
        Returns:
            Response from Notion API
        """
        access_token = self._get_access_token()
        
        url = "https://api.notion.com/v1/pages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        payload = {
            "parent": {"database_id": database_id},
            "properties": properties
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        return response.json()
    
    def query_database(self, database_id: str, filter_obj: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Query a Notion database
        
        Args:
            database_id: The Notion database ID
            filter_obj: Optional filter object
        
        Returns:
            Query results from Notion API
        """
        access_token = self._get_access_token()
        
        url = f"https://api.notion.com/v1/databases/{database_id}/query"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        payload = {}
        if filter_obj:
            payload["filter"] = filter_obj
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        return response.json()


def notion_title(text: str) -> Dict[str, Any]:
    """Create a Notion title property"""
    return {
        "title": [
            {
                "text": {
                    "content": text
                }
            }
        ]
    }


def notion_rich_text(text: str) -> Dict[str, Any]:
    """Create a Notion rich text property"""
    return {
        "rich_text": [
            {
                "text": {
                    "content": text
                }
            }
        ]
    }


def notion_number(value: float) -> Dict[str, Any]:
    """Create a Notion number property"""
    return {
        "number": value
    }


def notion_checkbox(checked: bool) -> Dict[str, Any]:
    """Create a Notion checkbox property"""
    return {
        "checkbox": checked
    }


def notion_date(date_str: str) -> Dict[str, Any]:
    """Create a Notion date property"""
    return {
        "date": {
            "start": date_str
        }
    }


def notion_select(option: str) -> Dict[str, Any]:
    """Create a Notion select property"""
    return {
        "select": {
            "name": option
        }
    }


def notion_url(url: str) -> Dict[str, Any]:
    """Create a Notion URL property"""
    return {
        "url": url
    }
