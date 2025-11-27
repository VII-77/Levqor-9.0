# Levqor X V10.0 — Fully Autonomous Execution Edition

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments.

**V10 Features:**
- **Cost Autopilot Grid**: Real-time monitoring, spike detection, auto-throttling, and cost protection
- **Marketing Distribution Autopilot**: 3 pipelines (content, multi-channel, SEO) with founder approval
- **Multi-Language Live Switching**: Reactive language store with localStorage persistence
- **Brain V10**: AI-powered workflow assist, error debugger, and auto-fix actions
- **Admin Power Panel**: System toggles, cost monitor, approval queue, real-time logs at `/admin/power`
- **Compliance Grid V10**: Daily GDPR/DSAR/Cookie/Legal/Security audits with severity scoring
- **Autonomous Workflow Healing**: Health checks, auto-repair suggestions, dry-run by default
- **SEO Landing Generator**: Keyword templates, multi-language drafts, 4 page types
- **Growth Organism V10**: Closed-loop autonomous growth with founder approval gates

**V10 Completion (100%) - New Production Modules:**
- **Retry/Recovery Engine**: Exponential backoff (1s-5m), max 5 attempts, priority escalation, structured failure queue
- **Tenant Usage Metering**: Real-time tracking of workflow runs, API calls, AI credits with configurable limits
- **Tenant Lifecycle Management**: Soft delete/restore, suspend/resume with full lifecycle state machine
- **Support Feedback Loop**: AI-powered ticket analysis, auto-suggestions, satisfaction scoring
- **Region-Aware Pricing**: 15 regions with PPP support (India, Brazil, Mexico, Nigeria, South Africa), currency tiers
- **Growth Loops**: Viral sharing, copy-to-template, referral tracking with conversion analytics
- **Partner Ecosystem v1**: Partner registration, dashboard, template sharing, commission tracking
- **Workflow Validator**: 8 step types validation, deep logic checks, naming conventions, guardrails
- **Auto-Recovery Worker**: Background workflow healing, configurable cycles, dry-run safety mode

Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, stabilized authentication, a self-running workflow execution engine with AI-powered builder, approval system, scheduling, and analytics, 25+ workflow templates, a visual workflow editor with drag-and-drop, comprehensive scaling documentation, GDPR/CCPA compliant data export/delete, launch readiness monitoring, and preflight testing infrastructure. The project is launch-ready for production deployment.

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
- **Autopilot Telemetry System**: Full-stack telemetry collecting errors, events, and performance data. Backend module (`api/telemetry/`) with `log_event`, `log_error`, `log_performance` helpers. Rotating JSONL log at `logs/telemetry.log`. Frontend telemetry utility (`src/lib/telemetry.ts`) batches events to backend ingestion endpoint. Guardian feed endpoint (`/api/guardian/summary`) aggregates metrics with anomaly detection (high error rates, slow endpoints).
- **System Heartbeat + Safe Auto-Heal Layer (Autopilot Wave 1)**: Continuous health monitoring with dry-run healing suggestions for AI agents and dashboards.
  - `GET /api/system/heartbeat`: Returns `db_ok`, `stripe_ok`, `brain_ok`, `error_count_recent`, `status`, `uptime_seconds`, `version`
  - `GET /api/system/pulse`: Minimal alive check (`alive: true/false`)
  - `GET /api/guardian/healing-plan`: 6 health checks (db, Stripe, Brain, error rate, slow endpoints, repeated errors) with suggested actions
  - Scheduler job runs every 60 seconds, logs heartbeat telemetry events
  - Safe Mode enforced: all healing actions are dry-run only (`auto_applicable: false`), no destructive operations
- **Telemetry Autopilot Core (Wave 2)**: Database-backed log ingestion, anomaly detection, and daily reporting in passive mode.
  - `POST /api/guardian/telemetry/ingest`: Stores telemetry events in PostgreSQL (`telemetry_logs` table)
  - `GET /api/guardian/telemetry`: Summarizes telemetry data (sources, error rates, performance metrics)
  - `GET /api/guardian/anomalies`: Detects patterns (repeated messages >=3x, slow endpoints >2000ms, high error rates >10%)
  - `GET /api/guardian/daily-report`: Generates health score (0-100), improvement suggestions, top errors/events
  - Frontend integration: `guardianLog()` function in `src/lib/telemetry.ts` for Wave 2 database logging
  - Passive Mode enforced: All suggestions are dry-run only (`auto_applicable: false`)
- **Auto-Upgrade Engine (Autopilot Wave 3 - Design Only)**: Passive planner that reads telemetry/heartbeat/healing data and generates structured upgrade plans WITHOUT auto-applying any fixes.
  - `POST /api/guardian/upgrade/plans/rebuild`: Analyzes anomalies and generates new upgrade plans, archives stale ones
  - `GET /api/guardian/upgrade/plans`: Lists upgrade plans with optional filters (status, category, limit)
  - `GET /api/guardian/upgrade/plans/<id>`: Gets single plan details by ID
  - `GET /api/guardian/upgrade/summary`: Statistics breakdown by status/category/priority
  - Database: `upgrade_plans` table with id, status (open/in_progress/applied/archived), priority (1-5), category (performance/reliability/i18n/UX/pricing/security), risk_level (low/medium/high), source, metadata (JSON)
  - Scheduler: Runs every 6 hours automatically via APScheduler job "Upgrade Planner (Autopilot Wave 3 - Design Only)"
  - Strict Design-Only Mode: All plans have `auto_applicable: false`, `safe_mode: true` - no shell commands, no config edits, no service restarts
- **Enterprise Support**: Tier-aware support routing and SLA mapping.
- **Governance**: Hardening checklist, automated health checks, and a comprehensive CI/CD safety harness for safe deployments. Includes preflight testing with user journey personas and launch readiness checks.
- **Legal & Compliance**: Backend privacy API, 4 legal pages, cookie consent UX, automated file integrity monitoring, and log hygiene (e.g., email truncation).
- **Authentication System**: Stabilized NextAuth with Credentials provider (admin user), clear error surfacing, and an auth diagnostic page (`/auth/status`).
- **Launch Stage Management**: Centralized `config/launch_stage.py` with pre-launch (dry-run, approval-required) and post-launch (autonomous execution) modes. Growth Organism engines respect `LEVQOR_LAUNCH_STAGE` environment variable. See `docs/PHASE60_LAUNCH_READY.md` for full documentation.

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