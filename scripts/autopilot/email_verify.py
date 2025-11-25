#!/usr/bin/env python3
"""
LEVQOR EMAIL SYSTEM VERIFICATION
Validates email configuration and performs dry-run tests.
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from modules.email_service import (
    get_resend_config,
    is_email_configured,
    send_email,
    ping_resend_api,
    AUTONOMOUS_EMAILS_ALLOWED,
    FOUNDER_APPROVAL_REQUIRED_EMAILS
)

AUTOPILOT_DIR = Path("/home/runner/workspace-data/autopilot/email")


def verify_environment():
    """Step 1: Verify environment configuration"""
    config = get_resend_config()
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "checks": {
            "RESEND_API_KEY": "present" if config["api_key"] else "missing",
            "AUTH_FROM_EMAIL": config["from_email"] or "missing",
            "FOUNDER_EMAIL": config["founder_email"] or "using_auth_from_email",
            "email_configured": is_email_configured()
        }
    }
    
    env_log = AUTOPILOT_DIR / "env_check.log"
    with open(env_log, 'a') as f:
        f.write(f"\n[{results['timestamp']}] Environment Check\n")
        for key, value in results["checks"].items():
            status = "OK" if value and value not in ["missing"] else "MISSING"
            f.write(f"  {key}: {value} [{status}]\n")
    
    print("=== ENVIRONMENT VERIFICATION ===")
    for key, value in results["checks"].items():
        status = "OK" if value and value not in ["missing"] else "MISSING"
        print(f"  {key}: {value} [{status}]")
    
    return results


def verify_api_connectivity():
    """Step 2: Verify Resend API connectivity"""
    result = ping_resend_api()
    
    verify_log = AUTOPILOT_DIR / "verify.log"
    with open(verify_log, 'a') as f:
        f.write(f"\n[{datetime.now().isoformat()}] API Connectivity Check\n")
        f.write(f"  Status: {result.get('status')}\n")
        if result.get('domains'):
            f.write(f"  Domains: {result.get('domains')}\n")
            f.write(f"  Verified: {result.get('verified')}\n")
        if result.get('error'):
            f.write(f"  Error: {result.get('error')}\n")
    
    print("\n=== RESEND API CONNECTIVITY ===")
    print(f"  Status: {result.get('status')}")
    if result.get('domains') is not None:
        print(f"  Domains configured: {result.get('domains')}")
        print(f"  Domain verified: {result.get('verified')}")
    if result.get('error'):
        print(f"  Error: {result.get('error')}")
    
    return result


def perform_dry_run():
    """Step 3: Perform dry-run email test"""
    config = get_resend_config()
    
    test_email = {
        "to": config["founder_email"] or "test@example.com",
        "subject": "[TEST] Levqor Email System Verification",
        "body": "This is a dry-run test email to validate the email system configuration."
    }
    
    result = send_email(
        to=test_email["to"],
        subject=test_email["subject"],
        body=test_email["body"],
        email_type="system_health_alert",
        dry_run=True
    )
    
    verify_log = AUTOPILOT_DIR / "verify.log"
    with open(verify_log, 'a') as f:
        f.write(f"\n[{datetime.now().isoformat()}] Dry-Run Email Test\n")
        f.write(f"  Status: {result.get('status')}\n")
        f.write(f"  Dry Run: {result.get('dry_run')}\n")
        if result.get('payload'):
            f.write(f"  Payload validated: {json.dumps(result.get('payload'))}\n")
    
    print("\n=== DRY-RUN EMAIL TEST ===")
    print(f"  Status: {result.get('status')}")
    print(f"  Dry Run: {result.get('dry_run')}")
    if result.get('payload'):
        print(f"  To: {result['payload'].get('to')}")
        print(f"  Subject: {result['payload'].get('subject')}")
        print(f"  From: {result['payload'].get('from')}")
    
    return result


def list_email_permissions():
    """Step 4: List autonomous vs approval-required emails"""
    print("\n=== EMAIL PERMISSIONS ===")
    
    print("\nAUTONOMOUS (No approval needed):")
    for email_type in AUTONOMOUS_EMAILS_ALLOWED:
        print(f"  [AUTO] {email_type}")
    
    print("\nFOUNDER APPROVAL REQUIRED:")
    for email_type in FOUNDER_APPROVAL_REQUIRED_EMAILS:
        print(f"  [APPROVAL] {email_type}")
    
    verify_log = AUTOPILOT_DIR / "verify.log"
    with open(verify_log, 'a') as f:
        f.write(f"\n[{datetime.now().isoformat()}] Email Permissions\n")
        f.write(f"  Autonomous types: {len(AUTONOMOUS_EMAILS_ALLOWED)}\n")
        f.write(f"  Approval-required types: {len(FOUNDER_APPROVAL_REQUIRED_EMAILS)}\n")


def run_full_verification():
    """Run complete email system verification"""
    AUTOPILOT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("   LEVQOR EMAIL SYSTEM VERIFICATION")
    print("=" * 60)
    
    env_result = verify_environment()
    api_result = verify_api_connectivity()
    dry_run_result = perform_dry_run()
    list_email_permissions()
    
    all_ok = (
        env_result["checks"]["email_configured"] and
        api_result.get("status") == "connected" and
        dry_run_result.get("status") == "validated"
    )
    
    print("\n" + "=" * 60)
    if all_ok:
        print("   EMAIL SYSTEM: FULLY OPERATIONAL")
    else:
        print("   EMAIL SYSTEM: CONFIGURATION ISSUES DETECTED")
        if not env_result["checks"]["email_configured"]:
            print("   - Missing environment variables")
        if api_result.get("status") != "connected":
            print("   - API connectivity issue")
    print("=" * 60)
    
    return {
        "environment": env_result,
        "api": api_result,
        "dry_run": dry_run_result,
        "fully_operational": all_ok
    }


if __name__ == "__main__":
    run_full_verification()
