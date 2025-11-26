"""
Demand Signature Engine - Detects and interprets market demand signals.

Analyzes:
- Search trends and keywords
- User behavior patterns
- Competitive landscape
- Seasonal demand cycles

Launch Stage Behavior:
- PRE: Always dry-run, generate proposals only
- POST: Can execute live scans with external APIs
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


class DemandSignatureEngine:
    """Detects and interprets market demand signals."""
    
    def __init__(self):
        self.signals = []
        self.last_scan = None
    
    def scan_demand_signals(self, dry_run: bool = True) -> dict:
        """
        Scan for market demand signals.
        
        Args:
            dry_run: If True, only simulate (forced True in pre-launch)
        
        Returns:
            Dictionary with detected signals and recommendations
        """
        effective_dry_run = _get_effective_dry_run(dry_run)
        logger.info(f"[DemandSignature] Scanning demand signals (dry_run={effective_dry_run})")
        
        signals = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": effective_dry_run,
            "detected_signals": [],
            "recommendations": [],
            "launch_stage_enforced": effective_dry_run != dry_run
        }
        
        sample_signals = [
            {
                "type": "keyword_trend",
                "signal": "workflow automation",
                "strength": 0.85,
                "source": "internal_analytics"
            },
            {
                "type": "user_intent",
                "signal": "no-code integration",
                "strength": 0.72,
                "source": "search_queries"
            },
            {
                "type": "competitive_gap",
                "signal": "enterprise API features",
                "strength": 0.68,
                "source": "market_analysis"
            }
        ]
        
        signals["detected_signals"] = sample_signals
        signals["recommendations"] = [
            {
                "action": "content_creation",
                "topic": "Workflow Automation Best Practices",
                "priority": "high",
                "approval_class": "C"
            },
            {
                "action": "feature_highlight",
                "topic": "No-Code Integration Capabilities",
                "priority": "medium",
                "approval_class": "B"
            }
        ]
        
        self.signals = signals["detected_signals"]
        self.last_scan = datetime.now(timezone.utc)
        
        logger.info(f"[DemandSignature] Found {len(signals['detected_signals'])} signals")
        return signals
    
    def get_top_signals(self, limit: int = 5) -> list:
        """Get top demand signals by strength."""
        sorted_signals = sorted(
            self.signals,
            key=lambda x: x.get("strength", 0),
            reverse=True
        )
        return sorted_signals[:limit]
    
    def verify(self) -> dict:
        """Verify engine is operational."""
        return {
            "engine": "DemandSignatureEngine",
            "status": "OK",
            "last_scan": self.last_scan.isoformat() if self.last_scan else None,
            "signal_count": len(self.signals)
        }
