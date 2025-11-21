"""
AI Advisor Module
Predictive analytics for revenue, churn, and growth
"""
from .predict import (
    forecast_revenue,
    forecast_churn,
    forecast_partner_health,
    generate_ai_insights
)

__all__ = [
    "forecast_revenue",
    "forecast_churn",
    "forecast_partner_health",
    "generate_ai_insights"
]
