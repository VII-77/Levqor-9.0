"""
Levqor Autopilot Wave 2 - Telemetry Ingestion with Database Storage
Provides persistent storage for telemetry logs from both backend and frontend.
"""
import logging
import json
from time import time
from uuid import uuid4
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional

log = logging.getLogger("levqor.guardian.telemetry_ingest")

telemetry_ingest_bp = Blueprint('guardian_telemetry_ingest', __name__, url_prefix='/api/guardian/telemetry')

def _get_db():
    """Get database connection with error handling."""
    try:
        from modules.db_wrapper import get_db, execute_query, commit
        return get_db, execute_query, commit
    except ImportError as e:
        log.error(f"Database import failed: {e}")
        return None, None, None

def store_telemetry(
    source: str = "backend",
    level: str = "info",
    event_type: Optional[str] = None,
    message: Optional[str] = None,
    endpoint: Optional[str] = None,
    duration_ms: Optional[float] = None,
    status_code: Optional[int] = None,
    error_type: Optional[str] = None,
    error_message: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Store a telemetry entry in the database.
    
    Args:
        source: Origin of telemetry (backend, frontend)
        level: Log level (info, warning, error, critical)
        event_type: Type of event (e.g., brain_call, checkout_start)
        message: Human-readable message
        endpoint: API endpoint related to this log
        duration_ms: Request duration in milliseconds
        status_code: HTTP status code
        error_type: Type of error if applicable
        error_message: Error message if applicable
        metadata: Additional structured data
    
    Returns:
        True if stored successfully, False otherwise
    """
    get_db, execute_query, commit = _get_db()
    if not get_db:
        return False
    
    try:
        log_id = str(uuid4())
        created_at = time()
        meta_json = json.dumps(metadata or {})
        
        query = """
            INSERT INTO telemetry_logs 
            (id, source, level, event_type, message, endpoint, duration_ms, 
             status_code, error_type, error_message, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        execute_query(
            query,
            (log_id, source, level, event_type, message, endpoint, 
             duration_ms, status_code, error_type, error_message, meta_json, created_at),
            fetch=None
        )
        commit()
        return True
        
    except Exception as e:
        log.error(f"Failed to store telemetry: {e}")
        return False


def get_recent_logs(
    limit: int = 500,
    max_age_minutes: int = 60,
    level: Optional[str] = None,
    source: Optional[str] = None
) -> list:
    """
    Retrieve recent telemetry logs from the database.
    
    Args:
        limit: Maximum number of logs to return
        max_age_minutes: Only return logs from the last N minutes
        level: Filter by log level
        source: Filter by source
    
    Returns:
        List of telemetry log entries
    """
    get_db, execute_query, commit = _get_db()
    if not execute_query:
        return []
    
    try:
        cutoff = time() - (max_age_minutes * 60)
        
        query = "SELECT * FROM telemetry_logs WHERE created_at >= ?"
        params = [cutoff]
        
        if level:
            query += " AND level = ?"
            params.append(level)
        
        if source:
            query += " AND source = ?"
            params.append(source)
        
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        results = execute_query(query, tuple(params), fetch='all')
        
        logs = []
        for row in results or []:
            entry = dict(row)
            if entry.get('metadata'):
                try:
                    entry['metadata'] = json.loads(entry['metadata'])
                except:
                    pass
            logs.append(entry)
        
        return logs
        
    except Exception as e:
        log.error(f"Failed to retrieve telemetry logs: {e}")
        return []


@telemetry_ingest_bp.route('/ingest', methods=['POST'])
def ingest_telemetry():
    """
    POST /api/guardian/telemetry/ingest
    
    Ingest telemetry data into persistent database storage.
    
    Request body:
    {
        "source": "frontend|backend",
        "level": "info|warning|error|critical",
        "message": "Human readable message",
        "meta": { ... additional data ... }
    }
    
    OR batch format:
    {
        "events": [
            { "source": "...", "level": "...", ... },
            ...
        ]
    }
    
    Response:
    { "ok": true, "received": N }
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        body = request.get_json(silent=True) or {}
        
        if 'events' in body:
            events = body.get('events', [])
            if not isinstance(events, list):
                return jsonify({"error": "events must be an array"}), 400
            if len(events) > 100:
                return jsonify({"error": "Too many events in batch (max 100)"}), 400
        else:
            events = [body]
        
        processed = 0
        
        for entry in events:
            if not isinstance(entry, dict):
                continue
            
            try:
                success = store_telemetry(
                    source=entry.get('source', 'unknown'),
                    level=entry.get('level', 'info'),
                    event_type=entry.get('event_type') or entry.get('event'),
                    message=entry.get('message', ''),
                    endpoint=entry.get('endpoint'),
                    duration_ms=entry.get('duration_ms'),
                    status_code=entry.get('status_code') or entry.get('status'),
                    error_type=entry.get('error_type'),
                    error_message=entry.get('error_msg') or entry.get('error_message'),
                    metadata=entry.get('meta') or entry.get('metadata') or entry.get('data')
                )
                
                if success:
                    processed += 1
                    
            except Exception as e:
                log.warning(f"Failed to process telemetry entry: {e}")
        
        return jsonify({
            "ok": True,
            "received": processed,
            "stored_in": "database"
        }), 200
        
    except Exception as e:
        log.error(f"Telemetry ingest error: {e}")
        return jsonify({"error": "Failed to process telemetry"}), 500


@telemetry_ingest_bp.route('/health', methods=['GET'])
def telemetry_db_health():
    """
    GET /api/guardian/telemetry/health
    
    Health check for database-backed telemetry ingestion.
    """
    get_db, execute_query, _ = _get_db()
    
    db_ok = False
    log_count = 0
    
    if execute_query:
        try:
            result = execute_query("SELECT COUNT(*) as cnt FROM telemetry_logs", fetch='one')
            log_count = result.get('cnt', 0) if result else 0
            db_ok = True
        except Exception as e:
            log.warning(f"DB health check failed: {e}")
    
    return jsonify({
        "status": "ok" if db_ok else "degraded",
        "module": "guardian_telemetry_ingest",
        "storage": "database",
        "db_connected": db_ok,
        "total_logs": log_count
    }), 200 if db_ok else 503
