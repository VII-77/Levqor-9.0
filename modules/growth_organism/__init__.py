"""
Growth Organism - Levqor's Autonomous Growth Engine

A living, self-evolving growth system that:
1. Detects demand signals from market data
2. Mutates and optimizes growth strategies
3. Distributes content and campaigns
4. Applies gravity to attract and retain users
5. Evolves based on performance feedback

Launch Stage Behavior:
- PRE-LAUNCH ("pre"): All actions are dry-run only, proposals generated but not executed
- POST-LAUNCH ("post"): Low/medium risk actions can execute, high-risk still require approval
"""

from .demand_signature import DemandSignatureEngine
from .mutation_engine import MutationEngine
from .distribution_engine import DistributionEngine
from .gravity_engine import GravityEngine
from .evolution_engine import EvolutionEngine

__all__ = [
    "DemandSignatureEngine",
    "MutationEngine",
    "DistributionEngine",
    "GravityEngine",
    "EvolutionEngine",
]


def get_organism_status() -> dict:
    """Get comprehensive Growth Organism status including launch stage."""
    from config.launch_stage import get_stage_config
    
    stage_config = get_stage_config()
    
    return {
        "launch_stage": stage_config["stage"],
        "is_live": stage_config["is_live"],
        "engines": [
            "DemandSignatureEngine",
            "MutationEngine", 
            "DistributionEngine",
            "GravityEngine",
            "EvolutionEngine"
        ],
        "autonomous_execution_enabled": stage_config["permissions"]["growth_organism_execute"],
        "high_risk_approval_required": True,
    }
