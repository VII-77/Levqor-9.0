"""
Evolution Engine - Orchestrates organism-wide evolution based on performance.

Responsibilities:
- Performance aggregation
- Strategy evolution
- Learning from outcomes
- Cross-engine optimization
- Generational improvements
"""

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


class EvolutionEngine:
    """Orchestrates organism-wide evolution based on performance feedback."""
    
    def __init__(self):
        self.evolution_history = []
        self.current_generation = 1
        self.fitness_scores = []
    
    def evolve(
        self,
        performance_data: dict,
        engines: Optional[list] = None,
        dry_run: bool = True
    ) -> dict:
        """
        Trigger evolution cycle based on performance data.
        
        Args:
            performance_data: Metrics from all growth engines
            engines: Specific engines to evolve (defaults to all)
            dry_run: If True, only simulate
        
        Returns:
            Evolution results and new generation parameters
        """
        logger.info(f"[EvolutionEngine] Starting evolution cycle (gen {self.current_generation}, dry_run={dry_run})")
        
        if engines is None:
            engines = ["demand", "mutation", "distribution", "gravity"]
        
        result = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run": dry_run,
            "generation": self.current_generation,
            "input_performance": performance_data,
            "evolved_parameters": {},
            "fitness_improvement": 0.0,
            "next_actions": []
        }
        
        current_fitness = self._calculate_fitness(performance_data)
        result["current_fitness"] = current_fitness
        
        for engine in engines:
            result["evolved_parameters"][engine] = {
                "learning_rate": 0.1,
                "exploration_factor": max(0.1, 0.5 - (self.current_generation * 0.05)),
                "optimization_target": "conversion_rate"
            }
        
        if self.fitness_scores:
            prev_fitness = self.fitness_scores[-1]
            result["fitness_improvement"] = round(current_fitness - prev_fitness, 3)
        
        self.fitness_scores.append(current_fitness)
        
        result["next_actions"] = [
            {
                "action": "demand_rescan",
                "priority": "medium",
                "rationale": "Refresh market signals for next generation"
            },
            {
                "action": "mutation_generation",
                "priority": "high",
                "rationale": "Generate new strategy variants"
            }
        ]
        
        self.evolution_history.append({
            "generation": self.current_generation,
            "fitness": current_fitness,
            "timestamp": result["timestamp"]
        })
        
        self.current_generation += 1
        
        logger.info(f"[EvolutionEngine] Evolution complete. Fitness: {current_fitness:.3f}")
        return result
    
    def _calculate_fitness(self, performance_data: dict) -> float:
        """Calculate overall fitness score from performance data."""
        metrics = {
            "conversion_rate": performance_data.get("conversion_rate", 0.02),
            "retention_rate": performance_data.get("retention_rate", 0.7),
            "engagement_score": performance_data.get("engagement_score", 0.5),
            "revenue_growth": performance_data.get("revenue_growth", 0.0),
        }
        
        weights = {
            "conversion_rate": 0.3 * 10,
            "retention_rate": 0.3,
            "engagement_score": 0.2,
            "revenue_growth": 0.2 * 2,
        }
        
        fitness = sum(
            metrics[k] * weights[k]
            for k in metrics
        )
        
        return round(min(1.0, fitness), 3)
    
    def get_evolution_history(self) -> list:
        """Get history of evolution cycles."""
        return self.evolution_history
    
    def verify(self) -> dict:
        """Verify engine is operational."""
        return {
            "engine": "EvolutionEngine",
            "status": "OK",
            "current_generation": self.current_generation,
            "evolution_cycles": len(self.evolution_history),
            "latest_fitness": self.fitness_scores[-1] if self.fitness_scores else None
        }
