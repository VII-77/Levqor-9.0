"""
Gravity Engine - Attracts and retains users through engagement optimization.

Strategies:
- Engagement scoring
- Retention triggers
- Churn prediction
- Re-engagement campaigns
- Loyalty mechanics

Launch Stage Behavior:
- PRE: Always dry-run, generate proposals only
- POST: Can execute live engagement actions
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


class GravityEngine:
    """Attracts and retains users through engagement optimization."""
    
    GRAVITY_FACTORS = [
        {"id": "onboarding_completion", "weight": 0.25, "description": "New user onboarding progress"},
        {"id": "feature_adoption", "weight": 0.20, "description": "Core feature usage"},
        {"id": "workflow_creation", "weight": 0.20, "description": "Workflow builder engagement"},
        {"id": "return_frequency", "weight": 0.15, "description": "Login frequency"},
        {"id": "support_interactions", "weight": 0.10, "description": "Support ticket activity"},
        {"id": "referral_activity", "weight": 0.10, "description": "Referral program participation"},
    ]
    
    def __init__(self):
        self.gravity_scores = {}
        self.retention_triggers = []
    
    def calculate_gravity_score(
        self,
        user_data: dict,
        dry_run: bool = True
    ) -> dict:
        """
        Calculate user engagement gravity score.
        
        Args:
            user_data: User activity and engagement data
            dry_run: If True, use sample data (forced True in pre-launch)
        
        Returns:
            Gravity score and retention recommendations
        """
        effective_dry_run = _get_effective_dry_run(dry_run)
        logger.info(f"[GravityEngine] Calculating gravity score (dry_run={effective_dry_run})")
        
        score_components = []
        total_score = 0.0
        
        for factor in self.GRAVITY_FACTORS:
            factor_value = user_data.get(factor["id"], 0.5)
            weighted_score = factor_value * factor["weight"]
            total_score += weighted_score
            score_components.append({
                "factor": factor["id"],
                "value": factor_value,
                "weighted": round(weighted_score, 3)
            })
        
        result = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": effective_dry_run,
            "gravity_score": round(total_score, 3),
            "components": score_components,
            "risk_level": self._assess_risk(total_score),
            "recommendations": self._generate_recommendations(total_score, score_components),
            "launch_stage_enforced": effective_dry_run != dry_run
        }
        
        logger.info(f"[GravityEngine] Gravity score: {result['gravity_score']} ({result['risk_level']})")
        return result
    
    def _assess_risk(self, score: float) -> str:
        """Assess churn risk based on gravity score."""
        if score >= 0.7:
            return "low"
        elif score >= 0.4:
            return "medium"
        else:
            return "high"
    
    def _generate_recommendations(self, score: float, components: list) -> list:
        """Generate retention recommendations."""
        recommendations = []
        
        if score < 0.5:
            recommendations.append({
                "type": "re_engagement",
                "action": "Send personalized win-back email",
                "priority": "high",
                "approval_class": "C"
            })
        
        weak_factors = [c for c in components if c["value"] < 0.3]
        for factor in weak_factors[:2]:
            recommendations.append({
                "type": "feature_education",
                "action": f"Guide user on {factor['factor'].replace('_', ' ')}",
                "priority": "medium",
                "approval_class": "B"
            })
        
        return recommendations
    
    def verify(self) -> dict:
        """Verify engine is operational."""
        return {
            "engine": "GravityEngine",
            "status": "OK",
            "gravity_factors": len(self.GRAVITY_FACTORS),
            "active_triggers": len(self.retention_triggers)
        }
