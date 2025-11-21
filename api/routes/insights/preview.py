"""
Insights Preview API
Returns aggregated metrics without generating a report
"""
from flask import Blueprint, jsonify
import sys
import os

# Add modules to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from modules.data_insights.aggregator import aggregate

bp = Blueprint('insights_preview', __name__, url_prefix="/api/insights")

@bp.get("/preview")
def preview():
    """
    Get insights preview (last 90 days)
    
    Returns:
        JSON with aggregated KPIs
    """
    try:
        kpis = aggregate(period_days=90)
        return jsonify({
            "ok": True,
            "data": kpis
        }), 200
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "aggregation_failed",
            "message": str(e)
        }), 500
