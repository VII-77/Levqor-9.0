# Levqor X 9.0 — V15.0 Hardening & Production-Ready Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, stabilized authentication, Living Canvas brain visualization, and improved dashboard UX. The project's ambition is to provide robust, scalable, and globally accessible data management solutions with complete automation core, auto-health monitoring, auto-scaling, auto-marketing, growth engine, and auto-reports.

## Recent Changes (November 25, 2025)

### V15 Hardening & Real-World Alignment

**Summary:** Production hardening phase validating real-world readiness, performance monitoring, and auto-engine stability. All 4/4 safety checks passing.

**Real-World Hardening:**
- Repo-wide scan completed — no dead code found
- No circular dependencies detected
- 4 components reserved for future features (verified intentional)

**Performance Metrics:**
- LevqorBrainCanvas: Frame time monitoring (warns if avg >50ms/frame)
- HealthOverview: Fetch timing (warns if >2000ms)

**Auto-Engine Validation:**
- All 6 engines tested: health_bp, scaling_policy, templates, referrals, auto_marketing_cycle, auto_weekly_report

**ICP/Real-World Alignment:**
- Created `/docs/real_world_alignment.md` with ICP, workflows, and guardrails

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