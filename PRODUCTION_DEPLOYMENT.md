# Levqor X 9.0 - Production Deployment Guide

## 🎯 System Status

### ✅ WORKING
- **Backend**: Flask + Gunicorn running on port 8000 with 18 APScheduler jobs
- **Frontend**: Next.js 14 running on port 5000
- **Database**: PostgreSQL provisioned and connected
- **Authentication**: Google + Microsoft OAuth via NextAuth 5.0
- **Workflows**: Both backend and frontend running cleanly with no errors

### ⚠️ CRITICAL FIXES NEEDED BEFORE PRODUCTION

#### 1. **STRIPE PRICES INACTIVE** (BLOCKING)
**Issue**: Current Stripe price IDs point to inactive/test prices
**Error**: `The price specified is inactive. This field only accepts active prices.`
**Impact**: Checkout endpoint fails - users cannot purchase subscriptions

**FIX REQUIRED**:
You need to create and activate Stripe prices in your Stripe dashboard:

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create active prices for each tier:
   - **Starter** (monthly/yearly)
   - **Launch** (monthly/yearly)
   - **Growth** (monthly/yearly)
   - **Scale** (monthly/yearly)
   - **Business** (monthly/yearly)
   - **Agency** (monthly/yearly) - MISSING
   - **Flow** (monthly/yearly) - MISSING
   - **Add-ons**: Priority Support, SLA 99.9%, White Label, DFY packages
3. Update your secrets with the ACTIVE price IDs:
   ```
   STRIPE_PRICE_STARTER=price_xxx
   STRIPE_PRICE_LAUNCH=price_xxx
   STRIPE_PRICE_GROWTH=price_xxx
   ...etc
   ```

**Verification**:
```bash
curl -X POST http://localhost:5000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"starter","term":"monthly"}'
```
Should return a Stripe checkout URL, not an error.

---

#### 2. **EMAIL AUTHENTICATION DISABLED**
**Status**: Resend email provider removed to fix NextAuth adapter error
**Why**: Email login requires a database adapter (not configured)
**Current**: Only Google + Microsoft OAuth enabled

**To Enable Email Login** (optional):
1. Install Drizzle adapter:
   ```bash
   cd levqor-site && npm install @auth/drizzle-adapter drizzle-orm
   ```
2. Create auth schema in database
3. Add adapter configuration to `levqor-site/src/auth.ts`
4. Uncomment Resend provider

**Current Solution**: Users sign in with Google or Microsoft accounts only

---

#### 3. **GIT SECURITY ISSUE** (CRITICAL)
**Status**: Real secrets committed in git history (commit f8e0953)
**Impact**: GitHub Push Protection blocking repository pushes
**Risk**: Exposed credentials in version control

**FIX REQUIRED**:
```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove secrets from git history
git filter-repo --path .env --invert-paths --force

# Rotate all exposed secrets:
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY  
# - OAuth credentials
# - Database passwords
```

---

## 📋 Production Deployment Checklist

### Pre-Deployment
- [ ] **Activate Stripe prices** in Stripe dashboard
- [ ] **Update Stripe price IDs** in secrets
- [ ] **Test Stripe checkout** endpoint
- [ ] **Rotate exposed secrets** from git history
- [ ] **Clean git history** with git-filter-repo
- [ ] Configure production OAuth redirect URLs:
  - Google: `https://levqor.ai/api/auth/callback/google`
  - Microsoft: `https://levqor.ai/api/auth/callback/azure-ad`
- [ ] Update `NEXTAUTH_URL` to `https://levqor.ai`
- [ ] Configure production database connection
- [ ] Test all critical user flows

### Vercel Deployment (Frontend)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   ```
   NEXTAUTH_URL=https://levqor.ai
   NEXTAUTH_SECRET=<production-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   MICROSOFT_CLIENT_ID=<your-microsoft-client-id>
   MICROSOFT_CLIENT_SECRET=<your-microsoft-client-secret>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   NEXT_PUBLIC_API_URL=https://api.levqor.ai
   ```
3. Set root directory to `levqor-site`
4. Deploy

### Backend Deployment (api.levqor.ai)
**Options**:
1. **Replit Deployments** (recommended for quick start)
2. **Railway.app** (auto-deploy from Git)
3. **Fly.io** (global edge deployment)
4. **AWS/GCP/Azure** (enterprise production)

**Requirements**:
- Python 3.11+
- PostgreSQL database
- Environment variables configured
- Gunicorn with 2+ workers

---

## 🔍 Testing Endpoints

### Backend (api.levqor.ai)
```bash
# Health check
curl https://api.levqor.ai/health

# API endpoints (require auth)
curl https://api.levqor.ai/api/v1/users/me
curl https://api.levqor.ai/api/v1/capsules
```

### Frontend (levqor.ai)
- Homepage: https://levqor.ai
- Pricing: https://levqor.ai/pricing
- Sign In: https://levqor.ai/signin
- Dashboard: https://levqor.ai/dashboard

---

## 📊 Current Configuration

### Backend Jobs (18 Total)
✅ All scheduled jobs running successfully:
- Daily retention metrics
- SLO monitoring (every 5 min)
- Daily ops report
- Weekly cost forecast
- Hourly KV cost sync
- Growth retention tracking
- Governance email (weekly)
- Health & uptime monitor
- Daily cost dashboard
- Weekly Sentry checks
- Weekly pulse summary
- Expansion verification
- Intelligence monitoring (every 15 min)
- AI insights & trends (weekly)
- Scaling checks (hourly)
- Synthetic endpoint checks
- Alert threshold checks

### Database
- **Type**: PostgreSQL (Neon-backed)
- **Status**: Provisioned and connected
- **Connection**: Via DATABASE_URL environment variable

### Authentication
- **Provider**: NextAuth 5.0
- **Strategy**: JWT (1-hour max age)
- **Providers**: Google OAuth, Microsoft Azure AD
- **Email Denylist**: mailinator.com, tempmail.com, guerrillamail.com, temp-mail.org

---

## 🚨 Known Issues

1. **Backend using SQLite instead of PostgreSQL**
   - Current: `levqor.db` (SQLite file)
   - Fix: Update database connection in backend code to use `DATABASE_URL`

2. **Missing Stripe price IDs**
   - `STRIPE_PRICE_AGENCY` and `STRIPE_PRICE_AGENCY_YEAR`
   - `STRIPE_PRICE_FLOW` and `STRIPE_PRICE_FLOW_YEAR`

3. **Git history contains secrets**
   - Must clean before pushing to GitHub
   - Rotate all exposed credentials

---

## 🎉 Ready for Production

Once you complete the fixes above:
1. ✅ Both workflows running cleanly
2. ✅ Authentication working (Google + Microsoft)
3. ✅ All 18 backend jobs scheduled
4. ✅ Frontend compiling successfully
5. ⚠️ Stripe prices need activation
6. ⚠️ Git history needs cleaning

**NEXT STEPS**:
1. Activate Stripe prices in dashboard
2. Update price ID secrets
3. Test checkout flow end-to-end
4. Clean git history
5. Deploy to production!
