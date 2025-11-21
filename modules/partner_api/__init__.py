"""
Partner API Module
Enables third-party partner registration, webhooks, and revenue sharing
"""
from .registry import bp as registry_bp
from .hooks import trigger_partner_event, notify_all_partners
from .auth import generate_partner_token, verify_partner_token, issue_partner_credentials

__all__ = [
    "registry_bp",
    "trigger_partner_event",
    "notify_all_partners",
    "generate_partner_token",
    "verify_partner_token",
    "issue_partner_credentials"
]
