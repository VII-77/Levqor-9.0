"""
Analytics Usage Module - MEGA PHASE v18
Aggregates workflow metrics and statistics
"""
import time
import logging
from typing import Dict, Any
from modules.db_wrapper import execute_query

log = logging.getLogger("levqor.analytics.usage")


def get_workflows_count(tenant_id: str = None) -> int:
    """Get total number of workflows."""
    try:
        if tenant_id:
            result = execute_query(
                "SELECT COUNT(*) as count FROM workflows WHERE tenant_id = ?",
                (tenant_id,),
                fetch='one'
            )
        else:
            result = execute_query(
                "SELECT COUNT(*) as count FROM workflows",
                fetch='one'
            )
        return result.get('count', 0) if result else 0
    except Exception as e:
        log.warning(f"Error getting workflows count: {e}")
        return 0


def get_runs_count(tenant_id: str = None, days: int = 7) -> int:
    """Get number of workflow runs in the last N days."""
    try:
        cutoff = time.time() - (days * 24 * 60 * 60)
        
        result = execute_query(
            "SELECT COUNT(*) as count FROM workflow_runs WHERE started_at > ?",
            (cutoff,),
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception as e:
        log.warning(f"Error getting runs count: {e}")
        return 0


def get_failure_rate(tenant_id: str = None, days: int = 30) -> float:
    """Get failure rate as a percentage (0.0 - 1.0)."""
    try:
        cutoff = time.time() - (days * 24 * 60 * 60)
        
        total = execute_query(
            "SELECT COUNT(*) as count FROM workflow_runs WHERE started_at > ?",
            (cutoff,),
            fetch='one'
        )
        total_count = total.get('count', 0) if total else 0
        
        if total_count == 0:
            return 0.0
        
        failed = execute_query(
            "SELECT COUNT(*) as count FROM workflow_runs WHERE started_at > ? AND status = 'failed'",
            (cutoff,),
            fetch='one'
        )
        failed_count = failed.get('count', 0) if failed else 0
        
        return failed_count / total_count
    except Exception as e:
        log.warning(f"Error getting failure rate: {e}")
        return 0.0


def get_avg_steps_per_workflow(tenant_id: str = None) -> float:
    """Get average number of steps per workflow."""
    try:
        import json
        
        if tenant_id:
            result = execute_query(
                "SELECT steps FROM workflows WHERE tenant_id = ?",
                (tenant_id,),
                fetch='all'
            )
        else:
            result = execute_query(
                "SELECT steps FROM workflows",
                fetch='all'
            )
        
        if not result:
            return 0.0
        
        total_steps = 0
        for row in result:
            try:
                steps = json.loads(row.get('steps', '[]'))
                total_steps += len(steps)
            except json.JSONDecodeError:
                pass
        
        return total_steps / len(result) if result else 0.0
    except Exception as e:
        log.warning(f"Error getting avg steps: {e}")
        return 0.0


def get_workflow_analytics(tenant_id: str = None) -> Dict[str, Any]:
    """Get comprehensive workflow analytics."""
    return {
        "workflows_count": get_workflows_count(tenant_id),
        "runs_last_7d": get_runs_count(tenant_id, days=7),
        "runs_last_30d": get_runs_count(tenant_id, days=30),
        "failure_rate": get_failure_rate(tenant_id),
        "avg_steps_per_workflow": get_avg_steps_per_workflow(tenant_id)
    }
