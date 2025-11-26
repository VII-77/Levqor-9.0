#!/usr/bin/env python3
"""
Secrets Health Monitor - Guardian Autopilot Grid

Checks presence and basic health of all external service integrations.
SECURITY: Does NOT store or log secret values - only checks presence and connectivity.
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

OUTPUT_DIR = Path("/home/runner/workspace/workspace-data/autopilot")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(OUTPUT_DIR / "secrets_health.log")
    ]
)
logger = logging.getLogger(__name__)

INTEGRATIONS = {
    "stripe": {
        "env_vars": ["STRIPE_SECRET_KEY"],
        "service": "Stripe Payments",
        "criticality": "critical",
        "test_type": "api_call"
    },
    "database": {
        "env_vars": ["DATABASE_URL"],
        "service": "PostgreSQL Database",
        "criticality": "critical",
        "test_type": "db_query"
    },
    "resend": {
        "env_vars": ["RESEND_API_KEY"],
        "service": "Resend Email",
        "criticality": "high",
        "test_type": "api_call"
    },
    "openai": {
        "env_vars": ["OPENAI_API_KEY", "AI_INTEGRATIONS_OPENAI_API_KEY"],
        "service": "OpenAI AI",
        "criticality": "high",
        "test_type": "api_call"
    },
    "nextauth": {
        "env_vars": ["NEXTAUTH_SECRET", "NEXTAUTH_URL"],
        "service": "NextAuth Authentication",
        "criticality": "critical",
        "test_type": "presence"
    },
    "telegram": {
        "env_vars": ["TELEGRAM_BOT_TOKEN"],
        "service": "Telegram Alerts",
        "criticality": "medium",
        "test_type": "api_call"
    },
    "slack": {
        "env_vars": ["SLACK_WEBHOOK_URL"],
        "service": "Slack Notifications",
        "criticality": "low",
        "test_type": "presence"
    },
    "cloudflare": {
        "env_vars": ["CLOUDFLARE_API_TOKEN"],
        "service": "Cloudflare CDN",
        "criticality": "medium",
        "test_type": "presence"
    },
    "google_oauth": {
        "env_vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
        "service": "Google OAuth",
        "criticality": "medium",
        "test_type": "presence"
    },
    "microsoft_oauth": {
        "env_vars": ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
        "service": "Microsoft OAuth",
        "criticality": "medium",
        "test_type": "presence"
    },
    "redis": {
        "env_vars": ["REDIS_URL"],
        "service": "Redis Cache",
        "criticality": "medium",
        "test_type": "connection"
    },
    "sentry": {
        "env_vars": ["SENTRY_DSN"],
        "service": "Sentry Monitoring",
        "criticality": "low",
        "test_type": "presence"
    },
    "admin": {
        "env_vars": ["ADMIN_TOKEN", "JWT_SECRET"],
        "service": "Admin Authentication",
        "criticality": "critical",
        "test_type": "presence"
    }
}


def check_presence(env_vars: list[str]) -> tuple[str, list[str]]:
    """Check if any of the env vars are present."""
    present = []
    missing = []
    for var in env_vars:
        if os.environ.get(var):
            present.append(var)
        else:
            missing.append(var)
    
    if present:
        return "OK", present
    return "MISSING", missing


def test_stripe() -> tuple[str, str]:
    """Test Stripe connectivity."""
    try:
        import stripe
        key = os.environ.get("STRIPE_SECRET_KEY", "")
        if not key:
            return "FAIL", "STRIPE_SECRET_KEY not set"
        
        stripe.api_key = key
        stripe.Account.retrieve()
        
        key_type = "LIVE" if key.startswith("sk_live_") else "TEST"
        return "OK", f"Stripe {key_type} mode active"
    except Exception as e:
        return "FAIL", str(e)[:100]


def test_database() -> tuple[str, str]:
    """Test PostgreSQL connectivity."""
    try:
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            return "FAIL", "DATABASE_URL not set"
        
        import psycopg2
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return "OK", "Database connection successful"
    except ImportError:
        try:
            from modules.db_wrapper import get_db_connection
            conn = get_db_connection()
            if conn:
                conn.close()
                return "OK", "Database connection successful (via wrapper)"
            return "WARN", "Could not verify database connection"
        except Exception as e:
            return "WARN", f"Could not import db module: {str(e)[:50]}"
    except Exception as e:
        return "FAIL", str(e)[:100]


def test_openai() -> tuple[str, str]:
    """Test OpenAI connectivity."""
    try:
        key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
        if not key:
            return "FAIL", "No OpenAI API key found"
        
        from openai import OpenAI
        client = OpenAI(api_key=key)
        models = client.models.list()
        return "OK", f"OpenAI connected, {len(list(models))} models available"
    except ImportError:
        return "WARN", "OpenAI SDK not installed"
    except Exception as e:
        return "FAIL", str(e)[:100]


def test_telegram() -> tuple[str, str]:
    """Test Telegram bot connectivity."""
    try:
        import requests
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        if not token:
            return "SKIP", "TELEGRAM_BOT_TOKEN not configured"
        
        resp = requests.get(f"https://api.telegram.org/bot{token}/getMe", timeout=5)
        if resp.ok:
            data = resp.json()
            if data.get("ok"):
                return "OK", f"Bot: @{data['result'].get('username', 'unknown')}"
        return "FAIL", "Invalid response from Telegram"
    except Exception as e:
        return "FAIL", str(e)[:100]


def test_resend() -> tuple[str, str]:
    """Test Resend email connectivity."""
    try:
        key = os.environ.get("RESEND_API_KEY")
        if not key:
            return "FAIL", "RESEND_API_KEY not set"
        
        import requests
        resp = requests.get(
            "https://api.resend.com/domains",
            headers={"Authorization": f"Bearer {key}"},
            timeout=5
        )
        if resp.ok:
            return "OK", "Resend API connected"
        return "FAIL", f"Resend API error: {resp.status_code}"
    except Exception as e:
        return "FAIL", str(e)[:100]


def run_health_checks() -> dict:
    """Run all health checks and return results."""
    timestamp = datetime.now(timezone.utc).isoformat()
    results = {
        "timestamp": timestamp,
        "summary": {
            "total": len(INTEGRATIONS),
            "ok": 0,
            "warn": 0,
            "fail": 0,
            "skip": 0
        },
        "checks": {}
    }
    
    for integration_id, config in INTEGRATIONS.items():
        logger.info(f"Checking {config['service']}...")
        
        presence_status, presence_detail = check_presence(config["env_vars"])
        
        test_status = "SKIP"
        test_detail = "No test performed"
        
        if presence_status == "OK":
            test_type = config["test_type"]
            
            if test_type == "api_call":
                if integration_id == "stripe":
                    test_status, test_detail = test_stripe()
                elif integration_id == "openai":
                    test_status, test_detail = test_openai()
                elif integration_id == "telegram":
                    test_status, test_detail = test_telegram()
                elif integration_id == "resend":
                    test_status, test_detail = test_resend()
                else:
                    test_status = "OK"
                    test_detail = "Presence verified"
            elif test_type == "db_query":
                test_status, test_detail = test_database()
            else:
                test_status = "OK"
                test_detail = "Presence verified"
        else:
            test_status = "FAIL" if config["criticality"] == "critical" else "WARN"
            test_detail = f"Missing: {', '.join(presence_detail)}"
        
        final_status = test_status
        if presence_status != "OK" and test_status == "SKIP":
            final_status = "FAIL" if config["criticality"] == "critical" else "WARN"
        
        results["checks"][integration_id] = {
            "service": config["service"],
            "criticality": config["criticality"],
            "presence": presence_status,
            "test_status": final_status,
            "detail": test_detail,
            "env_vars_checked": config["env_vars"]
        }
        
        status_emoji = {"OK": "OK", "WARN": "WARN", "FAIL": "FAIL", "SKIP": "SKIP"}[final_status]
        logger.info(f"  [{status_emoji}] {config['service']}: {test_detail}")
        
        results["summary"][final_status.lower()] = results["summary"].get(final_status.lower(), 0) + 1
    
    return results


def main():
    """Main entry point."""
    logger.info("=" * 60)
    logger.info("GUARDIAN AUTOPILOT - Secrets Health Monitor")
    logger.info("=" * 60)
    
    results = run_health_checks()
    
    json_path = OUTPUT_DIR / "secrets_health.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
    logger.info(f"\nResults saved to: {json_path}")
    
    logger.info("\n" + "=" * 60)
    logger.info("SUMMARY")
    logger.info("=" * 60)
    s = results["summary"]
    logger.info(f"Total: {s['total']} | OK: {s['ok']} | WARN: {s['warn']} | FAIL: {s['fail']} | SKIP: {s['skip']}")
    
    critical_fails = [
        k for k, v in results["checks"].items()
        if v["criticality"] == "critical" and v["test_status"] == "FAIL"
    ]
    if critical_fails:
        logger.error(f"CRITICAL FAILURES: {', '.join(critical_fails)}")
        return 1
    
    logger.info("All critical services healthy")
    return 0


if __name__ == "__main__":
    sys.exit(main())
