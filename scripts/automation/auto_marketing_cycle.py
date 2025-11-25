#!/usr/bin/env python3
"""
Auto-Marketing Cycle Script - MEGA PHASE v11-v14
Generates marketing recommendations based on user segments

This script:
- Queries DB for user segments (new signups, active trials, churned)
- Uses AI advisor patterns to propose next actions
- Outputs recommendations to stdout and logs/auto_marketing.log
- Does NOT send emails directly (TODO: wire to email provider)

Usage: python scripts/automation/auto_marketing_cycle.py
"""
import os
import sys
import json
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from modules.db_wrapper import execute_query, get_db_type

LOG_FILE = os.path.join(os.getcwd(), "logs", "auto_marketing.log")
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
log = logging.getLogger("auto_marketing")

EMAIL_TEMPLATES = {
    "welcome": {
        "subject": "Welcome to Levqor - Your Automation Journey Begins",
        "body_summary": "Introduce platform features, quick-start guide, first workflow tutorial"
    },
    "trial_day_3": {
        "subject": "How's your Levqor trial going?",
        "body_summary": "Check-in, offer help, highlight key features they haven't tried"
    },
    "trial_day_5": {
        "subject": "Only 2 days left on your trial - Here's what you'll miss",
        "body_summary": "Urgency, ROI calculator, special offer for early conversion"
    },
    "nurture_case_study": {
        "subject": "How [Industry] companies save 10+ hours/week with Levqor",
        "body_summary": "Case study, testimonials, relevant use cases"
    },
    "winback": {
        "subject": "We miss you! Here's what's new at Levqor",
        "body_summary": "New features since they left, special comeback offer, no-commitment chat"
    },
    "inactive_30d": {
        "subject": "Your workflows miss you",
        "body_summary": "Gentle reminder, help offer, highlight value they're missing"
    }
}


def get_new_signups(days: int = 7) -> List[Dict]:
    cutoff = time.time() - (days * 24 * 60 * 60)
    try:
        result = execute_query(
            "SELECT id, email, name, created_at FROM users WHERE created_at > ?",
            (cutoff,),
            fetch='all'
        )
        return result or []
    except Exception as e:
        log.warning(f"Could not query new signups: {e}")
        return []


def get_active_trials() -> List[Dict]:
    try:
        result = execute_query(
            """SELECT id, email, name, created_at, meta FROM users 
               WHERE meta LIKE '%trial%' OR meta LIKE '%Trial%'""",
            fetch='all'
        )
        return result or []
    except Exception as e:
        log.warning(f"Could not query active trials: {e}")
        return []


def get_inactive_users(inactive_days: int = 30) -> List[Dict]:
    cutoff = time.time() - (inactive_days * 24 * 60 * 60)
    try:
        result = execute_query(
            "SELECT id, email, name, updated_at FROM users WHERE updated_at < ?",
            (cutoff,),
            fetch='all'
        )
        return result or []
    except Exception as e:
        log.warning(f"Could not query inactive users: {e}")
        return []


def generate_recommendations() -> List[Dict]:
    recommendations = []
    now = datetime.utcnow().isoformat()
    
    new_signups = get_new_signups(days=7)
    log.info(f"Found {len(new_signups)} new signups in last 7 days")
    for user in new_signups[:50]:
        email = user.get('email', 'unknown')
        created = user.get('created_at', 0)
        days_since = (time.time() - created) / (24 * 60 * 60) if created else 0
        
        if days_since < 1:
            template = EMAIL_TEMPLATES["welcome"]
            action = "send_welcome_sequence"
        elif days_since < 3:
            template = EMAIL_TEMPLATES["trial_day_3"]
            action = "send_trial_checkin"
        else:
            template = EMAIL_TEMPLATES["nurture_case_study"]
            action = "send_case_study"
        
        recommendations.append({
            "timestamp": now,
            "segment": "new_signup",
            "user_id": user.get('id'),
            "email": _mask_email(email),
            "action": action,
            "template": template["subject"],
            "body_summary": template["body_summary"],
            "priority": "high" if days_since < 1 else "medium"
        })
    
    trials = get_active_trials()
    log.info(f"Found {len(trials)} active trial users")
    for user in trials[:30]:
        email = user.get('email', 'unknown')
        template = EMAIL_TEMPLATES["trial_day_5"]
        
        recommendations.append({
            "timestamp": now,
            "segment": "active_trial",
            "user_id": user.get('id'),
            "email": _mask_email(email),
            "action": "send_trial_urgency",
            "template": template["subject"],
            "body_summary": template["body_summary"],
            "priority": "high"
        })
    
    inactive = get_inactive_users(inactive_days=30)
    log.info(f"Found {len(inactive)} inactive users (30+ days)")
    for user in inactive[:20]:
        email = user.get('email', 'unknown')
        template = EMAIL_TEMPLATES["winback"]
        
        recommendations.append({
            "timestamp": now,
            "segment": "churned_inactive",
            "user_id": user.get('id'),
            "email": _mask_email(email),
            "action": "send_winback_email",
            "template": template["subject"],
            "body_summary": template["body_summary"],
            "priority": "medium"
        })
    
    return recommendations


def _mask_email(email: str) -> str:
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 3:
        return f"{local[0]}***@{domain}"
    return f"{local[:3]}***@{domain}"


def main():
    log.info("=" * 60)
    log.info("AUTO-MARKETING CYCLE STARTED")
    log.info(f"Database type: {get_db_type()}")
    log.info("=" * 60)
    
    recommendations = generate_recommendations()
    
    log.info(f"\nGenerated {len(recommendations)} marketing recommendations:")
    log.info("-" * 40)
    
    by_segment = {}
    for rec in recommendations:
        segment = rec.get("segment", "unknown")
        by_segment[segment] = by_segment.get(segment, 0) + 1
    
    for segment, count in by_segment.items():
        log.info(f"  {segment}: {count} recommendations")
    
    log.info("-" * 40)
    log.info("\nSAMPLE RECOMMENDATIONS (first 5):")
    for rec in recommendations[:5]:
        log.info(f"  [{rec['priority'].upper()}] {rec['action']}")
        log.info(f"    Segment: {rec['segment']}")
        log.info(f"    Email: {_truncate_email(rec['email'])}")
        log.info(f"    Subject: {rec['template']}")
        log.info("")
    
    log.info("=" * 60)
    log.info("NOTE: This script generates recommendations only.")
    log.info("TODO: Wire to email provider (Resend, SendGrid, etc.)")
    log.info(f"Full log saved to: {LOG_FILE}")
    log.info("=" * 60)
    
    return recommendations


if __name__ == "__main__":
    main()
