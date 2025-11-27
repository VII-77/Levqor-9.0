"""
Levqor Telemetry Ingestion Endpoint
Receives telemetry batches from frontend and logs them via the telemetry module.
"""
import logging
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List

from .events import log_event, log_error, log_performance

log = logging.getLogger("levqor.telemetry.ingest")

telemetry_ingest_bp = Blueprint('telemetry_ingest', __name__, url_prefix='/api/telemetry')


@telemetry_ingest_bp.route('/ingest', methods=['POST'])
def ingest_telemetry():
    """
    POST /api/telemetry/ingest
    
    Receives batched telemetry events from frontend.
    
    Request body:
    {
        "events": [
            { "event": "...", "data": {...}, "timestamp": ... },
            { "location": "...", "error_type": "...", "error_msg": "..." },
            { "endpoint": "...", "duration_ms": ..., "status": ... }
        ]
    }
    
    Response:
    { "ok": true, "received": N }
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        body = request.get_json(silent=True) or {}
        events = body.get("events", [])
        
        if not isinstance(events, list):
            return jsonify({"error": "events must be an array"}), 400
        
        if len(events) > 100:
            return jsonify({"error": "Too many events in batch (max 100)"}), 400
        
        processed = 0
        
        for entry in events:
            if not isinstance(entry, dict):
                continue
            
            try:
                _process_telemetry_entry(entry)
                processed += 1
            except Exception as e:
                log.warning(f"Failed to process telemetry entry: {e}")
        
        return jsonify({
            "ok": True,
            "received": processed,
            "source": "frontend"
        }), 200
        
    except Exception as e:
        log.error(f"Telemetry ingest error: {e}")
        return jsonify({"error": "Failed to process telemetry"}), 500


@telemetry_ingest_bp.route('/health', methods=['GET'])
def telemetry_health():
    """
    GET /api/telemetry/health
    
    Health check for telemetry ingestion.
    """
    return jsonify({
        "status": "ok",
        "module": "telemetry_ingest",
        "max_batch_size": 100
    }), 200


def _process_telemetry_entry(entry: Dict[str, Any]) -> None:
    """
    Process a single telemetry entry and route to appropriate handler.
    """
    if "event" in entry:
        log_event(
            event_type=f"fe:{entry.get('event', 'unknown')}",
            payload=entry.get("data", {}),
            endpoint=entry.get("endpoint")
        )
    
    elif "location" in entry and ("error_type" in entry or "error_msg" in entry):
        error_type = entry.get("error_type", "Error")
        error_msg = entry.get("error_msg", "Unknown frontend error")
        
        class FrontendError(Exception):
            """Dynamic frontend error wrapper."""
            pass
        
        FrontendError.__name__ = str(error_type)
        err = FrontendError(error_msg)
        
        log_error(
            location=f"fe:{entry.get('location', 'unknown')}",
            error=err,
            extra=entry.get("extra")
        )
    
    elif "endpoint" in entry and "duration_ms" in entry:
        log_performance(
            endpoint=f"fe:{entry.get('endpoint', 'unknown')}",
            duration_ms=entry.get("duration_ms", 0),
            status_code=entry.get("status", 200),
            extra=entry.get("extra")
        )
