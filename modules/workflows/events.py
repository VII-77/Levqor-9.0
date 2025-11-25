"""
Workflow Events - MEGA PHASE v15
Event logging for workflow runs and steps
"""
import uuid
import time
import json
import logging
from typing import Dict, Any, Optional, List
from modules.db_wrapper import execute_query, get_db_type

log = logging.getLogger("levqor.workflows.events")

WORKFLOW_RUNS_TABLE = "workflow_runs"
WORKFLOW_EVENTS_TABLE = "workflow_events"


def _ensure_tables():
    """Ensure workflow tables exist (simple idempotent check)"""
    db_type = get_db_type()
    
    if db_type == "postgresql":
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflow_runs (
                id VARCHAR(64) PRIMARY KEY,
                workflow_id VARCHAR(64) NOT NULL,
                status VARCHAR(32) NOT NULL DEFAULT 'pending',
                started_at REAL NOT NULL,
                ended_at REAL,
                context TEXT,
                result TEXT,
                error TEXT,
                created_at REAL DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        """, commit=True)
        
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflow_events (
                id VARCHAR(64) PRIMARY KEY,
                run_id VARCHAR(64) NOT NULL,
                workflow_id VARCHAR(64) NOT NULL,
                step_id VARCHAR(64),
                event_type VARCHAR(64) NOT NULL,
                payload TEXT,
                created_at REAL DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        """, commit=True)
    else:
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflow_runs (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                started_at REAL NOT NULL,
                ended_at REAL,
                context TEXT,
                result TEXT,
                error TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now'))
            )
        """, commit=True)
        
        execute_query("""
            CREATE TABLE IF NOT EXISTS workflow_events (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                workflow_id TEXT NOT NULL,
                step_id TEXT,
                event_type TEXT NOT NULL,
                payload TEXT,
                created_at REAL DEFAULT (strftime('%s', 'now'))
            )
        """, commit=True)


_tables_initialized = False


def _init_tables():
    global _tables_initialized
    if not _tables_initialized:
        try:
            _ensure_tables()
            _tables_initialized = True
        except Exception as e:
            log.warning(f"Could not initialize workflow tables: {e}")


def record_workflow_run_start(workflow_id: str, context: Dict[str, Any] = None) -> str:
    """Record the start of a workflow run. Returns run_id."""
    _init_tables()
    
    run_id = str(uuid.uuid4())
    started_at = time.time()
    context_json = json.dumps(context or {})
    
    try:
        execute_query(
            """INSERT INTO workflow_runs (id, workflow_id, status, started_at, context)
               VALUES (?, ?, 'running', ?, ?)""",
            (run_id, workflow_id, started_at, context_json),
            commit=True
        )
        log.info(f"Workflow run started: {run_id} for workflow {workflow_id}")
    except Exception as e:
        log.error(f"Failed to record workflow run start: {e}")
    
    return run_id


def record_workflow_run_end(run_id: str, status: str, result: Dict[str, Any] = None, error: str = None):
    """Record the end of a workflow run."""
    _init_tables()
    
    ended_at = time.time()
    result_json = json.dumps(result or {})
    
    try:
        execute_query(
            """UPDATE workflow_runs 
               SET status = ?, ended_at = ?, result = ?, error = ?
               WHERE id = ?""",
            (status, ended_at, result_json, error, run_id),
            commit=True
        )
        log.info(f"Workflow run ended: {run_id} with status {status}")
    except Exception as e:
        log.error(f"Failed to record workflow run end: {e}")


def record_workflow_step_event(
    run_id: str,
    workflow_id: str,
    step_id: str,
    event_type: str,
    payload: Dict[str, Any] = None
):
    """Record a workflow step event."""
    _init_tables()
    
    event_id = str(uuid.uuid4())
    payload_json = json.dumps(payload or {})
    
    try:
        execute_query(
            """INSERT INTO workflow_events (id, run_id, workflow_id, step_id, event_type, payload)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (event_id, run_id, workflow_id, step_id, event_type, payload_json),
            commit=True
        )
        log.debug(f"Workflow event recorded: {event_type} for step {step_id}")
    except Exception as e:
        log.error(f"Failed to record workflow step event: {e}")


def get_workflow_runs(workflow_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Get recent workflow runs, optionally filtered by workflow_id."""
    _init_tables()
    
    try:
        if workflow_id:
            result = execute_query(
                """SELECT * FROM workflow_runs WHERE workflow_id = ? 
                   ORDER BY started_at DESC LIMIT ?""",
                (workflow_id, limit),
                fetch='all'
            )
        else:
            result = execute_query(
                """SELECT * FROM workflow_runs ORDER BY started_at DESC LIMIT ?""",
                (limit,),
                fetch='all'
            )
        return result or []
    except Exception as e:
        log.error(f"Failed to get workflow runs: {e}")
        return []


def get_workflow_events(run_id: str) -> List[Dict[str, Any]]:
    """Get all events for a workflow run."""
    _init_tables()
    
    try:
        result = execute_query(
            """SELECT * FROM workflow_events WHERE run_id = ? ORDER BY created_at ASC""",
            (run_id,),
            fetch='all'
        )
        return result or []
    except Exception as e:
        log.error(f"Failed to get workflow events: {e}")
        return []
