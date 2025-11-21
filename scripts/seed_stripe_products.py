#!/usr/bin/env python3
"""
Stripe Product Seeding Script
Creates products and prices in Stripe via API using Replit connector credentials

Usage:
    python scripts/seed_stripe_products.py

This script is safe to run multiple times - it checks if products exist before creating.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.stripe_connector import get_stripe_secret_key, is_stripe_configured
import stripe


# Product definitions for Levqor
PRODUCTS = [
    {
        "name": "Starter",
        "description": "Perfect for getting started with Levqor",
        "prices": [
            {"interval": "month", "amount": 2900, "currency": "usd"},  # $29/month
            {"interval": "year", "amount": 29000, "currency": "usd"},  # $290/year
        ]
    },
    {
        "name": "Launch",
        "description": "Great for launching your business",
        "prices": [
            {"interval": "month", "amount": 9900, "currency": "usd"},  # $99/month
            {"interval": "year", "amount": 99000, "currency": "usd"},  # $990/year
        ]
    },
    {
        "name": "Growth",
        "description": "Scale your business with advanced features",
        "prices": [
            {"interval": "month", "amount": 29900, "currency": "usd"},  # $299/month
            {"interval": "year", "amount": 299000, "currency": "usd"},  # $2990/year
        ]
    },
    {
        "name": "Scale",
        "description": "Enterprise-grade capabilities for scaling teams",
        "prices": [
            {"interval": "month", "amount": 99900, "currency": "usd"},  # $999/month
            {"interval": "year", "amount": 999000, "currency": "usd"},  # $9990/year
        ]
    },
    {
        "name": "Business",
        "description": "Full business support and dedicated resources",
        "prices": [
            {"interval": "month", "amount": 199900, "currency": "usd"},  # $1999/month
            {"interval": "year", "amount": 1999000, "currency": "usd"},  # $19990/year
        ]
    },
]


def check_product_exists(stripe_client, product_name):
    """Check if a product with the given name already exists"""
    try:
        products = stripe_client.products.search(query=f"name:'{product_name}'")
        return products.data[0] if products.data else None
    except Exception as e:
        print(f"Error searching for product '{product_name}': {e}")
        return None


def create_product_with_prices(stripe_client, product_def):
    """Create a product and its prices, or return existing"""
    product_name = product_def["name"]
    
    # Check if product already exists
    existing_product = check_product_exists(stripe_client, product_name)
    if existing_product:
        print(f"✓ Product '{product_name}' already exists (ID: {existing_product.id})")
        product = existing_product
    else:
        # Create product
        try:
            product = stripe_client.products.create(
                name=product_def["name"],
                description=product_def["description"],
                metadata={
                    "source": "levqor_seed_script",
                    "tier": product_def["name"].lower()
                }
            )
            print(f"✓ Created product: {product_name} (ID: {product.id})")
        except Exception as e:
            print(f"✗ Error creating product '{product_name}': {e}")
            return None
    
    # Create prices for the product
    created_prices = []
    for price_def in product_def["prices"]:
        interval = price_def["interval"]
        amount = price_def["amount"]
        currency = price_def["currency"]
        
        # Check if price already exists
        existing_prices = stripe_client.prices.list(
            product=product.id,
            active=True,
            limit=100
        )
        
        price_exists = any(
            p.recurring and 
            p.recurring.interval == interval and 
            p.unit_amount == amount and 
            p.currency == currency
            for p in existing_prices.data
        )
        
        if price_exists:
            print(f"  ✓ Price already exists: ${amount/100}/{interval}")
            continue
        
        # Create price
        try:
            price = stripe_client.prices.create(
                product=product.id,
                unit_amount=amount,
                currency=currency,
                recurring={"interval": interval},
                metadata={
                    "tier": product_def["name"].lower(),
                    "billing_interval": interval
                }
            )
            created_prices.append(price)
            print(f"  ✓ Created price: ${amount/100}/{interval} (ID: {price.id})")
        except Exception as e:
            print(f"  ✗ Error creating price for {product_name}: {e}")
    
    return {
        "product": product,
        "prices": created_prices
    }


def main():
    """Main seeding function"""
    print("=" * 60)
    print("Levqor Stripe Product Seeding Script")
    print("=" * 60)
    print()
    
    # Check if Stripe is configured
    if not is_stripe_configured():
        print("✗ Stripe is not configured!")
        print("Please set up the Stripe integration in Replit first.")
        sys.exit(1)
    
    # Get Stripe client with connector credentials
    try:
        api_key = get_stripe_secret_key()
        stripe_client = stripe.Stripe(api_key=api_key)
        print("✓ Connected to Stripe using Replit connector")
        print()
    except Exception as e:
        print(f"✗ Failed to connect to Stripe: {e}")
        sys.exit(1)
    
    # Create products and prices
    results = []
    for product_def in PRODUCTS:
        result = create_product_with_prices(stripe_client, product_def)
        if result:
            results.append(result)
        print()
    
    # Summary
    print("=" * 60)
    print(f"Summary: Created/verified {len(results)} products")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Check your Stripe Dashboard to verify products")
    print("2. Copy the price IDs and update your environment variables:")
    print()
    
    for result in results:
        product = result["product"]
        print(f"{product.name}:")
        prices = stripe_client.prices.list(product=product.id, active=True, limit=100)
        for price in prices.data:
            if price.recurring:
                interval = price.recurring.interval
                env_var = f"STRIPE_PRICE_{product.name.upper()}_{interval.upper()}"
                print(f"  {env_var}={price.id}")
        print()
    
    print("3. Use these price IDs in your checkout flow")
    print("4. Test the checkout endpoint: /api/billing/checkout")


if __name__ == "__main__":
    main()
