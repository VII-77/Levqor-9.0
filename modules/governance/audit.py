"""
Partner Audit System
Conducts regular security and compliance audits of partners
"""
import sqlite3
import os
from time import time
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

def audit_partner(partner_id: str) -> Dict[str, Any]:
    """
    Audit a single partner for compliance
    
    Args:
        partner_id: Partner UUID
        
    Returns:
        Audit report dict
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get partner info
    cursor.execute("""
        SELECT id, name, email, webhook_url, is_verified,
               is_active, created_at
        FROM partners
        WHERE id = ?
    """, (partner_id,))
    
    partner = cursor.fetchone()
    
    if not partner:
        return {"error": "partner_not_found"}
    
    pid, name, email, webhook_url, is_verified, is_active, created_at = partner
    
    # Get partner's listings
    cursor.execute("""
        SELECT COUNT(*), SUM(downloads), AVG(rating)
        FROM listings
        WHERE partner_id = ? AND is_active = 1
    """, (partner_id,))
    
    listings_stats = cursor.fetchone()
    total_listings = listings_stats[0] or 0
    total_downloads = listings_stats[1] or 0
    avg_rating = listings_stats[2]
    
    # Get sales history
    cursor.execute("""
        SELECT COUNT(*), SUM(amount_cents)
        FROM marketplace_orders
        WHERE partner_id = ?
    """, (partner_id,))
    
    sales_stats = cursor.fetchone()
    total_sales = sales_stats[0] or 0
    total_revenue_cents = sales_stats[1] or 0
    
    db.close()
    
    # Load policy for compliance checks
    policy = load_policy()
    
    # Compliance checks
    issues = []
    warnings = []
    
    if not is_verified:
        warnings.append("Partner not verified")
    
    if not is_active:
        warnings.append("Partner inactive")
    
    if webhook_url and not webhook_url.startswith("https://"):
        issues.append("Webhook URL not using HTTPS")
    
    if avg_rating and avg_rating < policy["auto_suspend_threshold"]["low_rating"]:
        issues.append(f"Low average rating: {avg_rating:.1f}")
    
    # Check if review is due
    review_cycle_days = policy["review_cycle_days"]
    created_dt = datetime.fromtimestamp(created_at)
    days_since_creation = (datetime.now() - created_dt).days
    review_due = days_since_creation >= review_cycle_days
    
    audit_report = {
        "partner_id": pid,
        "partner_name": name,
        "email": email,
        "is_verified": bool(is_verified),
        "is_active": bool(is_active),
        "total_listings": total_listings,
        "total_downloads": int(total_downloads),
        "avg_rating": float(avg_rating) if avg_rating else None,
        "total_sales": total_sales,
        "total_revenue": total_revenue_cents / 100.0,
        "days_since_creation": days_since_creation,
        "review_due": review_due,
        "compliance_issues": issues,
        "warnings": warnings,
        "audit_timestamp": datetime.utcnow().isoformat(),
        "status": "compliant" if not issues else "issues_found"
    }
    
    return audit_report

def run_full_audit() -> Dict[str, Any]:
    """
    Run audit on all verified partners
    
    Returns:
        Audit summary
    """
    db = get_db()
    cursor = db.cursor()
    
    # Get all verified active partners
    cursor.execute("""
        SELECT id, name
        FROM partners
        WHERE is_verified = 1 AND is_active = 1
    """)
    
    partners = cursor.fetchall()
    
    audit_results = []
    issues_count = 0
    compliant_count = 0
    
    for partner_id, partner_name in partners:
        report = audit_partner(partner_id)
        audit_results.append(report)
        
        if report.get("status") == "compliant":
            compliant_count += 1
        else:
            issues_count += 1
        
        # Send audit notification to partner
        try:
            from modules.partner_api.hooks import trigger_partner_event
            cursor.execute("""
                SELECT id, name, webhook_url
                FROM partners
                WHERE id = ?
            """, (partner_id,))
            p = cursor.fetchone()
            if p and p[2]:  # Has webhook
                partner_dict = {"id": p[0], "name": p[1], "webhook_url": p[2]}
                trigger_partner_event(
                    partner_dict,
                    "audit.completed",
                    {
                        "audit_date": datetime.utcnow().isoformat(),
                        "status": report["status"],
                        "issues_count": len(report["compliance_issues"])
                    }
                )
        except Exception as e:
            print(f"⚠️ Failed to notify partner {partner_name}: {e}")
    
    # Log audit to database
    audit_id = f"audit_{int(time())}"
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs(
            id TEXT PRIMARY KEY,
            timestamp REAL NOT NULL,
            partners_checked INTEGER NOT NULL,
            issues_found INTEGER NOT NULL,
            compliant INTEGER NOT NULL,
            report_json TEXT
        )
    """)
    
    cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, partners_checked, issues_found, compliant, report_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        audit_id,
        time(),
        len(partners),
        issues_count,
        compliant_count,
        json.dumps(audit_results)
    ))
    
    db.commit()
    db.close()
    
    summary = {
        "audit_id": audit_id,
        "timestamp": datetime.utcnow().isoformat(),
        "total_partners_audited": len(partners),
        "compliant": compliant_count,
        "issues_found": issues_count,
        "audit_results": audit_results
    }
    
    print(f"✅ Audit completed: {compliant_count} compliant, {issues_count} with issues")
    
    # Log to Notion if available
    try:
        log_audit_to_notion(summary)
    except Exception as e:
        print(f"⚠️ Notion audit logging failed: {e}")
    
    return summary

def log_audit_to_notion(summary: Dict[str, Any]) -> None:
    """Log audit to Notion"""
    import requests
    
    notion_token = os.getenv("NOTION_TOKEN", "").strip()
    audit_db_id = os.getenv("NOTION_AUDIT_LOGS_DB_ID", "").strip()
    
    if not notion_token or not audit_db_id:
        return
    
    headers = {
        "Authorization": f"Bearer {notion_token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    data = {
        "parent": {"database_id": audit_db_id},
        "properties": {
            "Audit ID": {
                "title": [{"text": {"content": summary["audit_id"]}}]
            },
            "Partners Audited": {
                "number": summary["total_partners_audited"]
            },
            "Compliant": {
                "number": summary["compliant"]
            },
            "Issues Found": {
                "number": summary["issues_found"]
            },
            "Audit Date": {
                "date": {"start": summary["timestamp"]}
            }
        }
    }
    
    try:
        response = requests.post(
            "https://api.notion.com/v1/pages",
            headers=headers,
            json=data
        )
        if response.status_code == 200:
            print(f"✅ Audit logged to Notion")
    except Exception as e:
        print(f"❌ Notion audit logging error: {e}")
