"""
Workflow Storage - MEGA PHASE v15
Database operations for workflows using db_wrapper
"""
import uuid
import time
import json
import logging
from typing import Dict, Any, Optional, List
from modules.db_wrapper import execute_query, get_db_type

from .models import Workflow, WorkflowStep, ScheduleConfig

log = logging.getLogger("levqor.workflows.storage")


def _ensure_workflows_table():
    """Ensure workflows table exists."""
    db_type = get_db_type()
    
    if db_type == "postgresql":
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflows (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                steps TEXT NOT NULL,
                owner_id VARCHAR(64),
                tenant_id VARCHAR(64) DEFAULT 'default',
                is_active BOOLEAN DEFAULT FALSE,
                schedule_config TEXT,
                created_at REAL DEFAULT EXTRACT(EPOCH FROM NOW()),
                updated_at REAL DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        """, commit=True)
    else:
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                steps TEXT NOT NULL,
                owner_id TEXT,
                tenant_id TEXT DEFAULT 'default',
                is_active INTEGER DEFAULT 0,
                schedule_config TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now')),
                updated_at REAL DEFAULT (strftime('%s', 'now'))
            )
        """, commit=True)


_table_initialized = False


def _init_table():
    global _table_initialized
    if not _table_initialized:
        try:
            _ensure_workflows_table()
            _table_initialized = True
        except Exception as e:
            log.warning(f"Could not initialize workflows table: {e}")


def create_workflow(workflow: Workflow) -> str:
    """Create a new workflow. Returns workflow ID."""
    _init_table()
    
    workflow_id = workflow.id or str(uuid.uuid4())
    steps_json = json.dumps([s.to_dict() for s in workflow.steps])
    schedule_json = json.dumps(workflow.schedule_config.to_dict()) if workflow.schedule_config else None
    now = time.time()
    
    try:
        execute_query(
            """INSERT INTO workflows (id, name, description, steps, owner_id, tenant_id, is_active, schedule_config, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (workflow_id, workflow.name, workflow.description, steps_json, 
             workflow.owner_id, workflow.tenant_id, workflow.is_active,
             schedule_json, now, now),
            commit=True
        )
        log.info(f"Workflow created: {workflow_id}")
        return workflow_id
    except Exception as e:
        log.error(f"Failed to create workflow: {e}")
        raise


def get_workflow_by_id(workflow_id: str) -> Optional[Workflow]:
    """Get a workflow by ID."""
    _init_table()
    
    try:
        result = execute_query(
            "SELECT * FROM workflows WHERE id = ?",
            (workflow_id,),
            fetch='one'
        )
        
        if not result:
            return None
        
        return _row_to_workflow(result)
    except Exception as e:
        log.error(f"Failed to get workflow: {e}")
        return None


def list_workflows(tenant_id: str = None, owner_id: str = None, active_only: bool = False, limit: int = 100) -> List[Workflow]:
    """List workflows with optional filters."""
    _init_table()
    
    conditions = []
    params = []
    
    if tenant_id:
        conditions.append("tenant_id = ?")
        params.append(tenant_id)
    
    if owner_id:
        conditions.append("owner_id = ?")
        params.append(owner_id)
    
    if active_only:
        conditions.append("is_active = ?")
        params.append(True)
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    params.append(limit)
    
    try:
        result = execute_query(
            f"SELECT * FROM workflows WHERE {where_clause} ORDER BY created_at DESC LIMIT ?",
            tuple(params),
            fetch='all'
        )
        
        return [_row_to_workflow(row) for row in (result or [])]
    except Exception as e:
        log.error(f"Failed to list workflows: {e}")
        return []


def update_workflow(workflow_id: str, updates: Dict[str, Any]) -> bool:
    """Update a workflow."""
    _init_table()
    
    set_clauses = []
    params = []
    
    if "name" in updates:
        set_clauses.append("name = ?")
        params.append(updates["name"])
    
    if "description" in updates:
        set_clauses.append("description = ?")
        params.append(updates["description"])
    
    if "steps" in updates:
        set_clauses.append("steps = ?")
        steps_data = updates["steps"]
        if isinstance(steps_data, list):
            steps_json = json.dumps([s if isinstance(s, dict) else s.to_dict() for s in steps_data])
        else:
            steps_json = json.dumps(steps_data)
        params.append(steps_json)
    
    if "is_active" in updates:
        set_clauses.append("is_active = ?")
        params.append(updates["is_active"])
    
    if "schedule_config" in updates:
        set_clauses.append("schedule_config = ?")
        sc = updates["schedule_config"]
        if sc:
            params.append(json.dumps(sc if isinstance(sc, dict) else sc.to_dict()))
        else:
            params.append(None)
    
    if not set_clauses:
        return True
    
    set_clauses.append("updated_at = ?")
    params.append(time.time())
    params.append(workflow_id)
    
    try:
        execute_query(
            f"UPDATE workflows SET {', '.join(set_clauses)} WHERE id = ?",
            tuple(params),
            commit=True
        )
        log.info(f"Workflow updated: {workflow_id}")
        return True
    except Exception as e:
        log.error(f"Failed to update workflow: {e}")
        return False


def delete_workflow(workflow_id: str) -> bool:
    """Delete a workflow."""
    _init_table()
    
    try:
        execute_query(
            "DELETE FROM workflows WHERE id = ?",
            (workflow_id,),
            commit=True
        )
        log.info(f"Workflow deleted: {workflow_id}")
        return True
    except Exception as e:
        log.error(f"Failed to delete workflow: {e}")
        return False


def get_scheduled_workflows() -> List[Workflow]:
    """Get all active workflows with scheduling enabled."""
    _init_table()
    
    try:
        result = execute_query(
            """SELECT * FROM workflows 
               WHERE is_active = ? AND schedule_config IS NOT NULL
               ORDER BY created_at DESC""",
            (True,),
            fetch='all'
        )
        
        workflows = []
        for row in (result or []):
            wf = _row_to_workflow(row)
            if wf.schedule_config and wf.schedule_config.enabled:
                workflows.append(wf)
        
        return workflows
    except Exception as e:
        log.error(f"Failed to get scheduled workflows: {e}")
        return []


def _row_to_workflow(row: Dict[str, Any]) -> Workflow:
    """Convert a database row to a Workflow object."""
    steps_data = json.loads(row.get("steps", "[]"))
    steps = [WorkflowStep.from_dict(s) for s in steps_data]
    
    schedule_data = row.get("schedule_config")
    schedule = None
    if schedule_data:
        schedule = ScheduleConfig.from_dict(json.loads(schedule_data))
    
    is_active = row.get("is_active")
    if isinstance(is_active, int):
        is_active = bool(is_active)
    
    return Workflow(
        id=row.get("id", ""),
        name=row.get("name", ""),
        description=row.get("description", ""),
        steps=steps,
        owner_id=row.get("owner_id", ""),
        tenant_id=row.get("tenant_id", "default"),
        is_active=is_active,
        schedule_config=schedule,
        created_at=row.get("created_at", 0),
        updated_at=row.get("updated_at", 0)
    )
