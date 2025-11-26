"""
Tenant Lifecycle Module - V10 Completion
Soft delete, suspend, restore functionality for tenants.
"""
import time
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum

log = logging.getLogger("levqor.tenant_lifecycle")


class TenantStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"
    PENDING_DELETION = "pending_deletion"


@dataclass
class TenantState:
    tenant_id: str
    status: TenantStatus = TenantStatus.ACTIVE
    created_at: float = field(default_factory=time.time)
    suspended_at: Optional[float] = None
    deleted_at: Optional[float] = None
    scheduled_deletion_at: Optional[float] = None
    suspension_reason: Optional[str] = None
    deletion_reason: Optional[str] = None
    data_retained: bool = True


_tenant_states: Dict[str, TenantState] = {}
_tenant_audit_log: List[Dict[str, Any]] = []


def _audit_log(tenant_id: str, action: str, details: Dict[str, Any] = None):
    entry = {
        "tenant_id": tenant_id,
        "action": action,
        "timestamp": time.time(),
        "details": details or {}
    }
    _tenant_audit_log.append(entry)
    log.info(f"Tenant audit: {tenant_id} - {action}")


def get_or_create_tenant_state(tenant_id: str) -> TenantState:
    if tenant_id not in _tenant_states:
        _tenant_states[tenant_id] = TenantState(tenant_id=tenant_id)
    return _tenant_states[tenant_id]


def suspend_tenant(tenant_id: str, reason: str = "Manual suspension") -> Dict[str, Any]:
    state = get_or_create_tenant_state(tenant_id)
    
    if state.status == TenantStatus.DELETED:
        return {"success": False, "error": "Cannot suspend a deleted tenant"}
    
    previous_status = state.status
    state.status = TenantStatus.SUSPENDED
    state.suspended_at = time.time()
    state.suspension_reason = reason
    
    _audit_log(tenant_id, "suspend", {
        "previous_status": previous_status.value,
        "reason": reason
    })
    
    return {
        "success": True,
        "tenant_id": tenant_id,
        "status": state.status.value,
        "suspended_at": state.suspended_at,
        "reason": reason
    }


def restore_tenant(tenant_id: str) -> Dict[str, Any]:
    state = get_or_create_tenant_state(tenant_id)
    
    if state.status == TenantStatus.DELETED:
        return {"success": False, "error": "Cannot restore a permanently deleted tenant"}
    
    if state.status == TenantStatus.ACTIVE:
        return {"success": True, "tenant_id": tenant_id, "status": "already_active"}
    
    previous_status = state.status
    state.status = TenantStatus.ACTIVE
    state.suspended_at = None
    state.suspension_reason = None
    state.scheduled_deletion_at = None
    
    _audit_log(tenant_id, "restore", {
        "previous_status": previous_status.value
    })
    
    return {
        "success": True,
        "tenant_id": tenant_id,
        "status": state.status.value,
        "restored": True
    }


def soft_delete_tenant(tenant_id: str, reason: str = "User requested", grace_period_days: int = 30) -> Dict[str, Any]:
    state = get_or_create_tenant_state(tenant_id)
    
    if state.status == TenantStatus.DELETED:
        return {"success": False, "error": "Tenant already deleted"}
    
    previous_status = state.status
    state.status = TenantStatus.PENDING_DELETION
    state.deleted_at = time.time()
    state.deletion_reason = reason
    state.scheduled_deletion_at = time.time() + (grace_period_days * 24 * 3600)
    state.data_retained = True
    
    _audit_log(tenant_id, "soft_delete", {
        "previous_status": previous_status.value,
        "reason": reason,
        "grace_period_days": grace_period_days,
        "scheduled_deletion": state.scheduled_deletion_at
    })
    
    return {
        "success": True,
        "tenant_id": tenant_id,
        "status": state.status.value,
        "grace_period_days": grace_period_days,
        "scheduled_permanent_deletion": state.scheduled_deletion_at,
        "can_restore_until": state.scheduled_deletion_at
    }


def hard_delete_tenant(tenant_id: str) -> Dict[str, Any]:
    state = get_or_create_tenant_state(tenant_id)
    
    if state.status != TenantStatus.PENDING_DELETION:
        return {"success": False, "error": "Tenant must be in pending_deletion state for hard delete"}
    
    state.status = TenantStatus.DELETED
    state.data_retained = False
    
    _audit_log(tenant_id, "hard_delete", {
        "data_purged": True
    })
    
    log.warning(f"Tenant {tenant_id} permanently deleted")
    
    return {
        "success": True,
        "tenant_id": tenant_id,
        "status": state.status.value,
        "data_purged": True
    }


def get_tenant_status(tenant_id: str) -> Dict[str, Any]:
    state = get_or_create_tenant_state(tenant_id)
    
    return {
        "tenant_id": tenant_id,
        "status": state.status.value,
        "created_at": state.created_at,
        "suspended_at": state.suspended_at,
        "suspension_reason": state.suspension_reason,
        "deleted_at": state.deleted_at,
        "deletion_reason": state.deletion_reason,
        "scheduled_deletion_at": state.scheduled_deletion_at,
        "data_retained": state.data_retained,
        "is_active": state.status == TenantStatus.ACTIVE,
        "can_operate": state.status == TenantStatus.ACTIVE
    }


def is_tenant_operational(tenant_id: str) -> bool:
    state = get_or_create_tenant_state(tenant_id)
    return state.status == TenantStatus.ACTIVE


def get_audit_log(tenant_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    if tenant_id:
        logs = [e for e in _tenant_audit_log if e["tenant_id"] == tenant_id]
    else:
        logs = _tenant_audit_log
    
    return sorted(logs, key=lambda x: x["timestamp"], reverse=True)[:limit]


def get_pending_deletions() -> List[Dict[str, Any]]:
    now = time.time()
    pending = []
    
    for tenant_id, state in _tenant_states.items():
        if state.status == TenantStatus.PENDING_DELETION:
            pending.append({
                "tenant_id": tenant_id,
                "scheduled_deletion_at": state.scheduled_deletion_at,
                "days_remaining": max(0, (state.scheduled_deletion_at - now) / 86400) if state.scheduled_deletion_at else 0,
                "reason": state.deletion_reason
            })
    
    return sorted(pending, key=lambda x: x.get("scheduled_deletion_at", 0))


def process_scheduled_deletions() -> Dict[str, Any]:
    now = time.time()
    deleted = 0
    
    for tenant_id, state in list(_tenant_states.items()):
        if state.status == TenantStatus.PENDING_DELETION:
            if state.scheduled_deletion_at and state.scheduled_deletion_at <= now:
                hard_delete_tenant(tenant_id)
                deleted += 1
    
    return {
        "processed": deleted,
        "timestamp": now
    }
