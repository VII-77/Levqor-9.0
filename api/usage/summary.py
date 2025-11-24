"""
Usage Summary API
Provides aggregate usage metrics across the platform.
"""

from flask import Blueprint, jsonify
import sqlite3
import os

bp = Blueprint("usage_summary", __name__, url_prefix="/api/usage")

def get_db():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'levqor.db')
    return sqlite3.connect(db_path)

@bp.get("/summary")
def get_usage_summary():
    """
    GET /api/usage/summary
    
    Returns aggregate usage metrics across the platform.
    This endpoint provides a high-level overview of system usage.
    
    Response:
    {
        "status": "ok",
        "workflows": <int>,      # Total workflows across all users
        "runs": <int>,           # Total runs across all users
        "ai_credits": <int>,     # Total AI credits consumed
        "source": "database" | "stub"
    }
    
    TODO: In production, this should be aggregated from a proper metrics/analytics table
    with tenant-level isolation and time-based aggregation.
    """
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Try to get real metrics from database tables if they exist
        # For now, check if we have any developer API usage data
        try:
            cursor.execute("""
                SELECT COUNT(*) as total_calls
                FROM developer_keys
                WHERE is_active = 1
            """)
            result = cursor.fetchone()
            active_keys = result[0] if result else 0
            
            # Get total API calls from active keys
            cursor.execute("""
                SELECT SUM(calls_used) as total_calls
                FROM developer_keys
                WHERE is_active = 1
            """)
            result = cursor.fetchone()
            total_calls = result[0] if result and result[0] else 0
            
            db.close()
            
            # Return stub data with database context
            # TODO: Replace with actual workflow, runs, and AI credits tables when available
            data = {
                "status": "ok",
                "workflows": active_keys,  # Using active API keys as proxy for workflows
                "runs": total_calls,       # Using API calls as proxy for runs
                "ai_credits": 0,           # Not yet tracked
                "source": "database"
            }
            
            return jsonify(data), 200
            
        except sqlite3.OperationalError:
            # Table doesn't exist yet, return safe stub
            db.close()
            data = {
                "status": "ok",
                "workflows": 0,
                "runs": 0,
                "ai_credits": 0,
                "source": "stub"
            }
            return jsonify(data), 200
            
    except Exception as e:
        # Graceful fallback to stub on any error
        data = {
            "status": "ok",
            "workflows": 0,
            "runs": 0,
            "ai_credits": 0,
            "source": "stub",
            "error": str(e)
        }
        return jsonify(data), 200
