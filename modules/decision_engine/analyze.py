"""
Decision Engine - Trend Analysis
Analyzes system trends and generates optimization recommendations
"""
import sqlite3
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def analyze_trends() -> Dict[str, Any]:
    """
    Analyze recent trends and generate recommendations
    
    Returns:
        Dict with analysis results and recommendations
    """
    db = get_db()
    cursor = db.cursor()
    
    recommendations = []
    metrics = {}
    
    # Analyze system health
    cursor.execute("""
        SELECT AVG(latency_ms), COUNT(*)
        FROM system_health_log
        WHERE timestamp > datetime('now', '-7 days')
          AND latency_ms IS NOT NULL
    """)
    
    health_row = cursor.fetchone()
    if health_row and health_row[1] > 0:
        avg_latency = health_row[0] or 0
        metrics['avg_latency_7d'] = round(avg_latency, 2)
        
        if avg_latency > 500:
            recommendations.append({
                "type": "performance",
                "priority": "high",
                "message": "Average latency is high. Consider optimizing database queries or increasing resources.",
                "metric": f"{avg_latency:.0f}ms average latency"
            })
        elif avg_latency > 200:
            recommendations.append({
                "type": "performance",
                "priority": "medium",
                "message": "Latency trending upward. Monitor for continued degradation.",
                "metric": f"{avg_latency:.0f}ms average latency"
            })
    
    # Analyze API usage (if developer keys exist)
    cursor.execute("""
        SELECT COUNT(DISTINCT key_id), SUM(calls_used), AVG(calls_used * 100.0 / NULLIF(calls_limit, 0))
        FROM developer_keys
        WHERE is_active = 1
    """)
    
    api_row = cursor.fetchone()
    if api_row and api_row[0] and api_row[0] > 0:
        active_keys = api_row[0]
        total_calls = api_row[1] or 0
        avg_quota_usage = api_row[2] or 0
        
        metrics['active_api_keys'] = active_keys
        metrics['total_api_calls'] = total_calls
        metrics['avg_quota_usage_pct'] = round(avg_quota_usage, 1)
        
        if avg_quota_usage > 80:
            recommendations.append({
                "type": "capacity",
                "priority": "high",
                "message": "API quota utilization above 80%. Consider upselling Enterprise tier or increasing limits.",
                "metric": f"{avg_quota_usage:.0f}% average quota usage"
            })
    
    # Analyze partner ecosystem (if partners exist)
    cursor.execute("""
        SELECT COUNT(*), SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END)
        FROM partners
        WHERE is_active = 1
    """)
    
    partner_row = cursor.fetchone()
    if partner_row and partner_row[0] and partner_row[0] > 0:
        total_partners = partner_row[0]
        verified_partners = partner_row[1] or 0
        
        metrics['total_partners'] = total_partners
        metrics['verified_partners'] = verified_partners
        
        pending = total_partners - verified_partners
        if pending > 5:
            recommendations.append({
                "type": "growth",
                "priority": "medium",
                "message": f"{pending} partners pending verification. Review queue to enable ecosystem growth.",
                "metric": f"{pending} pending verifications"
            })
    
    # Analyze marketplace listings
    cursor.execute("""
        SELECT COUNT(*), SUM(downloads), AVG(price_cents)
        FROM listings
        WHERE is_active = 1 AND is_verified = 1
    """)
    
    listing_row = cursor.fetchone()
    if listing_row and listing_row[0] and listing_row[0] > 0:
        total_listings = listing_row[0]
        total_downloads = listing_row[1] or 0
        avg_price_cents = listing_row[2] or 0
        
        metrics['marketplace_listings'] = total_listings
        metrics['total_downloads'] = total_downloads
        metrics['avg_listing_price'] = round(avg_price_cents / 100, 2)
        
        if total_listings > 0 and total_downloads / total_listings < 10:
            recommendations.append({
                "type": "marketing",
                "priority": "medium",
                "message": "Low marketplace engagement. Consider promoting listings or improving discovery.",
                "metric": f"{total_downloads / total_listings:.1f} avg downloads per listing"
            })
    
    # Store recommendations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS intel_recommendations(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            metrics TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        INSERT INTO intel_recommendations (timestamp, recommendations, metrics)
        VALUES (?, ?, ?)
    """, (
        datetime.utcnow().isoformat(),
        json.dumps(recommendations),
        json.dumps(metrics)
    ))
    
    db.commit()
    db.close()
    
    print(f"📊 Analysis complete: {len(recommendations)} recommendations generated")
    for rec in recommendations:
        print(f"   [{rec['priority'].upper()}] {rec['message']}")
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": metrics,
        "recommendations": recommendations,
        "recommendation_count": len(recommendations)
    }

def get_recent_recommendations(limit: int = 5) -> List[Dict]:
    """
    Get recent recommendations
    
    Args:
        limit: Max number of recommendation sets to return
        
    Returns:
        List of recommendation dicts
    """
    db = get_db()
    cursor = db.cursor()
    
    # Ensure table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS intel_recommendations(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            metrics TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        SELECT timestamp, recommendations, metrics
        FROM intel_recommendations
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    db.close()
    
    results = []
    for row in rows:
        results.append({
            'timestamp': row[0],
            'recommendations': json.loads(row[1]),
            'metrics': json.loads(row[2])
        })
    
    return results
