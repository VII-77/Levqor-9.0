#!/usr/bin/env python3
"""
One-Click Integrity Test Script - MEGA-PHASE 6
Tests core endpoints and prints human-readable summary
Run: python3 monitors/integrity_test.py
"""
import requests
import json
import sys
from datetime import datetime

API_BASE = "https://api.levqor.ai"
TIMEOUT = 10  # seconds

def print_header(title):
    """Print formatted section header."""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print('=' * 60)

def test_endpoint(method, url, data=None, description=""):
    """
    Test an endpoint and return success status.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        url: Full URL to test
        data: Optional payload for POST requests
        description: Human-readable description
    
    Returns:
        tuple: (success: bool, details: str)
    """
    try:
        if method == "GET":
            response = requests.get(url, timeout=TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=TIMEOUT)
        else:
            return False, f"Unsupported method: {method}"
        
        # Check if response is valid JSON
        try:
            json_data = response.json()
        except:
            json_data = None
        
        success = response.status_code < 400
        
        if success:
            details = f"{response.status_code} OK"
            if json_data and isinstance(json_data, dict):
                # Show key response fields
                if "status" in json_data:
                    details += f" | status={json_data['status']}"
                if "success" in json_data:
                    details += f" | success={json_data['success']}"
        else:
            details = f"{response.status_code} FAIL"
            if json_data and isinstance(json_data, dict) and "error" in json_data:
                details += f" | error={json_data['error']}"
        
        return success, details
    
    except requests.exceptions.Timeout:
        return False, "TIMEOUT (> 10s)"
    except requests.exceptions.RequestException as e:
        return False, f"NETWORK_ERROR: {str(e)[:50]}"
    except Exception as e:
        return False, f"ERROR: {str(e)[:50]}"

def main():
    """Run all integrity checks."""
    print("\n╔════════════════════════════════════════════════════════════╗")
    print("║          LEVQOR INTEGRITY TEST - MEGA-PHASE 6              ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"\nTimestamp: {datetime.utcnow().isoformat()}Z")
    print(f"API Base:  {API_BASE}")
    
    all_tests = []
    
    # ===== BACKEND HEALTH =====
    print_header("Backend Health & Core")
    
    tests = [
        ("GET", f"{API_BASE}/health", None, "Health endpoint"),
        ("GET", f"{API_BASE}/api/usage/summary", None, "Usage summary"),
        ("GET", f"{API_BASE}/api/usage/export", None, "Usage CSV export"),
    ]
    
    for method, url, data, desc in tests:
        success, details = test_endpoint(method, url, data, desc)
        status = "[✓ OK]" if success else "[✗ FAIL]"
        print(f"{status:8} {desc:30} {details}")
        all_tests.append(success)
    
    # ===== AI ENDPOINTS =====
    print_header("AI Features")
    
    tests = [
        ("POST", f"{API_BASE}/api/ai/chat", {"query": "test", "context": {}}, "AI Chat"),
        ("POST", f"{API_BASE}/api/ai/workflow", {"query": "test workflow", "context": {}}, "AI Workflow Builder"),
        ("POST", f"{API_BASE}/api/ai/debug", {"error": "test error", "context": {}}, "AI Debug Assistant"),
        ("POST", f"{API_BASE}/api/ai/onboarding/next-step", {"current_step": "welcome", "context": {}}, "AI Onboarding"),
    ]
    
    for method, url, data, desc in tests:
        success, details = test_endpoint(method, url, data, desc)
        status = "[✓ OK]" if success else "[✗ FAIL]"
        print(f"{status:8} {desc:30} {details}")
        all_tests.append(success)
    
    # ===== GTM ENGINE =====
    print_header("GTM Engine (MEGA-PHASE 5)")
    
    tests = [
        ("POST", f"{API_BASE}/api/consultations/book", {
            "name": "Test User",
            "email": "test@levqor-integrity.ai",
            "timezone": "UTC",
            "duration": 60,
            "preferred_time": "ASAP"
        }, "Consultation Booking"),
        ("POST", f"{API_BASE}/api/consultations/run", {"topic": "test", "context": {}}, "Consultation Run"),
        ("POST", f"{API_BASE}/api/support/auto", {"query": "test support query", "context": {}}, "AI Support Auto"),
        ("POST", f"{API_BASE}/api/marketing/lead", {"email": "test@levqor-integrity.ai"}, "Marketing Lead"),
        ("POST", f"{API_BASE}/api/marketing/events", {"event": "test_event", "metadata": {}}, "Marketing Events"),
    ]
    
    for method, url, data, desc in tests:
        success, details = test_endpoint(method, url, data, desc)
        status = "[✓ OK]" if success else "[✗ FAIL]"
        print(f"{status:8} {desc:30} {details}")
        all_tests.append(success)
    
    # ===== MEGA-PHASE 6 ENDPOINTS =====
    print_header("MEGA-PHASE 6 Features")
    
    tests = [
        ("POST", f"{API_BASE}/api/referrals/create", {"email": "test@levqor-integrity.ai"}, "Referral Create"),
        ("GET", f"{API_BASE}/api/knowledge/search?q=workflow", None, "Knowledge Base Search"),
        ("GET", f"{API_BASE}/api/knowledge/categories", None, "KB Categories"),
    ]
    
    for method, url, data, desc in tests:
        success, details = test_endpoint(method, url, data, desc)
        status = "[✓ OK]" if success else "[✗ FAIL]"
        print(f"{status:8} {desc:30} {details}")
        all_tests.append(success)
    
    # ===== METRICS =====
    print_header("Observability")
    
    tests = [
        ("GET", f"{API_BASE}/api/metrics/app", None, "Application Metrics"),
    ]
    
    for method, url, data, desc in tests:
        success, details = test_endpoint(method, url, data, desc)
        status = "[✓ OK]" if success else "[✗ FAIL]"
        print(f"{status:8} {desc:30} {details}")
        all_tests.append(success)
    
    # ===== SUMMARY =====
    print_header("Summary")
    
    total = len(all_tests)
    passed = sum(all_tests)
    failed = total - passed
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\nTotal Tests:   {total}")
    print(f"Passed:        {passed} ✓")
    print(f"Failed:        {failed} ✗")
    print(f"Pass Rate:     {pass_rate:.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! System integrity verified.")
        return 0
    else:
        print(f"\n⚠️  {failed} test(s) failed. Review the output above for details.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        print("\n" + "=" * 60 + "\n")
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Integrity test interrupted by user.")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
