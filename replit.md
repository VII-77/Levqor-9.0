# Levqor X 9.0 — V12.12 Enterprise

## Overview

Levqor X is a comprehensive data backup and retention management platform with Done-For-You (DFY) service tiers. The project consists of a Python Flask backend API, a Next.js frontend, PostgreSQL database, and Stripe billing integration. Currently configured for production with LIVE Stripe credentials and automatic Vercel deployments.

**Enterprise Upgrade V12.12 (November 23, 2025):** Enhanced with reliability/resiliency, observability/monitoring, and enterprise support automation capabilities while maintaining full backward compatibility with all pricing, policies, and SLA guarantees.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

### V12.12 Enterprise Upgrade - COMPLETED ✅ (Nov 23, 2025)
- **Reliability & Resiliency**: Added DB connection retry logic, backend keep-alive monitoring, enhanced /health endpoint
- **Observability & Monitoring**: Implemented structured JSON logging, error monitoring hooks, frontend client logger
- **Enterprise Support**: Created tier-aware support routing, SLA mapping, AI integration stubs, support ticket API
- **Governance**: Extended drift monitor with V12.12 file checks, updated hardening checklist, deployment automation
- **Modules Created**: 7 new enterprise modules (resilience, logging, error monitoring, support tiers, AI router, keep-alive, client logger)
- **Blueprint Compliance**: ✅ PASS - No pricing/policy/route violations detected
- **Breaking Changes**: ❌ None - Full backward compatibility maintained

### Dashboard V2 SEO Configuration - COMPLETED ✅
- **Created**: `/dashboard/v2` route with protected access
- **SEO Lockdown**: Added noindex, nofollow, nocache meta tags
- **Deployment**: Pushed to GitHub, Vercel auto-deployed
- **Status**: Excluded from search engines, production-ready

### DFY Pricing Realignment - COMPLETED ✅
- **New Pricing Tiers**: Starter (£9/£90), Launch (£29/£290), Growth (£59/£590), Agency (£149/£1490)
- **Backend**: Updated checkout API to support new tiers with Stripe connector integration
- **Frontend**: Pricing page rebuilt with new tier structure
- **Stripe**: All 8 checkout endpoints working with LIVE credentials
- **Security**: Using Replit Stripe connector exclusively with automatic secret rotation

### DNS Configuration - COMPLETED ✅
- **Cloudflare Integration**: Automated DNS setup via API
- **Backend**: `api.levqor.ai` → Replit Autoscale deployment (A + TXT records)
- **Frontend**: `www.levqor.ai` & root domain → Vercel (CNAME + A records)
- **SSL**: Auto-issued by Replit & Vercel with proper DNS proxy settings

### Hardening & Health Automation - COMPLETED ✅
- **Genesis v8.0 Compliance**: Added HARDENING_CHECKLIST.md for pre/post deployment governance
- **Automated Health Checks**: Created deployment_health_check.py script for endpoint monitoring
- **GitHub Actions**: Configured hourly health check workflow (free, no extra costs)
- **Monitoring Coverage**: Frontend, Dashboard V2, and API health endpoints
- **Status**: All automation infrastructure deployed and tested

## System Architecture

### Architecture Overview (Canonical)

**IMPORTANT:** Levqor X 9.0 uses a clean separation of concerns:

- **Frontend**: Next.js application deployed on **Vercel only** (`levqor.ai` / `www.levqor.ai`)
- **Backend**: Python/Flask API deployed on **Replit Autoscale only** (`api.levqor.ai`)
- **No backend deployment exists on Vercel** — any legacy Vercel backend projects are deprecated and must not be used

This architecture ensures:
- Frontend scales via Vercel's global edge network
- Backend scales via Replit's Autoscale platform with per-request pricing
- Clear separation prevents deployment confusion and configuration drift

### Frontend Architecture

**Framework**: Next.js (App Router)
- **Rationale**: Next.js App Router provides server-side rendering, optimal performance, and modern React patterns
- **Styling**: Tailwind CSS with a dark theme (slate color palette)
- **TypeScript**: Fully typed for type safety and developer experience
- **Protected Routes**: `/dashboard`, `/dashboard/v2` require NextAuth authentication

**Component Structure**
- Page-based routing using Next.js 13+ App Router convention
- Client-side navigation with Next.js Link components
- Responsive design with Tailwind utility classes
- SEO optimization: Public pages indexed, private dashboard excluded

### Frontend Deployment

**Platform**: Vercel (Frontend Only)
- **Rationale**: Native Next.js hosting with automatic deployments, edge network, and zero-config setup
- **Configuration**: 
  - Node.js 20.x runtime
  - Root directory set to `levqor-site`
  - Standard Next.js build process
  - Auto-deploy on git push to main branch
- **Custom Domain**: `www.levqor.ai` and `levqor.ai` (CNAME + A records via Cloudflare)
- **Pros**: Seamless integration with Next.js, automatic previews, global CDN
- **Cons**: Vendor lock-in, potential cost scaling with traffic

### Styling Approach

**Tailwind CSS**
- **Rationale**: Utility-first CSS framework for rapid UI development
- **Theme**: Dark mode design (slate-950 background, slate-50 text)
- **Pros**: Consistent design system, small bundle size with purging, highly customizable
- **Cons**: Verbose class names, learning curve for new developers

### Backend Architecture

**Framework**: Python Flask + Gunicorn
- **API Server**: Flask REST API on port 8000 (development) / port 5000 (production)
- **WSGI Server**: Gunicorn with 2 workers, 4 threads, port reuse enabled
- **Database**: PostgreSQL (Replit-hosted, development database)
- **Billing**: Stripe integration via Replit Stripe connector
- **Scheduler**: APScheduler for background jobs (18 scheduled tasks)
- **Deployment**: **Replit Autoscale ONLY** (auto-scales based on demand, per-request pricing)
- **Custom Domain**: `api.levqor.ai` (A + TXT records via Cloudflare, Proxy OFF)
- **NOTE**: Backend is NOT deployed on Vercel — Replit is the sole production backend platform

**Key Backend Modules**:
- `api/billing/checkout.py`: Stripe checkout session creation for DFY tiers + add-ons
- `modules/stripe_connector.py`: Replit Stripe connector integration with automatic credential refresh
- `server/storage.ts`: Database access layer
- `shared/schema.ts`: Drizzle ORM schema definitions

**DFY Pricing Configuration**:
- 15 LIVE price IDs configured as secrets:
  - 4 subscription tiers (Starter, Launch, Growth, Agency) × 2 intervals (monthly/yearly) = 8 prices
  - 3 DFY packages (Starter £149, Professional £299, Enterprise £499)
  - 4 add-ons (Priority Support, SLA 99.9%, White Label, Extra Workflows)
- Per-request Stripe credential refresh to avoid caching issues
- Backward compatibility for legacy tier names (scale→growth, business→agency)

## External Dependencies

### Payment Processing
- **Stripe**: Billing and subscription management
- **Integration**: Replit Stripe connector (LIVE mode for production)
- **Price IDs**: 15 active GBP prices for all tiers and add-ons
- **Webhook**: Configured for subscription/payment event handling

### Hosting & Deployment
- **Vercel**: Frontend hosting (Next.js application, `www.levqor.ai`)
- **Replit**: Backend deployment (Flask API, `api.levqor.ai`)
- **Cloudflare**: DNS management and domain routing
- **PostgreSQL**: Database (Replit-hosted development database)

### Framework Dependencies
- **Backend**: Python 3.x, Flask, Gunicorn, Stripe SDK, APScheduler, Drizzle ORM
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth
- **Database**: Drizzle ORM, PostgreSQL driver

### Authentication & Security
- **Planned**: NextAuth (OAuth with Google/Microsoft)
- **Secrets**: Managed via Replit secrets (Stripe keys, webhook secrets, API credentials)
- **Dashboard Protection**: Private routes require authentication, excluded from search engines

## Deployment Checklist

- ✅ Backend deployed to Replit Autoscale
- ✅ Frontend deployed to Vercel with auto-deployments
- ✅ Cloudflare DNS configured (api.levqor.ai & www.levqor.ai)
- ✅ SSL certificates issued for both domains
- ✅ LIVE Stripe billing active (15 price IDs)
- ✅ Dashboard V2 created with SEO lockdown
- ✅ All workflows running and healthy
- ✅ Hardening checklist created (Genesis v8.0 governance)
- ✅ Deployment health automation configured (GitHub Actions)
- ⏳ Pending: Production Stripe webhook verification

## Governance & Monitoring

### Hardening Checklist
**Location**: `levqor-site/docs/HARDENING_CHECKLIST.md`
- Comprehensive security, authentication, and infrastructure review checklist
- Must be completed before and after each production deployment
- Covers 9 critical areas: Security headers, auth, API hardening, Stripe integrity, DNS, logging, backups, frontend UX, and post-deployment validation
- **Usage**: Review checklist before every major release to ensure no gaps

### Deployment Health Automation
**Script**: `levqor-site/scripts/deployment_health_check.py`
- Automated endpoint monitoring for production health verification
- Checks: Frontend root, Dashboard V2, API health endpoint
- Returns exit code 0 (healthy) or 1 (unhealthy) for CI/CD integration
- **Usage**: Run manually with `python scripts/deployment_health_check.py` or via GitHub Actions

**GitHub Actions**: `.github/workflows/deployment-health.yml`
- Runs hourly (cron: "0 * * * *") to verify all endpoints
- Can be triggered manually via workflow_dispatch
- Zero cost (uses GitHub free CI minutes)
- Alerts via GitHub Actions UI when health checks fail
