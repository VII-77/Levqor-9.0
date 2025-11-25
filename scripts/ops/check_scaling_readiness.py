#!/usr/bin/env python3
"""
Scaling Readiness Check Script - MEGA PHASE v29
Verifies system is ready for scaled operations.

Usage:
    python scripts/ops/check_scaling_readiness.py
"""
import os
import sys
import json
import time
import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

API_BASE = os.environ.get("API_BASE", "http://localhost:8000")


def print_header(text: str):
    """Print formatted header."""
    print("\n" + "=" * 50)
    print(f" {text}")
    print("=" * 50)


def check_health_endpoint() -> dict:
    """Check health endpoint response."""
    try:
        start = time.time()
        response = requests.get(f"{API_BASE}/api/health/summary", timeout=10)
        latency = (time.time() - start) * 1000
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "PASS",
                "latency_ms": round(latency, 2),
                "health_status": data.get("status", "unknown"),
                "details": data
            }
        else:
            return {
                "status": "FAIL",
                "latency_ms": round(latency, 2),
                "error": f"HTTP {response.status_code}"
            }
    except Exception as e:
        return {
            "status": "FAIL",
            "error": str(e)
        }


def check_database_connection() -> dict:
    """Check database connectivity."""
    try:
        from modules.db_wrapper import execute_query, get_db_type
        
        start = time.time()
        result = execute_query("SELECT 1 as ping", fetch="one")
        latency = (time.time() - start) * 1000
        
        if result and result.get("ping") == 1:
            return {
                "status": "PASS",
                "latency_ms": round(latency, 2),
                "db_type": get_db_type()
            }
        else:
            return {
                "status": "FAIL",
                "error": "Ping query failed"
            }
    except Exception as e:
        return {
            "status": "FAIL",
            "error": str(e)
        }


def check_scaling_policy() -> dict:
    """Check scaling policy configuration."""
    try:
        from security_core.scaling_policy import (
            get_current_load_tier,
            get_rate_limit_for_endpoint
        )
        
        tier = get_current_load_tier()
        sample_limit = get_rate_limit_for_endpoint("/api/workflows")
        
        return {
            "status": "PASS",
            "current_tier": tier,
            "sample_rate_limit": sample_limit,
            "message": f"Operating in {tier} load tier"
        }
    except Exception as e:
        return {
            "status": "WARN",
            "error": str(e),
            "message": "Scaling policy not fully configured"
        }


def check_environment() -> dict:
    """Check environment configuration."""
    required_vars = [
        "DATABASE_URL",
        "STRIPE_SECRET_KEY"
    ]
    optional_vars = [
        "OPENAI_API_KEY",
        "AI_INTEGRATIONS_OPENAI_API_KEY",
        "SENTRY_DSN"
    ]
    
    missing_required = [v for v in required_vars if not os.environ.get(v)]
    present_optional = [v for v in optional_vars if os.environ.get(v)]
    
    if missing_required:
        return {
            "status": "FAIL",
            "missing": missing_required,
            "present_optional": present_optional
        }
    else:
        return {
            "status": "PASS",
            "required_present": len(required_vars),
            "optional_present": len(present_optional)
        }


def check_worker_capacity() -> dict:
    """Check worker configuration."""
    workers = int(os.environ.get("GUNICORN_WORKERS", 2))
    threads = int(os.environ.get("GUNICORN_THREADS", 4))
    timeout = int(os.environ.get("GUNICORN_TIMEOUT", 30))
    
    total_capacity = workers * threads
    
    return {
        "status": "PASS" if total_capacity >= 4 else "WARN",
        "workers": workers,
        "threads": threads,
        "timeout": timeout,
        "total_capacity": total_capacity,
        "recommendation": "Increase workers for higher load" if total_capacity < 8 else "Good capacity"
    }


def main():
    print_header("LEVQOR SCALING READINESS CHECK")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print(f"API Base: {API_BASE}")
    
    checks = {}
    
    print("\n--- Running Checks ---")
    
    print("\n1. Health Endpoint...")
    checks["health"] = check_health_endpoint()
    print(f"   {checks['health']['status']}: {checks['health'].get('latency_ms', 'N/A')}ms")
    
    print("\n2. Database Connection...")
    checks["database"] = check_database_connection()
    print(f"   {checks['database']['status']}: {checks['database'].get('db_type', 'N/A')}")
    
    print("\n3. Scaling Policy...")
    checks["scaling"] = check_scaling_policy()
    print(f"   {checks['scaling']['status']}: {checks['scaling'].get('message', 'N/A')}")
    
    print("\n4. Environment Configuration...")
    checks["environment"] = check_environment()
    print(f"   {checks['environment']['status']}")
    
    print("\n5. Worker Capacity...")
    checks["workers"] = check_worker_capacity()
    print(f"   {checks['workers']['status']}: {checks['workers']['total_capacity']} concurrent connections")
    
    print_header("SUMMARY")
    
    pass_count = sum(1 for c in checks.values() if c["status"] == "PASS")
    warn_count = sum(1 for c in checks.values() if c["status"] == "WARN")
    fail_count = sum(1 for c in checks.values() if c["status"] == "FAIL")
    
    print(f"PASS: {pass_count} | WARN: {warn_count} | FAIL: {fail_count}")
    
    if fail_count == 0:
        print("\nSCALING READY - System can handle production load")
        return 0
    else:
        print("\nNOT READY - Fix failing checks before scaling")
        return 1


if __name__ == "__main__":
    sys.exit(main())
