"""
Intelligence Layer Database Adapter
Production-ready PostgreSQL integration for intelligence modules
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from typing import List, Dict, Optional, Any
import json

def get_connection():
    """Get PostgreSQL connection for production"""
    return psycopg2.connect(
        os.environ.get("DATABASE_URL"),
        cursor_factory=RealDictCursor
    )

def log_health_metric(frontend: int, backend: int, latency_ms: int, error: str = None):
    """Log system health metrics to PostgreSQL"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO system_health_log (source, frontend, backend, latency_ms, error)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, ('monitor', frontend, backend, latency_ms, error))
            return cur.fetchone()['id']

def get_recent_health_logs(limit: int = 20) -> List[Dict]:
    """Get recent health metrics"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, source, frontend, backend, latency_ms, error, timestamp
                FROM system_health_log
                ORDER BY timestamp DESC
                LIMIT %s
            """, (limit,))
            return [dict(row) for row in cur.fetchall()]

def log_intel_event(event: str, value: float, mean: float):
    """Log intelligence event (anomaly detection, etc.)"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO intel_events (event, value, mean)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (event, value, mean))
            return cur.fetchone()['id']

def get_recent_events(limit: int = 20) -> List[Dict]:
    """Get recent intelligence events"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, event, value, mean, ts
                FROM intel_events
                ORDER BY ts DESC
                LIMIT %s
            """, (limit,))
            return [dict(row) for row in cur.fetchall()]

def log_intel_action(action: str, metadata: Dict[str, Any]):
    """Log self-healing action"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO intel_actions (action, meta)
                VALUES (%s, %s)
                RETURNING id
            """, (action, json.dumps(metadata)))
            return cur.fetchone()['id']

def get_recent_actions(limit: int = 10) -> List[Dict]:
    """Get recent self-healing actions"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, action, meta, ts
                FROM intel_actions
                ORDER BY ts DESC
                LIMIT %s
            """, (limit,))
            return [dict(row) for row in cur.fetchall()]

def save_recommendations(recommendations: List[Dict]):
    """Save decision engine recommendations"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO intel_recommendations (recommendations)
                VALUES (%s)
                RETURNING id
            """, (json.dumps(recommendations),))
            return cur.fetchone()['id']

def get_recent_recommendations(limit: int = 5) -> List[Dict]:
    """Get recent recommendations"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, recommendations, ts
                FROM intel_recommendations
                ORDER BY ts DESC
                LIMIT %s
            """, (limit,))
            return [dict(row) for row in cur.fetchall()]

def save_forecast(predicted_revenue: float, churn_rate: float, horizon_days: int):
    """Save AI forecast"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ai_forecasts (predicted_revenue, churn_rate, horizon_days)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (predicted_revenue, churn_rate, horizon_days))
            return cur.fetchone()['id']

def get_recent_forecasts(limit: int = 10) -> List[Dict]:
    """Get recent AI forecasts"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, predicted_revenue, churn_rate, horizon_days, ts
                FROM ai_forecasts
                ORDER BY ts DESC
                LIMIT %s
            """, (limit,))
            return [dict(row) for row in cur.fetchall()]

def get_intelligence_summary() -> Dict:
    """Get comprehensive intelligence summary for dashboard"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Get recent anomalies (events with value > mean + 2*stddev)
            cur.execute("""
                SELECT COUNT(*) as anomaly_count
                FROM intel_events
                WHERE ts > NOW() - INTERVAL '24 hours'
                AND value > mean * 1.5
            """)
            anomaly_count = cur.fetchone()['anomaly_count']
            
            # Get recent actions
            cur.execute("""
                SELECT COUNT(*) as action_count
                FROM intel_actions
                WHERE ts > NOW() - INTERVAL '24 hours'
            """)
            action_count = cur.fetchone()['action_count']
            
            # Get latest forecast
            cur.execute("""
                SELECT predicted_revenue, churn_rate, horizon_days, ts
                FROM ai_forecasts
                ORDER BY ts DESC
                LIMIT 1
            """)
            latest_forecast = cur.fetchone()
            
            # Get health status
            cur.execute("""
                SELECT AVG(latency_ms) as avg_latency,
                       COUNT(CASE WHEN error IS NOT NULL THEN 1 END) as error_count,
                       COUNT(*) as total_checks
                FROM system_health_log
                WHERE timestamp > NOW() - INTERVAL '1 hour'
            """)
            health = cur.fetchone()
            
            return {
                "anomalies_24h": anomaly_count,
                "actions_24h": action_count,
                "latest_forecast": dict(latest_forecast) if latest_forecast else None,
                "health": {
                    "avg_latency_ms": float(health['avg_latency']) if health['avg_latency'] else 0,
                    "error_rate": (health['error_count'] / health['total_checks'] * 100) if health['total_checks'] > 0 else 0,
                    "total_checks": health['total_checks']
                }
            }
