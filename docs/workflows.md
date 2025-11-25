# Levqor Workflow System Documentation

## Overview

The Levqor Workflow System (MEGA PHASE v15-v18) provides a complete workflow execution engine with:
- Multi-step workflow execution
- AI-powered workflow builder via Levqor Brain
- Approval queue for critical operations
- Scheduling and automation
- Analytics and event history

## Workflow Schema

### Workflow Structure

```json
{
  "id": "uuid",
  "name": "Workflow Name",
  "description": "Workflow description",
  "steps": [...],
  "owner_id": "user-uuid",
  "tenant_id": "default",
  "is_active": false,
  "schedule_config": {
    "enabled": false,
    "interval_minutes": 60,
    "cron_expression": "",
    "last_run_at": 0,
    "next_run_at": 0
  },
  "created_at": 1700000000,
  "updated_at": 1700000000
}
```

### Step Types

#### 1. LOG Step
Logs a message to the workflow events.

```json
{
  "id": "step_1",
  "type": "log",
  "name": "Log Message",
  "config": {
    "message": "Processing started",
    "level": "info"
  },
  "next_step_ids": ["step_2"]
}
```

Levels: `info`, `warn`, `error`

#### 2. HTTP_REQUEST Step
Makes an HTTP request to an external service.

```json
{
  "id": "step_2",
  "type": "http_request",
  "name": "Call API",
  "config": {
    "method": "POST",
    "url": "https://api.example.com/webhook",
    "headers": {"Authorization": "Bearer token"},
    "body": {"key": "value"},
    "timeout": 30
  },
  "next_step_ids": ["step_3"]
}
```

Methods: `GET`, `POST`, `PUT`, `DELETE`
Max timeout: 30 seconds

#### 3. EMAIL Step (Class C - Requires Approval)
Sends an email. **Note:** Email steps require approval before execution.

```json
{
  "id": "step_3",
  "type": "email",
  "name": "Send Notification",
  "config": {
    "to": "user@example.com",
    "subject": "Workflow Complete",
    "body": "Your workflow has finished processing."
  },
  "next_step_ids": []
}
```

#### 4. DELAY Step
Pauses execution for a specified duration.

```json
{
  "id": "step_4",
  "type": "delay",
  "name": "Wait",
  "config": {
    "seconds": 10
  },
  "next_step_ids": ["step_5"]
}
```

Max delay: 300 seconds (5 minutes)

#### 5. CONDITION Step
Evaluates a condition (basic implementation).

```json
{
  "id": "step_5",
  "type": "condition",
  "name": "Check Status",
  "config": {
    "condition": "status == 'success'",
    "true_step": "step_6",
    "false_step": "step_7"
  },
  "next_step_ids": ["step_6", "step_7"]
}
```

## Impact Classification (Class A/B/C)

### Class A (SAFE)
- Log steps only
- Internal operations
- No external effects
- Automatically approved

### Class B (SOFT)
- Delay steps
- Condition steps
- Limited external effects
- Logged but auto-approved

### Class C (CRITICAL)
- Email steps (always)
- HTTP requests to external domains
- Financial operations
- **Requires manual approval**

## API Endpoints

### Workflows

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workflows` | GET | List all workflows |
| `/api/workflows/<id>` | GET | Get workflow details |
| `/api/workflows` | POST | Create workflow (inactive) |
| `/api/workflows/<id>` | PUT | Update workflow |
| `/api/workflows/<id>/run` | POST | Trigger manual run |
| `/api/workflows/runs` | GET | List workflow runs |
| `/api/workflows/runs/<id>/events` | GET | Get run events |

### Brain Builder

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/brain/build_workflow` | POST | AI-powered workflow design |
| `/api/ai/brain/submit_workflow` | POST | Submit proposed workflow |

### Approvals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/approvals` | GET | List pending approvals |
| `/api/approvals/<id>` | GET | Get approval details |
| `/api/approvals/<id>/approve` | POST | Approve action |
| `/api/approvals/<id>/reject` | POST | Reject action |
| `/api/approvals/stats` | GET | Get approval statistics |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/overview` | GET | Get workflow analytics |

## Examples

### Creating a Simple Workflow

```bash
curl -X POST http://localhost:8000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Report",
    "description": "Generate and log daily report",
    "steps": [
      {
        "id": "start",
        "type": "log",
        "name": "Start",
        "config": {"message": "Starting daily report", "level": "info"},
        "next_step_ids": ["process"]
      },
      {
        "id": "process",
        "type": "delay",
        "name": "Process",
        "config": {"seconds": 5},
        "next_step_ids": ["complete"]
      },
      {
        "id": "complete",
        "type": "log",
        "name": "Complete",
        "config": {"message": "Report complete", "level": "info"},
        "next_step_ids": []
      }
    ]
  }'
```

### Running a Workflow

```bash
curl -X POST http://localhost:8000/api/workflows/<workflow_id>/run \
  -H "Content-Type: application/json" \
  -d '{"context": {"triggered_by": "manual"}}'
```

### Using AI Brain Builder

```bash
curl -X POST http://localhost:8000/api/ai/brain/build_workflow \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Send weekly analytics summary to team",
    "context": "Marketing team",
    "approx_volume": "50 emails/week"
  }'
```

## Frontend Components

### BrainWorkflowBuilder
Client component for AI-powered workflow creation.
Location: `levqor-site/src/components/brain/BrainWorkflowBuilder.tsx`

### ApprovalPanel
Dashboard component for managing approval queue.
Location: `levqor-site/src/components/dashboard/ApprovalPanel.tsx`

### AnalyticsPanel
Dashboard component for workflow analytics.
Location: `levqor-site/src/components/dashboard/AnalyticsPanel.tsx`

### WorkflowHistoryPanel
Dashboard component for workflow run history.
Location: `levqor-site/src/components/dashboard/WorkflowHistoryPanel.tsx`

## Database Tables

### workflows
Stores workflow definitions.

### workflow_runs
Stores execution history for workflows.

### workflow_events
Stores individual step events during execution.

### approval_queue
Stores pending, approved, and rejected actions.
