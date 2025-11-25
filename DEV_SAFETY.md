# Levqor Development Safety Guide

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
