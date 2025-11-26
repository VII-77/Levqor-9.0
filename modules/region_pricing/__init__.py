"""
Region-Aware Pricing Module - V10 Completion
Auto-detect region, apply currency tiers, pricing adjustments.
"""
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

log = logging.getLogger("levqor.region_pricing")


@dataclass
class RegionConfig:
    code: str
    name: str
    currency: str
    currency_symbol: str
    price_multiplier: float  # 1.0 = base price (USD)
    tax_rate: float  # e.g., 0.20 for 20% VAT
    supports_ppp: bool  # Purchasing Power Parity


REGION_CONFIGS: Dict[str, RegionConfig] = {
    "US": RegionConfig("US", "United States", "USD", "$", 1.0, 0.0, False),
    "CA": RegionConfig("CA", "Canada", "CAD", "$", 1.35, 0.13, False),
    "GB": RegionConfig("GB", "United Kingdom", "GBP", "£", 0.79, 0.20, False),
    "EU": RegionConfig("EU", "European Union", "EUR", "€", 0.92, 0.20, False),
    "DE": RegionConfig("DE", "Germany", "EUR", "€", 0.92, 0.19, False),
    "FR": RegionConfig("FR", "France", "EUR", "€", 0.92, 0.20, False),
    "AU": RegionConfig("AU", "Australia", "AUD", "$", 1.55, 0.10, False),
    "IN": RegionConfig("IN", "India", "INR", "₹", 83.0, 0.18, True),
    "BR": RegionConfig("BR", "Brazil", "BRL", "R$", 5.0, 0.0, True),
    "MX": RegionConfig("MX", "Mexico", "MXN", "$", 17.5, 0.16, True),
    "JP": RegionConfig("JP", "Japan", "JPY", "¥", 150.0, 0.10, False),
    "KR": RegionConfig("KR", "South Korea", "KRW", "₩", 1340.0, 0.10, False),
    "SG": RegionConfig("SG", "Singapore", "SGD", "$", 1.35, 0.08, False),
    "ZA": RegionConfig("ZA", "South Africa", "ZAR", "R", 19.0, 0.15, True),
    "NG": RegionConfig("NG", "Nigeria", "NGN", "₦", 780.0, 0.0, True),
}

PPP_DISCOUNTS: Dict[str, float] = {
    "IN": 0.40,  # 40% discount
    "BR": 0.30,  # 30% discount
    "MX": 0.25,  # 25% discount
    "ZA": 0.35,  # 35% discount
    "NG": 0.50,  # 50% discount
}


def detect_region_from_ip(ip_address: str) -> str:
    if ip_address.startswith("192.168") or ip_address.startswith("10.") or ip_address.startswith("127."):
        return "US"
    
    return "US"


def get_region_config(region_code: str) -> RegionConfig:
    return REGION_CONFIGS.get(region_code.upper(), REGION_CONFIGS["US"])


def calculate_regional_price(
    base_price_usd: float,
    region_code: str,
    apply_ppp: bool = True,
    include_tax: bool = False
) -> Dict[str, Any]:
    config = get_region_config(region_code)
    
    local_price = base_price_usd * config.price_multiplier
    
    ppp_discount = 0.0
    if apply_ppp and config.supports_ppp:
        ppp_discount = PPP_DISCOUNTS.get(region_code.upper(), 0.0)
        local_price = local_price * (1 - ppp_discount)
    
    tax_amount = 0.0
    if include_tax:
        tax_amount = local_price * config.tax_rate
    
    final_price = local_price + tax_amount
    
    return {
        "base_price_usd": base_price_usd,
        "local_price": round(local_price, 2),
        "currency": config.currency,
        "currency_symbol": config.currency_symbol,
        "ppp_discount": ppp_discount,
        "ppp_applied": apply_ppp and config.supports_ppp,
        "tax_rate": config.tax_rate,
        "tax_amount": round(tax_amount, 2),
        "final_price": round(final_price, 2),
        "formatted_price": f"{config.currency_symbol}{round(final_price, 2):,.2f}",
        "region": region_code.upper(),
        "region_name": config.name
    }


def get_pricing_tiers(region_code: str) -> Dict[str, Any]:
    config = get_region_config(region_code)
    
    base_prices = {
        "starter": {"monthly": 29, "yearly": 290},
        "growth": {"monthly": 79, "yearly": 790},
        "business": {"monthly": 199, "yearly": 1990},
        "agency": {"monthly": 399, "yearly": 3990},
        "scale": {"monthly": 799, "yearly": 7990},
    }
    
    regional_prices = {}
    for tier, prices in base_prices.items():
        regional_prices[tier] = {
            "monthly": calculate_regional_price(prices["monthly"], region_code),
            "yearly": calculate_regional_price(prices["yearly"], region_code)
        }
    
    return {
        "region": region_code.upper(),
        "region_name": config.name,
        "currency": config.currency,
        "currency_symbol": config.currency_symbol,
        "ppp_supported": config.supports_ppp,
        "tiers": regional_prices
    }


def get_available_regions() -> List[Dict[str, Any]]:
    return [
        {
            "code": config.code,
            "name": config.name,
            "currency": config.currency,
            "currency_symbol": config.currency_symbol,
            "ppp_supported": config.supports_ppp
        }
        for config in REGION_CONFIGS.values()
    ]


def format_price_for_display(amount: float, region_code: str) -> str:
    config = get_region_config(region_code)
    
    if config.currency in ["JPY", "KRW"]:
        return f"{config.currency_symbol}{int(amount):,}"
    
    return f"{config.currency_symbol}{amount:,.2f}"
