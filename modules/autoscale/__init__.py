"""
Dynamic Scaling Module
Auto-scales based on system load and predictions
"""
from .scaler import check_load, get_scaling_history

__all__ = [
    "check_load",
    "get_scaling_history"
]
