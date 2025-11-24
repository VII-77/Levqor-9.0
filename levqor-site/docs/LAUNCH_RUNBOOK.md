# Levqor V12.22 - Production Launch Runbook

**Version**: V12.22  
**Date**: November 2025  
**Status**: PUBLIC LAUNCH READY

## Pre-Launch Checklist

### 1. Trial & Subscription Verification
- [ ] Verify 7-day trial on all plans (Starter, Launch, Growth, Agency)
- [ ] Confirm card required for trial signup
- [ ] Test trial cancel before Day 7 (no charge)
- [ ] Test trial convert to paid (Day 8 charge)
- [ ] Verify correct pricing: £9/£29/£59/£149 monthly
- [ ] Verify DFY pricing: £149/£299/£499
- [ ] Test yearly pricing discounts

**Commands**:
```bash
# Test checkout flow
curl -X POST https://api.levqor.ai/api/billing/checkout/session \
  -H "Content-Type: application/json" \
  -d '{"tier":"starter","term":"monthly"}'
```

### 2. Checkout & Payment Flows
- [ ] Test successful checkout completion
- [ ] Test failed payment handling (use Stripe test cards)
- [ ] Verify email receipt sent after payment
- [ ] Test upgrade/downgrade flows
- [ ] Verify proration calculations
- [ ] Test cancellation flow (immediate + end of period)

### 3. DNS & Domain Verification
- [ ] Verify levqor.ai → Vercel (frontend)
- [ ] Verify api.levqor.ai → Replit Autoscale (backend)
- [ ] Confirm TLS/SSL certificates valid
- [ ] Test CORS headers working
- [ ] Verify all subdomains resolve

**Commands**:
```bash
# DNS checks
dig levqor.ai
dig api.levqor.ai
dig www.levqor.ai

# TLS checks
curl -I https://levqor.ai
curl -I https://api.levqor.ai

# Health checks
curl https://api.levqor.ai/health
```

### 4. Backend Health & Monitoring
- [ ] Verify /health endpoint returns 200
- [ ] Check scheduler is running (18 tasks)
- [ ] Verify database connections stable
- [ ] Test /api/usage/summary endpoint
- [ ] Test /api/usage/export CSV download
- [ ] Verify Stripe webhooks receiving events
- [ ] Check Sentry error tracking active

**Commands**:
```bash
# Backend health
curl https://api.levqor.ai/health | jq

# Usage API
curl https://api.levqor.ai/api/usage/summary | jq

# CSV export
curl -O https://api.levqor.ai/api/usage/export
```

### 5. Frontend Build & SEO
- [ ] Run `npm run build` (expect 55+ pages)
- [ ] Verify no build errors
- [ ] Check all marketing pages return 200
- [ ] Verify noindex on /dashboard, /dashboard/v2, /signin
- [ ] Test meta tags on homepage, pricing, trial
- [ ] Verify og:image works on social shares
- [ ] Run Lighthouse audit (target: 90+ performance, 100 SEO)

**Commands**:
```bash
cd levqor-site
npm run build

# Check pages
for p in / /pricing /trial /security /status /docs; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "https://levqor.ai$p"
done
```

### 6. Marketing & Lead Capture
- [ ] Test demo page form submission
- [ ] Verify lead data saved to marketing_leads.json
- [ ] Test LeadCaptureInline component
- [ ] Verify events tracked to marketing_events.json
- [ ] Check automation stubs executable

**Commands**:
```bash
# Test lead capture
curl -X POST https://api.levqor.ai/api/marketing/lead \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"demo_page"}'

# Test automation stubs
python scripts/automation/nurture_lead.py
python scripts/automation/trial_activation.py
python scripts/automation/checkout_recovery.py
```

## Launch Day Workflow

### T-24 Hours
1. Freeze code changes (emergency fixes only)
2. Run full test suite
3. Backup production database
4. Verify all secrets/env vars set
5. Schedule team availability for monitoring

### T-1 Hour
1. Final drift monitor check: `node scripts/drift-monitor.js`
2. Final build test: `npm run build`
3. Verify backend health: `curl https://api.levqor.ai/health`
4. Check Stripe webhook logs

### Launch (T-0)
1. Deploy frontend to Vercel (automatic via git push)
2. Restart backend workflows on Replit
3. Monitor error rates in Sentry
4. Watch Stripe webhook deliveries
5. Monitor user signups

### T+1 Hour
1. Verify first trial signup works end-to-end
2. Check first checkout conversion
3. Review error logs (backend + frontend)
4. Monitor API response times (p95 < 200ms target)

### T+4 Hours
1. Send internal team status update
2. Review support ticket queue
3. Check email delivery rates
4. Monitor database connection pool

### T+24 Hours
1. Review first-day metrics:
   - Signups
   - Trial activations
   - Paid conversions
   - Support tickets
   - Error rates
2. Identify any immediate optimizations needed

## First Week Monitoring Plan

### Daily Checks (Every Morning, 9am GMT)
- [ ] Backend health status
- [ ] Frontend build/deployment status
- [ ] Error rate trends (Sentry)
- [ ] New support tickets
- [ ] Trial signups vs conversions
- [ ] Stripe payment success rate

### Weekly Reviews (Every Monday)
- [ ] Week-over-week growth metrics
- [ ] Support ticket themes/patterns
- [ ] Performance optimization opportunities
- [ ] Feature requests from users
- [ ] Billing/revenue reconciliation

## Rollback Procedures

### Frontend Rollback (Vercel)
```bash
# Via Vercel dashboard: Deployments → Previous deployment → Promote to Production
# Or via CLI:
vercel rollback https://levqor.ai
```

### Backend Rollback (Replit)
```bash
# Use Replit rollback feature in UI
# Or manually revert via git:
cd /home/runner/workspace
git log --oneline  # Find previous commit
git reset --hard <commit-hash>
# Then restart workflows
```

### Database Rollback
```bash
# Replit provides automatic snapshots
# Use Replit database pane: Checkpoints → Select checkpoint → Restore
```

## Emergency Contacts

- **Backend Issues**: Check Sentry, restart workflows
- **Payment Issues**: Stripe Dashboard → Logs
- **DNS Issues**: Cloudflare dashboard
- **Frontend Issues**: Vercel dashboard → Logs
- **Database Issues**: Replit database pane

## Success Criteria

Week 1 targets:
- ✅ 99.9% uptime (backend + frontend)
- ✅ < 200ms p95 API response time
- ✅ > 10% trial-to-paid conversion
- ✅ < 5% payment failure rate
- ✅ < 24h median support response time

---

**Last Updated**: V12.22 Implementation  
**Next Review**: Post-launch week 1
