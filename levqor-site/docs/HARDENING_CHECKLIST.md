# Levqor Hardening Checklist — V12.12 Enterprise Upgrade

This checklist must be reviewed and ticked off before and after each production deployment.

## V12.12 Enterprise Additions

### Reliability & Resiliency
- [ ] Backend resilience layer (`api/utils/resilience.py`) deployed
- [ ] DB retry logic tested with connection failures
- [ ] Backend keep-alive pinger script added to health monitoring
- [ ] Enhanced `/health` endpoint returns version + uptime

### Observability & Monitoring
- [ ] Structured JSON logging configured (`api/utils/logging_config.py`)
- [ ] Error monitoring hooks integrated (`api/utils/error_monitor.py`)
- [ ] Frontend client logger utility deployed (`src/lib/client-logger.ts`)
- [ ] Correlation IDs tracked across all critical paths

### Enterprise Support Automation
- [ ] Support tier logic module functional (`api/support/tiers.py`)
- [ ] Support ticket endpoint tested (`POST /api/support/tickets`)
- [ ] AI routing stub integrated (ready for future AI agent)
- [ ] SLA hours correctly mapped to starter/launch/growth/agency tiers

---

## Architecture (Canonical)

**Frontend**: Deployed on Vercel (project: `levqor-site`) with domains `levqor.ai` / `www.levqor.ai`  
**Backend**: Deployed on Replit Autoscale behind `api.levqor.ai`  
**NOTE**: No production backend deployment exists on Vercel; any such project is legacy and should remain disabled.

---

## 1. Security Headers

- [ ] Strict-Transport-Security (HSTS) enabled via Cloudflare or Vercel
- [ ] X-Frame-Options = DENY or SAMEORIGIN
- [ ] X-Content-Type-Options = nosniff
- [ ] Referrer-Policy = strict-origin-when-cross-origin (or stricter)
- [ ] Content-Security-Policy (CSP) reviewed (no wild * on scripts where avoidable)

**Why:** Stops common browser-based attacks (clickjacking, sniffing, insecure referrals).  
**Impact if ignored:** Higher risk of XSS, data leakage, or framing attacks.

---

## 2. Authentication & Authorization

- [ ] NextAuth callback URL matches production domain
- [ ] Session cookies set with Secure, HttpOnly, SameSite
- [ ] All dashboard routes (including `/dashboard/v2`) require sign-in
- [ ] No admin endpoints exposed without proper role checks

**Why:** Keeps authenticated areas actually private.  
**Impact if ignored:** Users may access sensitive pages unauthenticated or via weak cookies.

---

## 3. API & Backend Hardening

- [ ] `/health` endpoint reveals minimal info (no secrets, no stack traces)
- [ ] Rate limiting in place for auth and billing-sensitive endpoints
- [ ] Error handlers return generic messages, not internal details
- [ ] Environment variables for DB, Stripe, etc. are not logged anywhere

**Why:** Reduces attack surface and information leaks.  
**Impact if ignored:** Attackers can enumerate infrastructure and abuse endpoints.

---

## 4. Stripe & Billing Integrity

- [ ] All LIVE Stripe prices verified and mapped correctly in backend
- [ ] Webhook secret stored in env, not code
- [ ] Webhook endpoint checks signatures
- [ ] Test purchase flow exercised after deployment

**Why:** Ensures billing can't be spoofed or broken silently.  
**Impact if ignored:** Revenue loss or fraudulent charges.

---

## 5. DNS & Cloudflare Configuration

- [ ] `levqor.ai` and `www.levqor.ai` point to Vercel
- [ ] `api.levqor.ai` points to backend host (proxied through Cloudflare if desired)
- [ ] Cloudflare API token scopes are minimal (zone-limited, DNS only where needed)
- [ ] No unused wildcards or legacy records pointing at old infra

**Why:** Keeps traffic routed correctly and limits blast radius if a token leaks.  
**Impact if ignored:** Downtime, broken APIs, or attackers abusing misconfigured DNS.

---

## 6. Logging, Monitoring & Alerts

- [ ] Backend logs include timestamp, level, and key request context (no secrets)
- [ ] Errors are captured (e.g., to a log file or logging service)
- [ ] At least one health-check automation runs daily
- [ ] A notification path exists (email/Telegram/etc.) when health checks fail

**Why:** You can't fix what you don't see.  
**Impact if ignored:** Silent failures, downtime you only discover via users.

---

## 7. Data & Backup Safety

- [ ] DB provider backups enabled and retention verified
- [ ] Migrations tested on staging before production
- [ ] Rollback strategy for bad migrations documented
- [ ] No production data exported to local dev machines without encryption

**Why:** Protects your data and allows safe schema changes.  
**Impact if ignored:** Permanent data loss or broken schema in production.

---

## 8. Frontend Integrity & UX

- [ ] Critical pages (landing, pricing, auth, dashboard) load within acceptable time
- [ ] No console errors on production in browser dev tools
- [ ] SEO meta for public pages correct; noindex on private ones
- [ ] Lighthouse performance and accessibility checked periodically

**Why:** Users care about speed and polish; search engines care about quality.  
**Impact if ignored:** Lower conversions, frustrated users, and worse rankings.

---

## 9. Post-Deployment Checklist

- [ ] `https://www.levqor.ai` home loads successfully
- [ ] `https://www.levqor.ai/dashboard/v2` behind auth and `noindex`
- [ ] `https://api.levqor.ai/health` returns HTTP 200
- [ ] No 5xx spikes in logs after release

**Why:** Final validation that everything is live and healthy.  
**Impact if ignored:** Bugs go unnoticed until users complain.

---

## Status

- [ ] Hardening checklist reviewed for current deployment
- [ ] All high-priority items completed
- [ ] Exceptions (if any) documented with justification
