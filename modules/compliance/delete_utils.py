"""
Data Deletion Utilities - MEGA PHASE Legal-0
Handles account deletion with pseudonymization for audit compliance.
"""
import logging
import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

log = logging.getLogger("levqor.compliance.delete")

REDACTED_EMAIL = "[redacted]@deleted.levqor.ai"
REDACTED_NAME = "Deleted User"


def pseudonymize_identifier(identifier: str, salt: str = "") -> str:
    """
    Create a pseudonymous hash from an identifier.
    Used to replace PII while maintaining referential integrity for audit logs.
    """
    if not identifier:
        return f"anon_{uuid.uuid4().hex[:8]}"
    
    combined = f"{identifier}:{salt}:levqor-pseudo-v1"
    h = hashlib.sha256(combined.encode()).hexdigest()
    return f"pseudo_{h[:16]}"


def _hash_id_for_log(identifier: str) -> str:
    """Create a truncated hash for logging purposes."""
    if not identifier:
        return "unknown"
    h = hashlib.sha256(identifier.encode()).hexdigest()[:8]
    return f"{identifier[:3]}***{h}"


def anonymize_user_data(user_id: str, tenant_id: str = "default") -> Dict[str, Any]:
    """
    Anonymize user data in place of full deletion.
    
    This approach:
    - Clears PII fields (email, name)
    - Replaces with pseudonymized identifiers
    - Keeps structural data for audit/analytics
    - Maintains referential integrity
    
    Note: This is a Class C operation. Should only be called after approval.
    
    Returns a summary of what was anonymized.
    """
    from modules.db_wrapper import execute_query
    
    log.info(f"Starting data anonymization for user: {_hash_id_for_log(user_id)}")
    
    result: Dict[str, Any] = {
        "user_id": user_id,
        "anonymized_at": datetime.utcnow().isoformat(),
        "actions": []
    }
    
    pseudo_id = pseudonymize_identifier(user_id)
    redacted_email = f"{pseudo_id}@deleted.levqor.ai"
    redacted_name = f"User {pseudo_id[:8]}"
    
    try:
        execute_query(
            "UPDATE users SET email = ?, name = ?, preferences = NULL, updated_at = NOW() WHERE id = ?",
            (redacted_email, redacted_name, user_id)
        )
        result["actions"].append({
            "table": "users",
            "action": "anonymized",
            "fields": ["email", "name", "preferences"]
        })
        log.info(f"Anonymized user account: {_hash_id_for_log(user_id)}")
    except Exception as e:
        log.error(f"Failed to anonymize user account: {e}")
        result["actions"].append({
            "table": "users",
            "action": "failed",
            "error": str(e)
        })
    
    try:
        execute_query(
            "UPDATE workflows SET description = '[content removed]' WHERE owner_id = ? AND tenant_id = ?",
            (user_id, tenant_id)
        )
        result["actions"].append({
            "table": "workflows",
            "action": "anonymized",
            "fields": ["description"]
        })
    except Exception as e:
        log.warning(f"Could not anonymize workflows: {e}")
    
    try:
        execute_query(
            """DELETE FROM workflow_runs 
               WHERE workflow_id IN (
                   SELECT id FROM workflows 
                   WHERE owner_id = ? AND tenant_id = ?
               )""",
            (user_id, tenant_id)
        )
        result["actions"].append({
            "table": "workflow_runs",
            "action": "deleted"
        })
    except Exception as e:
        log.warning(f"Could not delete workflow runs: {e}")
    
    try:
        execute_query(
            "DELETE FROM workflows WHERE owner_id = ? AND tenant_id = ?",
            (user_id, tenant_id)
        )
        result["actions"].append({
            "table": "workflows",
            "action": "deleted"
        })
    except Exception as e:
        log.warning(f"Could not delete workflows: {e}")
    
    log.info(f"Data anonymization completed for user: {_hash_id_for_log(user_id)}")
    return result


def schedule_deletion(
    user_id: str,
    tenant_id: str = "default",
    grace_period_days: int = 30
) -> Dict[str, Any]:
    """
    Schedule a user account for deletion after a grace period.
    
    This creates an approval queue entry that will execute
    the anonymization after the grace period expires.
    
    Returns the scheduled deletion details.
    """
    from modules.approvals import enqueue_action
    
    deletion_request = {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "requested_at": datetime.utcnow().isoformat(),
        "grace_period_days": grace_period_days,
        "scope": ["account", "workflows", "activity"]
    }
    
    try:
        action_id = enqueue_action(
            action_type="delete_data",
            payload=deletion_request,
            reason=f"User requested account deletion (grace period: {grace_period_days} days)",
            impact_level="C",
            tenant_id=tenant_id,
            owner_id=user_id
        )
        
        log.info(f"Scheduled deletion for user: {_hash_id_for_log(user_id)}, action_id: {action_id}")
        
        return {
            "status": "scheduled",
            "action_id": action_id,
            "grace_period_days": grace_period_days,
            "message": f"Account scheduled for deletion. You have {grace_period_days} days to cancel."
        }
    except Exception as e:
        log.error(f"Failed to schedule deletion: {e}")
        return {
            "status": "error",
            "message": "Failed to schedule deletion. Please contact support."
        }
