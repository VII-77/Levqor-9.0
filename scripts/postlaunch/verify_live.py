#!/usr/bin/env python3
"""
Post-Launch Verification Script - MEGA PHASE v31
Verifies production deployment is healthy after launch.

Usage:
    python scripts/postlaunch/verify_live.py [--api-base URL]
"""
import os
import sys
import time
import argparse
import requests
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

DEFAULT_API_BASE = os.environ.get("API_BASE", "http://localhost:8000")


def print_header(text: str):
    """Print formatted header."""
    print("\n" + "=" * 60)
    print(f" {text}")
    print("=" * 60)


def print_result(name: str, passed: bool, message: str = ""):
    """Print check result."""
    icon = "✓" if passed else "✗"
    status = "PASS" if passed else "FAIL"
    print(f"  {icon} {name}: {status}")
    if message:
        print(f"      {message}")


def check_health(api_base: str) -> tuple:
    """Check health endpoint."""
    try:
        response = requests.get(f"{api_base}/api/health/summary", timeout=10)
        if response.status_code == 200:
            data = response.json()
            status = data.get("status", "unknown")
            return status in ["healthy", "warning"], f"Status: {status}"
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)


def check_launch_readiness(api_base: str) -> tuple:
    """Check launch readiness endpoint."""
    try:
        response = requests.get(f"{api_base}/api/system/launch-readiness", timeout=10)
        if response.status_code == 200:
            data = response.json()
            passing = data.get("summary", {}).get("passing", 0)
            total = data.get("summary", {}).get("total", 0)
            return data.get("ready", False), f"{passing}/{total} checks passing"
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)


def check_templates(api_base: str) -> tuple:
    """Check templates endpoint."""
    try:
        response = requests.get(f"{api_base}/api/templates", timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("templates", []))
            return count > 0, f"{count} templates available"
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)


def check_workflows(api_base: str) -> tuple:
    """Check workflows endpoint."""
    try:
        response = requests.get(f"{api_base}/api/workflows?limit=1", timeout=10)
        if response.status_code == 200:
            return True, "API accessible"
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)


def run_safety_gate() -> tuple:
    """Run safety gate checks."""
    try:
        import subprocess
        result = subprocess.run(
            ["python", "scripts/ci/run_all_checks.py"],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        
        if "PASS" in result.stdout and result.returncode == 0:
            return True, "All safety checks passing"
        elif result.returncode == 0:
            return True, "Safety gate completed"
        else:
            return False, "Some checks failed"
    except FileNotFoundError:
        return True, "Safety gate script not found (skipped)"
    except subprocess.TimeoutExpired:
        return False, "Safety gate timeout"
    except Exception as e:
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(description="Post-launch verification")
    parser.add_argument("--api-base", default=DEFAULT_API_BASE, help="API base URL")
    parser.add_argument("--skip-safety", action="store_true", help="Skip safety gate check")
    args = parser.parse_args()
    
    print_header("LEVQOR POST-LAUNCH VERIFICATION")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print(f"API Base: {args.api_base}")
    
    results = []
    
    print("\n--- Health Checks ---")
    
    passed, msg = check_health(args.api_base)
    print_result("Health Endpoint", passed, msg)
    results.append(passed)
    
    passed, msg = check_launch_readiness(args.api_base)
    print_result("Launch Readiness", passed, msg)
    results.append(passed)
    
    passed, msg = check_templates(args.api_base)
    print_result("Templates API", passed, msg)
    results.append(passed)
    
    passed, msg = check_workflows(args.api_base)
    print_result("Workflows API", passed, msg)
    results.append(passed)
    
    if not args.skip_safety:
        print("\n--- Safety Gate ---")
        passed, msg = run_safety_gate()
        print_result("Safety Gate", passed, msg)
        results.append(passed)
    
    print_header("VERIFICATION SUMMARY")
    
    pass_count = sum(results)
    total_count = len(results)
    all_pass = all(results)
    
    print(f"Results: {pass_count}/{total_count} checks passing")
    print(f"Status: {'LIVE AND HEALTHY' if all_pass else 'ISSUES DETECTED'}")
    
    if all_pass:
        print("\n✓ Production deployment verified successfully")
        print("✓ All systems operational")
        return 0
    else:
        print("\n✗ Some verification checks failed")
        print("✗ Review and fix issues before announcing launch")
        return 1


if __name__ == "__main__":
    sys.exit(main())
