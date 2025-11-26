#!/usr/bin/env python3
"""
Full Stack Verification - Phase 60 Post-Launch

Verifies that both production and development environments are healthy.
Can be run in dev mode (localhost) or production mode (api.levqor.ai).

Usage:
    python scripts/postlaunch/verify_full_stack.py          # Dev mode
    python scripts/postlaunch/verify_full_stack.py --prod   # Production mode
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config.launch_stage import get_launch_stage, get_stage_config

OUTPUT_DIR = Path("/home/runner/workspace/workspace-data/autopilot")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DEV_BACKEND = "http://localhost:8000"
DEV_FRONTEND = "http://localhost:5000"
PROD_BACKEND = "https://api.levqor.ai"
PROD_FRONTEND = "https://www.levqor.ai"


def check_endpoint(url: str, method: str = "GET", expected_codes: list = None, json_body: dict = None) -> dict:
    """Check if an endpoint is accessible."""
    if expected_codes is None:
        expected_codes = [200]
    
    try:
        if method == "GET":
            resp = requests.get(url, timeout=15, allow_redirects=True)
        elif method == "POST":
            resp = requests.post(url, json=json_body or {}, timeout=15)
        else:
            resp = requests.request(method, url, timeout=15)
        
        success = resp.status_code in expected_codes
        return {
            "status": "OK" if success else "FAIL",
            "url": url,
            "http_code": resp.status_code,
            "expected_codes": expected_codes,
            "response_time_ms": resp.elapsed.total_seconds() * 1000
        }
    except requests.exceptions.ConnectionError:
        return {"status": "FAIL", "url": url, "error": "Connection refused"}
    except requests.exceptions.Timeout:
        return {"status": "FAIL", "url": url, "error": "Timeout"}
    except Exception as e:
        return {"status": "FAIL", "url": url, "error": str(e)[:100]}


def check_html_content(url: str, expected_markers: list) -> dict:
    """Check if HTML contains expected content markers."""
    try:
        resp = requests.get(url, timeout=15, allow_redirects=True)
        if resp.status_code != 200:
            return {"status": "FAIL", "url": url, "error": f"HTTP {resp.status_code}"}
        
        content = resp.text.lower()
        found = []
        missing = []
        
        for marker in expected_markers:
            if marker.lower() in content:
                found.append(marker)
            else:
                missing.append(marker)
        
        return {
            "status": "OK" if not missing else "WARN",
            "url": url,
            "found_markers": found,
            "missing_markers": missing
        }
    except Exception as e:
        return {"status": "FAIL", "url": url, "error": str(e)[:100]}


def check_onboarding_ux() -> dict:
    """Check onboarding UX audit results."""
    from datetime import date
    
    onboarding_dir = Path("/home/runner/workspace-data/autopilot/onboarding")
    today_report = onboarding_dir / f"audit_{date.today().isoformat()}.json"
    
    result = {"status": "UNKNOWN", "score": 0, "details": {}}
    
    if today_report.exists():
        try:
            with open(today_report) as f:
                data = json.load(f)
            
            score = data.get("score", 0)
            result["score"] = score
            result["summary"] = data.get("summary", {})
            
            if score >= 90:
                result["status"] = "OK"
            elif score >= 70:
                result["status"] = "WARN"
            else:
                result["status"] = "FAIL"
        except Exception as e:
            result["status"] = "FAIL"
            result["error"] = str(e)
    else:
        try:
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from autopilot.onboarding_ux_audit import run_audit
            data = run_audit()
            score = data.get("score", 0)
            result["score"] = score
            result["summary"] = data.get("summary", {})
            result["status"] = "OK" if score >= 90 else ("WARN" if score >= 70 else "FAIL")
        except Exception as e:
            result["status"] = "SKIP"
            result["error"] = f"Audit not run: {str(e)[:50]}"
    
    return result


def check_autopilot_files() -> dict:
    """Check that Guardian Autopilot files exist and are healthy."""
    files = {
        "secrets_health": OUTPUT_DIR / "secrets_health.json",
        "compliance_audit": OUTPUT_DIR / "compliance_audit.json",
        "growth_check": OUTPUT_DIR / "growth_check.json",
        "founder_digest": OUTPUT_DIR / "founder_digest.md",
        "onboarding_ux": Path("/home/runner/workspace-data/autopilot/onboarding") / f"audit_{datetime.now().strftime('%Y-%m-%d')}.json"
    }
    
    results = {"status": "OK", "files": {}}
    
    for name, path in files.items():
        if path.exists():
            if path.suffix == ".json":
                try:
                    with open(path) as f:
                        data = json.load(f)
                    
                    if name == "secrets_health":
                        fail_count = data.get("summary", {}).get("fail", 0)
                        status = "OK" if fail_count == 0 else "FAIL"
                    elif name == "compliance_audit":
                        score = data.get("summary", {}).get("compliance_score", 0)
                        status = "OK" if score >= 80 else "WARN"
                    elif name == "growth_check":
                        org_status = data.get("summary", {}).get("organism_status", "UNKNOWN")
                        status = "OK" if org_status == "HEALTHY" else "FAIL"
                    else:
                        status = "OK"
                    
                    results["files"][name] = {"status": status, "path": str(path)}
                except Exception as e:
                    results["files"][name] = {"status": "FAIL", "error": str(e)}
            else:
                results["files"][name] = {"status": "OK", "path": str(path)}
        else:
            results["files"][name] = {"status": "MISSING", "path": str(path)}
            results["status"] = "WARN"
    
    if any(f.get("status") == "FAIL" for f in results["files"].values()):
        results["status"] = "FAIL"
    
    return results


def run_verification(production: bool = False) -> dict:
    """Run full stack verification."""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    backend_url = PROD_BACKEND if production else DEV_BACKEND
    frontend_url = PROD_FRONTEND if production else DEV_FRONTEND
    
    stage_config = get_stage_config()
    
    results = {
        "timestamp": timestamp,
        "mode": "production" if production else "development",
        "backend_url": backend_url,
        "frontend_url": frontend_url,
        "launch_stage": stage_config,
        "checks": {
            "backend": [],
            "frontend": [],
            "autopilot": None
        },
        "summary": {
            "total_checks": 0,
            "passed": 0,
            "warned": 0,
            "failed": 0,
            "overall_status": "UNKNOWN"
        }
    }
    
    print("=" * 60)
    print(f"FULL STACK VERIFICATION - {'PRODUCTION' if production else 'DEVELOPMENT'}")
    print("=" * 60)
    print(f"Backend: {backend_url}")
    print(f"Frontend: {frontend_url}")
    print(f"Launch Stage: {stage_config['stage'].upper()}")
    print()
    
    print("[BACKEND CHECKS]")
    backend_endpoints = [
        {"path": "/health", "name": "Health Check", "expected_codes": [200]},
        {"path": "/api/health/summary", "name": "Health Summary", "expected_codes": [200]},
        {"path": "/api/system/launch-readiness", "name": "Launch Readiness", "expected_codes": [200]},
        {"path": "/api/me/export-data", "name": "DSAR Export", "expected_codes": [200, 401]},
        {"path": "/api/me/delete-account", "name": "DSAR Delete", "method": "POST", "expected_codes": [200, 401]},
    ]
    
    for endpoint in backend_endpoints:
        url = f"{backend_url}{endpoint['path']}"
        method = endpoint.get("method", "GET")
        check = check_endpoint(url, method=method, expected_codes=endpoint.get("expected_codes", [200]))
        check["name"] = endpoint["name"]
        results["checks"]["backend"].append(check)
        
        status_emoji = {"OK": "[OK]", "WARN": "[WARN]", "FAIL": "[FAIL]"}.get(check["status"], "[?]")
        print(f"  {status_emoji} {endpoint['name']}: {check.get('http_code', check.get('error', 'N/A'))}")
        
        results["summary"]["total_checks"] += 1
        if check["status"] == "OK":
            results["summary"]["passed"] += 1
        elif check["status"] == "WARN":
            results["summary"]["warned"] += 1
        else:
            results["summary"]["failed"] += 1
    
    print()
    print("[FRONTEND CHECKS]")
    frontend_check = check_html_content(
        frontend_url,
        expected_markers=["Levqor", "workflow", "automation"]
    )
    frontend_check["name"] = "Frontend Content"
    results["checks"]["frontend"].append(frontend_check)
    
    status_emoji = {"OK": "[OK]", "WARN": "[WARN]", "FAIL": "[FAIL]"}.get(frontend_check["status"], "[?]")
    found = len(frontend_check.get("found_markers", []))
    total = found + len(frontend_check.get("missing_markers", []))
    print(f"  {status_emoji} Frontend Content: {found}/{total} markers found")
    
    results["summary"]["total_checks"] += 1
    if frontend_check["status"] == "OK":
        results["summary"]["passed"] += 1
    elif frontend_check["status"] == "WARN":
        results["summary"]["warned"] += 1
    else:
        results["summary"]["failed"] += 1
    
    print()
    print("[GUARDIAN AUTOPILOT FILES]")
    autopilot_check = check_autopilot_files()
    results["checks"]["autopilot"] = autopilot_check
    
    for name, file_status in autopilot_check["files"].items():
        status = file_status.get("status", "UNKNOWN")
        status_emoji = {"OK": "[OK]", "WARN": "[WARN]", "FAIL": "[FAIL]", "MISSING": "[MISS]"}.get(status, "[?]")
        print(f"  {status_emoji} {name}")
        
        results["summary"]["total_checks"] += 1
        if status == "OK":
            results["summary"]["passed"] += 1
        elif status in ("WARN", "MISSING"):
            results["summary"]["warned"] += 1
        else:
            results["summary"]["failed"] += 1
    
    if results["summary"]["failed"] > 0:
        results["summary"]["overall_status"] = "FAIL"
    elif results["summary"]["warned"] > 0:
        results["summary"]["overall_status"] = "DEGRADED"
    else:
        results["summary"]["overall_status"] = "HEALTHY"
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Full Stack Verification")
    parser.add_argument("--prod", action="store_true", help="Run against production")
    args = parser.parse_args()
    
    results = run_verification(production=args.prod)
    
    output_path = OUTPUT_DIR / "verification_result.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print()
    print("=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    s = results["summary"]
    print(f"Total: {s['total_checks']} | Passed: {s['passed']} | Warned: {s['warned']} | Failed: {s['failed']}")
    print(f"Overall Status: {s['overall_status']}")
    print(f"Results saved to: {output_path}")
    
    if s["overall_status"] == "HEALTHY":
        return 0
    elif s["overall_status"] == "DEGRADED":
        return 1
    return 2


if __name__ == "__main__":
    sys.exit(main())
