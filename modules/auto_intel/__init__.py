"""
Automation Intelligence Module
Self-monitoring, anomaly detection, and self-healing
"""
from .monitor import collect_metrics, detect_anomalies, get_recent_anomalies
from .self_heal import attempt_fix, get_recent_actions
from .alerts import notify

__all__ = [
    "collect_metrics",
    "detect_anomalies",
    "get_recent_anomalies",
    "attempt_fix",
    "get_recent_actions",
    "notify"
]
