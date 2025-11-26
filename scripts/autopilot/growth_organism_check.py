#!/usr/bin/env python3
"""
Growth Organism Check - Guardian Autopilot Grid

Verifies all Growth Organism modules are operational and running correctly.
Includes launch stage awareness for pre/post-launch behavior.
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config.launch_stage import get_launch_stage, get_stage_config

OUTPUT_DIR = Path("/home/runner/workspace/workspace-data/autopilot")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(OUTPUT_DIR / "growth_organism_check.log")
    ]
)
logger = logging.getLogger(__name__)


def check_module_import(module_name: str) -> tuple[str, str]:
    """Try to import a module and return status."""
    try:
        if module_name == "DemandSignatureEngine":
            from modules.growth_organism.demand_signature import DemandSignatureEngine
            return "OK", "Import successful"
        elif module_name == "MutationEngine":
            from modules.growth_organism.mutation_engine import MutationEngine
            return "OK", "Import successful"
        elif module_name == "DistributionEngine":
            from modules.growth_organism.distribution_engine import DistributionEngine
            return "OK", "Import successful"
        elif module_name == "GravityEngine":
            from modules.growth_organism.gravity_engine import GravityEngine
            return "OK", "Import successful"
        elif module_name == "EvolutionEngine":
            from modules.growth_organism.evolution_engine import EvolutionEngine
            return "OK", "Import successful"
        else:
            return "FAIL", f"Unknown module: {module_name}"
    except ImportError as e:
        return "FAIL", str(e)
    except Exception as e:
        return "FAIL", str(e)[:100]


def run_dry_test(module_name: str) -> tuple[str, dict]:
    """Run a dry-run test on a module."""
    try:
        if module_name == "DemandSignatureEngine":
            from modules.growth_organism.demand_signature import DemandSignatureEngine
            engine = DemandSignatureEngine()
            result = engine.scan_demand_signals(dry_run=True)
            verify = engine.verify()
            return "OK", {"test_result": result, "verify": verify}
        
        elif module_name == "MutationEngine":
            from modules.growth_organism.mutation_engine import MutationEngine
            engine = MutationEngine()
            result = engine.generate_mutations(
                base_strategy={"type": "test"},
                mutation_count=2,
                dry_run=True
            )
            verify = engine.verify()
            return "OK", {"test_result": result, "verify": verify}
        
        elif module_name == "DistributionEngine":
            from modules.growth_organism.distribution_engine import DistributionEngine
            engine = DistributionEngine()
            result = engine.plan_distribution(
                content={"type": "test", "title": "Test Content"},
                dry_run=True
            )
            verify = engine.verify()
            return "OK", {"test_result": result, "verify": verify}
        
        elif module_name == "GravityEngine":
            from modules.growth_organism.gravity_engine import GravityEngine
            engine = GravityEngine()
            result = engine.calculate_gravity_score(
                user_data={"onboarding_completion": 0.8, "feature_adoption": 0.6},
                dry_run=True
            )
            verify = engine.verify()
            return "OK", {"test_result": result, "verify": verify}
        
        elif module_name == "EvolutionEngine":
            from modules.growth_organism.evolution_engine import EvolutionEngine
            engine = EvolutionEngine()
            result = engine.evolve(
                performance_data={
                    "conversion_rate": 0.03,
                    "retention_rate": 0.75,
                    "engagement_score": 0.6
                },
                dry_run=True
            )
            verify = engine.verify()
            return "OK", {"test_result": result, "verify": verify}
        
        else:
            return "FAIL", {"error": f"Unknown module: {module_name}"}
    
    except Exception as e:
        return "FAIL", {"error": str(e)[:200]}


def run_growth_organism_check() -> dict:
    """Run full Growth Organism verification."""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    stage_config = get_stage_config()
    launch_stage = get_launch_stage()
    
    modules = [
        "DemandSignatureEngine",
        "MutationEngine",
        "DistributionEngine",
        "GravityEngine",
        "EvolutionEngine"
    ]
    
    results = {
        "timestamp": timestamp,
        "launch_stage": launch_stage,
        "launch_stage_config": stage_config,
        "summary": {
            "total_modules": len(modules),
            "imports_ok": 0,
            "tests_ok": 0,
            "failed": 0
        },
        "modules": {}
    }
    
    logger.info("=" * 60)
    logger.info("GUARDIAN AUTOPILOT - Growth Organism Check")
    logger.info("=" * 60)
    logger.info(f"Launch Stage: {launch_stage.upper()}")
    if launch_stage == "pre":
        logger.info("  Mode: DRY-RUN (proposals only, no execution)")
    else:
        logger.info("  Mode: LIVE (autonomous execution for low/medium risk)")
    
    for module_name in modules:
        logger.info(f"\nChecking {module_name}...")
        
        import_status, import_detail = check_module_import(module_name)
        
        if import_status == "OK":
            results["summary"]["imports_ok"] += 1
            test_status, test_result = run_dry_test(module_name)
            
            if test_status == "OK":
                results["summary"]["tests_ok"] += 1
                logger.info(f"  [OK] Import: OK | Dry-run test: OK")
                verify_data = test_result.get("verify", {})
                logger.info(f"       Status: {verify_data.get('status', 'N/A')}")
            else:
                results["summary"]["failed"] += 1
                logger.error(f"  [FAIL] Import: OK | Dry-run test: FAIL")
                logger.error(f"       Error: {test_result.get('error', 'Unknown')}")
        else:
            results["summary"]["failed"] += 1
            test_status = "SKIP"
            test_result = {"skipped": "Import failed"}
            logger.error(f"  [FAIL] Import: FAIL - {import_detail}")
        
        results["modules"][module_name] = {
            "import_status": import_status,
            "import_detail": import_detail,
            "test_status": test_status,
            "test_result": test_result if test_status == "OK" else {"error": test_result.get("error", import_detail)}
        }
    
    all_ok = results["summary"]["failed"] == 0
    results["summary"]["organism_status"] = "HEALTHY" if all_ok else "DEGRADED"
    
    return results


def main():
    """Main entry point."""
    results = run_growth_organism_check()
    
    json_path = OUTPUT_DIR / "growth_check.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    logger.info(f"\nResults saved to: {json_path}")
    
    logger.info("\n" + "=" * 60)
    logger.info("GROWTH ORGANISM SUMMARY")
    logger.info("=" * 60)
    s = results["summary"]
    logger.info(f"Modules: {s['total_modules']} | Imports OK: {s['imports_ok']} | Tests OK: {s['tests_ok']} | Failed: {s['failed']}")
    logger.info(f"Organism Status: {s['organism_status']}")
    
    if s["organism_status"] == "HEALTHY":
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
