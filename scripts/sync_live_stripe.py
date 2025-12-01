#!/usr/bin/env python3
"""
Sync all billing products and prices to LIVE Stripe
Mirrors TEST setup: subscriptions + DFY packages + add-ons
"""
import os
import sys
import stripe
from typing import Dict, List, Optional

# Force LIVE mode by setting REPLIT_DEPLOYMENT=1
os.environ["REPLIT_DEPLOYMENT"] = "1"

# Import after setting environment
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.stripe_connector import get_stripe_credentials

def init_stripe_live():
    """Initialize Stripe client in LIVE mode"""
    try:
        # Try to get LIVE key from STRIPE_SECRET_KEY secret
        live_key = os.environ.get("STRIPE_SECRET_KEY", "")
        
        if not live_key:
            raise ValueError("STRIPE_SECRET_KEY not found in environment")
        
        if not live_key.startswith("sk_live_"):
            raise ValueError(f"Expected LIVE key (sk_live_...), got: {live_key[:15]}...")
        
        stripe.api_key = live_key
        
        print("✅ Connected to Stripe LIVE mode")
        print(f"   Key: {live_key[:15]}...")
        
        return {"secret_key": live_key, "environment": "production"}
    except Exception as e:
        print(f"❌ Failed to connect to Stripe LIVE: {e}")
        sys.exit(1)

def list_all_products() -> List[Dict]:
    """List all products in LIVE Stripe"""
    products = []
    for product in stripe.Product.list(limit=100, active=True):
        products.append(product)
    return products

def list_all_prices(product_id: Optional[str] = None) -> List[Dict]:
    """List all prices in LIVE Stripe"""
    params = {"limit": 100, "active": True}
    if product_id:
        params["product"] = product_id
    
    prices = []
    for price in stripe.Price.list(**params):
        prices.append(price)
    return prices

def find_product_by_name(products: List[Dict], name: str) -> Optional[Dict]:
    """Find product by name (case-insensitive)"""
    name_lower = name.lower()
    for product in products:
        if product.name.lower() == name_lower:
            return product
    return None

def find_price(prices: List[Dict], product_id: str, amount: int, currency: str, 
               recurring: Optional[str] = None) -> Optional[Dict]:
    """Find price matching criteria"""
    for price in prices:
        if price.product != product_id:
            continue
        if price.unit_amount != amount:
            continue
        if price.currency != currency:
            continue
        
        if recurring:
            # Check recurring interval
            if not price.recurring or price.recurring.interval != recurring:
                continue
        else:
            # One-time payment
            if price.type != "one_time":
                continue
        
        return price
    return None

def create_product(name: str, description: str) -> Dict:
    """Create a new product"""
    print(f"  Creating product: {name}")
    product = stripe.Product.create(
        name=name,
        description=description,
        active=True
    )
    return product

def create_price(product_id: str, amount: int, currency: str, 
                 recurring: Optional[str] = None) -> Dict:
    """Create a new price"""
    params = {
        "product": product_id,
        "unit_amount": amount,
        "currency": currency,
        "active": True
    }
    
    if recurring:
        params["recurring"] = {"interval": recurring}
    
    interval_str = f"{recurring} recurring" if recurring else "one-time"
    print(f"    Creating price: {currency.upper()} {amount/100:.2f} ({interval_str})")
    
    price = stripe.Price.create(**params)
    return price

def ensure_subscription_products(products: List[Dict], all_prices: List[Dict]) -> Dict[str, Dict]:
    """Ensure all subscription tiers exist with monthly + yearly prices"""
    tiers = [
        ("Levqor X Starter", "Starter plan - Up to 5 workflows, 2,000 runs/month", 900, 9000),
        ("Levqor X Launch", "Launch plan - Up to 20 workflows, 10,000 runs/month", 2900, 29000),
        ("Levqor X Growth", "Growth plan - Up to 50 workflows, 50,000 runs/month", 5900, 59000),
        ("Levqor X Agency", "Agency plan - Up to 200 workflows, 200,000 runs/month", 14900, 149000)
    ]
    
    results = {}
    
    for name, desc, monthly_amount, yearly_amount in tiers:
        tier_key = name.split()[-1].lower()  # starter, launch, growth, agency
        print(f"\n{'='*60}")
        print(f"SUBSCRIPTION TIER: {name}")
        print(f"{'='*60}")
        
        # Find or create product
        product = find_product_by_name(products, name)
        if not product:
            product = create_product(name, desc)
            products.append(product)
        else:
            print(f"  ✅ Product exists: {product.id}")
        
        # Find or create monthly price
        monthly_price = find_price(all_prices, product.id, monthly_amount, "gbp", "month")
        if not monthly_price:
            monthly_price = create_price(product.id, monthly_amount, "gbp", "month")
            all_prices.append(monthly_price)
        else:
            print(f"    ✅ Monthly price exists: {monthly_price.id}")
        
        # Find or create yearly price
        yearly_price = find_price(all_prices, product.id, yearly_amount, "gbp", "year")
        if not yearly_price:
            yearly_price = create_price(product.id, yearly_amount, "gbp", "year")
            all_prices.append(yearly_price)
        else:
            print(f"    ✅ Yearly price exists: {yearly_price.id}")
        
        results[tier_key] = {
            "product": product,
            "monthly": monthly_price,
            "yearly": yearly_price
        }
    
    return results

def ensure_dfy_products(products: List[Dict], all_prices: List[Dict]) -> Dict[str, Dict]:
    """Ensure all DFY packages exist with one-time prices"""
    packages = [
        ("Levqor X DFY Starter", "Done-For-You Starter Package", 14900),
        ("Levqor X DFY Professional", "Done-For-You Professional Package", 29900),
        ("Levqor X DFY Enterprise", "Done-For-You Enterprise Package", 49900)
    ]
    
    results = {}
    
    for name, desc, amount in packages:
        package_key = "dfy_" + name.split()[-1].lower()  # dfy_starter, dfy_professional, dfy_enterprise
        print(f"\n{'='*60}")
        print(f"DFY PACKAGE: {name}")
        print(f"{'='*60}")
        
        # Find or create product
        product = find_product_by_name(products, name)
        if not product:
            product = create_product(name, desc)
            products.append(product)
        else:
            print(f"  ✅ Product exists: {product.id}")
        
        # Find or create one-time price
        price = find_price(all_prices, product.id, amount, "gbp", None)
        if not price:
            price = create_price(product.id, amount, "gbp", None)
            all_prices.append(price)
        else:
            print(f"    ✅ One-time price exists: {price.id}")
        
        results[package_key] = {
            "product": product,
            "price": price
        }
    
    return results

def ensure_addon_products(products: List[Dict], all_prices: List[Dict]) -> Dict[str, Dict]:
    """Ensure all add-on products exist with monthly recurring prices"""
    addons = [
        ("Levqor X Priority Support", "Priority support with faster response times", 2900),
        ("Levqor X SLA 99.9%", "99.9% uptime SLA guarantee", 4900),
        ("Levqor X White Label", "White label branding", 9900),
        ("Levqor X Extra Workflow Pack", "Additional 50 workflows", 1000)
    ]
    
    results = {}
    
    for name, desc, amount in addons:
        # Map to addon keys
        addon_map = {
            "Priority Support": "addon_priority_support",
            "SLA 99.9%": "addon_sla_99",
            "White Label": "addon_white_label",
            "Extra Workflow Pack": "addon_extra_workflows"
        }
        addon_key = None
        for key, value in addon_map.items():
            if key in name:
                addon_key = value
                break
        
        if not addon_key:
            continue
        
        print(f"\n{'='*60}")
        print(f"ADD-ON: {name}")
        print(f"{'='*60}")
        
        # Find or create product
        product = find_product_by_name(products, name)
        if not product:
            product = create_product(name, desc)
            products.append(product)
        else:
            print(f"  ✅ Product exists: {product.id}")
        
        # Find or create monthly recurring price
        price = find_price(all_prices, product.id, amount, "gbp", "month")
        if not price:
            price = create_price(product.id, amount, "gbp", "month")
            all_prices.append(price)
        else:
            print(f"    ✅ Monthly price exists: {price.id}")
        
        results[addon_key] = {
            "product": product,
            "price": price
        }
    
    return results

def print_summary_table(products: List[Dict], all_prices: List[Dict]):
    """Print summary table of all LIVE products and prices"""
    print("\n" + "="*120)
    print("LIVE STRIPE PRODUCTS & PRICES SUMMARY")
    print("="*120)
    print(f"{'Product Name':<40} {'Price ID':<35} {'Amount':<12} {'Currency':<8} {'Interval':<12} {'Active'}")
    print("-"*120)
    
    for product in sorted(products, key=lambda p: p.name):
        product_prices = [p for p in all_prices if p.product == product.id]
        
        if not product_prices:
            print(f"{product.name:<40} {'(no prices)':<35} {'-':<12} {'-':<8} {'-':<12} {product.active}")
        else:
            for i, price in enumerate(sorted(product_prices, key=lambda p: p.unit_amount)):
                product_name = product.name if i == 0 else ""
                amount = f"£{price.unit_amount/100:.2f}"
                interval = price.recurring.interval if price.recurring else "one-time"
                print(f"{product_name:<40} {price.id:<35} {amount:<12} {price.currency.upper():<8} {interval:<12} {price.active}")
    
    print("="*120)

def generate_env_vars(subscriptions: Dict, dfy: Dict, addons: Dict):
    """Generate STRIPE_PRICE_* environment variable mappings"""
    print("\n" + "="*80)
    print("LIVE STRIPE PRICE ENV VARS")
    print("="*80)
    print("\n# SUBSCRIPTION TIERS (Monthly + Yearly)")
    
    for tier in ["starter", "launch", "growth", "agency"]:
        if tier in subscriptions:
            monthly_id = subscriptions[tier]["monthly"].id
            yearly_id = subscriptions[tier]["yearly"].id
            print(f"STRIPE_PRICE_{tier.upper()}={monthly_id}")
            print(f"STRIPE_PRICE_{tier.upper()}_YEAR={yearly_id}")
    
    print("\n# DFY PACKAGES (One-Time)")
    for package in ["dfy_starter", "dfy_professional", "dfy_enterprise"]:
        if package in dfy:
            price_id = dfy[package]["price"].id
            print(f"STRIPE_PRICE_{package.upper()}={price_id}")
    
    print("\n# ADD-ONS (Monthly Recurring)")
    for addon in ["addon_priority_support", "addon_sla_99", "addon_white_label", "addon_extra_workflows"]:
        if addon in addons:
            price_id = addons[addon]["price"].id
            env_key = f"STRIPE_PRICE_{addon.upper()}"
            print(f"{env_key}={price_id}")
    
    print("\n" + "="*80)

def main():
    """Main execution"""
    print("\n" + "🚀"*40)
    print("LEVQOR X - SYNC ALL BILLING TO LIVE STRIPE")
    print("🚀"*40)
    
    # PHASE 1: Initialize and discover
    print("\n" + "="*80)
    print("PHASE 1: DISCOVER CURRENT LIVE STRIPE STATE")
    print("="*80)
    
    init_stripe_live()
    
    print("\nFetching all LIVE products...")
    products = list_all_products()
    print(f"Found {len(products)} active products")
    
    print("\nFetching all LIVE prices...")
    all_prices = list_all_prices()
    print(f"Found {len(all_prices)} active prices")
    
    print_summary_table(products, all_prices)
    
    # PHASE 2: Ensure all required products/prices exist
    print("\n" + "="*80)
    print("PHASE 2: ENSURE REQUIRED LIVE PRODUCTS/PRICES EXIST")
    print("="*80)
    
    subscriptions = ensure_subscription_products(products, all_prices)
    print(f"\n✅ Subscriptions configured: {len(subscriptions)}/4 tiers")
    
    dfy = ensure_dfy_products(products, all_prices)
    print(f"\n✅ DFY packages configured: {len(dfy)}/3 packages")
    
    addons = ensure_addon_products(products, all_prices)
    print(f"\n✅ Add-ons configured: {len(addons)}/4 add-ons")
    
    # PHASE 3: Generate env var mappings
    print("\n" + "="*80)
    print("PHASE 3: GENERATE STRIPE_PRICE_* ENV MAPPINGS")
    print("="*80)
    
    generate_env_vars(subscriptions, dfy, addons)
    
    # Final summary
    print("\n" + "✅"*40)
    print("SYNC COMPLETE - ALL LIVE PRODUCTS & PRICES CONFIGURED")
    print("✅"*40)
    print(f"\n📊 Summary:")
    print(f"   • Subscription tiers: {len(subscriptions)}/4 ({len(subscriptions)*2} prices)")
    print(f"   • DFY packages: {len(dfy)}/3 (3 prices)")
    print(f"   • Add-ons: {len(addons)}/4 (4 prices)")
    print(f"   • Total: {len(subscriptions)*2 + len(dfy) + len(addons)} LIVE prices configured")
    print("\nNext steps:")
    print("1. Copy the STRIPE_PRICE_* env vars above")
    print("2. Update production secrets with LIVE price IDs")
    print("3. Verify /api/billing/health reports all prices correctly")
    print("4. Test checkout session creation in LIVE mode")

if __name__ == "__main__":
    main()
