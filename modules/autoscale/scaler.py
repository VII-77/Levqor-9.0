"""
Dynamic Scaling Module
Auto-scales resources based on predicted load
"""
import os
import requests
import sqlite3
from datetime import datetime
from typing import Dict, Optional

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def check_load() -> Dict:
    """
    Check current system load and make scaling decisions
    
    Returns:
        Dict with load metrics and scaling action
    """
    metrics = {
        'timestamp': datetime.utcnow().isoformat(),
        'cpu_usage': 0,
        'memory_usage': 0,
        'queue_length': 0,
        'latency_ms': 0,
        'scaling_action': None
    }
    
    try:
        # Get system health metrics
        db = get_db()
        cursor = db.cursor()
        
        # Get recent latency
        cursor.execute("""
            SELECT AVG(latency_ms), MAX(latency_ms)
            FROM system_health_log
            WHERE timestamp > datetime('now', '-15 minutes')
              AND latency_ms IS NOT NULL
        """)
        
        latency_row = cursor.fetchone()
        if latency_row:
            metrics['latency_ms'] = int(latency_row[0] or 0)
            metrics['max_latency_ms'] = int(latency_row[1] or 0)
        
        # Estimate queue length from API usage
        cursor.execute("""
            SELECT COUNT(*)
            FROM api_usage_log
            WHERE created_at > ?
        """, ((datetime.now().timestamp() - 300),))  # Last 5 minutes
        
        queue_row = cursor.fetchone()
        if queue_row:
            metrics['queue_length'] = queue_row[0] or 0
        
        # Make scaling decision
        action = None
        
        # Scale up if high latency or large queue
        if metrics['latency_ms'] > 1000 or metrics['queue_length'] > 100:
            action = "scale_up"
            metrics['scaling_action'] = "scale_up"
            metrics['reason'] = f"High load detected (latency: {metrics['latency_ms']}ms, queue: {metrics['queue_length']})"
            
            print(f"⚡ SCALING UP: {metrics['reason']}")
            
            # Log scaling event
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scale_events(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    reason TEXT,
                    timestamp TEXT NOT NULL,
                    metrics TEXT
                )
            """)
            
            cursor.execute("""
                INSERT INTO scale_events (action, reason, timestamp, metrics)
                VALUES (?, ?, ?, ?)
            """, ("scale_up", metrics['reason'], metrics['timestamp'], str(metrics)))
            
            # Send alert
            try:
                from modules.auto_intel.alerts import notify
                notify("⚡ Scaling Up", metrics['reason'], "warning")
            except Exception as e:
                print(f"⚠️ Alert failed: {e}")
        
        # Scale down if idle
        elif metrics['latency_ms'] < 100 and metrics['queue_length'] == 0:
            action = "scale_down"
            metrics['scaling_action'] = "scale_down"
            metrics['reason'] = "System idle - optimizing resources"
            
            print(f"🧘 SCALING DOWN: {metrics['reason']}")
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scale_events(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    reason TEXT,
                    timestamp TEXT NOT NULL,
                    metrics TEXT
                )
            """)
            
            cursor.execute("""
                INSERT INTO scale_events (action, reason, timestamp, metrics)
                VALUES (?, ?, ?, ?)
            """, ("scale_down", metrics['reason'], metrics['timestamp'], str(metrics)))
        
        db.commit()
        db.close()
        
    except Exception as e:
        print(f"⚠️ Load check error: {e}")
        metrics['error'] = str(e)
    
    return metrics

def get_scaling_history(limit: int = 20) -> list:
    """
    Get recent scaling events
    
    Args:
        limit: Number of events to return
        
    Returns:
        List of scaling event dicts
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT action, reason, timestamp, metrics
        FROM scale_events
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    db.close()
    
    events = []
    for row in rows:
        events.append({
            'action': row[0],
            'reason': row[1],
            'timestamp': row[2],
            'metrics': row[3]
        })
    
    return events
