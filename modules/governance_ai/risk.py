"""
Governance AI - Risk Scoring
Evaluates ecosystem security and compliance risk
"""
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Dict
import json

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def evaluate_risk() -> Dict:
    """
    Calculate governance risk score based on multiple factors
    
    Returns:
        Dict with risk score and contributing factors
    """
    db = get_db()
    cursor = db.cursor()
    
    risk_factors = []
    risk_score = 100  # Start at 100 (perfect), deduct for issues
    
    # Check audit logs for critical incidents
    cursor.execute("""
        SELECT COUNT(*)
        FROM audit_logs
        WHERE timestamp > ?
    """, ((datetime.now() - timedelta(days=30)).timestamp(),))
    
    recent_audits = cursor.fetchone()
    if recent_audits and recent_audits[0]:
        audit_count = recent_audits[0]
        # Deduct points for high audit activity (could indicate issues)
        if audit_count > 100:
            deduction = min(20, (audit_count - 100) * 0.2)
            risk_score -= deduction
            risk_factors.append(f"High audit activity: {audit_count} events")
    
    # Check partner verification status
    cursor.execute("""
        SELECT COUNT(*), SUM(CASE WHEN is_verified = 0 THEN 1 ELSE 0 END)
        FROM partners
        WHERE is_active = 1
    """)
    
    partner_row = cursor.fetchone()
    if partner_row and partner_row[0]:
        total = partner_row[0]
        unverified = partner_row[1] or 0
        
        if total > 0:
            unverified_pct = (unverified / total) * 100
            if unverified_pct > 30:
                deduction = min(15, unverified_pct * 0.5)
                risk_score -= deduction
                risk_factors.append(f"{unverified_pct:.0f}% partners unverified")
    
    # Check for marketplace compliance
    cursor.execute("""
        SELECT COUNT(*), AVG(rating)
        FROM listings
        WHERE is_active = 1 AND is_verified = 1 AND rating IS NOT NULL
    """)
    
    listing_row = cursor.fetchone()
    if listing_row and listing_row[0]:
        count = listing_row[0]
        avg_rating = listing_row[1] or 0
        
        if avg_rating < 3.0:
            deduction = (3.0 - avg_rating) * 10
            risk_score -= deduction
            risk_factors.append(f"Low marketplace rating: {avg_rating:.1f}/5.0")
    
    # Check system health incidents
    cursor.execute("""
        SELECT COUNT(*)
        FROM intel_events
        WHERE timestamp > ?
          AND event IN ('latency_spike', 'backend_failures')
    """, (datetime.now() - timedelta(days=7).isoformat(),))
    
    incident_row = cursor.fetchone()
    if incident_row and incident_row[0]:
        incidents = incident_row[0]
        if incidents > 5:
            deduction = min(20, incidents * 2)
            risk_score -= deduction
            risk_factors.append(f"{incidents} system incidents in 7 days")
    
    # Ensure score is within bounds
    risk_score = max(0, min(100, risk_score))
    
    # Determine risk level
    if risk_score >= 80:
        risk_level = "low"
    elif risk_score >= 60:
        risk_level = "medium"
    elif risk_score >= 40:
        risk_level = "high"
    else:
        risk_level = "critical"
    
    result = {
        "risk_score": int(risk_score),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Store in database
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS governance_scores(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            risk_factors TEXT
        )
    """)
    
    cursor.execute("""
        INSERT INTO governance_scores (timestamp, risk_score, risk_level, risk_factors)
        VALUES (?, ?, ?, ?)
    """, (result["timestamp"], result["risk_score"], result["risk_level"], json.dumps(risk_factors)))
    
    db.commit()
    db.close()
    
    print(f"⚖️ Governance Risk Score: {risk_score}/100 ({risk_level})")
    for factor in risk_factors:
        print(f"   - {factor}")
    
    return result

def get_risk_history(limit: int = 30) -> list:
    """
    Get historical risk scores
    
    Args:
        limit: Number of historical scores to return
        
    Returns:
        List of risk score dicts
    """
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT timestamp, risk_score, risk_level, risk_factors
        FROM governance_scores
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    db.close()
    
    history = []
    for row in rows:
        history.append({
            'timestamp': row[0],
            'risk_score': row[1],
            'risk_level': row[2],
            'risk_factors': json.loads(row[3]) if row[3] else []
        })
    
    return history
