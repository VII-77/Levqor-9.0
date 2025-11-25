# Levqor X 9.0 — V31.0 Launch Hardening Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, stabilized authentication, Living Canvas brain visualization, improved dashboard UX, a **self-running workflow execution engine** with AI-powered builder, approval system, scheduling, and analytics, **25+ workflow templates**, a **visual workflow editor with drag-and-drop**, **comprehensive scaling documentation**, **GDPR/CCPA compliant data export/delete**, **launch readiness monitoring**, and **preflight testing infrastructure**. The project is now **launch-ready** for production deployment.

## Recent Changes (November 25, 2025)

### MEGA PHASE v15-v18: Self-Running Workflow Engine

**Summary:** Complete workflow execution engine with AI-powered builder, Class A/B/C approval system, scheduling, and analytics. All 4/4 safety checks passing.

**Workflow Execution Engine (v15):**
- Created `modules/workflows/` package with models, runner, events, storage
- Implemented step types: `http_request`, `delay`, `log`, `email`, `condition`
- Email and external HTTP requests trigger approval (Class C)
- Event logging for all workflow runs and step executions

**AI Brain Builder (v16):**
- Created `api/ai/brain_builder.py` for natural language workflow creation
- Impact classification system (Class A=Safe, B=Soft, C=Critical)
- Approval queue with pending/approved/rejected states

**Frontend Components (v17):**
- `BrainWorkflowBuilder.tsx` - AI workflow builder with brain state integration
- `ApprovalPanel.tsx` - Manage pending approvals
- API endpoints for approval queue management

**Scheduling & Analytics (v18):**
- `scripts/automation/workflow_scheduler.py` (one-shot and continuous modes)
- `modules/analytics/usage.py` with metrics aggregation
- `AnalyticsPanel.tsx` and `WorkflowHistoryPanel.tsx` for dashboard
- Documentation: `docs/workflows.md`, `docs/operations.md`

### V15 Hardening & Real-World Alignment

**Real-World Hardening:**
- Repo-wide scan completed — no dead code found
- No circular dependencies detected
- 4 components reserved for future features (verified intentional)

**Performance Metrics:**
- LevqorBrainCanvas: Frame time monitoring (warns if avg >50ms/frame)
- HealthOverview: Fetch timing (warns if >2000ms)

**Auto-Engine Validation:**
- All 6 original engines tested: health_bp, scaling_policy, templates, referrals, auto_marketing_cycle, auto_weekly_report

**ICP/Real-World Alignment:**
- Created `/docs/real_world_alignment.md` with ICP, workflows, and guardrails

### MEGA PHASE v19-v22: Visual Editor, Templates, Scaling (November 25, 2025)

**SEO Content Engine (v19):**
- Created `scripts/automation/auto_seo_content.py` for SEO recommendations
- Proposal-based approach (generates suggestions, human reviews before implementation)

**Template Marketplace Expansion (v20):**
- Expanded `modules/growth_engine/templates.py` from 8 to 25+ templates
- Categories: lead_capture, customer_support, reporting, data_sync, notifications, sales_automation
- Created `api/templates/` blueprint with GET endpoints
- Frontend `/templates` marketplace page

**Visual Workflow Editor (v21):**
- Created `WorkflowEditor.tsx` with native HTML5 drag-and-drop
- Step reordering via drag handles with visual drop indicators
- Configuration panels for all step types
- Brain state integration: Quantum during drag, Success on reorder

**Scaling Documentation (v22):**
- Created `docs/scaling.md` with infrastructure scaling patterns
- Load tier definitions and rate limit profiles
- K8s HPA, AWS ASG, Replit Autoscale integration guides
- Capacity planning formulas

### i18n Routing Architecture Fix (November 25, 2025)

**Hybrid Locale Routing:**
- Implemented proper next-intl v4 App Router structure with `[locale]` segment
- Using `localePrefix: 'as-needed'` for clean URLs (default locale at `/`, others at `/es`, `/fr`, etc.)
- All pages relocated under `app/[locale]/` with route groups:
  - `(public)/` - Marketing pages (pricing, about, help, contact, templates, etc.)
  - `(auth)/` - Auth-protected pages (signin, dashboard)
  - `(legal)/` - Legal pages (terms, privacy, gdpr, sla, etc.)
- Root level retains only: `admin/`, `auth/` (NextAuth), `api/`
- 9 supported languages: en, es, fr, de, ar, hi, zh-Hans, it, pt
- Middleware chains NextAuth and next-intl for both auth and i18n

### MEGA PHASE v23-v31: Launch Hardening (November 25, 2025)

**Legal Compliance (LEGAL-0):**
- Created `docs/compliance.md` with GDPR/CCPA baseline
- Built `modules/compliance/` package with export_utils and delete_utils
- Added `/api/me/export-data` and `/api/me/delete-account` endpoints (Class C with 30-day grace period)
- Log hygiene: Email addresses now truncated to `abc***@domain.com` format

**UX Improvements (v23):**
- Created `GetStartedPanel.tsx` for FTUE (first-time user experience)
- Added `ErrorDisplay.tsx` shared component for friendly error messages
- Enhanced error handling in BrainWorkflowBuilder and WorkflowEditor

**Help Center (v24):**
- Expanded `/help` page with 6 categories and 24 help topics
- Search functionality and popular topics

**Preflight Testing (v26):**
- Created `scripts/preflight/test_personas.py` with 3 user journey personas
- Built `LaunchReadinessPanel.tsx` showing 7 system checks

**Marketing Panel (v27):**
- Created `MarketingPanel.tsx` with user segments and approval-based campaigns
- All marketing actions remain proposal-based (Class C)

**Growth Loops (v28):**
- Added workflow duplication endpoint `POST /api/workflows/<id>/duplicate`
- Existing referrals UI and template sharing

**Scaling Readiness (v29):**
- Created `scripts/ops/check_scaling_readiness.py` for capacity verification
- Checks: health, database, scaling policy, environment, worker capacity

**Launch Readiness API (v30):**
- Created `api/system/launch_readiness.py` with 7 launch checks
- Endpoint: `GET /api/system/launch-readiness`

**Launch Page (v31):**
- Created `/launch` page with hero, features, pricing, CTA
- Built `scripts/postlaunch/verify_live.py` for post-launch verification

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

Levqor X 9.0 employs a clean separation of concerns with a Next.js frontend deployed on Vercel and a Python/Flask API backend deployed on Replit Autoscale. This architecture ensures optimal scaling and clear deployment boundaries.

### Frontend Architecture

- **Framework**: Next.js (App Router) for server-side rendering.
- **Styling**: Tailwind CSS with a design tokens system and professional branding.
- **Language**: TypeScript.
- **Authentication**: NextAuth for route protection, integrated with i18n.
- **Internationalization**: `next-intl` supporting 40 languages (9 Tier-1 full translations), with locale-aware routing.
- **AI UX Components**: Six production components for contextual help, workflow creation, debugging, onboarding, suggestions, and knowledge browsing.
- **Deployment**: Vercel for automatic deployments, global edge network, and custom domains.
- **UI/UX Decisions**: Centralized design tokens, professional branding, custom CSS animations, predominantly dark mode (Tailwind CSS slate palette with gradient accents), context-aware AI experience, responsive design, and SEO.
- **Living Canvas**: WebGL/Canvas 2D visualization with 5 brain states (Organic, Neural, Quantum, Success, Error) driven by a centralized state machine and React Context for cross-component state management.

### Backend Architecture

- **Framework**: Python Flask with Gunicorn.
- **Database**: PostgreSQL (Replit-hosted).
- **Billing**: Stripe integration via Replit Stripe connector, supporting 15 live price IDs for subscriptions and DFY packages.
- **Scheduler**: APScheduler for background jobs.
- **Deployment**: Replit Autoscale for automatic scaling and custom domain (`api.levqor.ai`).
- **AI Integration**: Four core endpoints (`/api/ai/chat`, `/api/ai/workflow`, `/api/ai/debug`, `/api/ai/onboarding`) powered by GPT-4o-mini, with robust fallbacks and cost controls.
- **Autonomous Operator System**: A 4-layer system including Self-Monitor, Operator Advisor, Optimization Engine, and Human Dashboard.
- **Automation Core**: Includes auto-health monitoring (`/api/health/summary`), auto-scaling logic based on load (`security_core/scaling_policy.py`), auto-marketing recommendations, a growth engine with workflow templates and referrals, and auto-reports (e.g., weekly reports).
- **Revenue Funnel**: Post-checkout welcome page, session verification, and enhanced pricing page with live Stripe checkout.
- **Support Enhancement**: AI-first messaging, contact form, and ticket API (`/api/support/ticket`).

### System Design Choices

- **Reliability & Resiliency**: Database connection retry logic and backend keep-alive monitoring.
- **Observability & Monitoring**: Structured JSON logging, error monitoring, and a frontend client logger, including real-time health tiles in the dashboard.
- **Enterprise Support**: Tier-aware support routing and SLA mapping.
- **Governance**: Hardening checklist, automated health checks, and a comprehensive CI/CD safety harness (`scripts/ci/run_all_checks.py`) for safe deployments.
- **Legal & Compliance**: Backend privacy API, 4 legal pages, cookie consent UX, and automated file integrity monitoring.
- **Authentication System**: Stabilized NextAuth with Credentials provider (admin user), clear error surfacing, and an auth diagnostic page (`/auth/status`).

## External Dependencies

### Payment Processing
- **Stripe**: Used for all billing and subscription management.

### Hosting & Deployment
- **Vercel**: Hosts the Next.js frontend application.
- **Replit**: Provides the deployment environment for the Python Flask backend API and hosts the PostgreSQL database.
- **Cloudflare**: Manages DNS.

### Email Services
- **Resend**: Primary email provider for authentication (magic links).

### AI Services
- **OpenAI**: Provides GPT-4o-mini for AI integration.

### Framework Dependencies
- **Backend**: Python, Flask, Gunicorn, Stripe SDK, APScheduler, Drizzle ORM, OpenAI SDK.
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth, next-intl.

### Authentication & Security
- **NextAuth**: Used for authentication, with OAuth integration (Google, Microsoft) and Resend provider.
- **Replit Secrets**: Manages sensitive credentials.