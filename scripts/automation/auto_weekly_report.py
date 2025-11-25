#!/usr/bin/env python3
"""
Auto-Weekly Report Script - MEGA PHASE v11-v14
Generates a weekly summary report of platform metrics

This script:
- Aggregates metrics from the database (users, activity)
- Generates a plaintext/Markdown summary
- Outputs to stdout and logs/weekly_report.md
- TODO: Send via email or to Notion/Drive

Usage: python scripts/automation/auto_weekly_report.py
Suggest scheduling with cron/Make/External scheduler to run weekly.
"""
import os
import sys
import time
from datetime import datetime, timedelta
from typing import Dict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from modules.db_wrapper import execute_query, get_db_type

REPORT_FILE = os.path.join(os.getcwd(), "logs", "weekly_report.md")
os.makedirs(os.path.dirname(REPORT_FILE), exist_ok=True)


def get_new_tenants_count(days: int = 7) -> int:
    cutoff = time.time() - (days * 24 * 60 * 60)
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM users WHERE created_at > ?",
            (cutoff,),
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception:
        return 0


def get_total_users() -> int:
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM users",
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception:
        return 0


def get_active_users(days: int = 7) -> int:
    cutoff = time.time() - (days * 24 * 60 * 60)
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM users WHERE updated_at > ?",
            (cutoff,),
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception:
        return 0


def get_api_usage_count(days: int = 7) -> int:
    cutoff = time.time() - (days * 24 * 60 * 60)
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM api_usage_log WHERE created_at > ?",
            (cutoff,),
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception:
        return 0


def get_marketplace_orders(days: int = 7) -> Dict:
    cutoff = time.time() - (days * 24 * 60 * 60)
    try:
        result = execute_query(
            """SELECT COUNT(*) as count, COALESCE(SUM(amount_cents), 0) as revenue 
               FROM marketplace_orders WHERE created_at > ?""",
            (cutoff,),
            fetch='one'
        )
        return {
            "count": result.get('count', 0) if result else 0,
            "revenue_cents": result.get('revenue', 0) if result else 0
        }
    except Exception:
        return {"count": 0, "revenue_cents": 0}


def get_partner_count() -> int:
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM partners WHERE is_active = 1",
            fetch='one'
        )
        return result.get('count', 0) if result else 0
    except Exception:
        return 0


def get_referral_stats(days: int = 7) -> Dict:
    referrals_file = os.path.join(os.getcwd(), "workspace-data", "referrals", "referrals.jsonl")
    if not os.path.exists(referrals_file):
        return {"total": 0, "this_week": 0}
    
    import json
    cutoff = time.time() - (days * 24 * 60 * 60)
    total = 0
    this_week = 0
    
    try:
        with open(referrals_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        total += 1
                        created = record.get('created_at', 0)
                        if created > cutoff:
                            this_week += 1
                    except json.JSONDecodeError:
                        pass
    except Exception:
        pass
    
    return {"total": total, "this_week": this_week}


def generate_report() -> str:
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    
    new_tenants = get_new_tenants_count()
    total_users = get_total_users()
    active_users = get_active_users()
    api_usage = get_api_usage_count()
    marketplace = get_marketplace_orders()
    partners = get_partner_count()
    referrals = get_referral_stats()
    
    report = f"""# Levqor Weekly Report

**Report Period:** {week_start.strftime('%Y-%m-%d')} to {now.strftime('%Y-%m-%d')}
**Generated:** {now.strftime('%Y-%m-%d %H:%M:%S')} UTC
**Database:** {get_db_type()}

---

## User Metrics

| Metric | Value |
|--------|-------|
| New Signups (7d) | {new_tenants} |
| Total Users | {total_users} |
| Active Users (7d) | {active_users} |

## Platform Activity

| Metric | Value |
|--------|-------|
| API Calls (7d) | {api_usage} |
| Active Partners | {partners} |

## Growth Metrics

| Metric | Value |
|--------|-------|
| Total Referrals | {referrals['total']} |
| New Referrals (7d) | {referrals['this_week']} |

## Marketplace

| Metric | Value |
|--------|-------|
| Orders (7d) | {marketplace['count']} |
| Revenue (7d) | £{marketplace['revenue_cents'] / 100:.2f} |

---

## Health Status

- Database: {get_db_type().upper()}
- Report generated successfully

---

*This report was auto-generated by Levqor Auto-Reports.*
*TODO: Send via email or sync to Notion/Drive.*
"""
    return report


def main():
    print("=" * 60)
    print("LEVQOR AUTO-WEEKLY REPORT")
    print("=" * 60)
    
    report = generate_report()
    
    print(report)
    
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("=" * 60)
    print(f"Report saved to: {REPORT_FILE}")
    print("TODO: Schedule with cron/external scheduler for weekly runs")
    print("=" * 60)
    
    return report


if __name__ == "__main__":
    main()
