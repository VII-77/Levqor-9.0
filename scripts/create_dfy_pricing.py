#!/usr/bin/env python3
"""
Create DFY Pricing Structure in Stripe
Tiers: Starter £9, Launch £29, Growth £59, Agency £149
"""
import sys
import os
sys.path.insert(0, '/home/runner/workspace')

from modules.stripe_connector import get_stripe_secret_key
import stripe

stripe.api_key = get_stripe_secret_key()

TARGET_CURRENCY = "gbp"
TIERS = [
    {"code": "starter", "name": "Starter", "amount": 9, "description": "Perfect for getting started with basic data management"},
    {"code": "launch", "name": "Launch", "amount": 29, "description": "Essential tools to launch your data operations"},
    {"code": "growth", "name": "Growth", "amount": 59, "description": "Advanced features for growing teams"},
    {"code": "agency", "name": "Agency", "amount": 149, "description": "Complete solution for agencies and enterprises"},
]

print("=" * 80)
print("LEVQOR X DFY PRICING CREATION")
print("=" * 80)
print()

print("Step 1: Fetching existing products...")
products = stripe.Product.list(limit=100, active=True)
by_name = {p.name.lower(): p for p in products.data}

created_or_used = {}

for tier in TIERS:
    key = tier["name"].lower()
    if key in by_name:
        product = by_name[key]
        print(f"  ✅ Using existing product: {product.id} ({tier['name']})")
    else:
        product = stripe.Product.create(
            name=tier["name"],
            active=True,
            description=tier["description"],
            metadata={"levqor_tier": tier["code"], "currency": TARGET_CURRENCY}
        )
        print(f"  ✨ Created product: {product.id} ({tier['name']})")
    created_or_used[tier["code"]] = product

print()
print("Step 2: Creating/updating monthly + yearly prices...")
print()

env_lines = []

for tier in TIERS:
    code = tier["code"]
    product = created_or_used[code]
    monthly_amount = tier["amount"]
    yearly_amount = monthly_amount * 10  # £90, £290, £590, £1490

    print(f"Processing {tier['name']} (£{monthly_amount}/month, £{yearly_amount}/year)...")
    
    # Get all prices for this product
    prices = stripe.Price.list(product=product.id, limit=50)
    monthly_price = None
    yearly_price = None

    # Find existing prices
    for p in prices.data:
        recurring = p.recurring
        if not recurring:
            continue
        
        if (recurring.interval == "month" and 
            p.unit_amount == monthly_amount * 100 and 
            p.currency == TARGET_CURRENCY):
            monthly_price = p
        
        if (recurring.interval == "year" and 
            p.unit_amount == yearly_amount * 100 and 
            p.currency == TARGET_CURRENCY):
            yearly_price = p

    # Create monthly if doesn't exist
    if not monthly_price:
        monthly_price = stripe.Price.create(
            product=product.id,
            unit_amount=monthly_amount * 100,
            currency=TARGET_CURRENCY,
            recurring={"interval": "month"},
            nickname=f"{tier['name']} Monthly",
            active=True,
        )
        print(f"  ✨ Created monthly price: {monthly_price.id} (£{monthly_amount})")
    else:
        # Ensure it's active
        if not monthly_price.active:
            monthly_price = stripe.Price.modify(monthly_price.id, active=True)
            print(f"  ⚡ Activated monthly price: {monthly_price.id} (£{monthly_amount})")
        else:
            print(f"  ✅ Active monthly price: {monthly_price.id} (£{monthly_amount})")

    # Create yearly if doesn't exist
    if not yearly_price:
        yearly_price = stripe.Price.create(
            product=product.id,
            unit_amount=yearly_amount * 100,
            currency=TARGET_CURRENCY,
            recurring={"interval": "year"},
            nickname=f"{tier['name']} Yearly",
            active=True,
        )
        print(f"  ✨ Created yearly price: {yearly_price.id} (£{yearly_amount})")
    else:
        # Ensure it's active
        if not yearly_price.active:
            yearly_price = stripe.Price.modify(yearly_price.id, active=True)
            print(f"  ⚡ Activated yearly price: {yearly_price.id} (£{yearly_amount})")
        else:
            print(f"  ✅ Active yearly price: {yearly_price.id} (£{yearly_amount})")

    env_lines.append(f"STRIPE_PRICE_{code.upper()}={monthly_price.id}")
    env_lines.append(f"STRIPE_PRICE_{code.upper()}_YEAR={yearly_price.id}")
    print()

print("=" * 80)
print("ENVIRONMENT VARIABLES TO SET IN REPLIT SECRETS")
print("=" * 80)
for line in env_lines:
    print(line)
print("=" * 80)
print()
print("✅ Stripe DFY pricing structure created successfully!")
print()
print("Next steps:")
print("1. Copy the environment variables above into Replit Secrets")
print("2. Update backend billing logic to use these tier codes")
print("3. Update frontend pricing page to display these tiers")
