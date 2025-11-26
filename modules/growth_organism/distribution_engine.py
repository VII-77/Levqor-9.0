"""
Distribution Engine - Manages content and campaign distribution.

Channels:
- Email campaigns
- Social media
- Content syndication
- Partner networks
- SEO optimization

Launch Stage Behavior:
- PRE: All distributions are dry-run proposals only
- POST: Can execute to enabled channels with valid API keys, high-risk still require approval
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def _get_effective_dry_run(explicit_dry_run: bool) -> bool:
    """Determine effective dry_run based on launch stage."""
    try:
        from config.launch_stage import is_pre_launch
        if is_pre_launch():
            return True
        return explicit_dry_run
    except ImportError:
        return explicit_dry_run


class DistributionEngine:
    """Manages multi-channel content and campaign distribution."""
    
    CHANNELS = [
        {"id": "email", "name": "Email Marketing", "enabled": True},
        {"id": "social", "name": "Social Media", "enabled": True},
        {"id": "seo", "name": "SEO Content", "enabled": True},
        {"id": "partner", "name": "Partner Network", "enabled": False},
        {"id": "paid", "name": "Paid Advertising", "enabled": False},
    ]
    
    def __init__(self):
        self.pending_distributions = []
        self.completed_distributions = []
    
    def plan_distribution(
        self,
        content: dict,
        channels: Optional[list] = None,
        dry_run: bool = True
    ) -> dict:
        """
        Plan content distribution across channels.
        
        Args:
            content: Content to distribute
            channels: Target channels (defaults to all enabled)
            dry_run: If True, only simulate (forced True in pre-launch)
        
        Returns:
            Distribution plan requiring approval
        """
        effective_dry_run = _get_effective_dry_run(dry_run)
        logger.info(f"[DistributionEngine] Planning distribution (dry_run={effective_dry_run})")
        
        if channels is None:
            channels = [c["id"] for c in self.CHANNELS if c["enabled"]]
        
        plan = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": effective_dry_run,
            "content": content,
            "distribution_plan": [],
            "approval_class": "C",
            "status": "pending_approval",
            "launch_stage_enforced": effective_dry_run != dry_run
        }
        
        for channel_id in channels:
            channel = next((c for c in self.CHANNELS if c["id"] == channel_id), None)
            if channel and channel["enabled"]:
                plan["distribution_plan"].append({
                    "channel": channel_id,
                    "channel_name": channel["name"],
                    "scheduled_for": None,
                    "status": "draft",
                    "reach_estimate": self._estimate_reach(channel_id)
                })
        
        self.pending_distributions.append(plan)
        
        logger.info(f"[DistributionEngine] Planned {len(plan['distribution_plan'])} channel distributions")
        return plan
    
    def _estimate_reach(self, channel_id: str) -> dict:
        """Estimate reach for a channel."""
        estimates = {
            "email": {"low": 500, "high": 2000},
            "social": {"low": 1000, "high": 5000},
            "seo": {"low": 200, "high": 10000},
            "partner": {"low": 100, "high": 1000},
            "paid": {"low": 5000, "high": 50000},
        }
        return estimates.get(channel_id, {"low": 0, "high": 0})
    
    def get_channel_status(self) -> list:
        """Get status of all distribution channels."""
        return self.CHANNELS
    
    def verify(self) -> dict:
        """Verify engine is operational."""
        enabled_channels = sum(1 for c in self.CHANNELS if c["enabled"])
        return {
            "engine": "DistributionEngine",
            "status": "OK",
            "enabled_channels": enabled_channels,
            "pending_distributions": len(self.pending_distributions)
        }
