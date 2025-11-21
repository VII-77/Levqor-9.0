"""
Automation Intelligence - System Monitoring
Collects metrics, detects anomalies, triggers self-healing
"""
import os
import time
import json
import requests
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sqlite3

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def collect_metrics() -> Dict:
    """
    Collect system health metrics from all endpoints
    
    Returns:
        Dict with health status and metrics
    """
    health = {
        'timestamp': datetime.utcnow().isoformat(),
        'frontend_status': 0,
        'backend_status': 0,
        'latency_ms': 0,
        'error': None
    }
    
    # Check frontend
    try:
        resp = requests.get("https://levqor.ai/", timeout=5)
        health['frontend_status'] = resp.status_code
    except Exception as e:
        health['error'] = f"Frontend: {str(e)}"
    
    # Check backend
    try:
        start = time.time()
        resp = requests.get("https://api.levqor.ai/health", timeout=5)
        health['backend_status'] = resp.status_code
        health['latency_ms'] = int((time.time() - start) * 1000)
    except Exception as e:
        health['error'] = f"Backend: {str(e)}"
    
    # Store in database
    db = get_db()
    cursor = db.cursor()
    
    # Create table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_health_log(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            frontend_status INTEGER,
            backend_status INTEGER,
            latency_ms INTEGER,
            error TEXT
        )
    """)
    
    cursor.execute("""
        INSERT INTO system_health_log (timestamp, frontend_status, backend_status, latency_ms, error)
        VALUES (?, ?, ?, ?, ?)
    """, (
        health['timestamp'],
        health['frontend_status'],
        health['backend_status'],
        health['latency_ms'],
        health['error']
    ))
    
    db.commit()
    db.close()
    
    print(f"✅ Metrics collected: {health['backend_status']} backend, {health['latency_ms']}ms")
    
    return health

def detect_anomalies(window: int = 20) -> Optional[Dict]:
    """
    Detect anomalies in recent metrics using statistical analysis
    
    Args:
        window: Number of recent records to analyze
        
    Returns:
        Anomaly dict if detected, None otherwise
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get recent metrics
    cursor.execute("""
        SELECT latency_ms, backend_status
        FROM system_health_log
        WHERE latency_ms IS NOT NULL AND latency_ms > 0
        ORDER BY timestamp DESC
        LIMIT ?
    """, (window,))
    
    rows = cursor.fetchall()
    
    if len(rows) < 5:
        db.close()
        return None
    
    latencies = [row[0] for row in rows]
    statuses = [row[1] for row in rows]
    
    # Calculate statistics
    mean_latency = statistics.mean(latencies)
    stdev_latency = statistics.pstdev(latencies) if len(latencies) > 1 else 0
    
    anomaly = None
    
    # Check for latency spike (> 2 standard deviations)
    if stdev_latency > 0 and latencies[0] > mean_latency + 2 * stdev_latency:
        anomaly = {
            'type': 'latency_spike',
            'current': latencies[0],
            'mean': mean_latency,
            'threshold': mean_latency + 2 * stdev_latency,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Log anomaly
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intel_events(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                value REAL,
                mean REAL,
                timestamp TEXT NOT NULL,
                metadata TEXT
            )
        """)
        
        cursor.execute("""
            INSERT INTO intel_events (event, value, mean, timestamp, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (
            'latency_spike',
            latencies[0],
            mean_latency,
            anomaly['timestamp'],
            json.dumps({'threshold': anomaly['threshold']})
        ))
        
        db.commit()
        
        print(f"⚠️ ANOMALY DETECTED: Latency spike {latencies[0]:.0f}ms (avg {mean_latency:.0f}ms)")
        
        # Send alert
        try:
            from modules.auto_intel.alerts import notify
            notify(
                "⚠️ High latency detected",
                f"Current {latencies[0]:.0f} ms vs avg {mean_latency:.0f} ms"
            )
        except Exception as e:
            print(f"⚠️ Alert failed: {e}")
    
    # Check for backend failures
    failed_count = sum(1 for s in statuses[:5] if s != 200)
    if failed_count >= 3:
        anomaly = {
            'type': 'backend_failures',
            'failed_count': failed_count,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        print(f"⚠️ ANOMALY DETECTED: {failed_count} backend failures in last 5 checks")
        
        try:
            from modules.auto_intel.alerts import notify
            notify(
                "⚠️ Backend health degraded",
                f"{failed_count}/5 recent checks failed"
            )
        except Exception as e:
            print(f"⚠️ Alert failed: {e}")
    
    db.close()
    
    return anomaly

def get_recent_anomalies(limit: int = 10) -> List[Dict]:
    """
    Get recent anomaly events
    
    Args:
        limit: Max number of events to return
        
    Returns:
        List of anomaly dicts
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT event_type, severity, message, timestamp, metadata
        FROM intel_events
        WHERE severity IN ('high', 'critical')
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    db.close()
    
    anomalies = []
    for row in rows:
        anomalies.append({
            'event': row[0],
            'severity': row[1],
            'message': row[2],
            'timestamp': row[3],
            'metadata': json.loads(row[4]) if row[4] else {}
        })
    
    return anomalies
