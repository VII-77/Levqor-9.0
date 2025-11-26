"""
Growth Organism - Levqor's Autonomous Growth Engine

A living, self-evolving growth system that:
1. Detects demand signals from market data
2. Mutates and optimizes growth strategies
3. Distributes content and campaigns
4. Applies gravity to attract and retain users
5. Evolves based on performance feedback

All actions are proposal-based (Class C) requiring human approval.
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
