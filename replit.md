# Levqor X 9.0 — V13.2 Global Launch Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, and global internationalization supporting 40 languages. The project now includes a full global launch suite with 11 new pages/features: Workflow Library (50 templates), Workflow of the Day, AI Workflow Creator, Community/AI Operators Network, Founder's Playbook, Global Support landing, Automation for Everyone multilingual page, GDPR educational page, Security Status UI, and LifecycleBanner conversion component.

## Recent Changes (November 24, 2025)

### V13.2 Global Launch Implementation - ALL 10 PHASES COMPLETE ✅

**Summary:** Delivered comprehensive global launch plan with 11 new pages/features across viral growth, authority building, conversion optimization, community layer, multilingual expansion, and security UX. Zero Blueprint violations. Zero TypeScript errors.

#### New Pages Created:
1. **`/workflows/library`** — 50 pre-built workflow templates across 10 categories with filtering, search, and one-click import (stub)
2. **`/workflows/daily`** — Workflow of the Day with social sharing, challenge system, badges, and 7-day rotation
3. **`/workflows/ai-create`** — AI-powered workflow creator with natural language builder and multi-step flow
4. **`/community`** — AI Operators Network with badges, discussion forum, workflow submission, and leaderboard
5. **`/founder-playbook`** — 5-chapter comprehensive guide with case studies and downloadable PDF
6. **`/automation-for-everyone`** — Multilingual landing showcasing 40-language support and global use cases
7. **`/global-support`** — Global support landing with SLA tiers, regional coverage, and AI support features
8. **`/privacy/gdpr`** — GDPR educational page with compliance overview and data rights explanation

#### Enhanced Pages:
9. **Status Page** — Added Security Status UI with compliance badges and encryption indicators
10. **Dashboard** — Integrated LifecycleBanner for trial conversion optimization

#### New Components:
11. **`LifecycleBanner.tsx`** — Day-based conversion component (Day 1/3/7/10/30) with localStorage tracking

#### Key Features:
- **Workflow Library:** 50 templates (Business Ops, Marketing, Customer Success, Finance, HR, Data, IT/DevOps, Compliance, Healthcare, Education)
- **Viral Engine:** Daily workflow rotation, social sharing (Twitter, LinkedIn, Email), OpenGraph meta tags, challenge/badge system
- **Authority Content:** Founder's Playbook with 5 chapters, industry-specific workflows, global expansion messaging
- **Conversion Cycle:** Trial day progression (Day 1→3→7→10→30), context-aware CTAs, dismissible banners
- **Community Layer:** Network badges, discussion topics, workflow submissions, leaderboards
- **Multilingual:** 40-language support showcase (9 Tier-1, 6 Tier-2, 25 Tier-3)
- **Global Support:** SLA tiers (48h/24h/12h/4h), 7 regional coverage areas, AI-powered assistance
- **Security UX:** Security status dashboard, compliance badges (SOC 2, GDPR, ISO 27001), GDPR education

#### Blueprint Compliance Maintained:
- ✅ Pricing preserved (£9/29/59/149 GBP monthly)
- ✅ 7-day free trial logic intact
- ✅ SLAs maintained (48h/24h/12h/4h)
- ✅ No schema changes
- ✅ No package.json modifications
- ✅ All AI features in stub-only mode (no server-side LLM calls)

#### Validations:
- ✅ TypeScript: 0 errors
- ✅ Drift Monitor: PASS (no violations)
- ✅ Both workflows RUNNING
- ✅ Omega system operational (23 + 3 jobs healthy)

#### Future Production Work Needed:
- Connect workflow library to backend API for real imports
- Move daily workflow rotation from localStorage to server-side scheduling
- Implement server-side trial tracking for cross-device persistence
- Replace AI stub responses with real GPT-4o-mini calls
- Add backend for community discussions and workflow submissions
- Complete Tier-1 translations for all 9 languages

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

## External Dependencies

### Payment Processing
- **Stripe**: Used for all billing and subscription management in live mode, integrated via the Replit Stripe connector. Includes a webhook for event handling.

### Hosting & Deployment
- **Vercel**: Hosts the Next.js frontend application (`www.levqor.ai`).
- **Replit**: Provides the deployment environment for the Python Flask backend API (`api.levqor.ai`) using Autoscale, and hosts the PostgreSQL database.
- **Cloudflare**: Manages DNS for both frontend and backend domains.

### Framework Dependencies
- **Backend**: Python 3.x, Flask, Gunicorn, Stripe SDK, APScheduler, Drizzle ORM, OpenAI SDK (GPT-4o-mini).
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth, next-intl.

### Authentication & Security
- **NextAuth**: Used for authentication, with planned OAuth integration.
- **Middleware Security**: Auth protection across all locales.
- **Replit Secrets**: Manages sensitive credentials.