# Levqor X 9.0 — V13.6 Auth Stabilization Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, stabilized authentication with guaranteed login path, auth diagnostics, and improved dashboard UX. The project's ambition is to provide robust, scalable, and globally accessible data management solutions.

## Recent Changes (November 25, 2025)

### V13.6 Auth System Stabilization - COMPLETE

**Summary:** Delivered a stabilized authentication system with guaranteed login path (Credentials/Admin), clear error surfacing on sign-in failures, and auth configuration diagnostics. Safety gate 4/4 PASSED.

**Key Changes:**
1. **Credentials Provider** — Added ENV-based admin user authentication (ADMIN_EMAIL, ADMIN_PASSWORD)
2. **Password Form** — Toggle between magic link and password login on sign-in page
3. **Error Messages** — Comprehensive ERROR_MESSAGES map for all NextAuth error codes
4. **Auth Diagnostic Page** — `/auth/status` shows provider configuration status with remediation guidance
5. **Dashboard Link** — Auth Status added to Quick Actions sidebar

**Key Files:**
- `levqor-site/src/auth.ts` — NextAuth config with Credentials provider
- `levqor-site/src/app/signin/page.tsx` — Enhanced sign-in with password form
- `levqor-site/src/app/auth/status/page.tsx` — Auth diagnostic page
- `levqor-site/src/app/dashboard/page.tsx` — Dashboard with Auth Status link

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

### Backend Architecture

- **Framework**: Python Flask with Gunicorn.
- **Database**: PostgreSQL (Replit-hosted).
- **Billing**: Stripe integration via Replit Stripe connector, supporting 15 live price IDs for subscriptions and DFY packages.
- **Scheduler**: APScheduler for background jobs.
- **Deployment**: Replit Autoscale for automatic scaling and custom domain (`api.levqor.ai`).
- **AI Integration**: Four core endpoints (`/api/ai/chat`, `/api/ai/workflow`, `/api/ai/debug`, `/api/ai/onboarding`) powered by GPT-4o-mini, with robust fallbacks and cost controls.
- **Autonomous Operator System**: A 4-layer system including Self-Monitor, Operator Advisor, Optimization Engine, and Human Dashboard.

### UI/UX Decisions

- **Design System**: Centralized design tokens for consistent styling.
- **Branding**: Professional logo and consistent brand gradient.
- **Animations**: Custom CSS animations for a polished user experience.
- **Theme**: Predominantly dark mode using Tailwind CSS's slate palette with gradient accents.
- **AI Experience**: Context-aware help panels, natural language workflow builder, debug assistant, and interactive onboarding.
- **Responsive Design**: Tailwind CSS for cross-device compatibility.
- **SEO**: Public pages are indexed, while private dashboard routes are explicitly excluded.

### System Design Choices

- **Reliability & Resiliency**: Database connection retry logic and backend keep-alive monitoring.
- **Observability & Monitoring**: Structured JSON logging, error monitoring, and a frontend client logger.
- **Enterprise Support**: Tier-aware support routing and SLA mapping.
- **Governance**: Hardening checklist and automated health checks ensure pre/post-deployment governance.
- **Legal & Compliance**: Backend privacy API, 4 new legal pages, cookie consent UX, and automated file integrity monitoring for legal documents.

## External Dependencies

### Payment Processing
- **Stripe**: Used for all billing and subscription management in live mode, integrated via the Replit Stripe connector.

### Hosting & Deployment
- **Vercel**: Hosts the Next.js frontend application (`www.levqor.ai`).
- **Replit**: Provides the deployment environment for the Python Flask backend API (`api.levqor.ai`) using Autoscale, and hosts the PostgreSQL database.
- **Cloudflare**: Manages DNS for both frontend and backend domains.

### Email Services
- **Resend**: Primary email provider for authentication (magic links).

### AI Services
- **OpenAI**: Provides GPT-4o-mini for AI integration.

### Framework Dependencies
- **Backend**: Python 3.x, Flask, Gunicorn, Stripe SDK, APScheduler, Drizzle ORM, OpenAI SDK.
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth, next-intl.

### Authentication & Security
- **NextAuth**: Used for authentication, with OAuth integration (Google, Microsoft) and Resend provider.
- **Replit Secrets**: Manages sensitive credentials.