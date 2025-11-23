"""
Levqor V12.12 Enterprise - Support Tier Logic
Tier-aware support routing and SLA configuration.

CRITICAL: This module defines internal support behavior only.
It does NOT change any user-facing pricing, trial periods, or guarantees.
"""

from typing import Dict, Any, Optional
from enum import Enum


class SupportTier(str, Enum):
    """Support tier levels matching subscription plans."""
    STARTER = "starter"
    LAUNCH = "launch"
    GROWTH = "growth"
    AGENCY = "agency"


class SupportChannel(str, Enum):
    """Available support channels."""
    EMAIL = "email"
    AI_CHAT = "ai_chat"
    HUMAN_CHAT = "human_chat"
    PHONE = "phone"


class TicketPriority(str, Enum):
    """Ticket priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# Support tier configuration
# Maps plan tiers to their support capabilities
TIER_CONFIG: Dict[SupportTier, Dict[str, Any]] = {
    SupportTier.STARTER: {
        "channels": [SupportChannel.EMAIL],
        "ai_assisted": False,
        "human_escalation": False,
        "sla_hours": 48,  # Response SLA in business hours
        "priority_boost": False,
        "default_priority": TicketPriority.NORMAL,
        "description": "Email support with standard SLA"
    },
    
    SupportTier.LAUNCH: {
        "channels": [SupportChannel.EMAIL],
        "ai_assisted": True,
        "human_escalation": True,
        "sla_hours": 24,  # Response SLA in business hours
        "priority_boost": False,
        "default_priority": TicketPriority.NORMAL,
        "description": "Email support with AI-assisted routing and improved SLA"
    },
    
    SupportTier.GROWTH: {
        "channels": [SupportChannel.EMAIL, SupportChannel.AI_CHAT],
        "ai_assisted": True,
        "human_escalation": True,
        "sla_hours": 12,  # Response SLA in business hours
        "priority_boost": True,
        "default_priority": TicketPriority.HIGH,
        "description": "AI-assisted chat + email with human escalation"
    },
    
    SupportTier.AGENCY: {
        "channels": [
            SupportChannel.EMAIL,
            SupportChannel.AI_CHAT,
            SupportChannel.HUMAN_CHAT,
            SupportChannel.PHONE
        ],
        "ai_assisted": True,
        "human_escalation": True,
        "sla_hours": 4,  # Response SLA in business hours
        "priority_boost": True,
        "default_priority": TicketPriority.URGENT,
        "description": "AI concierge + priority human support with 4-hour SLA"
    },
}


def get_support_config(tier: str) -> Dict[str, Any]:
    """
    Get support configuration for a given tier.
    
    Args:
        tier: Subscription tier name (starter, launch, growth, agency)
    
    Returns:
        Support configuration dictionary
    
    Example:
        config = get_support_config("growth")
        if config["ai_assisted"]:
            route_to_ai_agent(ticket)
    """
    try:
        tier_enum = SupportTier(tier.lower())
        return TIER_CONFIG[tier_enum]
    except (ValueError, KeyError):
        # Default to starter tier if unknown
        return TIER_CONFIG[SupportTier.STARTER]


def should_route_to_ai(tier: str) -> bool:
    """Check if tier supports AI-assisted routing."""
    config = get_support_config(tier)
    return config.get("ai_assisted", False)


def can_escalate_to_human(tier: str) -> bool:
    """Check if tier supports human escalation."""
    config = get_support_config(tier)
    return config.get("human_escalation", False)


def get_sla_hours(tier: str) -> int:
    """Get response SLA in business hours for tier."""
    config = get_support_config(tier)
    return config.get("sla_hours", 48)


def get_default_priority(tier: str) -> str:
    """Get default ticket priority for tier."""
    config = get_support_config(tier)
    priority = config.get("default_priority", TicketPriority.NORMAL)
    return priority.value if isinstance(priority, TicketPriority) else priority


def get_available_channels(tier: str) -> list:
    """Get list of available support channels for tier."""
    config = get_support_config(tier)
    channels = config.get("channels", [SupportChannel.EMAIL])
    return [ch.value if isinstance(ch, SupportChannel) else ch for ch in channels]


# Verification commands:
# python -c "from api.support.tiers import get_support_config; import json; print(json.dumps(get_support_config('growth'), indent=2, default=str))"
# python -c "from api.support.tiers import should_route_to_ai; print(f'Growth AI: {should_route_to_ai(\"growth\")}, Starter AI: {should_route_to_ai(\"starter\")}')"
