# Levqor Development Safety Guide

## Levqor Brain Interactions

The Living Canvas brain visualization responds to user interactions across the platform:

### Homepage Brain Interactions
- **Primary CTA ("Start free trial")**: Hover triggers `neural` (thinking) state, click triggers `success` state
- **Secondary CTA ("See pricing")**: Hover triggers `quantum` (processing) state
- **Location**: `levqor-site/src/components/brain/InteractiveHeroCTA.tsx`

### Dashboard Brain Interactions
- **Test Brain Button**: Cycles through all 5 states (organic → neural → quantum → success → error → organic)
- **Location**: `levqor-site/src/components/brain/TestBrainButton.tsx`
- **Note**: Replace with real workflow execution wiring when available

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
