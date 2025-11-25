"""
Analytics Module - MEGA PHASE v18
Workflow usage analytics and metrics
"""
from .usage import (
    get_workflow_analytics,
    get_workflows_count,
    get_runs_count,
    get_failure_rate
)

__all__ = [
    'get_workflow_analytics',
    'get_workflows_count',
    'get_runs_count',
    'get_failure_rate'
]
