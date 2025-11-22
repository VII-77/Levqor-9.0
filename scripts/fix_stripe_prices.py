#!/usr/bin/env python3
"""
Fix Stripe prices - activate or update to active ones
Uses Replit Stripe integration
"""
import sys
import os
sys.path.insert(0, '/home/runner/workspace')

from modules.stripe_connector import get_stripe_secret_key
import stripe

# Initialize Stripe
stripe.api_key = get_stripe_secret_key()

# Get current environment price IDs
current_prices = {
    "STARTER": os.environ.get("STRIPE_PRICE_STARTER"),
    "LAUNCH": os.environ.get("STRIPE_PRICE_LAUNCH"),
    "GROWTH": os.environ.get("STRIPE_PRICE_GROWTH"),
    "SCALE": os.environ.get("STRIPE_PRICE_SCALE"),
    "BUSINESS": os.environ.get("STRIPE_PRICE_BUSINESS"),
}

print("=" * 70)
print("Checking Stripe Price Status")
print("=" * 70)
print()

for tier, price_id in current_prices.items():
    if not price_id:
        print(f"{tier}: ⚠️  No price ID configured")
        continue
    
    try:
        price = stripe.Price.retrieve(price_id)
        status = "✅ ACTIVE" if price.active else "❌ INACTIVE"
        amount = f"${price.unit_amount/100}" if price.unit_amount else "N/A"
        interval = price.recurring.interval if price.recurring else "one-time"
        
        print(f"{tier}: {status}")
        print(f"  Price ID: {price_id}")
        print(f"  Amount: {amount}/{interval}")
        
        # Try to activate if inactive
        if not price.active:
            print(f"  → Attempting to activate...")
            try:
                updated = stripe.Price.modify(price_id, active=True)
                if updated.active:
                    print(f"  ✅ Successfully activated!")
                else:
                    print(f"  ❌ Activation failed")
            except Exception as e:
                print(f"  ❌ Cannot activate: {str(e)}")
        print()
    except Exception as e:
        print(f"{tier}: ❌ ERROR - {str(e)}")
        print()

print("=" * 70)
print("Recommendation:")
print("=" * 70)
print("If prices cannot be activated, find active replacements in Stripe")
print("Dashboard and update environment variables.")
