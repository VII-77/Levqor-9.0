# Levqor Enterprise RBAC Model

**Version:** 1.0 (MEGA-PHASE 9)  
**Status:** Logic-Only (No enforcement on existing endpoints)  

## Overview

Levqor implements a role-based access control (RBAC) system for enterprise-grade user management. This system is designed as an **additive layer** that does not affect existing flows.

## Roles

### `owner`
- Full administrative access
- Can manage all aspects of the organization
- Can assign/revoke roles
- Can view all logs and security events
- Default role for account creator

### `admin`
- Administrative access to most features
- Can manage users (except role changes)
- Can view security logs
- Can manage workflows and runs
- Cannot access billing management

### `editor`
- Can create and edit workflows
- Can view workflow runs and logs
- Can manage AI interactions
- Cannot access user management or security logs
- Cannot access billing

### `viewer`
- Read-only access to workflows and runs
- Can view AI interactions
- Cannot edit, create, or delete resources
- Cannot access logs or security events

## Permissions Matrix

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| `manage_users` | ✅ | ✅ | ❌ | ❌ |
| `manage_roles` | ✅ | ❌ | ❌ | ❌ |
| `view_billing` | ✅ | ❌ | ❌ | ❌ |
| `manage_billing` | ✅ | ❌ | ❌ | ❌ |
| `manage_workflows` | ✅ | ✅ | ✅ | ❌ |
| `view_workflows` | ✅ | ✅ | ✅ | ✅ |
| `manage_ai` | ✅ | ✅ | ✅ | ❌ |
| `view_ai_logs` | ✅ | ✅ | ❌ | ❌ |
| `view_security_logs` | ✅ | ✅ | ❌ | ❌ |
| `view_enterprise_dashboard` | ✅ | ✅ | ❌ | ❌ |
| `manage_api_keys` | ✅ | ✅ | ❌ | ❌ |
| `view_metrics` | ✅ | ✅ | ✅ | ✅ |

## Principles

### Least Privilege
- Users are granted minimum permissions needed for their role
- Sensitive operations (billing, security logs) restricted to owners
- Read-only access (viewer) for audit and compliance needs

### Progressive Enforcement
- **Phase 1 (Current):** RBAC logic exists but only enforces on NEW enterprise endpoints
- **Phase 2 (Future):** Gradual migration of existing endpoints to RBAC
- **Phase 3 (Future):** Full RBAC enforcement across platform

### Backward Compatibility
- Existing API endpoints continue to work without RBAC checks
- Single-user accounts default to `owner` role
- Multi-user organizations can opt-in to RBAC enforcement

## Implementation Notes

### Current State (MEGA-PHASE 9)
- RBAC utilities and decorators created
- Permission checks implemented for enterprise dashboard endpoints only
- Existing endpoints (AI, billing, workflows, etc.) **NOT affected**
- Default role: `owner` (full access, no restrictions)

### Authentication Integration
- RBAC checks assume user authentication is handled separately
- If no auth context available, default to `owner` role (maintains backward compatibility)
- Future: Integrate with NextAuth user session

### Tenant Context
- RBAC operates within tenant boundaries
- Users can have different roles across different tenants
- Single-tenant mode: User role is global

## API Usage

### Backend Decorator

```python
from enterprise.rbac import require_permission

@app.route('/api/enterprise/security-logs')
@require_permission('view_security_logs')
def get_security_logs():
    # Only owners and admins can access
    return jsonify(logs)
```

### Permission Check

```python
from enterprise.rbac import has_permission, get_current_user

user = get_current_user()
if has_permission(user, 'manage_billing'):
    # Allow billing operations
    pass
```

## Security Considerations

1. **Default Allow:** For backward compatibility, unknown users default to `owner` role
2. **Audit Logging:** All RBAC denials are logged for security monitoring
3. **No DB Changes:** Roles/permissions stored in-memory or config (Phase 1)
4. **Progressive Rollout:** Gradual enforcement prevents breaking changes

## Future Enhancements

- Database-backed role storage
- Custom roles and permissions
- Time-based access controls
- IP-based role restrictions
- Multi-factor authentication for sensitive operations
- Granular resource-level permissions
