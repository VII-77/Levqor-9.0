"""
AI Advisor - Predictive Analytics
Revenue forecasting, churn prediction, and growth modeling
"""
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

def get_db():
    """Get database connection"""
    db_path = os.environ.get("SQLITE_PATH", "levqor.db")
    return sqlite3.connect(db_path, check_same_thread=False)

def forecast_revenue(days_ahead: int = 30) -> Dict:
    """
    Forecast revenue using simple trend analysis
    
    Args:
        days_ahead: Number of days to forecast
        
    Returns:
        Dict with forecast and confidence
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get recent marketplace orders for revenue data
    cursor.execute("""
        SELECT DATE(datetime(created_at, 'unixepoch')) as date, SUM(amount_cents)
        FROM marketplace_orders
        WHERE created_at IS NOT NULL
        GROUP BY date
        ORDER BY date DESC
        LIMIT 30
    """)
    
    rows = cursor.fetchall()
    db.close()
    
    if len(rows) < 5:
        return {
            "forecast_days": days_ahead,
            "predicted_revenue": 0,
            "confidence": "low",
            "message": "Insufficient data for revenue forecast (need 5+ days of history)"
        }
    
    # Simple linear trend calculation
    revenues = [row[1] / 100.0 for row in rows]  # Convert cents to dollars
    avg_daily = sum(revenues) / len(revenues)
    
    # Calculate trend
    recent_avg = sum(revenues[:7]) / min(7, len(revenues))
    older_avg = sum(revenues[7:14]) / min(7, len(revenues[7:14])) if len(revenues) > 7 else avg_daily
    
    trend_multiplier = recent_avg / older_avg if older_avg > 0 else 1.0
    
    # Project forward
    predicted_revenue = avg_daily * days_ahead * trend_multiplier
    
    confidence = "high" if len(revenues) >= 14 else "medium" if len(revenues) >= 7 else "low"
    
    result = {
        "forecast_days": days_ahead,
        "predicted_revenue": round(predicted_revenue, 2),
        "daily_average": round(avg_daily, 2),
        "trend_multiplier": round(trend_multiplier, 3),
        "confidence": confidence,
        "data_points": len(revenues)
    }
    
    print(f"💰 Revenue Forecast: ${predicted_revenue:.2f} over {days_ahead} days ({confidence} confidence)")
    
    return result

def forecast_churn() -> Dict:
    """
    Predict user churn rate based on activity patterns
    
    Returns:
        Dict with churn metrics
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get user activity (users who haven't logged in recently)
    cutoff_date = (datetime.now() - timedelta(days=30)).timestamp()
    
    cursor.execute("""
        SELECT COUNT(*) FROM users
    """)
    total_users = cursor.fetchone()[0] or 0
    
    cursor.execute("""
        SELECT COUNT(*)
        FROM users
        WHERE last_sign_in_at IS NOT NULL
          AND last_sign_in_at < ?
    """, (cutoff_date,))
    
    inactive_users = cursor.fetchone()[0] or 0
    
    db.close()
    
    if total_users == 0:
        return {
            "churn_rate": 0,
            "churned_users": 0,
            "total_users": 0,
            "message": "No user data available"
        }
    
    churn_rate = round(100 * inactive_users / total_users, 2)
    
    result = {
        "churn_rate": churn_rate,
        "churned_users": inactive_users,
        "active_users": total_users - inactive_users,
        "total_users": total_users,
        "threshold_days": 30
    }
    
    print(f"📉 Churn Analysis: {churn_rate}% ({inactive_users}/{total_users} users inactive 30+ days)")
    
    return result

def forecast_partner_health() -> Dict:
    """
    Analyze partner ecosystem health and growth trajectory
    
    Returns:
        Dict with partner health metrics
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get partner metrics
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM partners
    """)
    
    partner_row = cursor.fetchone()
    
    # Get listing metrics
    cursor.execute("""
        SELECT COUNT(*), SUM(downloads)
        FROM listings
        WHERE is_active = 1
    """)
    
    listing_row = cursor.fetchone()
    
    db.close()
    
    total_partners = partner_row[0] if partner_row else 0
    verified_partners = partner_row[1] if partner_row else 0
    active_partners = partner_row[2] if partner_row else 0
    
    total_listings = listing_row[0] if listing_row and listing_row[0] else 0
    total_downloads = listing_row[1] if listing_row and listing_row[1] else 0
    
    # Calculate health score (0-100)
    health_score = 0
    if total_partners > 0:
        verification_rate = verified_partners / total_partners
        activity_rate = active_partners / total_partners
        listings_per_partner = total_listings / total_partners if total_partners > 0 else 0
        
        health_score = int(
            (verification_rate * 40) +
            (activity_rate * 30) +
            (min(listings_per_partner, 3) / 3 * 30)
        )
    
    result = {
        "health_score": health_score,
        "total_partners": total_partners,
        "verified_partners": verified_partners,
        "active_partners": active_partners,
        "total_listings": total_listings,
        "total_downloads": total_downloads,
        "avg_listings_per_partner": round(total_listings / total_partners, 2) if total_partners > 0 else 0
    }
    
    print(f"🤝 Partner Health: {health_score}/100 ({total_partners} partners, {total_listings} listings)")
    
    return result

def generate_ai_insights() -> Dict:
    """
    Generate comprehensive AI insights combining all forecasts
    
    Returns:
        Dict with all AI advisor insights
    """
    insights = {
        "timestamp": datetime.utcnow().isoformat(),
        "revenue_forecast": forecast_revenue(30),
        "churn_analysis": forecast_churn(),
        "partner_health": forecast_partner_health()
    }
    
    # Store in database
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_insights(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            insights TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        INSERT INTO ai_insights (timestamp, insights)
        VALUES (?, ?)
    """, (insights["timestamp"], json.dumps(insights)))
    
    db.commit()
    db.close()
    
    print("🤖 AI Insights generated and stored")
    
    return insights
