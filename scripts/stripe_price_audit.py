#!/usr/bin/env python3
"""
Stripe Price Audit Script
Verifies all Stripe price IDs in .env.production are valid and active in Stripe.
"""

import os
import sys
from pathlib import Path

try:
    import stripe
except ImportError:
    print("ERROR: stripe package not installed. Run: pip install stripe")
    sys.exit(1)

ENV_FILE = Path(__file__).parent.parent / "levqor-site" / ".env.production"
if not ENV_FILE.exists():
    ENV_FILE = Path(__file__).parent.parent / ".env.production"

REQUIRED_KEYS = {
    "STRIPE_PRICE_STARTER": ("Starter Monthly", "month"),
    "STRIPE_PRICE_STARTER_YEAR": ("Starter Yearly", "year"),
    "STRIPE_PRICE_LAUNCH": ("Launch Monthly", "month"),
    "STRIPE_PRICE_LAUNCH_YEAR": ("Launch Yearly", "year"),
    "STRIPE_PRICE_GROWTH": ("Growth Monthly", "month"),
    "STRIPE_PRICE_GROWTH_YEAR": ("Growth Yearly", "year"),
    "STRIPE_PRICE_AGENCY": ("Agency Monthly", "month"),
    "STRIPE_PRICE_AGENCY_YEAR": ("Agency Yearly", "year"),
    "STRIPE_PRICE_DFY_STARTER": ("DFY Starter", "one_time"),
    "STRIPE_PRICE_DFY_PROFESSIONAL": ("DFY Professional", "one_time"),
    "STRIPE_PRICE_DFY_ENTERPRISE": ("DFY Enterprise", "one_time"),
    "STRIPE_PRICE_ADDON_PRIORITY_SUPPORT": ("Priority Support", "month"),
    "STRIPE_PRICE_ADDON_SLA_99": ("SLA 99.9%", "month"),
    "STRIPE_PRICE_ADDON_WHITE_LABEL": ("White Label", "month"),
    "STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS": ("Extra Workflow Pack", "month"),
}

def parse_env_file(filepath: Path) -> dict:
    """Parse .env file into a dictionary."""
    env_vars = {}
    if not filepath.exists():
        return env_vars
    
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value:
                    env_vars[key] = value
    return env_vars

def get_env_value(key: str, file_env: dict) -> str:
    """Get env value from file or environment."""
    return file_env.get(key) or os.environ.get(key, "")

def verify_stripe_price(price_id: str) -> tuple:
    """Verify a Stripe price ID exists and is active."""
    try:
        price = stripe.Price.retrieve(price_id)
        if not price.active:
            return False, "Price is INACTIVE"
        currency = price.currency.upper()
        amount = price.unit_amount / 100 if price.unit_amount else 0
        interval = price.recurring.interval if price.recurring else "one_time"
        return True, f"Active | {currency} {amount:.2f} | {interval}"
    except stripe.error.InvalidRequestError as e:
        return False, f"NOT FOUND: {e.user_message}"
    except stripe.error.AuthenticationError:
        return False, "INVALID API KEY"
    except Exception as e:
        return False, f"ERROR: {str(e)}"

def main():
    print("=" * 80)
    print("STRIPE PRICE AUDIT")
    print("=" * 80)
    
    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    if not stripe_key:
        print("\nERROR: STRIPE_SECRET_KEY not set in environment")
        sys.exit(1)
    
    stripe.api_key = stripe_key
    
    is_live = stripe_key.startswith("sk_live_")
    print(f"\nMode: {'LIVE' if is_live else 'TEST'}")
    print(f"Env file: {ENV_FILE}")
    
    file_env = parse_env_file(ENV_FILE)
    print(f"Keys loaded from file: {len(file_env)}")
    
    print("\n" + "-" * 80)
    print(f"{'NAME':<30} | {'ENV VAR':<35} | {'STATUS':<15}")
    print("-" * 80)
    
    all_valid = True
    results = []
    
    for env_key, (name, expected_interval) in REQUIRED_KEYS.items():
        value = get_env_value(env_key, file_env)
        
        if not value:
            status = "MISSING"
            notes = "Not set in env or file"
            all_valid = False
        else:
            valid, notes = verify_stripe_price(value)
            status = "OK" if valid else "FAILED"
            if not valid:
                all_valid = False
        
        results.append((name, env_key, value[:20] + "..." if len(value) > 20 else value, status, notes))
        print(f"{name:<30} | {env_key:<35} | {status:<15}")
    
    print("-" * 80)
    
    print("\n" + "=" * 80)
    print("DETAILED RESULTS")
    print("=" * 80)
    print()
    
    for name, env_key, value, status, notes in results:
        symbol = "[OK]" if status == "OK" else "[FAIL]"
        print(f"{symbol} {name}")
        print(f"    Key:    {env_key}")
        print(f"    Value:  {get_env_value(env_key, file_env) or '(not set)'}")
        print(f"    Status: {notes}")
        print()
    
    print("=" * 80)
    if all_valid:
        print("RESULT: ALL STRIPE PRICE IDS VALID")
        print("=" * 80)
        sys.exit(0)
    else:
        print("RESULT: SOME PRICE IDS ARE INVALID OR MISSING")
        print("=" * 80)
        sys.exit(1)

if __name__ == "__main__":
    main()
