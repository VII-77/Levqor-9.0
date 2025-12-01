#!/usr/bin/env python3
"""
Setup Stripe Add-on Products and Prices
Creates 4 recurring add-on products in TEST mode
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import stripe
from modules.stripe_connector import get_stripe_secret_key

# Add-on definitions
ADDONS = [
    {
        "code": "addon_priority_support",
        "name": "Priority Support",
        "description": "Get faster responses and higher priority in support queue",
        "price_gbp": 29,
    },
    {
        "code": "addon_sla_99",
        "name": "SLA 99.9%",
        "description": "99.9% uptime guarantee with SLA commitment",
        "price_gbp": 49,
    },
    {
        "code": "addon_white_label",
        "name": "White Label",
        "description": "Remove Levqor branding and use your custom brand",
        "price_gbp": 99,
    },
    {
        "code": "addon_extra_workflows",
        "name": "Extra Workflow Pack",
        "description": "Add extra automation workflow capacity to your plan",
        "price_gbp": 10,
    },
]


def setup_addons():
    """Create or verify add-on products and prices in Stripe"""
    print("=" * 60)
    print("STRIPE ADD-ON SETUP (TEST MODE)")
    print("=" * 60)
    print()
    
    # Get Stripe credentials from connector
    try:
        stripe.api_key = get_stripe_secret_key()
        print(f"✓ Connected to Stripe (TEST mode)")
        print()
    except Exception as e:
        print(f"✗ Failed to get Stripe credentials: {e}")
        return
    
    env_lines = []
    
    for addon in ADDONS:
        code = addon["code"]
        name = addon["name"]
        description = addon["description"]
        amount = addon["price_gbp"]
        
        print(f"Setting up: {name} (£{amount}/month)")
        print(f"  Code: {code}")
        
        try:
            # Search for existing product
            products = stripe.Product.list(limit=100)
            existing_product = None
            
            for p in products.auto_paging_iter():
                if p.name == name:
                    existing_product = p
                    break
            
            if existing_product:
                print(f"  ✓ Product exists: {existing_product.id}")
                product = existing_product
            else:
                # Create new product
                product = stripe.Product.create(
                    name=name,
                    description=description,
                    metadata={"addon_code": code}
                )
                print(f"  ✓ Created product: {product.id}")
            
            # Find or create monthly recurring price in GBP
            prices = stripe.Price.list(product=product.id, limit=100)
            existing_price = None
            
            for price in prices.data:
                if (price.currency == "gbp" and
                    price.unit_amount == amount * 100 and
                    price.recurring and
                    price.recurring.interval == "month" and
                    price.active):
                    existing_price = price
                    break
            
            if existing_price:
                print(f"  ✓ Price exists: {existing_price.id} (£{amount}/month)")
                price_id = existing_price.id
            else:
                # Create new price
                new_price = stripe.Price.create(
                    product=product.id,
                    currency="gbp",
                    unit_amount=amount * 100,
                    recurring={"interval": "month"},
                    metadata={"addon_code": code}
                )
                print(f"  ✓ Created price: {new_price.id} (£{amount}/month)")
                price_id = new_price.id
            
            # Generate env var line
            env_var_name = f"STRIPE_PRICE_{code.upper()}"
            env_lines.append(f"{env_var_name}={price_id}")
            print(f"  → {env_var_name}")
            print()
            
        except stripe.error.StripeError as e:
            print(f"  ✗ Stripe error: {e}")
            print()
            continue
        except Exception as e:
            print(f"  ✗ Unexpected error: {e}")
            print()
            continue
    
    print("=" * 60)
    print("ENVIRONMENT VARIABLES")
    print("=" * 60)
    print()
    for line in env_lines:
        print(line)
    print()
    
    print("=" * 60)
    print(f"✓ Setup complete: {len(env_lines)}/4 add-ons configured")
    print("=" * 60)
    
    return env_lines


if __name__ == "__main__":
    setup_addons()
