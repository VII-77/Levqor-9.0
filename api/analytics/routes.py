"""
Analytics API Routes - MEGA PHASE v18
Endpoints for workflow analytics
"""
import logging
from flask import jsonify, request, g
from . import analytics_bp

from modules.analytics import get_workflow_analytics

log = logging.getLogger("levqor.analytics.api")


@analytics_bp.route('/overview', methods=['GET'])
def api_get_analytics_overview():
    """
    GET /api/analytics/overview - Get workflow analytics overview.
    """
    try:
        tenant_id = request.args.get('tenant_id') or getattr(g, 'tenant_id', None)
        
        analytics = get_workflow_analytics(tenant_id=tenant_id)
        
        return jsonify(analytics), 200
        
    except Exception as e:
        log.error(f"Error getting analytics: {e}")
        return jsonify({
            "workflows_count": 0,
            "runs_last_7d": 0,
            "runs_last_30d": 0,
            "failure_rate": 0,
            "avg_steps_per_workflow": 0
        }), 200
