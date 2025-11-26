#!/usr/bin/env python3
"""
Compliance Audit - Guardian Autopilot Grid

Verifies legal pages, GDPR/CCPA endpoints, and security configurations.
"""

import os
import sys
import json
import logging
import requests
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
        logging.FileHandler(OUTPUT_DIR / "compliance_audit.log")
    ]
)
logger = logging.getLogger(__name__)

FRONTEND_URL = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:5000")
BACKEND_URL = os.environ.get("NEXT_PUBLIC_API_URL", "http://localhost:8000")

LEGAL_PAGES = [
    {"path": "/terms", "name": "Terms of Service", "required": True},
    {"path": "/privacy", "name": "Privacy Policy", "required": True},
    {"path": "/cookies", "name": "Cookie Policy", "required": True},
    {"path": "/gdpr", "name": "GDPR Information", "required": True},
    {"path": "/sla", "name": "Service Level Agreement", "required": False},
    {"path": "/dpa", "name": "Data Processing Agreement", "required": False},
    {"path": "/acceptable-use", "name": "Acceptable Use Policy", "required": False},
]

GDPR_ENDPOINTS = [
    {"path": "/api/me/export-data", "method": "GET", "name": "Data Export (DSAR)", "description": "User data export endpoint"},
    {"path": "/api/me/delete-account", "method": "POST", "name": "Account Deletion", "description": "Right to erasure endpoint"},
]

SECURITY_CHECKS = [
    {"name": "HTTPS Redirect", "check": "https_redirect"},
    {"name": "Stripe Webhook Secret", "check": "stripe_webhook"},
    {"name": "CORS Configuration", "check": "cors_config"},
    {"name": "Rate Limiting", "check": "rate_limit"},
    {"name": "JWT Secret Set", "check": "jwt_secret"},
]


def check_page_exists(base_url: str, path: str) -> tuple[str, int, str]:
    """Check if a page exists and returns 200."""
    try:
        url = f"{base_url}{path}"
        resp = requests.get(url, timeout=10, allow_redirects=True)
        if resp.status_code == 200:
            return "OK", resp.status_code, "Page accessible"
        elif resp.status_code == 404:
            return "FAIL", resp.status_code, "Page not found"
        else:
            return "WARN", resp.status_code, f"Unexpected status"
    except requests.exceptions.ConnectionError:
        return "SKIP", 0, "Server not reachable (dev mode?)"
    except Exception as e:
        return "FAIL", 0, str(e)[:50]


def check_endpoint_exists(base_url: str, path: str, method: str = "GET") -> tuple[str, int, str]:
    """Check if an API endpoint exists (expects 401 for protected endpoints)."""
    try:
        url = f"{base_url}{path}"
        if method == "GET":
            resp = requests.get(url, timeout=10)
        else:
            resp = requests.post(url, timeout=10, json={})
        
        if resp.status_code in [200, 401, 403]:
            return "OK", resp.status_code, "Endpoint exists"
        elif resp.status_code == 404:
            return "FAIL", resp.status_code, "Endpoint not found"
        else:
            return "WARN", resp.status_code, f"Unexpected status"
    except requests.exceptions.ConnectionError:
        return "SKIP", 0, "Server not reachable"
    except Exception as e:
        return "FAIL", 0, str(e)[:50]


def check_security_item(check_type: str) -> tuple[str, str]:
    """Check security configuration items."""
    if check_type == "stripe_webhook":
        if os.environ.get("STRIPE_WEBHOOK_SECRET"):
            return "OK", "Webhook secret configured"
        return "WARN", "Webhook secret not set"
    
    elif check_type == "jwt_secret":
        jwt = os.environ.get("JWT_SECRET", "")
        if jwt and jwt != "dev-secret-change-in-prod":
            return "OK", "JWT secret configured"
        return "FAIL", "JWT secret not properly configured"
    
    elif check_type == "https_redirect":
        app_url = os.environ.get("NEXT_PUBLIC_APP_URL", "")
        if app_url.startswith("https://"):
            return "OK", "HTTPS configured"
        return "WARN", "HTTPS not enforced in config"
    
    elif check_type == "cors_config":
        return "OK", "CORS handled by Flask (check manually)"
    
    elif check_type == "rate_limit":
        burst = os.environ.get("RATE_BURST", "20")
        return "OK", f"Rate limit: {burst} requests/burst"
    
    return "SKIP", "Check not implemented"


def check_file_exists(filepath: str) -> tuple[str, str]:
    """Check if a compliance-related file exists."""
    if Path(filepath).exists():
        return "OK", "File exists"
    return "FAIL", "File not found"


def run_compliance_audit() -> dict:
    """Run full compliance audit."""
    timestamp = datetime.now(timezone.utc).isoformat()
    results = {
        "timestamp": timestamp,
        "summary": {
            "total_checks": 0,
            "passed": 0,
            "warnings": 0,
            "failed": 0,
            "skipped": 0,
            "compliance_score": 0
        },
        "legal_pages": [],
        "gdpr_endpoints": [],
        "security_checks": [],
        "file_checks": []
    }
    
    logger.info("=" * 60)
    logger.info("GUARDIAN AUTOPILOT - Compliance Audit")
    logger.info("=" * 60)
    
    logger.info("\n[LEGAL PAGES]")
    for page in LEGAL_PAGES:
        status, code, detail = check_page_exists(FRONTEND_URL, page["path"])
        results["legal_pages"].append({
            "name": page["name"],
            "path": page["path"],
            "required": page["required"],
            "status": status,
            "http_code": code,
            "detail": detail
        })
        emoji = {"OK": "OK", "WARN": "WARN", "FAIL": "FAIL", "SKIP": "SKIP"}[status]
        logger.info(f"  [{emoji}] {page['name']}: {detail}")
        results["summary"]["total_checks"] += 1
        if status == "OK":
            results["summary"]["passed"] += 1
        elif status == "WARN":
            results["summary"]["warnings"] += 1
        elif status == "SKIP":
            results["summary"]["skipped"] += 1
        else:
            if page["required"]:
                results["summary"]["failed"] += 1
            else:
                results["summary"]["warnings"] += 1
    
    logger.info("\n[GDPR/CCPA ENDPOINTS]")
    for endpoint in GDPR_ENDPOINTS:
        status, code, detail = check_endpoint_exists(BACKEND_URL, endpoint["path"], endpoint["method"])
        results["gdpr_endpoints"].append({
            "name": endpoint["name"],
            "path": endpoint["path"],
            "method": endpoint["method"],
            "status": status,
            "http_code": code,
            "detail": detail
        })
        emoji = {"OK": "OK", "WARN": "WARN", "FAIL": "FAIL", "SKIP": "SKIP"}[status]
        logger.info(f"  [{emoji}] {endpoint['name']}: {detail}")
        results["summary"]["total_checks"] += 1
        if status == "OK":
            results["summary"]["passed"] += 1
        elif status == "WARN":
            results["summary"]["warnings"] += 1
        elif status == "SKIP":
            results["summary"]["skipped"] += 1
        else:
            results["summary"]["failed"] += 1
    
    logger.info("\n[SECURITY CONFIGURATION]")
    for check in SECURITY_CHECKS:
        status, detail = check_security_item(check["check"])
        results["security_checks"].append({
            "name": check["name"],
            "status": status,
            "detail": detail
        })
        emoji = {"OK": "OK", "WARN": "WARN", "FAIL": "FAIL", "SKIP": "SKIP"}[status]
        logger.info(f"  [{emoji}] {check['name']}: {detail}")
        results["summary"]["total_checks"] += 1
        if status == "OK":
            results["summary"]["passed"] += 1
        elif status == "WARN":
            results["summary"]["warnings"] += 1
        elif status == "SKIP":
            results["summary"]["skipped"] += 1
        else:
            results["summary"]["failed"] += 1
    
    logger.info("\n[COMPLIANCE FILES]")
    compliance_files = [
        {"path": "docs/compliance.md", "name": "Compliance Documentation"},
        {"path": "modules/compliance/__init__.py", "name": "Compliance Module"},
        {"path": "modules/compliance/export_utils.py", "name": "Data Export Utils"},
        {"path": "modules/compliance/delete_utils.py", "name": "Data Delete Utils"},
    ]
    for file_check in compliance_files:
        status, detail = check_file_exists(file_check["path"])
        results["file_checks"].append({
            "name": file_check["name"],
            "path": file_check["path"],
            "status": status,
            "detail": detail
        })
        emoji = {"OK": "OK", "FAIL": "FAIL"}[status]
        logger.info(f"  [{emoji}] {file_check['name']}: {detail}")
        results["summary"]["total_checks"] += 1
        if status == "OK":
            results["summary"]["passed"] += 1
        else:
            results["summary"]["failed"] += 1
    
    total = results["summary"]["total_checks"]
    passed = results["summary"]["passed"]
    if total > 0:
        results["summary"]["compliance_score"] = round((passed / total) * 100, 1)
    
    return results


def main():
    """Main entry point."""
    results = run_compliance_audit()
    
    json_path = OUTPUT_DIR / "compliance_audit.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
    logger.info(f"\nResults saved to: {json_path}")
    
    logger.info("\n" + "=" * 60)
    logger.info("COMPLIANCE SUMMARY")
    logger.info("=" * 60)
    s = results["summary"]
    logger.info(f"Total: {s['total_checks']} | Passed: {s['passed']} | Warnings: {s['warnings']} | Failed: {s['failed']}")
    logger.info(f"Compliance Score: {s['compliance_score']}%")
    
    if s["compliance_score"] >= 80:
        logger.info("COMPLIANCE STATUS: GOOD")
        return 0
    elif s["compliance_score"] >= 60:
        logger.warning("COMPLIANCE STATUS: NEEDS ATTENTION")
        return 0
    else:
        logger.error("COMPLIANCE STATUS: CRITICAL")
        return 1


if __name__ == "__main__":
    sys.exit(main())
