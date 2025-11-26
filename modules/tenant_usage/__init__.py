"""
Tenant Usage Metering Module - V10 Completion
Track runs, credits, API calls, and errors per tenant.
"""
import time
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from collections import defaultdict

log = logging.getLogger("levqor.tenant_usage")


@dataclass
class TenantUsage:
    tenant_id: str
    workflow_runs: int = 0
    api_calls: int = 0
    ai_credits_used: float = 0
    errors_count: int = 0
    storage_bytes: int = 0
    last_activity: float = field(default_factory=time.time)
    
    run_limit: int = 1000
    api_limit: int = 10000
    ai_credits_limit: float = 100.0
    
    is_blocked: bool = False
    block_reason: Optional[str] = None


_tenant_usage: Dict[str, TenantUsage] = {}


def get_or_create_tenant(tenant_id: str) -> TenantUsage:
    if tenant_id not in _tenant_usage:
        _tenant_usage[tenant_id] = TenantUsage(tenant_id=tenant_id)
    return _tenant_usage[tenant_id]


def record_workflow_run(tenant_id: str) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    if usage.is_blocked:
        return {"success": False, "error": usage.block_reason or "Tenant is blocked"}
    
    if usage.workflow_runs >= usage.run_limit:
        usage.is_blocked = True
        usage.block_reason = f"Workflow run limit ({usage.run_limit}) exceeded"
        log.warning(f"Tenant {tenant_id} blocked: run limit exceeded")
        return {"success": False, "error": usage.block_reason}
    
    usage.workflow_runs += 1
    usage.last_activity = time.time()
    
    return {"success": True, "runs": usage.workflow_runs, "remaining": usage.run_limit - usage.workflow_runs}


def record_api_call(tenant_id: str) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    if usage.is_blocked:
        return {"success": False, "error": usage.block_reason or "Tenant is blocked"}
    
    if usage.api_calls >= usage.api_limit:
        usage.is_blocked = True
        usage.block_reason = f"API call limit ({usage.api_limit}) exceeded"
        log.warning(f"Tenant {tenant_id} blocked: API limit exceeded")
        return {"success": False, "error": usage.block_reason}
    
    usage.api_calls += 1
    usage.last_activity = time.time()
    
    return {"success": True, "calls": usage.api_calls, "remaining": usage.api_limit - usage.api_calls}


def record_ai_credits(tenant_id: str, credits: float) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    if usage.is_blocked:
        return {"success": False, "error": usage.block_reason or "Tenant is blocked"}
    
    if usage.ai_credits_used + credits > usage.ai_credits_limit:
        usage.is_blocked = True
        usage.block_reason = f"AI credits limit ({usage.ai_credits_limit}) exceeded"
        log.warning(f"Tenant {tenant_id} blocked: AI credits exceeded")
        return {"success": False, "error": usage.block_reason}
    
    usage.ai_credits_used += credits
    usage.last_activity = time.time()
    
    return {"success": True, "credits_used": usage.ai_credits_used, "remaining": usage.ai_credits_limit - usage.ai_credits_used}


def record_error(tenant_id: str) -> None:
    usage = get_or_create_tenant(tenant_id)
    usage.errors_count += 1
    usage.last_activity = time.time()


def get_usage_summary(tenant_id: str) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    return {
        "tenant_id": tenant_id,
        "workflow_runs": usage.workflow_runs,
        "workflow_runs_limit": usage.run_limit,
        "workflow_runs_pct": (usage.workflow_runs / usage.run_limit * 100) if usage.run_limit > 0 else 0,
        "api_calls": usage.api_calls,
        "api_calls_limit": usage.api_limit,
        "api_calls_pct": (usage.api_calls / usage.api_limit * 100) if usage.api_limit > 0 else 0,
        "ai_credits_used": usage.ai_credits_used,
        "ai_credits_limit": usage.ai_credits_limit,
        "ai_credits_pct": (usage.ai_credits_used / usage.ai_credits_limit * 100) if usage.ai_credits_limit > 0 else 0,
        "errors_count": usage.errors_count,
        "storage_bytes": usage.storage_bytes,
        "last_activity": usage.last_activity,
        "is_blocked": usage.is_blocked,
        "block_reason": usage.block_reason
    }


def set_tenant_limits(
    tenant_id: str,
    run_limit: Optional[int] = None,
    api_limit: Optional[int] = None,
    ai_credits_limit: Optional[float] = None
) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    if run_limit is not None:
        usage.run_limit = run_limit
    if api_limit is not None:
        usage.api_limit = api_limit
    if ai_credits_limit is not None:
        usage.ai_credits_limit = ai_credits_limit
    
    log.info(f"Updated limits for tenant {tenant_id}: runs={usage.run_limit}, api={usage.api_limit}, ai={usage.ai_credits_limit}")
    
    return {
        "success": True,
        "tenant_id": tenant_id,
        "limits": {
            "run_limit": usage.run_limit,
            "api_limit": usage.api_limit,
            "ai_credits_limit": usage.ai_credits_limit
        }
    }


def unblock_tenant(tenant_id: str) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    was_blocked = usage.is_blocked
    usage.is_blocked = False
    usage.block_reason = None
    
    if was_blocked:
        log.info(f"Tenant {tenant_id} unblocked")
    
    return {"success": True, "tenant_id": tenant_id, "was_blocked": was_blocked}


def reset_usage(tenant_id: str) -> Dict[str, Any]:
    usage = get_or_create_tenant(tenant_id)
    
    usage.workflow_runs = 0
    usage.api_calls = 0
    usage.ai_credits_used = 0
    usage.errors_count = 0
    usage.is_blocked = False
    usage.block_reason = None
    
    log.info(f"Reset usage for tenant {tenant_id}")
    
    return {"success": True, "tenant_id": tenant_id}


def get_all_tenants_usage() -> Dict[str, Any]:
    return {
        "tenants": [get_usage_summary(tid) for tid in _tenant_usage.keys()],
        "total_tenants": len(_tenant_usage),
        "blocked_tenants": sum(1 for u in _tenant_usage.values() if u.is_blocked)
    }
