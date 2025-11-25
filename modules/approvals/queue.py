"""
Approval Queue - MEGA PHASE v16
DB-backed queue for pending actions requiring approval
"""
import uuid
import time
import json
import logging
from typing import Dict, Any, Optional, List
from modules.db_wrapper import execute_query, get_db_type

log = logging.getLogger("levqor.approvals.queue")

APPROVALS_TABLE = "approval_queue"


def _ensure_table():
    """Ensure approval queue table exists."""
    db_type = get_db_type()
    
    if db_type == "postgresql":
        execute_query("""
            CREATE TABLE IF NOT EXISTS approval_queue (
                id VARCHAR(64) PRIMARY KEY,
                action_type VARCHAR(64) NOT NULL,
                payload TEXT NOT NULL,
                reason TEXT,
                impact_level VARCHAR(8) NOT NULL DEFAULT 'C',
                status VARCHAR(32) NOT NULL DEFAULT 'pending',
                owner_id VARCHAR(64),
                tenant_id VARCHAR(64) DEFAULT 'default',
                created_at REAL DEFAULT EXTRACT(EPOCH FROM NOW()),
                processed_at REAL,
                processed_by VARCHAR(64)
            )
        """, commit=True)
    else:
        execute_query("""
            CREATE TABLE IF NOT EXISTS approval_queue (
                id TEXT PRIMARY KEY,
                action_type TEXT NOT NULL,
                payload TEXT NOT NULL,
                reason TEXT,
                impact_level TEXT NOT NULL DEFAULT 'C',
                status TEXT NOT NULL DEFAULT 'pending',
                owner_id TEXT,
                tenant_id TEXT DEFAULT 'default',
                created_at REAL DEFAULT (strftime('%s', 'now')),
                processed_at REAL,
                processed_by TEXT
            )
        """, commit=True)


_table_initialized = False


def _init_table():
    global _table_initialized
    if not _table_initialized:
        try:
            _ensure_table()
            _table_initialized = True
        except Exception as e:
            log.warning(f"Could not initialize approval queue table: {e}")


def enqueue_action(
    action_type: str,
    payload: Dict[str, Any],
    reason: str = "",
    impact_level: str = "C",
    owner_id: str = "",
    tenant_id: str = "default"
) -> str:
    """
    Add an action to the approval queue.
    Returns the action ID.
    """
    _init_table()
    
    action_id = str(uuid.uuid4())
    payload_json = json.dumps(payload)
    
    try:
        execute_query(
            """INSERT INTO approval_queue 
               (id, action_type, payload, reason, impact_level, status, owner_id, tenant_id)
               VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)""",
            (action_id, action_type, payload_json, reason, impact_level, owner_id, tenant_id),
            commit=True
        )
        log.info(f"Action enqueued for approval: {action_id} (type={action_type})")
        return action_id
    except Exception as e:
        log.error(f"Failed to enqueue action: {e}")
        raise


def list_pending_actions(tenant_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
    """List pending actions in the approval queue."""
    _init_table()
    
    try:
        if tenant_id:
            result = execute_query(
                """SELECT * FROM approval_queue 
                   WHERE status = 'pending' AND tenant_id = ?
                   ORDER BY created_at DESC LIMIT ?""",
                (tenant_id, limit),
                fetch='all'
            )
        else:
            result = execute_query(
                """SELECT * FROM approval_queue 
                   WHERE status = 'pending'
                   ORDER BY created_at DESC LIMIT ?""",
                (limit,),
                fetch='all'
            )
        
        actions = []
        for row in (result or []):
            action = dict(row)
            if 'payload' in action:
                try:
                    action['payload'] = json.loads(action['payload'])
                except json.JSONDecodeError:
                    pass
            actions.append(action)
        
        return actions
    except Exception as e:
        log.error(f"Failed to list pending actions: {e}")
        return []


def get_action_by_id(action_id: str) -> Optional[Dict[str, Any]]:
    """Get an action by ID."""
    _init_table()
    
    try:
        result = execute_query(
            "SELECT * FROM approval_queue WHERE id = ?",
            (action_id,),
            fetch='one'
        )
        
        if not result:
            return None
        
        action = dict(result)
        if 'payload' in action:
            try:
                action['payload'] = json.loads(action['payload'])
            except json.JSONDecodeError:
                pass
        
        return action
    except Exception as e:
        log.error(f"Failed to get action: {e}")
        return None


def approve_action(action_id: str, processed_by: str = "") -> bool:
    """
    Approve an action.
    Returns True if successful.
    """
    _init_table()
    
    try:
        execute_query(
            """UPDATE approval_queue 
               SET status = 'approved', processed_at = ?, processed_by = ?
               WHERE id = ? AND status = 'pending'""",
            (time.time(), processed_by, action_id),
            commit=True
        )
        log.info(f"Action approved: {action_id}")
        return True
    except Exception as e:
        log.error(f"Failed to approve action: {e}")
        return False


def reject_action(action_id: str, processed_by: str = "", reason: str = "") -> bool:
    """
    Reject an action.
    Returns True if successful.
    """
    _init_table()
    
    try:
        execute_query(
            """UPDATE approval_queue 
               SET status = 'rejected', processed_at = ?, processed_by = ?
               WHERE id = ? AND status = 'pending'""",
            (time.time(), processed_by, action_id),
            commit=True
        )
        log.info(f"Action rejected: {action_id}")
        return True
    except Exception as e:
        log.error(f"Failed to reject action: {e}")
        return False


def get_approval_stats(tenant_id: str = None) -> Dict[str, int]:
    """Get approval queue statistics."""
    _init_table()
    
    try:
        if tenant_id:
            pending = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'pending' AND tenant_id = ?",
                (tenant_id,),
                fetch='one'
            )
            approved = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'approved' AND tenant_id = ?",
                (tenant_id,),
                fetch='one'
            )
            rejected = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'rejected' AND tenant_id = ?",
                (tenant_id,),
                fetch='one'
            )
        else:
            pending = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'pending'",
                fetch='one'
            )
            approved = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'approved'",
                fetch='one'
            )
            rejected = execute_query(
                "SELECT COUNT(*) as count FROM approval_queue WHERE status = 'rejected'",
                fetch='one'
            )
        
        return {
            "pending": pending.get('count', 0) if pending else 0,
            "approved": approved.get('count', 0) if approved else 0,
            "rejected": rejected.get('count', 0) if rejected else 0
        }
    except Exception as e:
        log.error(f"Failed to get approval stats: {e}")
        return {"pending": 0, "approved": 0, "rejected": 0}
