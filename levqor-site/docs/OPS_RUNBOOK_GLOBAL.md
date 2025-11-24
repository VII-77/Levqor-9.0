# Levqor X Global Operations Runbook

**Version**: MEGA-PHASE 10  
**Date**: November 24, 2025  
**Status**: Production-Ready (Single Region)  
**Owner**: Platform Operations

---

## Single-Region Now, Multi-Region Ready

### Current Deployment Architecture
- **Active Region**: eu-west (Europe West - London/Dublin)
- **Backend**: Replit Autoscale (`api.levqor.ai`)
- **Frontend**: Vercel Edge Network (`levqor.ai`, `www.levqor.ai`)
- **Database**: Replit PostgreSQL (eu-west)
- **Future Regions**: us-east, ap-south (config-based, not yet deployed)

### Region Configuration
- **Config File**: `api/config/regions.py`
- **Supported Regions**: eu-west, us-east, ap-south
- **Default Region**: eu-west
- **Observable In**: `/api/metrics/app` JSON response, AI endpoint logs

---

## API Failover Plan

### Primary vs Fallback Domains
- **Primary API**: `https://api.levqor.ai` (Cloudflare → Replit)
- **Fallback API**: `https://levqor-backend.replit.app` (Direct Replit)

Both domains serve **identical responses** from the same Replit deployment.

### When to Use Fallback
Use `levqor-backend.replit.app` if:
1. Cloudflare has an outage affecting `api.levqor.ai`
2. DNS issues with custom domain propagation
3. Cloudflare proxy configuration errors
4. Debugging DNS/routing issues

### Failover Procedure
**For Internal Tools & Scripts:**
```bash
# Change API_URL environment variable
export NEXT_PUBLIC_API_URL="https://levqor-backend.replit.app"

# Or update .env files
NEXT_PUBLIC_API_URL=https://levqor-backend.replit.app
```

**For Production Frontend:**
1. Update Vercel environment variable `NEXT_PUBLIC_API_URL`
2. Redeploy frontend (automatic with new env var)
3. Monitor `/api/metrics/app` for traffic shift

**Verification:**
```bash
# Test both endpoints return identical data
curl https://api.levqor.ai/health
curl https://levqor-backend.replit.app/health

# Both should return same JSON with "status": "ok"
```

---

## Frontend Rollback

### Vercel Rollback Procedure
1. **Access Vercel Dashboard**: https://vercel.com/levqor (requires login)
2. **Navigate to Deployments**: Click "Deployments" tab
3. **Select Stable Version**: Find last known-good deployment (marked with green checkmark)
4. **Promote to Production**: Click "Promote to Production" button
5. **Verify**: Check `https://levqor.ai` shows rolled-back version

### Identifying Good Deployments
- **Green Checkmark**: Build succeeded, passed checks
- **Timestamp**: Recent = more likely to be stable
- **Commit Message**: Look for "VERIFIED", "PRODUCTION READY", or similar
- **Build Time**: Should be < 5 minutes for normal builds

### Emergency DNS Failover
If Vercel is completely down (rare):
1. Deploy static fallback to Cloudflare Pages
2. Update DNS A record for `levqor.ai`
3. Point to backup static site

---

## Backend Rollback

### Replit Autoscale Rollback
**High-Level Procedure:**
1. Identify last stable commit in Git history
2. Revert code to that commit (user handles git operations)
3. Restart Replit autoscale deployment
4. Verify `/health` and `/api/metrics/app` return healthy

**Health Check Commands:**
```bash
# Backend health
curl https://api.levqor.ai/health | jq

# Metrics endpoint (must include "region": "eu-west")
curl https://api.levqor.ai/api/metrics/app | jq

# Usage summary
curl https://api.levqor.ai/api/usage/summary | jq

# Expected: All return HTTP 200 with valid JSON
```

### Database Rollback
**CRITICAL**: Database rollback requires careful planning.

**Options:**
1. **Replit Rollback Feature**: Use Replit's built-in checkpoint rollback (safest)
2. **Manual SQL Restore**: Restore from PostgreSQL backup (requires downtime)
3. **Incremental Rollback**: Use `db:push` to revert schema changes

**NEVER:**
- Manually drop tables in production
- Run `ALTER TABLE` statements without testing
- Change primary key types (serial ↔ varchar)

---

## Security Incident Quick Checklist

### Immediate Actions (First 15 Minutes)
1. **Assess Severity**: Is user data at risk? Is payment processing affected?
2. **Contain**: If severe, temporarily disable affected endpoints via rate limiting
3. **Document**: Capture logs, screenshots, error messages immediately

### Log Locations
- **Security Audit Logs**: `security_core/audit.py` (audit_security_event calls)
- **AI Request Logs**: `api/ai/chat.py`, `api/ai/workflow.py`, `api/ai/debug.py`, `api/ai/onboarding.py`
- **API Gateway Logs**: `security_core/api_gateway.py` (suspicious pattern logs)
- **Backend Logs**: Check Replit console for Python stack traces

### Key Rotation Procedures

**Stripe API Keys:**
1. Log into Stripe Dashboard (https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Click "Create Secret Key" (new key)
4. Update Replit Secret: `STRIPE_SECRET_KEY`
5. Revoke old key in Stripe Dashboard
6. Verify: Test checkout flow immediately

**OpenAI API Key:**
1. Log into OpenAI Platform (https://platform.openai.com)
2. Navigate to API Keys
3. Create new key, copy it
4. Update Replit Secret: `OPENAI_API_KEY`
5. Delete old key in OpenAI dashboard
6. Verify: Test `/api/ai/chat` endpoint

**SECURITY_HMAC_SECRET:**
1. Generate new secret: `openssl rand -base64 32`
2. Update Replit Secret: `SECURITY_HMAC_SECRET`
3. Restart backend workers
4. Note: Old HMAC signatures will be invalid after rotation

**Verification After Rotation:**
```bash
# Test Stripe integration
curl -X POST https://api.levqor.ai/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"purchase_type":"subscription","tier":"starter","billing_interval":"month"}'

# Test OpenAI integration (if AI_ENABLED=true)
curl -X POST https://api.levqor.ai/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"test","language":"en"}'
```

### Tamper Detection
**Critical Files Monitored:**
- `levqor-site/docs/BLUEPRINT_BASELINE.md` (pricing, SLAs, legal)
- `api/config/regions.py` (region config)
- `security_core/api_gateway.py` (security logic)
- `enterprise/rbac.py` (permissions)

**Tamper Check:**
Automated via `monitors/scheduler.py` → "Security tamper check" job (runs hourly)

**Manual Verification:**
```bash
cd /home/runner/workspace/levqor-site
node scripts/drift-monitor.js

# Must show: DRIFT STATUS: PASS
# If FAIL: Review violations and revert unauthorized changes
```

---

## Region Migration Plan (Future)

### Prerequisites for Multi-Region Deployment
1. **Database Replication**: Set up PostgreSQL read replicas in target regions
2. **Session Affinity**: Implement sticky sessions or distributed session store (Redis)
3. **Geo-Routing**: Configure Cloudflare Load Balancer for region routing
4. **Data Residency**: Verify GDPR/compliance for eu-west, us-east, ap-south

### Migration Steps (When Ready)
1. **Clone Backend**: Deploy Replit backend to new region (manual process)
2. **Update Region Config**: Set `LEVQOR_REGION` environment variable per deployment
3. **Test Health**: Verify `/health` and `/api/metrics/app` return correct region
4. **Enable Geo-Routing**: Point Cloudflare to multiple origins with geo rules
5. **Monitor**: Watch metrics for traffic split and latency improvements

### Backwards Compatibility
**All regions share the same API contract:**
- Same endpoints (`/health`, `/api/metrics/app`, `/api/ai/*`)
- Same JSON schemas
- Same authentication requirements
- Same Blueprint values (£9/29/59/149 pricing, 7-day trial, etc.)

**Region is additive only:**
- Adds `"region"` field to `/api/metrics/app`
- Adds `region=...` to request logs
- No changes to existing behavior

---

## Monitoring & Alerting

### Health Check Endpoints
```bash
# Primary health check (must return 200)
curl https://api.levqor.ai/health

# Expected response:
# {
#   "status": "ok",
#   "version": "1.0.0",
#   "build": "dev",
#   "uptime_seconds": 12345,
#   "timestamp": 1700000000
# }
```

### Metrics Endpoint
```bash
# Application metrics with region info
curl https://api.levqor.ai/api/metrics/app

# Expected fields:
# - "region": "eu-west"
# - "status": "ok"
# - "uptime_seconds": <number>
# - "ai_requests_total": <number>
# - "errors_total": <number>
```

### Scheduler Status
```bash
# Check scheduler is running (20 jobs expected)
# Via Python introspection:
cd /home/runner/workspace
python3 -c "from monitors.scheduler import get_scheduler; print(f'Jobs: {len(get_scheduler().get_jobs())}')"

# Expected: Jobs: 20
```

### Critical Thresholds
- **Uptime**: < 99.9% triggers SLA review
- **Error Rate**: > 5% of requests triggers alert
- **Response Time**: p95 > 2s triggers investigation
- **Scheduler Jobs**: < 20 active jobs = configuration issue

---

## Emergency Contacts & Escalation

### Internal Team
- **Platform Lead**: (User's responsibility to fill in)
- **DevOps**: (User's responsibility to fill in)
- **Security**: (User's responsibility to fill in)

### External Vendors
- **Replit Support**: https://replit.com/support
- **Vercel Support**: https://vercel.com/help
- **Stripe Support**: https://support.stripe.com
- **Cloudflare Support**: https://support.cloudflare.com

### Escalation Path
1. **L1 (Low Severity)**: Single feature broken, no payment impact → DevOps handles
2. **L2 (Medium)**: Multiple features broken, degraded UX → Platform Lead notified
3. **L3 (High)**: Payment processing down, data loss risk → All hands, vendor support engaged
4. **L4 (Critical)**: Security breach, complete outage → Immediate escalation to leadership + vendors

---

## Post-Incident Procedures

### Postmortem Template
1. **Incident Summary**: What happened? When? How long?
2. **Root Cause**: Why did it happen?
3. **Timeline**: Detailed event sequence
4. **Impact**: Users affected, revenue impact, data loss
5. **Resolution**: What fixed it?
6. **Action Items**: Prevent recurrence (assign owners + deadlines)

### Postmortem Storage
- File location: `levqor-site/docs/postmortems/YYYY-MM-DD-<incident-name>.md`
- Review in next team meeting
- Track action items to completion

---

## Runbook Maintenance

**Review Frequency**: Monthly  
**Owner**: Platform Operations  
**Last Updated**: November 24, 2025 (MEGA-PHASE 10)

**Update Triggers:**
- New region deployment
- Architecture changes (database, hosting)
- Security policy updates
- Vendor/tool changes
