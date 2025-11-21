"""
Replit Stripe Connector for Python
Fetches Stripe credentials from Replit's connection API automatically
"""
import os
import logging
import requests
from typing import Dict, Optional
from datetime import datetime, timedelta

log = logging.getLogger("levqor.stripe")

# Cache credentials for 5 minutes to avoid excessive API calls
_credentials_cache: Optional[Dict] = None
_cache_expiry: Optional[datetime] = None
CACHE_DURATION = timedelta(minutes=5)


class StripeConnectionError(Exception):
    """Raised when Stripe connection cannot be established"""
    pass


def get_replit_auth_token() -> str:
    """
    Get Replit authentication token
    Uses REPL_IDENTITY (development) or WEB_REPL_RENEWAL (production deployment)
    """
    repl_identity = os.environ.get("REPL_IDENTITY")
    web_repl_renewal = os.environ.get("WEB_REPL_RENEWAL")
    
    if repl_identity:
        return f"repl {repl_identity}"
    elif web_repl_renewal:
        return f"depl {web_repl_renewal}"
    else:
        raise StripeConnectionError(
            "Neither REPL_IDENTITY nor WEB_REPL_RENEWAL found. "
            "This environment is not properly configured for Replit connectors."
        )


def get_stripe_credentials(force_refresh: bool = False) -> Dict[str, str]:
    """
    Fetch Stripe credentials from Replit connection API
    
    Returns:
        dict with keys: publishable_key, secret_key, webhook_secret
    
    Raises:
        StripeConnectionError: If credentials cannot be fetched
    """
    global _credentials_cache, _cache_expiry
    
    # Return cached credentials if still valid
    if not force_refresh and _credentials_cache and _cache_expiry:
        if datetime.now() < _cache_expiry:
            log.debug("Using cached Stripe credentials")
            return _credentials_cache
    
    hostname = os.environ.get("REPLIT_CONNECTORS_HOSTNAME")
    if not hostname:
        raise StripeConnectionError(
            "REPLIT_CONNECTORS_HOSTNAME not found. "
            "This environment does not support Replit connectors."
        )
    
    # Determine environment (development or production)
    is_production = os.environ.get("REPLIT_DEPLOYMENT") == "1"
    target_environment = "production" if is_production else "development"
    
    log.info(f"Fetching Stripe credentials for {target_environment} environment")
    
    try:
        # Get authentication token
        auth_token = get_replit_auth_token()
        
        # Build API request
        url = f"https://{hostname}/api/v2/connection"
        params = {
            "include_secrets": "true",
            "connector_names": "stripe",
            "environment": target_environment
        }
        headers = {
            "Accept": "application/json",
            "X_REPLIT_TOKEN": auth_token
        }
        
        # Fetch credentials
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            raise StripeConnectionError(
                f"No Stripe connection found for {target_environment} environment. "
                "Please set up the Stripe integration in Replit."
            )
        
        connection = items[0]
        settings = connection.get("settings", {})
        
        publishable = settings.get("publishable")
        secret = settings.get("secret")
        # Try to get webhook secret from connector (may be in various fields)
        webhook_secret = (
            settings.get("webhook_secret") or 
            settings.get("webhookSecret") or
            settings.get("signing_secret") or
            settings.get("signingSecret") or
            os.environ.get("STRIPE_WEBHOOK_SECRET", "")  # Final fallback to env
        )
        
        if not publishable or not secret:
            raise StripeConnectionError(
                f"Stripe connection for {target_environment} is missing credentials. "
                "Please check the integration configuration."
            )
        
        # Log if webhook secret is missing (warning, not error)
        if not webhook_secret:
            log.warning(
                f"No webhook secret found in Stripe connector for {target_environment}. "
                "Webhook verification will not work. Configure it in Stripe Dashboard."
            )
        
        # Cache the credentials
        _credentials_cache = {
            "publishable_key": publishable,
            "secret_key": secret,
            "webhook_secret": webhook_secret,
            "environment": target_environment
        }
        _cache_expiry = datetime.now() + CACHE_DURATION
        
        log.info(f"Successfully fetched Stripe {target_environment} credentials")
        return _credentials_cache
        
    except requests.RequestException as e:
        raise StripeConnectionError(
            f"Failed to fetch Stripe credentials from Replit API: {e}"
        )
    except Exception as e:
        raise StripeConnectionError(
            f"Unexpected error fetching Stripe credentials: {e}"
        )


def get_stripe_secret_key() -> str:
    """Get Stripe secret key from connector"""
    return get_stripe_credentials()["secret_key"]


def get_stripe_publishable_key() -> str:
    """Get Stripe publishable key from connector"""
    return get_stripe_credentials()["publishable_key"]


def get_stripe_webhook_secret() -> str:
    """Get Stripe webhook secret from connector or environment"""
    return get_stripe_credentials()["webhook_secret"]


def is_stripe_configured() -> bool:
    """Check if Stripe is properly configured via connector"""
    try:
        creds = get_stripe_credentials()
        return bool(
            creds.get("secret_key") and 
            creds["secret_key"].startswith("sk_")
        )
    except StripeConnectionError:
        return False


def clear_credentials_cache():
    """Clear cached credentials (useful for testing)"""
    global _credentials_cache, _cache_expiry
    _credentials_cache = None
    _cache_expiry = None
    log.debug("Stripe credentials cache cleared")
