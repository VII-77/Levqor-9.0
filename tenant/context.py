"""
Tenant Context Module (MEGA-PHASE 9)

Provides soft multi-tenancy support without database schema changes.
Tenant ID is extracted from request headers for analytics and logging.
"""

import logging
import re
from typing import Optional
from flask import g, Request

logger = logging.getLogger("tenant_context")

# Supported tenant ID headers (in priority order)
TENANT_HEADERS = ["X-Levqor-Tenant", "X-Tenant-Id", "X-Tenant"]

# Default tenant for requests without tenant header
DEFAULT_TENANT = "default"


def sanitize_tenant_id(tenant_id: str) -> str:
    """
    Sanitize tenant ID to safe alphanumeric string with dashes.
    
    Args:
        tenant_id: Raw tenant ID from header
    
    Returns:
        Sanitized tenant ID (alphanumeric + dashes only)
    """
    # Remove any non-alphanumeric characters except dashes
    sanitized = re.sub(r'[^a-zA-Z0-9\-]', '', tenant_id)
    
    # Limit length to 64 characters
    sanitized = sanitized[:64]
    
    # Ensure it's lowercase for consistency
    sanitized = sanitized.lower()
    
    # If empty after sanitization, use default
    if not sanitized:
        return DEFAULT_TENANT
    
    return sanitized


def get_tenant_id_from_request(request: Request) -> str:
    """
    Extract tenant ID from request headers.
    
    Priority:
    1. X-Levqor-Tenant
    2. X-Tenant-Id
    3. X-Tenant
    4. Default to 'default'
    
    Args:
        request: Flask request object
    
    Returns:
        Sanitized tenant ID
    """
    for header in TENANT_HEADERS:
        tenant_id = request.headers.get(header)
        if tenant_id:
            sanitized = sanitize_tenant_id(tenant_id)
            logger.debug(f"Tenant ID extracted from {header}: {sanitized}")
            return sanitized
    
    return DEFAULT_TENANT


def attach_tenant_to_g(request: Request):
    """
    Attach tenant ID to Flask g context for use in request handlers.
    
    Call this in a before_request hook.
    """
    tenant_id = get_tenant_id_from_request(request)
    g.tenant_id = tenant_id


def get_tenant_id() -> str:
    """
    Get current tenant ID from Flask g context.
    
    Returns:
        Tenant ID string (defaults to 'default' if not set)
    """
    return getattr(g, "tenant_id", DEFAULT_TENANT)


def get_tenant_context() -> dict:
    """
    Get full tenant context for logging and analytics.
    
    Returns:
        Dict with tenant metadata
    """
    return {
        "tenant_id": get_tenant_id(),
    }


# Log tenant module initialization
logger.info(f"✅ Tenant Context module initialized (DEFAULT_TENANT={DEFAULT_TENANT})")
