# Guardian Heartbeat Discovery Notes

## Discovery Date: 2025-11-27

## Current Health-Related Endpoints

| Endpoint | File | Purpose |
|----------|------|---------|
| `GET /api/health/summary` | `api/health/summary.py` | Returns app_up, db_ok, stripe_ok, error_count_24h |
| `GET /api/health/ping` | `api/health/summary.py` | Simple OK ping |
| `GET /api/guardian/summary` | `api/guardian/summary.py` | Aggregated telemetry summary with anomaly detection |
| `GET /api/guardian/health` | `api/guardian/summary.py` | Guardian module health check |

## Telemetry Logging Helpers

**Location**: `api/telemetry/events.py`

**Functions**:
- `log_event(event_type, payload, endpoint)` - Log any event
- `log_error(location, error, extra)` - Log errors
- `log_performance(endpoint, duration_ms, status_code, extra)` - Log performance
- `get_telemetry_stats()` - Get aggregated stats for Guardian feed

**Log File**: `logs/telemetry.log` (JSONL format, rotating at 10MB, keeps 5 backups)

## Guardian Summary Endpoint

**Location**: `api/guardian/summary.py`

**Returns**:
- `status`: "ok" | "no_data" | "error"
- `summary`: total_events, total_errors, error_rate_percent
- `events_by_type`: {event_name: count}
- `errors_by_location`: {location: count}
- `performance`: {endpoint: {avg_ms, max_ms, count}}
- `anomalies`: [{type, severity, message}]
- `live_stats`: uptime_seconds, total_events, total_errors

## Current Logging Events

From telemetry.log and codebase analysis:
- `brain_build_workflow` - AI workflow builder calls
- `checkout_start` / `checkout_complete` - Stripe checkout events
- Frontend events (prefixed with `fe:`)
- Performance metrics for API endpoints

## Scheduler Location

**File**: `monitors/scheduler.py`

Uses APScheduler with BackgroundScheduler. Contains 29+ scheduled jobs including:
- SLO watchdog (5 min)
- Health monitor (6 hours)
- Guardian cost guard (30 min)
- Guardian secrets health (6 hours)
- Guardian compliance audit (daily)
- Omega self-monitor (10 min)
- Omega operator advisor (15 min)

## External Guardian Loop

**File**: `scripts/autopilot/guardian_loop.py`

Runs external scripts on schedule:
- guardian_monitor.py (10 min)
- secrets_health.py (6 hours)
- cost_guard.py (30 min)
- spike_detector.py (15 min)
- growth_organism_check.py (2 hours)
- compliance_audit.py (daily)
- founder_digest.py (daily)

## Next Steps

1. Create `api/system/heartbeat.py` with unified health endpoint
2. Add heartbeat scheduler job to `monitors/scheduler.py`
3. Create `api/guardian/healing.py` with dry-run healing plan
