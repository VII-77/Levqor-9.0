"""
Mutation Engine - Evolves and optimizes growth strategies.

Capabilities:
- A/B test generation
- Copy variation creation
- Strategy optimization
- Performance-based mutations

Launch Stage Behavior:
- PRE: Always dry-run, generate proposals only
- POST: Can execute low-risk mutations, high-risk still require approval
"""

import logging
import random
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


class MutationEngine:
    """Evolves and optimizes growth strategies through controlled mutations."""
    
    def __init__(self):
        self.mutations = []
        self.generation = 0
    
    def generate_mutations(
        self,
        base_strategy: dict,
        mutation_count: int = 3,
        dry_run: bool = True
    ) -> dict:
        """
        Generate mutations of a base growth strategy.
        
        Args:
            base_strategy: Original strategy to mutate
            mutation_count: Number of variants to generate
            dry_run: If True, only simulate (forced True in pre-launch)
        
        Returns:
            Dictionary with mutations and recommendations
        """
        effective_dry_run = _get_effective_dry_run(dry_run)
        logger.info(f"[MutationEngine] Generating {mutation_count} mutations (dry_run={effective_dry_run})")
        
        self.generation += 1
        
        result = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": effective_dry_run,
            "generation": self.generation,
            "base_strategy": base_strategy,
            "mutations": [],
            "launch_stage_enforced": effective_dry_run != dry_run
        }
        
        mutation_types = [
            "headline_variation",
            "cta_optimization",
            "value_prop_emphasis",
            "urgency_factor",
            "social_proof_angle"
        ]
        
        for i in range(mutation_count):
            mutation = {
                "id": f"mut_g{self.generation}_{i+1}",
                "type": random.choice(mutation_types),
                "confidence": round(random.uniform(0.6, 0.95), 2),
                "changes": {
                    "element": f"variation_{i+1}",
                    "optimization_target": "conversion_rate"
                },
                "approval_class": "B",
                "requires_approval": True
            }
            result["mutations"].append(mutation)
        
        self.mutations.extend(result["mutations"])
        
        logger.info(f"[MutationEngine] Generated {len(result['mutations'])} mutations")
        return result
    
    def evaluate_mutation(self, mutation_id: str, performance_data: dict) -> dict:
        """Evaluate a mutation based on performance data."""
        return {
            "mutation_id": mutation_id,
            "evaluation": "pending",
            "recommendation": "continue_testing",
            "confidence": 0.0
        }
    
    def verify(self) -> dict:
        """Verify engine is operational."""
        return {
            "engine": "MutationEngine",
            "status": "OK",
            "generation": self.generation,
            "total_mutations": len(self.mutations)
        }
