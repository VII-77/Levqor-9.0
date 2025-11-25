"""
Data Export Utilities - MEGA PHASE Legal-0
Gathers user-related data for GDPR/CCPA export requests.
"""
import logging
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional, List

log = logging.getLogger("levqor.compliance.export")


def _hash_id(identifier: str) -> str:
    """Create a truncated hash for logging purposes."""
    if not identifier:
        return "unknown"
    h = hashlib.sha256(identifier.encode()).hexdigest()[:8]
    return f"{identifier[:3]}***{h}"


def export_user_data(user_id: str, tenant_id: str = "default") -> Dict[str, Any]:
    """
    Export all user-related data for GDPR/CCPA compliance.
    
    Returns a JSON-serializable bundle containing:
    - Account information
    - Workflows
    - Workflow runs
    - Activity logs
    - Support tickets (if any)
    
    Note: This is a Class C operation that should go through approval.
    """
    from modules.db_wrapper import execute_query
    
    log.info(f"Starting data export for user: {_hash_id(user_id)}")
    
    export_bundle: Dict[str, Any] = {
        "export_version": "1.0",
        "export_date": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "tenant_id": tenant_id,
        "data": {}
    }
    
    try:
        user_data = execute_query(
            "SELECT id, email, name, role, created_at, updated_at, preferences FROM users WHERE id = ?",
            (user_id,),
            fetch="one"
        )
        if user_data:
            export_bundle["data"]["account"] = {
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "name": user_data.get("name"),
                "role": user_data.get("role"),
                "created_at": str(user_data.get("created_at", "")),
                "updated_at": str(user_data.get("updated_at", "")),
                "preferences": user_data.get("preferences")
            }
    except Exception as e:
        log.warning(f"Could not export user account data: {e}")
        export_bundle["data"]["account"] = None
    
    try:
        workflows = execute_query(
            "SELECT id, name, description, steps, is_active, created_at, updated_at FROM workflows WHERE owner_id = ? AND tenant_id = ?",
            (user_id, tenant_id),
            fetch="all"
        )
        workflow_list: List[Dict[str, Any]] = []
        for w in (workflows or []):
            workflow_list.append({
                "id": w.get("id"),
                "name": w.get("name"),
                "description": w.get("description"),
                "steps": w.get("steps"),
                "is_active": w.get("is_active"),
                "created_at": str(w.get("created_at", "")),
                "updated_at": str(w.get("updated_at", ""))
            })
        export_bundle["data"]["workflows"] = workflow_list
    except Exception as e:
        log.warning(f"Could not export workflows: {e}")
        export_bundle["data"]["workflows"] = []
    
    try:
        runs = execute_query(
            """SELECT wr.id, wr.workflow_id, wr.status, wr.started_at, wr.ended_at
               FROM workflow_runs wr
               JOIN workflows w ON wr.workflow_id = w.id
               WHERE w.owner_id = ? AND w.tenant_id = ?
               ORDER BY wr.started_at DESC
               LIMIT 1000""",
            (user_id, tenant_id),
            fetch="all"
        )
        run_list: List[Dict[str, Any]] = []
        for r in (runs or []):
            run_list.append({
                "id": r.get("id"),
                "workflow_id": r.get("workflow_id"),
                "status": r.get("status"),
                "started_at": str(r.get("started_at", "")),
                "ended_at": str(r.get("ended_at", ""))
            })
        export_bundle["data"]["workflow_runs"] = run_list
    except Exception as e:
        log.warning(f"Could not export workflow runs: {e}")
        export_bundle["data"]["workflow_runs"] = []
    
    try:
        events = execute_query(
            """SELECT we.id, we.workflow_id, we.run_id, we.event_type, we.timestamp
               FROM workflow_events we
               JOIN workflows w ON we.workflow_id = w.id
               WHERE w.owner_id = ? AND w.tenant_id = ?
               ORDER BY we.timestamp DESC
               LIMIT 5000""",
            (user_id, tenant_id),
            fetch="all"
        )
        event_list: List[Dict[str, Any]] = []
        for e in (events or []):
            event_list.append({
                "id": e.get("id"),
                "workflow_id": e.get("workflow_id"),
                "run_id": e.get("run_id"),
                "event_type": e.get("event_type"),
                "timestamp": str(e.get("timestamp", ""))
            })
        export_bundle["data"]["activity_events"] = event_list
    except Exception as e:
        log.warning(f"Could not export activity events: {e}")
        export_bundle["data"]["activity_events"] = []
    
    try:
        tickets = execute_query(
            "SELECT id, subject, status, created_at FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
            fetch="all"
        )
        ticket_list: List[Dict[str, Any]] = []
        for t in (tickets or []):
            ticket_list.append({
                "id": t.get("id"),
                "subject": t.get("subject"),
                "status": t.get("status"),
                "created_at": str(t.get("created_at", ""))
            })
        export_bundle["data"]["support_tickets"] = ticket_list
    except Exception as e:
        log.debug(f"No support tickets table or error: {e}")
        export_bundle["data"]["support_tickets"] = []
    
    log.info(f"Data export completed for user: {_hash_id(user_id)}")
    return export_bundle


def get_exportable_data_summary(user_id: str, tenant_id: str = "default") -> Dict[str, int]:
    """
    Get a summary of how much data would be exported.
    Useful for showing users what they have before requesting export.
    """
    from modules.db_wrapper import execute_query
    
    summary: Dict[str, int] = {
        "workflows": 0,
        "workflow_runs": 0,
        "activity_events": 0,
        "support_tickets": 0
    }
    
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM workflows WHERE owner_id = ? AND tenant_id = ?",
            (user_id, tenant_id),
            fetch="one"
        )
        summary["workflows"] = result.get("count", 0) if result else 0
    except Exception:
        pass
    
    try:
        result = execute_query(
            """SELECT COUNT(*) as count FROM workflow_runs wr
               JOIN workflows w ON wr.workflow_id = w.id
               WHERE w.owner_id = ? AND w.tenant_id = ?""",
            (user_id, tenant_id),
            fetch="one"
        )
        summary["workflow_runs"] = result.get("count", 0) if result else 0
    except Exception:
        pass
    
    return summary
