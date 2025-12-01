#!/usr/bin/env python3
"""
Test LIVE checkout session creation directly with Stripe API
Bypasses backend to test LIVE prices work correctly
"""
import os
import sys
import stripe

# LIVE price IDs
LIVE_PRICES = {
    "starter": "price_1SW5zmBNwdcDOF99v8j2jdEN",
    "starter_year": "price_1SW5zmBNwdcDOF99Xt9jxP4w",
    "launch": "price_1SW5zmBNwdcDOF99BvLeIOY1",
    "launch_year": "price_1SW5zmBNwdcDOF99iJatpyVd",
    "growth": "price_1SW5znBNwdcDOF993dJ2LxUu",
    "growth_year": "price_1SW5znBNwdcDOF99jHLnbgAm",
    "agency": "price_1SW5znBNwdcDOF991WJRJuSC",
    "agency_year": "price_1SW5znBNwdcDOF99iCB3blS0",
    "dfy_starter": "price_1SW5zoBNwdcDOF99SLdCP484",
    "dfy_professional": "price_1SW5zoBNwdcDOF99LKhSEow6",
    "dfy_enterprise": "price_1SW5zoBNwdcDOF99yEuejfTJ",
    "addon_priority_support": "price_1SW5zoBNwdcDOF99fb2rBq17",
    "addon_sla_99": "price_1SW5zpBNwdcDOF99jcZ90vkG",
    "addon_white_label": "price_1SW5zpBNwdcDOF995naLMZD8",
    "addon_extra_workflows": "price_1SW5zpBNwdcDOF995MpJq8eA",
}

def init_stripe():
    """Initialize Stripe with LIVE key"""
    live_key = os.environ.get("STRIPE_SECRET_KEY", "")
    
    if not live_key.startswith("sk_live_"):
        print(f"❌ STRIPE_SECRET_KEY is not a LIVE key: {live_key[:15]}...")
        sys.exit(1)
    
    stripe.api_key = live_key
    print(f"✅ Initialized Stripe LIVE: {live_key[:15]}...\n")

def test_subscription_checkout(tier: str, interval: str):
    """Test creating a subscription checkout session"""
    price_key = f"{tier}_{interval}" if interval == "year" else tier
    price_id = LIVE_PRICES.get(price_key)
    
    if not price_id:
        print(f"❌ No price ID found for {tier} ({interval})")
        return False
    
    print(f"Testing {tier.upper()} subscription ({interval})...")
    print(f"  Price ID: {price_id}")
    
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
            metadata={
                "purchase_type": "subscription",
                "tier": tier,
                "interval": interval
            }
        )
        
        print(f"  ✅ Session created: {session.id}")
        print(f"  URL: {session.url[:70]}...")
        return True
    
    except stripe.error.StripeError as e:
        print(f"  ❌ Stripe error: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_dfy_checkout(package: str):
    """Test creating a DFY checkout session"""
    price_id = LIVE_PRICES.get(package)
    
    if not price_id:
        print(f"❌ No price ID found for {package}")
        return False
    
    print(f"Testing {package.upper()} DFY package...")
    print(f"  Price ID: {price_id}")
    
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
            metadata={
                "purchase_type": "dfy",
                "package": package
            }
        )
        
        print(f"  ✅ Session created: {session.id}")
        print(f"  URL: {session.url[:70]}...")
        return True
    
    except stripe.error.StripeError as e:
        print(f"  ❌ Stripe error: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_addon_checkout(addons: list):
    """Test creating an add-ons checkout session"""
    line_items = []
    
    for addon in addons:
        price_id = LIVE_PRICES.get(addon)
        if not price_id:
            print(f"❌ No price ID found for {addon}")
            return False
        line_items.append({"price": price_id, "quantity": 1})
    
    addon_names = ", ".join([a.replace("addon_", "").replace("_", " ").title() for a in addons])
    print(f"Testing add-ons: {addon_names}...")
    for addon in addons:
        print(f"  {addon}: {LIVE_PRICES.get(addon)}")
    
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=line_items,
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel",
            metadata={
                "purchase_type": "addons",
                "addons": ",".join(addons)
            }
        )
        
        print(f"  ✅ Session created: {session.id}")
        print(f"  URL: {session.url[:70]}...")
        return True
    
    except stripe.error.StripeError as e:
        print(f"  ❌ Stripe error: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "🧪"*40)
    print("LIVE CHECKOUT DIRECT TESTING (Stripe API)")
    print("🧪"*40 + "\n")
    
    init_stripe()
    
    results = []
    
    # Test subscriptions
    print("="*80)
    print("SUBSCRIPTION CHECKOUTS")
    print("="*80)
    results.append(("Starter (Monthly)", test_subscription_checkout("starter", "month")))
    results.append(("Launch (Yearly)", test_subscription_checkout("launch", "year")))
    print()
    
    # Test DFY packages
    print("="*80)
    print("DFY PACKAGE CHECKOUTS")
    print("="*80)
    results.append(("DFY Starter", test_dfy_checkout("dfy_starter")))
    results.append(("DFY Professional", test_dfy_checkout("dfy_professional")))
    print()
    
    # Test add-ons
    print("="*80)
    print("ADD-ON CHECKOUTS")
    print("="*80)
    results.append(("Priority Support (single)", test_addon_checkout(["addon_priority_support"])))
    results.append(("Multiple Add-ons", test_addon_checkout(["addon_sla_99", "addon_white_label"])))
    print()
    
    # Summary
    print("="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total = len(results)
    passed = sum(1 for _, result in results if result)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:<30} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ ALL LIVE CHECKOUT TESTS PASSED")
        print("\nAll LIVE price IDs are valid and checkout sessions can be created successfully!")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("\nPlease review the failures above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
