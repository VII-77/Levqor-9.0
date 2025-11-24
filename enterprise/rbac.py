"""
Enterprise RBAC Module (MEGA-PHASE 9)

Role-based access control system for enterprise features.
Initial implementation: Logic-only, no enforcement on existing endpoints.
"""

import logging
from typing import Optional, Dict, Set
from functools import wraps
from flask import g, jsonify, request

logger = logging.getLogger("enterprise_rbac")

# Role definitions
ROLES = {
    "owner": "Full administrative access",
    "admin": "Administrative access to most features",
    "editor": "Can create and edit workflows",
    "viewer": "Read-only access"
}

# Permission matrix
PERMISSIONS: Dict[str, Set[str]] = {
    "manage_users": {"owner", "admin"},
    "manage_roles": {"owner"},
    "view_billing": {"owner"},
    "manage_billing": {"owner"},
    "manage_workflows": {"owner", "admin", "editor"},
    "view_workflows": {"owner", "admin", "editor", "viewer"},
    "manage_ai": {"owner", "admin", "editor"},
    "view_ai_logs": {"owner", "admin"},
    "view_security_logs": {"owner", "admin"},
    "view_enterprise_dashboard": {"owner", "admin"},
    "manage_api_keys": {"owner", "admin"},
    "view_metrics": {"owner", "admin", "editor", "viewer"},
}


def get_current_user() -> Optional[Dict[str, str]]:
    """
    Get current user from Flask g context.
    Returns None if no authenticated user.
    
    Future: Integrate with NextAuth or JWT-based auth.
    """
    # Check if user is already attached to g
    if hasattr(g, 'current_user'):
        return g.current_user
    
    # TODO: Extract user from JWT token in Authorization header
    # For now, return None (will default to owner role for backward compat)
    return None


def get_user_role(user: Optional[Dict[str, str]]) -> str:
    """
    Get user role. 
    
    For Phase 1 (backward compatibility): Default to 'owner' if no user context.
    Future: Look up role from database or user session.
    """
    if not user:
        # Backward compatibility: Unknown users get owner role
        return "owner"
    
    # Check if role is in user dict
    role = user.get("role", "owner")
    
    # Validate role exists
    if role not in ROLES:
        logger.warning(f"Invalid role '{role}' for user, defaulting to 'owner'")
        return "owner"
    
    return role


def has_permission(user: Optional[Dict[str, str]], permission: str) -> bool:
    """
    Check if user has a specific permission.
    
    Args:
        user: User dict (can be None for backward compat)
        permission: Permission string (e.g. 'view_billing')
    
    Returns:
        bool: True if user has permission
    """
    role = get_user_role(user)
    
    # Check if permission exists
    if permission not in PERMISSIONS:
        logger.warning(f"Unknown permission '{permission}' requested")
        return False
    
    # Check if role has permission
    allowed_roles = PERMISSIONS[permission]
    has_perm = role in allowed_roles
    
    # Log permission check
    if not has_perm:
        logger.info(f"Permission denied: role={role}, permission={permission}")
    
    return has_perm


def require_permission(permission: str):
    """
    Decorator to require a specific permission for an endpoint.
    
    Usage:
        @app.route('/api/enterprise/security-logs')
        @require_permission('view_security_logs')
        def get_security_logs():
            return jsonify(logs)
    
    Returns 403 if user lacks permission.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            
            if not has_permission(user, permission):
                role = get_user_role(user)
                
                # Audit the permission denial
                logger.warning(
                    f"RBAC_DENIAL: path={request.path} permission={permission} "
                    f"role={role} ip={request.remote_addr}"
                )
                
                return jsonify({
                    "error": "forbidden",
                    "reason": "missing_permission",
                    "required_permission": permission
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def attach_user_to_context(user_data: Dict[str, str]):
    """
    Attach user to Flask g context for RBAC checks.
    
    Call this in a before_request hook if you have user authentication.
    """
    g.current_user = user_data


def get_role_permissions(role: str) -> Set[str]:
    """
    Get all permissions for a given role.
    
    Args:
        role: Role name (e.g. 'admin')
    
    Returns:
        Set of permission strings
    """
    if role not in ROLES:
        return set()
    
    permissions = set()
    for perm, allowed_roles in PERMISSIONS.items():
        if role in allowed_roles:
            permissions.add(perm)
    
    return permissions


# Log RBAC initialization
logger.info(f"✅ Enterprise RBAC initialized with {len(ROLES)} roles and {len(PERMISSIONS)} permissions")
