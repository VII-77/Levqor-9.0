"""
Decision Engine Module
Analyzes trends and generates automated recommendations
"""
from .analyze import analyze_trends, get_recent_recommendations

__all__ = [
    "analyze_trends",
    "get_recent_recommendations"
]
