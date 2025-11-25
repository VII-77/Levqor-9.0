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
