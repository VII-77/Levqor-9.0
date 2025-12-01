#!/usr/bin/env python3
"""
Map active Stripe prices to correct environment variables
Uses Replit Stripe integration to find best matches
"""
import sys
import os
sys.path.insert(0, '/home/runner/workspace')

from modules.stripe_connector import get_stripe_secret_key
import stripe

stripe.api_key = get_stripe_secret_key()

# Desired tier pricing (in cents)
TIER_PRICING = {
    "starter": {"month": 2900, "year": 29000},     # $29/month, $290/year
    "launch": {"month": 900, "year": 9000},        # $9/month, $90/year
    "growth": {"month": 29900, "year": 299000},    # $299/month, $2990/year
    "scale": {"month": 5900, "year": 59000},       # $59/month, $590/year
    "business": {"month": 199900, "year": 1999000}, # $1999/month, $19990/year
}

print("=" * 70)
print("Finding Active Prices for Each Tier")
print("=" * 70)
print()

# Get all active prices
prices = stripe.Price.list(active=True, limit=100)

# Build mapping
tier_mapping = {}

for tier_name, amounts in TIER_PRICING.items():
    tier_mapping[tier_name] = {"month": None, "year": None}
    
    for price in prices.data:
        if not price.recurring:
            continue
        
        interval = price.recurring.interval
        target_amount = amounts.get(interval)
        
        if price.unit_amount == target_amount:
            tier_mapping[tier_name][interval] = price.id
            print(f"✅ {tier_name.upper()} {interval}: ${price.unit_amount/100} → {price.id}")

print()
print("=" * 70)
print("Environment Variable Updates Needed:")
print("=" * 70)
print()

for tier_name, intervals in tier_mapping.items():
    env_prefix = f"STRIPE_PRICE_{tier_name.upper()}"
    
    if intervals["month"]:
        print(f"{env_prefix}={intervals['month']}")
    else:
        print(f"{env_prefix}=NOT_FOUND (need ${TIER_PRICING[tier_name]['month']/100}/month)")
    
    if intervals["year"]:
        print(f"{env_prefix}_YEAR={intervals['year']}")
    else:
        print(f"{env_prefix}_YEAR=NOT_FOUND (need ${TIER_PRICING[tier_name]['year']/100}/year)")
    print()

print("=" * 70)
print("Copy these values to Replit Secrets to fix checkout")
print("=" * 70)
