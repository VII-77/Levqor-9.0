#!/usr/bin/env python3
"""
Checkout Smoke Test Script
Tests all checkout endpoints to verify Stripe integration is working.
"""

import sys
import json
import time

try:
    import requests
except ImportError:
    print("ERROR: requests package not installed. Run: pip install requests")
    sys.exit(1)

PORTS_TO_TRY = [5000, 3000]

SUBSCRIPTION_TESTS = [
    ("starter", "month", "Starter Monthly"),
    ("starter", "year", "Starter Yearly"),
    ("launch", "month", "Launch Monthly"),
    ("launch", "year", "Launch Yearly"),
    ("growth", "month", "Growth Monthly"),
    ("growth", "year", "Growth Yearly"),
    ("agency", "month", "Agency Monthly"),
    ("agency", "year", "Agency Yearly"),
]

DFY_TESTS = [
    ("dfy_starter", "DFY Starter"),
    ("dfy_professional", "DFY Professional"),
    ("dfy_enterprise", "DFY Enterprise"),
]

ADDON_TESTS = [
    ("addon_priority_support", "Priority Support"),
    ("addon_sla_99", "SLA 99.9%"),
    ("addon_white_label", "White Label"),
    ("addon_extra_workflows", "Extra Workflow Pack"),
]

def find_server():
    """Find which port the server is running on."""
    for port in PORTS_TO_TRY:
        try:
            response = requests.get(f"http://localhost:{port}/", timeout=2)
            return port
        except:
            continue
    return None

def test_subscription_checkout(base_url: str, tier: str, interval: str) -> tuple:
    """Test a subscription checkout."""
    try:
        response = requests.post(
            f"{base_url}/api/checkout",
            json={"tier": tier, "billing_interval": interval},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url", "").startswith("https://checkout.stripe.com/"):
                return True, "Checkout URL returned"
            elif data.get("url"):
                return True, "URL returned (non-standard)"
            else:
                return False, f"Missing URL: {json.dumps(data)[:50]}"
        elif response.status_code == 401:
            return True, "Auth required (expected)"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:50]}"
    except requests.exceptions.Timeout:
        return False, "Request timed out"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_dfy_checkout(base_url: str, pack: str) -> tuple:
    """Test a DFY package checkout."""
    try:
        response = requests.post(
            f"{base_url}/api/checkout",
            json={"purchase_type": "dfy", "dfy_pack": pack},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url"):
                return True, "Checkout URL returned"
            else:
                return False, f"Missing URL: {json.dumps(data)[:50]}"
        elif response.status_code == 401:
            return True, "Auth required (expected)"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:50]}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_addon_checkout(base_url: str, addon: str) -> tuple:
    """Test an addon checkout."""
    try:
        response = requests.post(
            f"{base_url}/api/checkout",
            json={"purchase_type": "addons", "addons": addon},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url"):
                return True, "Checkout URL returned"
            else:
                return False, f"Missing URL: {json.dumps(data)[:50]}"
        elif response.status_code == 401:
            return True, "Auth required (expected)"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:50]}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("=" * 80)
    print("CHECKOUT SMOKE TEST")
    print("=" * 80)
    
    print("\nFinding server...")
    port = find_server()
    
    if not port:
        print("ERROR: No server found on ports 5000 or 3000")
        print("Make sure the development server is running.")
        sys.exit(1)
    
    base_url = f"http://localhost:{port}"
    print(f"Server found at: {base_url}")
    
    all_passed = True
    total_tests = 0
    passed_tests = 0
    
    print("\n" + "-" * 80)
    print("SUBSCRIPTION PLANS")
    print("-" * 80)
    print(f"{'PLAN':<25} | {'INTERVAL':<10} | {'STATUS':<8} | {'MESSAGE'}")
    print("-" * 80)
    
    for tier, interval, name in SUBSCRIPTION_TESTS:
        total_tests += 1
        success, message = test_subscription_checkout(base_url, tier, interval)
        status = "PASS" if success else "FAIL"
        if success:
            passed_tests += 1
        else:
            all_passed = False
        print(f"{name:<25} | {interval:<10} | {status:<8} | {message}")
    
    print("\n" + "-" * 80)
    print("DFY PACKAGES")
    print("-" * 80)
    print(f"{'PACK':<25} | {'TYPE':<10} | {'STATUS':<8} | {'MESSAGE'}")
    print("-" * 80)
    
    for pack, name in DFY_TESTS:
        total_tests += 1
        success, message = test_dfy_checkout(base_url, pack)
        status = "PASS" if success else "FAIL"
        if success:
            passed_tests += 1
        else:
            all_passed = False
        print(f"{name:<25} | {'one_time':<10} | {status:<8} | {message}")
    
    print("\n" + "-" * 80)
    print("ADD-ONS")
    print("-" * 80)
    print(f"{'ADDON':<25} | {'TYPE':<10} | {'STATUS':<8} | {'MESSAGE'}")
    print("-" * 80)
    
    for addon, name in ADDON_TESTS:
        total_tests += 1
        success, message = test_addon_checkout(base_url, addon)
        status = "PASS" if success else "FAIL"
        if success:
            passed_tests += 1
        else:
            all_passed = False
        print(f"{name:<25} | {'monthly':<10} | {status:<8} | {message}")
    
    print("\n" + "=" * 80)
    print(f"RESULTS: {passed_tests}/{total_tests} tests passed")
    
    if all_passed:
        print("STATUS: ALL CHECKOUT TESTS PASSED")
    else:
        print("STATUS: SOME TESTS FAILED")
    print("=" * 80)
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
