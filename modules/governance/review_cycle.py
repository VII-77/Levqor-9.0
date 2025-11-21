"""
Partner Review Cycle
Identifies partners due for quarterly review
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

def load_policy() -> Dict[str, Any]:
    """Load governance policy"""
    policy_path = os.path.join(os.path.dirname(__file__), "policy.json")
    with open(policy_path, 'r') as f:
        return json.load(f)

def get_partners_due_for_review() -> List[Dict[str, Any]]:
    """
    Get partners due for quarterly review
    
    Returns:
        List of partners needing review
    """
    policy = load_policy()
    review_cycle_days = policy["review_cycle_days"]
    
    db = get_db()
    cursor = db.cursor()
    
    # Calculate cutoff timestamp
    cutoff_dt = datetime.now() - timedelta(days=review_cycle_days)
    cutoff_ts = cutoff_dt.timestamp()
    
    cursor.execute("""
        SELECT id, name, email, created_at, updated_at
        FROM partners
        WHERE is_active = 1
          AND (
            created_at < ?
            OR (updated_at IS NOT NULL AND updated_at < ?)
          )
    """, (cutoff_ts, cutoff_ts))
    
    partners = []
    for row in cursor.fetchall():
        pid, name, email, created_at, updated_at = row
        
        # Determine which timestamp to use
        last_review_ts = updated_at if updated_at else created_at
        last_review_dt = datetime.fromtimestamp(last_review_ts)
        days_since_review = (datetime.now() - last_review_dt).days
        
        partners.append({
            "id": pid,
            "name": name,
            "email": email,
            "last_review_date": last_review_dt.isoformat(),
            "days_since_review": days_since_review,
            "review_overdue_by_days": days_since_review - review_cycle_days
        })
    
    db.close()
    
    return partners

def mark_partner_reviewed(partner_id: str) -> bool:
    """
    Mark a partner as reviewed (updates updated_at timestamp)
    
    Args:
        partner_id: Partner UUID
        
    Returns:
        True if successful
    """
    from time import time
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        UPDATE partners
        SET updated_at = ?
        WHERE id = ?
    """, (time(), partner_id))
    
    success = cursor.rowcount > 0
    
    db.commit()
    db.close()
    
    if success:
        print(f"✅ Partner {partner_id} marked as reviewed")
    
    return success

def generate_review_report() -> Dict[str, Any]:
    """
    Generate a comprehensive review cycle report
    
    Returns:
        Review cycle report
    """
    due_partners = get_partners_due_for_review()
    policy = load_policy()
    
    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "review_cycle_days": policy["review_cycle_days"],
        "partners_due_for_review": len(due_partners),
        "partners": due_partners,
        "most_overdue": None
    }
    
    if due_partners:
        # Find most overdue
        most_overdue = max(due_partners, key=lambda p: p["review_overdue_by_days"])
        report["most_overdue"] = {
            "name": most_overdue["name"],
            "days_overdue": most_overdue["review_overdue_by_days"]
        }
    
    print(f"📋 Review Report: {len(due_partners)} partners due for review")
    
    return report

def send_review_notifications() -> int:
    """
    Send review notifications to partners due for review
    
    Returns:
        Number of notifications sent
    """
    due_partners = get_partners_due_for_review()
    
    if not due_partners:
        print("✅ No partners due for review")
        return 0
    
    db = get_db()
    cursor = db.cursor()
    sent_count = 0
    
    for partner in due_partners:
        # Get partner webhook for notification
        cursor.execute("""
            SELECT id, name, webhook_url
            FROM partners
            WHERE id = ?
        """, (partner["id"],))
        
        p = cursor.fetchone()
        
        if p and p[2]:  # Has webhook
            try:
                from modules.partner_api.hooks import trigger_partner_event
                partner_dict = {"id": p[0], "name": p[1], "webhook_url": p[2]}
                
                success = trigger_partner_event(
                    partner_dict,
                    "review.due",
                    {
                        "review_due_date": datetime.now().isoformat(),
                        "days_overdue": partner["review_overdue_by_days"],
                        "message": "Your partnership is due for quarterly review"
                    }
                )
                
                if success:
                    sent_count += 1
                    
            except Exception as e:
                print(f"⚠️ Failed to notify partner {partner['name']}: {e}")
    
    db.close()
    
    print(f"📧 Sent {sent_count} review notifications")
    return sent_count
