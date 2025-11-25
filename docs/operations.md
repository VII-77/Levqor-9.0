# Levqor Operations Guide

## Overview

This guide covers operational tasks for running the Levqor platform, including automation scripts, scheduled jobs, and maintenance procedures.

## Workflow Scheduler

### Running the Scheduler

The workflow scheduler checks for workflows with active schedules and runs them automatically.

#### One-time Execution
```bash
python scripts/automation/workflow_scheduler.py --once
```

#### Continuous Mode
```bash
python scripts/automation/workflow_scheduler.py
```
Runs in a loop, checking every 60 seconds.

#### Via Cron
Add to crontab for running every 5 minutes:
```cron
*/5 * * * * cd /path/to/levqor && python scripts/automation/workflow_scheduler.py --once
```

### How It Works
1. Fetches all workflows where `is_active=True` and `schedule_config.enabled=True`
2. Checks if each workflow should run based on `interval_minutes` and `last_run_at`
3. Executes due workflows and updates their schedule state
4. Logs all activity to stdout

## Auto-Marketing Cycle

### Running Marketing Automation
```bash
python -c "from modules.auto_intel.auto_marketing import run_marketing_cycle; run_marketing_cycle()"
```

### What It Does
- Analyzes current user engagement
- Generates marketing recommendations
- Proposes campaign adjustments

## Weekly Report Generation

### Running Weekly Reports
```bash
python -c "from modules.auto_intel.auto_weekly_report import generate_weekly_report; print(generate_weekly_report())"
```

### What It Does
- Compiles metrics from the past week
- Generates markdown-formatted summary
- Includes performance highlights and recommendations

## Approval Queue Management

### Viewing Pending Approvals
```bash
curl http://localhost:8000/api/approvals
```

### Approving an Action
```bash
curl -X POST http://localhost:8000/api/approvals/<action_id>/approve
```

### Rejecting an Action
```bash
curl -X POST http://localhost:8000/api/approvals/<action_id>/reject \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not authorized"}'
```

### Understanding Impact Levels
- **Class A (SAFE)**: Auto-approved, internal operations
- **Class B (SOFT)**: Auto-approved but logged
- **Class C (CRITICAL)**: Requires manual approval (emails, external HTTP)

## Health Monitoring

### Auto-Health Summary
```bash
curl http://localhost:8000/api/health/summary
```

Returns:
- System uptime
- Database connectivity
- Queue depths
- Error rates

### Real-time Health Tiles
Dashboard component at `/dashboard` displays live health metrics.

## Auto-Scaling

### How Scaling Works
The scaling policy (`security_core/scaling_policy.py`) monitors:
- Current request rate
- Response latency (P95)
- Queue depth

### Scaling Thresholds
| Load Level | Threshold | Action |
|------------|-----------|--------|
| Low | <100 req/min | Scale down |
| Normal | 100-500 req/min | Maintain |
| High | 500-1000 req/min | Scale up |
| Critical | >1000 req/min | Emergency scale |

## CI/CD Safety Checks

### Running All Checks
```bash
python scripts/ci/run_all_checks.py
```

### Individual Checks
1. **Frontend Lint**: `cd levqor-site && npm run lint`
2. **Frontend Build**: `cd levqor-site && npm run build`
3. **Backend Syntax**: `python -m py_compile run.py`
4. **Safety Gate**: Validates critical file integrity

### Required Pass Rate
All 4/4 checks must pass before deployment.

## Troubleshooting

### Common Issues

#### Workflow Not Running
1. Check `is_active` is `True`
2. Verify `schedule_config.enabled` is `True`
3. Confirm scheduler script is running
4. Check logs for errors

#### Approval Queue Empty but Actions Pending
1. Verify `status` is `'pending'` in database
2. Check `tenant_id` matches query filter
3. Confirm API endpoint is accessible

#### Analytics Not Updating
1. Ensure workflow tables exist
2. Check database connectivity
3. Verify runs are being recorded

### Log Locations
- Backend: stdout (gunicorn)
- Frontend: browser console
- Scheduler: stdout

## Maintenance Procedures

### Database Cleanup
Workflows and runs older than 90 days can be archived:
```sql
-- Archive old workflow runs (manual operation)
DELETE FROM workflow_runs WHERE started_at < (EXTRACT(EPOCH FROM NOW()) - 7776000);
DELETE FROM workflow_events WHERE created_at < (EXTRACT(EPOCH FROM NOW()) - 7776000);
```

### Approval Queue Cleanup
Processed approvals older than 30 days:
```sql
DELETE FROM approval_queue WHERE status != 'pending' AND processed_at < (EXTRACT(EPOCH FROM NOW()) - 2592000);
```

## Monitoring Best Practices

1. **Set up alerts** for scheduler failures
2. **Monitor approval queue depth** - high pending count may indicate bottleneck
3. **Track workflow failure rate** - target <5%
4. **Review analytics weekly** for performance trends
