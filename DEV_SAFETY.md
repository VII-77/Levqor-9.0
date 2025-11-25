# Levqor Development Safety Guide

## Levqor Brain: Living Canvas

The Living Canvas brain visualization is a WebGL/Canvas-based animated background that responds to user interactions and optional sound input.

### Dimensional Brain States

The brain has 5 distinct visual states, each with unique shader effects:

| State | Description | Visual Effect | Colors |
|-------|-------------|---------------|--------|
| **Organic** | Default calm state | Soft breathing motion, slow waves | Blue gradient |
| **Neural** | Thinking/processing | Pulse lines, node-like grid flickers | Purple gradient |
| **Quantum** | Creative/generating | Shimmer noise, interference patterns | Cyan gradient |
| **Success** | Task completed | Green tint pulse overlay | Green overlay |
| **Error** | Issue encountered | Red warning flash overlay | Red overlay |

### Brain State Machine

All brain state transitions are centralized in `brainStateMachine.ts`:

```typescript
import { computeNextBrainState, BrainUIEvent } from "@/components/brain";

const nextState = computeNextBrainState({
  currentState: brain.state,
  uiEvent: "hover_primary_cta",
  intensity: 0, // optional: 0-1 from sound
});
brain.setState(nextState);
```

**UI Events:**
- `idle` → `organic`
- `hover_primary_cta` → `neural`
- `click_primary_cta` → `success`
- `hover_secondary_cta` → `quantum`
- `dashboard_action_start` → `neural`
- `dashboard_action_success` → `success`
- `dashboard_action_error` → `error`
- `test_cycle` → cycles through all states

**Intensity Modulation:** If `intensity > 0.7` and not in error/success, prefer `quantum` state.

### Homepage Brain Interactions
- **Primary CTA ("Start free trial")**: Hover triggers `neural`, click triggers `success`
- **Secondary CTA ("See pricing")**: Hover triggers `quantum`
- **Location**: `levqor-site/src/components/brain/InteractiveHeroCTA.tsx`

### Dashboard Brain Interactions
- **Test Brain Button**: Cycles through all 5 states
- **Location**: `levqor-site/src/components/brain/TestBrainButton.tsx`

### Brain Context Usage
- `useLevqorBrain()` hook provides: `state`, `setState`, `setOrganic`, `setNeural`, `setQuantum`, `setSuccess`, `setError`
- Homepage wrapped with `LevqorBrainProvider` at `page.tsx`
- Dashboard wrapped with `DashboardClientWrapper` → `LevqorBrainProvider`

### Sound Reactivity (Optional)
- **Hook**: `useSoundIntensity()` in `levqor-site/src/components/brain/useSoundIntensity.ts`
- **Requirements for activation**:
  1. `NEXT_PUBLIC_LEVQOR_BRAIN_SOUND_ENABLED=true` in environment
  2. User grants microphone permission
  3. `prefers-reduced-motion` is NOT active
- **Behavior**: Returns intensity 0-1, modulates canvas visuals subtly
- **Privacy**: Intensity-only. No recording, no storage, no network transmission.

### Accessibility & Performance

- **Reduced Motion**: If `prefers-reduced-motion` is active, animations are paused (static colors)
- **Feature Flag**: `NEXT_PUBLIC_LEVQOR_BRAIN_CANVAS_ENABLED=false` disables the canvas entirely
- **WebGL Fallback**: If WebGL unavailable, falls back to Canvas 2D with similar effects
- **Cleanup**: All animation frames and audio contexts are properly cleaned up on unmount

---

## Workflow Approval Model (Class A/B/C)

The workflow system uses an impact classification to determine which actions require manual approval:

### Impact Levels

| Level | Name | Description | Approval Required |
|-------|------|-------------|-------------------|
| A | SAFE | Internal operations only (log steps) | No |
| B | SOFT | Limited external effects (delay, condition) | No |
| C | CRITICAL | External services, emails, financial ops | **Yes** |

### How Classification Works

1. **Email steps** → Always Class C
2. **HTTP requests to external URLs** → Class C
3. **Delay/Condition steps** → Class B
4. **Log steps** → Class A

Workflow overall impact = highest impact among all steps.

### Managing Approvals

1. View pending approvals: `GET /api/approvals`
2. Approve an action: `POST /api/approvals/<id>/approve`
3. Reject an action: `POST /api/approvals/<id>/reject`

### Where Approval Code Lives
- Impact classification: `modules/approval_policy/__init__.py`
- Approval queue: `modules/approvals/queue.py`
- API routes: `api/approvals/routes.py`
- Frontend panel: `levqor-site/src/components/dashboard/ApprovalPanel.tsx`

---

## Workflow Scheduler

### Running the Scheduler

```bash
# One-time execution
python scripts/automation/workflow_scheduler.py --once

# Continuous mode (every 60s)
python scripts/automation/workflow_scheduler.py
```

### Cron Setup (every 5 minutes)
```cron
*/5 * * * * cd /path/to/levqor && python scripts/automation/workflow_scheduler.py --once
```

### How It Works
1. Fetches workflows with `is_active=True` and `schedule_config.enabled=True`
2. Checks if workflow should run based on `interval_minutes` and `last_run_at`
3. Executes due workflows and updates schedule state

### Related Files
- Scheduler: `scripts/automation/workflow_scheduler.py`
- Workflow storage: `modules/workflows/storage.py`
- Workflow runner: `modules/workflows/runner.py`

---

## Revenue Funnel Testing

### User Journey
1. **Homepage** → Primary CTA links to `/signin`, secondary to `/pricing`
2. **Pricing** → 4 subscription tiers + DFY packages with Stripe checkout
3. **Checkout** → Stripe-hosted payment flow
4. **Welcome** → `/welcome?session_id=...` post-checkout success page
5. **Dashboard** → QuickstartPanel prompts first-time users

### Key Endpoints
- `POST /api/billing/checkout` — Creates Stripe checkout session
- `GET /api/billing/verify-session` — Verifies post-checkout session
- `POST /api/support/ticket` — Submits support ticket

### Where Things Live
- **Welcome Page**: `levqor-site/src/app/welcome/page.tsx`
- **QuickstartPanel**: `levqor-site/src/components/dashboard/QuickstartPanel.tsx`
- **Support Form**: `levqor-site/src/components/SupportForm.tsx`
- **Onboarding Flow**: `levqor-site/src/app/onboarding/page.tsx`

---

## Master Safety Command

Before any deployment or major code changes, run the master safety command:

```bash
python scripts/ci/run_all_checks.py
```

### What It Checks

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| Frontend Lint | Runs `npm run lint` in levqor-site | No lint errors (WARNING only - non-blocking) |
| Frontend Build | Runs `npm run build` in levqor-site | TypeScript compiles, Next.js builds successfully |
| Backend Syntax | Compiles ALL Python files (api/, modules/, scripts/, etc.) | No Python syntax errors in any file |
| Safety Gate | Runs production endpoint checks | All 4 checks pass (landing page, auth gating, SEO protection, Stripe checkout) |

### Understanding Results

**PASS** — All checks completed successfully. Safe to deploy.

**FAIL** — One or more checks failed. Do NOT deploy until issues are fixed.

### Safety Gate Details

The safety gate (`scripts/monitoring/safety_gate_full.py`) verifies:

1. **Web: Landing page** — https://www.levqor.ai returns 200 with expected content
2. **Auth: /dashboard gated** — Unauthenticated requests redirect to signin
3. **SEO: /dashboard/v2 protected** — Dashboard routes are not publicly indexed
4. **API: /api/checkout endpoint** — Stripe checkout session creation works

### Running Individual Checks

```bash
# Frontend lint only
cd levqor-site && npm run lint

# Frontend build only
cd levqor-site && npm run build

# Backend syntax only
python -m py_compile run.py

# Safety gate only
python scripts/monitoring/safety_gate_full.py
```

## Auto-Deploy Process

The auto-deploy script (`scripts/ci/auto_deploy.py`) will:

1. Run the master safety command
2. If all checks pass, log to AUTO_CHANGELOG.md
3. Trigger deployment (when configured)

### Files Modified During Auto-Deploy

- `AUTO_CHANGELOG.md` — Timestamped deployment log

## Critical vs Non-Critical Changes

See `auto_upgrade_policy.yml` at repo root for categorization of which files are considered critical (require full safety checks) vs non-critical (marketing, docs, etc.).

## Emergency Rollback

If a deployment causes issues:

1. Check `AUTO_CHANGELOG.md` for the last successful commit hash
2. Use Replit's checkpoint rollback feature
3. Or revert to the previous commit manually

---

## Auto-Health Monitoring (v11-v14)

### Health Summary Endpoint

The `/api/health/summary` endpoint provides lightweight health status:

```bash
curl http://localhost:8000/api/health/summary
```

**Response:**
```json
{
  "status": "healthy",
  "app_up": true,
  "db_ok": true,
  "stripe_ok": true,
  "error_count_24h": 0,
  "last_incident_time": null,
  "db_type": "postgresql",
  "timestamp": 1732555000
}
```

**Status Values:**
- `healthy` — All systems operational
- `warning` — Minor issues detected
- `degraded` — Some systems impacted
- `critical` — Major outage

### Dashboard Integration

The `HealthOverview` component displays health status in the dashboard sidebar.

---

## Auto-Scaling Policy (v11-v14)

### Rate Limit Scaling

The `security_core/scaling_policy.py` module provides logical auto-scaling for rate limits:

```python
from security_core.scaling_policy import choose_rate_limits, get_limit_for_endpoint

# Get all limits for current load
limits = choose_rate_limits(current_load=0.5)

# Get limit for specific endpoint
limit = get_limit_for_endpoint("/api/chat", current_load=0.7)
```

**Load Tiers:**
- `low` (< 0.3) — More generous limits (2x default)
- `medium` (0.3 - 0.6) — Standard limits
- `high` (0.6 - 0.8) — Tighter limits (0.7x default)
- `critical` (> 0.8) — Strict limits (0.5x default)

**NOTE:** This is logical auto-scaling for rate limiting, not infrastructure scaling. Infrastructure-level autoscaling must be configured separately (e.g., Replit Autoscale).

---

## Automation Scripts (v11-v14)

### Auto-Marketing Cycle

Generates marketing recommendations based on user segments:

```bash
python scripts/automation/auto_marketing_cycle.py
```

**What It Does:**
- Queries DB for new signups, active trials, inactive users
- Proposes email campaigns per segment (welcome, nurture, winback)
- Outputs recommendations to stdout and `logs/auto_marketing.log`
- Does NOT send emails directly (TODO: wire to email provider)

**Output:**
```
AUTO-MARKETING CYCLE STARTED
Found 5 new signups in last 7 days
Found 3 active trial users
Found 2 inactive users (30+ days)

SAMPLE RECOMMENDATIONS:
  [HIGH] send_welcome_sequence
    Segment: new_signup
    Subject: Welcome to Levqor - Your Automation Journey Begins
```

### Auto-Weekly Report

Generates weekly summary report of platform metrics:

```bash
python scripts/automation/auto_weekly_report.py
```

**What It Does:**
- Aggregates metrics: new users, active users, API usage, revenue
- Generates Markdown summary
- Outputs to stdout and `logs/weekly_report.md`
- TODO: Send via email or sync to Notion/Drive

**Scheduling:**
Suggest using cron or external scheduler to run weekly:
```bash
# Example cron entry (every Monday at 9am)
0 9 * * 1 cd /path/to/levqor && python scripts/automation/auto_weekly_report.py
```

---

## Growth Engine (v11-v14)

### Starter Templates

Access pre-built workflow templates:

```python
from modules.growth_engine import get_starter_templates, get_template_by_id

# Get all templates
templates = get_starter_templates()

# Filter by category
lead_templates = get_starter_templates(category="lead_capture")

# Get specific template
template = get_template_by_id("tpl_lead_capture_form")
```

**Categories:**
- `lead_capture` — Lead forms and capture automation
- `customer_support` — Email responders and support flows
- `reporting` — Analytics and scheduled reports
- `data_sync` — CRM and database sync
- `notifications` — Slack and alert systems
- `sales_automation` — Invoice and sales flows

### Referral System

Generate and track referral codes:

```python
from modules.growth_engine import generate_referral_code, record_referral, get_user_referrals

# Generate code for user
code = generate_referral_code(user_id="usr_123")  # e.g., "A1B2C3D4"

# Record when someone signs up with code
record_referral(code="A1B2C3D4", new_user_id="usr_456")

# Get user's referral stats
referrals = get_user_referrals(user_id="usr_123")
```

### Dashboard Integration

- `GrowthPanel` component shows templates and referral link in dashboard
- `HealthOverview` component shows system health status
