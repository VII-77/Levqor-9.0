"""
Data Insights Aggregator
Collects metrics from Notion, Stripe, API usage, and integrity runs
"""
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any

def get_db_connection():
    """Get SQLite database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def fetch_api_usage_agg(since: str) -> Dict[str, Any]:
    """Fetch API usage aggregates from database"""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Get total API calls from developer usage
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT user_id) as users,
                SUM(calls_used) as total_calls,
                AVG(calls_used) as avg_calls_per_user
            FROM developer_keys
            WHERE created_at >= ?
        """, (datetime.fromisoformat(since).timestamp(),))
        
        row = cursor.fetchone()
        db.close()
        
        return {
            "users": row[0] if row else 0,
            "calls": row[1] if row else 0,
            "avg_per_user": round(row[2], 2) if row and row[2] else 0
        }
    except Exception as e:
        print(f"Error fetching API usage: {e}")
        return {"users": 0, "calls": 0, "avg_per_user": 0}

def fetch_integrity_runs(since: str) -> Dict[str, Any]:
    """Mock integrity runs data (replace with actual DB query)"""
    # TODO: Query from actual integrity runs table if exists
    return {
        "count": 0,
        "pass_rate": 0
    }

def get_revenue_summary(since: str) -> Dict[str, Any]:
    """Get revenue summary from Stripe (mock for now)"""
    # TODO: Integrate with actual Stripe API
    return {
        "total": 0,
        "mrr": 0,
        "by_product": {}
    }

def aggregate(period_days: int = 90) -> Dict[str, Any]:
    """
    Aggregate all metrics for insights report
    
    Args:
        period_days: Number of days to aggregate
        
    Returns:
        Dictionary of KPIs
    """
    since = (datetime.utcnow() - timedelta(days=period_days)).isoformat()
    
    kpis = {
        "period_days": period_days,
        "generated_at": datetime.utcnow().isoformat(),
        "revenue": get_revenue_summary(since=since),
        "api_usage": fetch_api_usage_agg(since=since),
        "integrity_runs": fetch_integrity_runs(since=since),
    }
    
    # Calculate derived metrics
    kpis["uptime_avg"] = 99.9  # TODO: Calculate from actual uptime logs
    kpis["net_margin_est"] = kpis["revenue"].get("total", 0) - 0  # TODO: Subtract actual costs
    
    return kpis
