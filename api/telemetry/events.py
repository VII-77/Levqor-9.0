"""
Levqor Autopilot Telemetry - Event Logging
Lightweight telemetry collection using only standard library.
Writes JSON lines to rotating local log file + stdout.
"""
import os
import json
import logging
import threading
from time import time
from datetime import datetime
from collections import defaultdict
from typing import Dict, Any, Optional

log = logging.getLogger("levqor.telemetry")

TELEMETRY_LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "logs")
TELEMETRY_LOG_FILE = os.path.join(TELEMETRY_LOG_DIR, "telemetry.log")
MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024  # 10MB before rotation
MAX_LOG_FILES = 5

_stats_lock = threading.Lock()
_stats: Dict[str, Any] = {
    "events": defaultdict(int),
    "errors": defaultdict(int),
    "performance": defaultdict(list),
    "languages": defaultdict(int),
    "last_reset": time()
}


def _ensure_log_dir():
    """Ensure telemetry log directory exists."""
    try:
        os.makedirs(TELEMETRY_LOG_DIR, exist_ok=True)
    except Exception as e:
        log.warning(f"Failed to create telemetry log dir: {e}")


def _rotate_log_if_needed():
    """Rotate log file if it exceeds max size."""
    try:
        if os.path.exists(TELEMETRY_LOG_FILE):
            size = os.path.getsize(TELEMETRY_LOG_FILE)
            if size >= MAX_LOG_SIZE_BYTES:
                for i in range(MAX_LOG_FILES - 1, 0, -1):
                    old_file = f"{TELEMETRY_LOG_FILE}.{i}"
                    new_file = f"{TELEMETRY_LOG_FILE}.{i + 1}"
                    if os.path.exists(old_file):
                        if i + 1 >= MAX_LOG_FILES:
                            os.remove(old_file)
                        else:
                            os.rename(old_file, new_file)
                os.rename(TELEMETRY_LOG_FILE, f"{TELEMETRY_LOG_FILE}.1")
    except Exception as e:
        log.warning(f"Log rotation failed: {e}")


def _write_telemetry_line(entry: Dict[str, Any]):
    """Write a single telemetry entry to log file and stdout."""
    _ensure_log_dir()
    _rotate_log_if_needed()
    
    line = json.dumps(entry, separators=(',', ':'), default=str)
    
    print(f"TELEMETRY {line}", flush=True)
    
    try:
        with open(TELEMETRY_LOG_FILE, "a") as f:
            f.write(line + "\n")
    except Exception as e:
        log.warning(f"Failed to write telemetry log: {e}")


def log_event(event_type: str, payload: Optional[Dict[str, Any]] = None, endpoint: Optional[str] = None):
    """
    Log a telemetry event.
    
    Args:
        event_type: Type of event (e.g., "brain_call", "checkout_start", "workflow_run")
        payload: Additional event data (optional, will be sanitized)
        endpoint: API endpoint that generated this event (optional)
    """
    sanitized_payload = _sanitize_payload(payload or {})
    
    entry = {
        "t": "event",
        "ts": int(time() * 1000),
        "event": event_type,
        "endpoint": endpoint,
        "data": sanitized_payload
    }
    
    _write_telemetry_line(entry)
    
    with _stats_lock:
        _stats["events"][event_type] += 1
        if endpoint:
            _stats["events"][f"endpoint:{endpoint}"] += 1
        if "language" in sanitized_payload:
            _stats["languages"][sanitized_payload["language"]] += 1


def log_error(location: str, error: Exception, extra: Optional[Dict[str, Any]] = None):
    """
    Log an error event.
    
    Args:
        location: Where the error occurred (e.g., "brain_builder.build_workflow")
        error: The exception that was raised
        extra: Additional context (optional)
    """
    sanitized_extra = _sanitize_payload(extra or {})
    
    entry = {
        "t": "error",
        "ts": int(time() * 1000),
        "location": location,
        "error_type": type(error).__name__,
        "error_msg": str(error)[:500],
        "extra": sanitized_extra
    }
    
    _write_telemetry_line(entry)
    
    with _stats_lock:
        _stats["errors"][location] += 1
        _stats["errors"][f"type:{type(error).__name__}"] += 1


def log_performance(endpoint: str, duration_ms: float, status_code: int = 200, extra: Optional[Dict[str, Any]] = None):
    """
    Log a performance metric.
    
    Args:
        endpoint: API endpoint being measured
        duration_ms: Request duration in milliseconds
        status_code: HTTP status code returned
        extra: Additional context (optional)
    """
    entry = {
        "t": "perf",
        "ts": int(time() * 1000),
        "endpoint": endpoint,
        "duration_ms": round(duration_ms, 2),
        "status": status_code,
        "extra": _sanitize_payload(extra or {})
    }
    
    _write_telemetry_line(entry)
    
    with _stats_lock:
        perf_list = _stats["performance"][endpoint]
        perf_list.append({"duration_ms": duration_ms, "status": status_code, "ts": time()})
        if len(perf_list) > 1000:
            _stats["performance"][endpoint] = perf_list[-500:]


def get_telemetry_stats() -> Dict[str, Any]:
    """
    Get aggregated telemetry statistics for Guardian feed.
    
    Returns:
        Dict with event counts, error counts, performance summaries, and language distribution.
    """
    with _stats_lock:
        now = time()
        uptime = now - _stats["last_reset"]
        
        perf_summary = {}
        for endpoint, entries in _stats["performance"].items():
            recent = [e for e in entries if now - e["ts"] < 3600]
            if recent:
                durations = [e["duration_ms"] for e in recent]
                errors = sum(1 for e in recent if e["status"] >= 400)
                perf_summary[endpoint] = {
                    "count": len(recent),
                    "avg_ms": round(sum(durations) / len(durations), 2) if durations else 0,
                    "max_ms": round(max(durations), 2) if durations else 0,
                    "min_ms": round(min(durations), 2) if durations else 0,
                    "error_rate": round(errors / len(recent) * 100, 2) if recent else 0
                }
        
        error_rate_total = 0
        total_events = sum(_stats["events"].values())
        total_errors = sum(_stats["errors"].values())
        if total_events > 0:
            error_rate_total = round(total_errors / total_events * 100, 2)
        
        return {
            "uptime_seconds": int(uptime),
            "total_events": total_events,
            "total_errors": total_errors,
            "error_rate_percent": error_rate_total,
            "events_by_type": dict(_stats["events"]),
            "errors_by_location": dict(_stats["errors"]),
            "performance": perf_summary,
            "languages": dict(_stats["languages"]),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }


def _sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize payload to remove sensitive data.
    Never include: passwords, tokens, API keys, full emails, etc.
    """
    sensitive_keys = {
        "password", "secret", "token", "api_key", "apikey", "authorization",
        "auth", "credential", "private", "key", "stripe", "webhook"
    }
    
    def sanitize_value(key: str, value: Any) -> Any:
        key_lower = key.lower()
        
        for sensitive in sensitive_keys:
            if sensitive in key_lower:
                if isinstance(value, str) and len(value) > 0:
                    return "[REDACTED]"
                return value
        
        if key_lower == "email" and isinstance(value, str) and "@" in value:
            parts = value.split("@")
            if len(parts) == 2 and len(parts[0]) > 2:
                return parts[0][:2] + "***@" + parts[1]
            return "***@***"
        
        if isinstance(value, dict):
            return {k: sanitize_value(k, v) for k, v in value.items()}
        
        if isinstance(value, list):
            return [sanitize_value(str(i), v) for i, v in enumerate(value)]
        
        if isinstance(value, str) and len(value) > 200:
            return value[:200] + "...[truncated]"
        
        return value
    
    return {k: sanitize_value(k, v) for k, v in payload.items()}
