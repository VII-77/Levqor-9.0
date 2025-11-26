# Levqor X 9.0 — V31.0 Launch Hardening Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, stabilized authentication, a self-running workflow execution engine with AI-powered builder, approval system, scheduling, and analytics, 25+ workflow templates, a visual workflow editor with drag-and-drop, comprehensive scaling documentation, GDPR/CCPA compliant data export/delete, launch readiness monitoring, and preflight testing infrastructure. The project is now launch-ready for production deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

Levqor X 9.0 employs a clean separation of concerns with a Next.js frontend deployed on Vercel and a Python/Flask API backend deployed on Replit Autoscale. This architecture ensures optimal scaling and clear deployment boundaries.

### Frontend Architecture

- **Framework**: Next.js (App Router) for server-side rendering.
- **Styling**: Tailwind CSS with a design tokens system and professional branding.
- **Language**: TypeScript.
- **Authentication**: NextAuth for route protection, integrated with i18n.
- **Internationalization**: `next-intl` supporting 40 languages (9 Tier-1 full translations), with locale-aware routing using `[locale]` segments and `localePrefix: 'as-needed'`.
- **AI UX Components**: Six production components for contextual help, workflow creation, debugging, onboarding, suggestions, and knowledge browsing.
- **Deployment**: Vercel for automatic deployments, global edge network, and custom domains.
- **UI/UX Decisions**: Centralized design tokens, professional branding, custom CSS animations, predominantly dark mode (Tailwind CSS slate palette with gradient accents), context-aware AI experience, responsive design, SEO optimization, and WCAG compliance (e.g., `prefers-reduced-motion` respected in Living Canvas).
- **Living Canvas**: WebGL/Canvas 2D visualization with 5 brain states (Organic, Neural, Quantum, Success, Error) driven by a centralized state machine and React Context for cross-component state management.
- **Workflow Editor**: Visual drag-and-drop editor for workflow creation and step reordering.

### Backend Architecture

- **Framework**: Python Flask with Gunicorn.
- **Database**: PostgreSQL (Replit-hosted).
- **Billing**: Stripe integration via Replit Stripe connector, supporting 15 live price IDs for subscriptions and DFY packages.
- **Scheduler**: APScheduler for background jobs.
- **Deployment**: Replit Autoscale for automatic scaling and custom domain (`api.levqor.ai`).
- **AI Integration**: Four core endpoints powered by GPT-4o-mini for chat, workflow generation, debugging, and onboarding, with robust fallbacks and cost controls.
- **Autonomous Operator System**: A 4-layer system including Self-Monitor, Operator Advisor, Optimization Engine, and Human Dashboard. This includes the Guardian Autopilot Grid for deep audits (secrets, compliance, growth organism checks) and a Growth Organism with 5 engines (demand signature, mutation, distribution, gravity, evolution).
- **Automation Core**: Includes auto-health monitoring, auto-scaling logic, auto-marketing recommendations, a growth engine with 25+ workflow templates and referrals, auto-reports, and an auto-SEO content engine (proposal-based).
- **Workflow Execution Engine**: Manages workflow models, runners, events, and storage, supporting step types like `http_request`, `delay`, `log`, `email`, `condition`, with Class A/B/C approval system and analytics.
- **Legal Compliance**: `modules/compliance/` for GDPR/CCPA baselines, data export/delete endpoints (`/api/me/export-data`, `/api/me/delete-account`).
- **Support Enhancement**: AI-first messaging, contact form, and ticket API.

### System Design Choices

- **Reliability & Resiliency**: Database connection retry logic and backend keep-alive monitoring.
- **Observability & Monitoring**: Structured JSON logging, error monitoring, frontend client logger, real-time health tiles, and performance metrics (e.g., BrainCanvas frame time).
- **Enterprise Support**: Tier-aware support routing and SLA mapping.
- **Governance**: Hardening checklist, automated health checks, and a comprehensive CI/CD safety harness for safe deployments. Includes preflight testing with user journey personas and launch readiness checks.
- **Legal & Compliance**: Backend privacy API, 4 legal pages, cookie consent UX, automated file integrity monitoring, and log hygiene (e.g., email truncation).
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
- **Backend**: Python, Flask, Gunicorn, Stripe SDK, APScheduler.
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth, next-intl.