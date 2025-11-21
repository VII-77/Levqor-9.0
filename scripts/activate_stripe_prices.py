#!/usr/bin/env python3
"""
Stripe Price Activation Script
Uses Replit Stripe integration to verify and activate all pricing tiers
Safe to run multiple times - checks what exists first

Usage:
    python scripts/activate_stripe_prices.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.stripe_connector import get_stripe_secret_key, is_stripe_configured
import stripe


PRICING_TIERS = [
    {
        "tier": "Starter",
        "env_prefix": "STRIPE_PRICE_STARTER",
        "prices": [
            {"interval": "month", "amount": 2900},
            {"interval": "year", "amount": 29000},
        ]
    },
    {
        "tier": "Launch",
        "env_prefix": "STRIPE_PRICE_LAUNCH",
        "prices": [
            {"interval": "month", "amount": 9900},
            {"interval": "year", "amount": 99000},
        ]
    },
    {
        "tier": "Growth",
        "env_prefix": "STRIPE_PRICE_GROWTH",
        "prices": [
            {"interval": "month", "amount": 29900},
            {"interval": "year", "amount": 299000},
        ]
    },
    {
        "tier": "Scale",
        "env_prefix": "STRIPE_PRICE_SCALE",
        "prices": [
            {"interval": "month", "amount": 99900},
            {"interval": "year", "amount": 999000},
        ]
    },
    {
        "tier": "Business",
        "env_prefix": "STRIPE_PRICE_BUSINESS",
        "prices": [
            {"interval": "month", "amount": 199900},
            {"interval": "year", "amount": 1999000},
        ]
    },
]


def activate_prices(stripe_client):
    """Activate all prices for all tiers"""
    print("=" * 60)
    print("Stripe Price Activation via Replit Integration")
    print("=" * 60)
    print()
    
    results = {
        "active": [],
        "already_active": [],
        "errors": []
    }
    
    for tier_config in PRICING_TIERS:
        tier_name = tier_config["tier"]
        env_prefix = tier_config["env_prefix"]
        
        print(f"Processing {tier_name}:")
        
        for price_info in tier_config["prices"]:
            interval = price_info["interval"]
            env_key = f"{env_prefix}_{interval.upper()}" if interval != "month" else env_prefix
            price_id = os.environ.get(env_key)
            
            if not price_id:
                print(f"  ⚠️ {interval}: Price ID not found in {env_key}")
                continue
            
            try:
                # Fetch the price to check status
                price = stripe_client.prices.retrieve(price_id)
                
                if price.active:
                    print(f"  ✓ {interval}: Already active ({price_id})")
                    results["already_active"].append({
                        "tier": tier_name,
                        "interval": interval,
                        "price_id": price_id,
                        "amount": price.unit_amount
                    })
                else:
                    # Activate the price
                    updated_price = stripe_client.prices.update(price_id, active=True)
                    print(f"  ✓ {interval}: Activated ({price_id})")
                    results["active"].append({
                        "tier": tier_name,
                        "interval": interval,
                        "price_id": price_id,
                        "amount": updated_price.unit_amount
                    })
            except stripe.error.InvalidRequestError as e:
                error_msg = str(e)
                print(f"  ✗ {interval}: {error_msg}")
                results["errors"].append({
                    "tier": tier_name,
                    "interval": interval,
                    "price_id": price_id,
                    "error": error_msg
                })
            except Exception as e:
                error_msg = str(e)
                print(f"  ✗ {interval}: Unexpected error: {error_msg}")
                results["errors"].append({
                    "tier": tier_name,
                    "interval": interval,
                    "price_id": price_id,
                    "error": error_msg
                })
        
        print()
    
    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✓ Newly activated: {len(results['active'])} prices")
    print(f"✓ Already active: {len(results['already_active'])} prices")
    print(f"✗ Errors: {len(results['errors'])} prices")
    print()
    
    if results["active"]:
        print("Newly Activated:")
        for p in results["active"]:
            print(f"  - {p['tier']} ({p['interval']}): ${p['amount']/100} (ID: {p['price_id']})")
        print()
    
    if results["errors"]:
        print("⚠️  Errors Found:")
        for err in results["errors"]:
            print(f"  - {err['tier']} ({err['interval']}): {err['error']}")
        print()
    
    total_activated = len(results["active"]) + len(results["already_active"])
    print(f"✅ Total Active Prices: {total_activated}")
    print()
    
    if total_activated >= 10:
        print("🎉 All pricing tiers are now active!")
        print()
        print("Your checkout flow is ready. Test with:")
        print('  curl -X POST http://localhost:8000/api/billing/checkout \\')
        print('    -H "Content-Type: application/json" \\')
        print('    -d \'{"tier": "starter", "billing_interval": "month"}\'')
    else:
        print(f"⚠️  Still need to activate {10 - total_activated} prices")


def main():
    # Check if Stripe is configured
    if not is_stripe_configured():
        print("✗ Stripe is not configured!")
        print("Please set up the Stripe integration in Replit first.")
        sys.exit(1)
    
    try:
        api_key = get_stripe_secret_key()
        stripe_client = stripe.Stripe(api_key=api_key)
        print("✓ Connected to Stripe using Replit integration")
        print()
    except Exception as e:
        print(f"✗ Failed to connect to Stripe: {e}")
        sys.exit(1)
    
    activate_prices(stripe_client)


if __name__ == "__main__":
    main()
