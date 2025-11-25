# LEVQOR SAFETY GATE — STANDARD CHECKLIST

Run this EVERY time before you call a phase "done".

## 1. Automated script checks

- [ ] Run: `pip install requests` (first time only)
- [ ] Run: `python scripts/monitoring/safety_gate_full.py`
- [ ] Confirm output ends with: "All checks PASSED. Safety gate is clear."

If any check FAILS:
- [ ] Fix the failing area (web, auth, SEO, billing).
- [ ] Re-run the script until ALL checks pass.

## 2. Manual UX sanity checks (mobile + desktop)

- [ ] Open https://www.levqor.ai
      - Page loads fast, no obvious errors.
- [ ] Try sign-in / sign-up flow with a test account.
- [ ] Trigger a checkout and confirm Stripe page opens correctly.
- [ ] Confirm /dashboard requires sign-in (no anonymous access).
- [ ] Confirm /dashboard/v2 is DEV-ONLY and behaves as expected.

## 3. SEO / indexing safety

- [ ] View source on https://www.levqor.ai/dashboard/v2
      - Confirm meta tags include "noindex, nofollow".
- [ ] In Google Search Console, inspect /dashboard/v2:
      - Should show "URL is not indexed: Excluded by 'noindex' tag".

## 4. Cost / monitoring sanity

- [ ] Check cost dashboard / alerts (Replit + Stripe usage).
- [ ] Confirm no abnormal traffic spikes or error bursts.
- [ ] Confirm critical monitors / alerts are still wired.

## RULE

A phase is NOT COMPLETE unless:
- The script `safety_gate_full.py` passes with 0 failures.
- Every checkbox in this document is ticked.

