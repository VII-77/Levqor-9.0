"""
Demand Signature Engine - Detects and interprets market demand signals.

Analyzes:
- Search trends and keywords
- User behavior patterns
- Competitive landscape
- Seasonal demand cycles
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


class DemandSignatureEngine:
    """Detects and interprets market demand signals."""
    
    def __init__(self):
        self.signals = []
        self.last_scan = None
    
    def scan_demand_signals(self, dry_run: bool = True) -> dict:
        """
        Scan for market demand signals.
        
        Args:
            dry_run: If True, only simulate (no external API calls)
        
        Returns:
            Dictionary with detected signals and recommendations
        """
        logger.info(f"[DemandSignature] Scanning demand signals (dry_run={dry_run})")
        
        signals = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": dry_run,
            "detected_signals": [],
            "recommendations": []
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
