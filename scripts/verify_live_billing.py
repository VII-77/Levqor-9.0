#!/usr/bin/env python3
"""
Verify LIVE billing configuration works with backend
Tests health endpoint and checkout session creation
"""
import os
import sys
import requests
import json

# LIVE price IDs from sync
LIVE_PRICES = {
    # Subscriptions
    "STRIPE_PRICE_STARTER": "price_1SW5zmBNwdcDOF99v8j2jdEN",
    "STRIPE_PRICE_STARTER_YEAR": "price_1SW5zmBNwdcDOF99Xt9jxP4w",
    "STRIPE_PRICE_LAUNCH": "price_1SW5zmBNwdcDOF99BvLeIOY1",
    "STRIPE_PRICE_LAUNCH_YEAR": "price_1SW5zmBNwdcDOF99iJatpyVd",
    "STRIPE_PRICE_GROWTH": "price_1SW5znBNwdcDOF993dJ2LxUu",
    "STRIPE_PRICE_GROWTH_YEAR": "price_1SW5znBNwdcDOF99jHLnbgAm",
    "STRIPE_PRICE_AGENCY": "price_1SW5znBNwdcDOF991WJRJuSC",
    "STRIPE_PRICE_AGENCY_YEAR": "price_1SW5znBNwdcDOF99iCB3blS0",
    # DFY
    "STRIPE_PRICE_DFY_STARTER": "price_1SW5zoBNwdcDOF99SLdCP484",
    "STRIPE_PRICE_DFY_PROFESSIONAL": "price_1SW5zoBNwdcDOF99LKhSEow6",
    "STRIPE_PRICE_DFY_ENTERPRISE": "price_1SW5zoBNwdcDOF99yEuejfTJ",
    # Add-ons
    "STRIPE_PRICE_ADDON_PRIORITY_SUPPORT": "price_1SW5zoBNwdcDOF99fb2rBq17",
    "STRIPE_PRICE_ADDON_SLA_99": "price_1SW5zpBNwdcDOF99jcZ90vkG",
    "STRIPE_PRICE_ADDON_WHITE_LABEL": "price_1SW5zpBNwdcDOF995naLMZD8",
    "STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS": "price_1SW5zpBNwdcDOF995MpJq8eA",
}

def setup_live_env():
    """Set up environment with LIVE price IDs"""
    print("Setting up LIVE price environment...")
    for key, value in LIVE_PRICES.items():
        os.environ[key] = value
    
    # Also ensure LIVE Stripe key is set
    if "STRIPE_SECRET_KEY" not in os.environ:
        print("⚠️  STRIPE_SECRET_KEY not found in environment")
    elif not os.environ["STRIPE_SECRET_KEY"].startswith("sk_live_"):
        print(f"⚠️  STRIPE_SECRET_KEY is not a LIVE key: {os.environ['STRIPE_SECRET_KEY'][:15]}...")
    else:
        print(f"✅ STRIPE_SECRET_KEY is LIVE: {os.environ['STRIPE_SECRET_KEY'][:15]}...")
    
    print(f"✅ Set {len(LIVE_PRICES)} LIVE price IDs in environment\n")

def test_health_endpoint():
    """Test /api/billing/health with LIVE credentials"""
    print("="*80)
    print("TEST 1: Health Endpoint with LIVE Prices")
    print("="*80)
    
    try:
        response = requests.get("http://localhost:8000/api/billing/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Health check PASSED")
            print(f"   Status: {data.get('status')}")
            print(f"   Subscriptions configured: {len(data.get('subscription_tiers', {}))}/4")
            print(f"   DFY packages: {data.get('dfy_packages_configured')}/{data.get('dfy_packages_total')}")
            print(f"   Add-ons: {data.get('addons_configured')}/{data.get('addons_total')}")
            
            # Verify LIVE price IDs are being used
            print("\n   LIVE Price ID Verification:")
            for tier, info in data.get('subscription_tiers', {}).items():
                print(f"   • {tier}: {info}")
            
            return True
        else:
            print(f"\n❌ Health check FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except Exception as e:
        print(f"\n❌ Health check ERROR: {e}")
        return False

def test_checkout_subscription():
    """Test creating a LIVE subscription checkout session"""
    print("\n" + "="*80)
    print("TEST 2: Subscription Checkout (Starter Monthly)")
    print("="*80)
    
    try:
        response = requests.post(
            "http://localhost:8000/api/billing/checkout",
            json={"tier": "starter", "interval": "month"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url"):
                print(f"✅ Subscription checkout PASSED")
                print(f"   Checkout URL: {data['url'][:80]}...")
                print(f"   Is LIVE: {'checkout.stripe.com' in data['url']}")
                return True
            else:
                print(f"❌ Subscription checkout FAILED: Missing URL")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print(f"❌ Subscription checkout FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ Subscription checkout ERROR: {e}")
        return False

def test_checkout_dfy():
    """Test creating a LIVE DFY checkout session"""
    print("\n" + "="*80)
    print("TEST 3: DFY Package Checkout (DFY Starter)")
    print("="*80)
    
    try:
        response = requests.post(
            "http://localhost:8000/api/billing/checkout",
            json={"purchase_type": "dfy", "dfy_pack": "dfy_starter"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url"):
                print(f"✅ DFY checkout PASSED")
                print(f"   Checkout URL: {data['url'][:80]}...")
                return True
            else:
                print(f"❌ DFY checkout FAILED: Missing URL")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print(f"❌ DFY checkout FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ DFY checkout ERROR: {e}")
        return False

def test_checkout_addons():
    """Test creating a LIVE add-ons checkout session"""
    print("\n" + "="*80)
    print("TEST 4: Add-ons Checkout (Priority Support + Extra Workflows)")
    print("="*80)
    
    try:
        response = requests.post(
            "http://localhost:8000/api/billing/checkout",
            json={"addons": "addon_priority_support,addon_extra_workflows"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("url"):
                print(f"✅ Add-ons checkout PASSED")
                print(f"   Checkout URL: {data['url'][:80]}...")
                return True
            else:
                print(f"❌ Add-ons checkout FAILED: Missing URL")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print(f"❌ Add-ons checkout FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ Add-ons checkout ERROR: {e}")
        return False

def main():
    """Run all verification tests"""
    print("\n" + "🔍"*40)
    print("LEVQOR X - VERIFY LIVE BILLING CONFIGURATION")
    print("🔍"*40 + "\n")
    
    # Setup LIVE environment
    setup_live_env()
    
    # Run tests
    results = {
        "health": test_health_endpoint(),
        "subscription": test_checkout_subscription(),
        "dfy": test_checkout_dfy(),
        "addons": test_checkout_addons()
    }
    
    # Summary
    print("\n" + "="*80)
    print("VERIFICATION SUMMARY")
    print("="*80)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test.upper():<20} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL LIVE BILLING TESTS PASSED")
        print("\nLive billing is ready for production deployment!")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("\nPlease review the failures above before deploying to production.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
