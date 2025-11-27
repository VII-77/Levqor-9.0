"""
Levqor Guardian Feed Endpoint
Provides aggregated telemetry summary for AI analysis layer.
Returns compact JSON payload - no sensitive raw data exposed.
"""
import os
import json
import logging
from datetime import datetime
from flask import Blueprint, jsonify
from typing import Dict, Any, List

log = logging.getLogger("levqor.guardian")

guardian_bp = Blueprint('guardian', __name__, url_prefix='/api/guardian')

TELEMETRY_LOG_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "logs", "telemetry.log"
)


def _read_recent_telemetry(max_lines: int = 500, max_age_minutes: int = 60) -> List[Dict[str, Any]]:
    """
    Read recent telemetry entries from log file.
    Returns parsed JSON entries from the last N lines or X minutes.
    """
    entries = []
    
    if not os.path.exists(TELEMETRY_LOG_FILE):
        log.debug("Telemetry log file does not exist yet")
        return entries
    
    try:
        with open(TELEMETRY_LOG_FILE, "r") as f:
            lines = f.readlines()
        
        recent_lines = lines[-max_lines:] if len(lines) > max_lines else lines
        
        now_ms = int(datetime.utcnow().timestamp() * 1000)
        cutoff_ms = now_ms - (max_age_minutes * 60 * 1000)
        
        for line in recent_lines:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                ts = entry.get("ts", 0)
                if ts >= cutoff_ms:
                    entries.append(entry)
            except json.JSONDecodeError:
                continue
                
    except Exception as e:
        log.warning(f"Failed to read telemetry log: {e}")
    
    return entries


def _aggregate_telemetry(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate telemetry entries into summary metrics.
    Returns compact JSON suitable for AI analysis.
    """
    if not entries:
        return {
            "status": "no_data",
            "message": "No telemetry data in the specified time window"
        }
    
    event_counts: Dict[str, int] = {}
    error_counts: Dict[str, int] = {}
    error_types: Dict[str, int] = {}
    endpoint_counts: Dict[str, int] = {}
    language_counts: Dict[str, int] = {}
    perf_data: Dict[str, List[float]] = {}
    
    total_events = 0
    total_errors = 0
    
    for entry in entries:
        entry_type = entry.get("t", "unknown")
        
        if entry_type == "event":
            total_events += 1
            event_name = entry.get("event", "unknown")
            event_counts[event_name] = event_counts.get(event_name, 0) + 1
            
            endpoint = entry.get("endpoint")
            if endpoint:
                endpoint_counts[endpoint] = endpoint_counts.get(endpoint, 0) + 1
            
            data = entry.get("data", {})
            if isinstance(data, dict):
                lang = data.get("language")
                if lang:
                    language_counts[lang] = language_counts.get(lang, 0) + 1
        
        elif entry_type == "error":
            total_errors += 1
            location = entry.get("location", "unknown")
            error_counts[location] = error_counts.get(location, 0) + 1
            
            err_type = entry.get("error_type", "unknown")
            error_types[err_type] = error_types.get(err_type, 0) + 1
        
        elif entry_type == "perf":
            endpoint = entry.get("endpoint", "unknown")
            duration = entry.get("duration_ms", 0)
            if endpoint not in perf_data:
                perf_data[endpoint] = []
            perf_data[endpoint].append(duration)
    
    perf_summary = {}
    for endpoint, durations in perf_data.items():
        if durations:
            perf_summary[endpoint] = {
                "count": len(durations),
                "avg_ms": round(sum(durations) / len(durations), 2),
                "max_ms": round(max(durations), 2),
                "min_ms": round(min(durations), 2)
            }
    
    error_rate = 0
    if total_events + total_errors > 0:
        error_rate = round(total_errors / (total_events + total_errors) * 100, 2)
    
    anomalies = []
    
    if error_rate > 10:
        anomalies.append({
            "type": "high_error_rate",
            "severity": "warning" if error_rate < 25 else "critical",
            "message": f"Error rate is {error_rate}% (threshold: 10%)",
            "value": error_rate
        })
    
    for endpoint, stats in perf_summary.items():
        if stats["avg_ms"] > 2000:
            anomalies.append({
                "type": "slow_endpoint",
                "severity": "warning",
                "message": f"Endpoint {endpoint} has avg response time {stats['avg_ms']}ms",
                "endpoint": endpoint,
                "value": stats["avg_ms"]
            })
    
    for err_type, count in error_types.items():
        if count >= 5:
            anomalies.append({
                "type": "repeated_error",
                "severity": "warning",
                "message": f"Error type '{err_type}' occurred {count} times",
                "error_type": err_type,
                "count": count
            })
    
    return {
        "status": "ok",
        "summary": {
            "total_events": total_events,
            "total_errors": total_errors,
            "error_rate_percent": error_rate,
            "entries_analyzed": len(entries)
        },
        "events_by_type": event_counts,
        "errors_by_location": error_counts,
        "error_types": error_types,
        "endpoints": endpoint_counts,
        "languages": language_counts,
        "performance": perf_summary,
        "anomalies": anomalies,
        "anomaly_count": len(anomalies)
    }


@guardian_bp.route('/summary', methods=['GET'])
def guardian_summary():
    """
    GET /api/guardian/summary
    
    Returns aggregated telemetry summary for AI analysis.
    Safe to expose internally - no sensitive raw data.
    
    Response:
    {
        "status": "ok",
        "summary": { total_events, total_errors, error_rate_percent },
        "events_by_type": { event_name: count },
        "errors_by_location": { location: count },
        "performance": { endpoint: { avg_ms, max_ms, count } },
        "anomalies": [ { type, severity, message } ],
        "generated_at": "ISO timestamp"
    }
    """
    try:
        entries = _read_recent_telemetry(max_lines=500, max_age_minutes=60)
        
        aggregated = _aggregate_telemetry(entries)
        
        try:
            from api.telemetry import get_telemetry_stats
            live_stats = get_telemetry_stats()
            aggregated["live_stats"] = {
                "uptime_seconds": live_stats.get("uptime_seconds", 0),
                "total_events": live_stats.get("total_events", 0),
                "total_errors": live_stats.get("total_errors", 0)
            }
        except ImportError:
            aggregated["live_stats"] = None
        
        aggregated["generated_at"] = datetime.utcnow().isoformat() + "Z"
        
        return jsonify(aggregated), 200
        
    except Exception as e:
        log.error(f"Guardian summary error: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to generate telemetry summary"
        }), 500


@guardian_bp.route('/health', methods=['GET'])
def guardian_health():
    """
    GET /api/guardian/health
    
    Quick health check for the Guardian module.
    """
    log_exists = os.path.exists(TELEMETRY_LOG_FILE)
    log_size = 0
    if log_exists:
        try:
            log_size = os.path.getsize(TELEMETRY_LOG_FILE)
        except:
            pass
    
    return jsonify({
        "status": "ok",
        "module": "guardian",
        "telemetry_log_exists": log_exists,
        "telemetry_log_size_bytes": log_size,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), 200
