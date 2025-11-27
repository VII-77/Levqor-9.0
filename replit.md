# Levqor X V10.0 — Fully Autonomous Execution Edition

## Overview

Levqor X is a comprehensive, production-ready data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform emphasizes autonomous operations, including a Cost Autopilot Grid, Marketing Distribution Autopilot, Compliance Grid, Autonomous Workflow Healing, and a Growth Organism. Key capabilities include a 4-layer autonomous operator system, multilingual AI with GPT-4o-mini integration, global internationalization supporting 40 languages, comprehensive legal/compliance infrastructure, and a self-running workflow execution engine with an AI-powered builder, approval system, scheduling, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

Levqor X employs a clean separation of concerns with a Next.js frontend deployed on Vercel and a Python/Flask API backend deployed on Replit Autoscale.

### Frontend Architecture

-   **Framework**: Next.js (App Router) for server-side rendering.
-   **Styling**: Tailwind CSS with a design tokens system and professional branding, predominantly dark mode.
-   **Language**: TypeScript.
-   **Authentication**: NextAuth for route protection.
-   **Internationalization**: `next-intl` supporting 40 languages with locale-aware routing.
-   **UI/UX Decisions**: Centralized design tokens, custom CSS animations, responsive design, SEO optimization, and WCAG compliance. Features include a WebGL/Canvas 2D visualization (Living Canvas) and a visual drag-and-drop workflow editor.

### Backend Architecture

-   **Framework**: Python Flask with Gunicorn.
-   **Database**: PostgreSQL.
-   **Billing**: Stripe integration for subscriptions and DFY packages.
-   **Scheduler**: APScheduler for background jobs.
-   **AI Integration**: Four core endpoints powered by GPT-4o-mini for chat, workflow generation, debugging, and onboarding.
-   **Autonomous Operator System**: A 4-layer system (Self-Monitor, Operator Advisor, Optimization Engine, Human Dashboard) including Guardian Autopilot Grid and a Growth Organism with 5 engines.
-   **Automation Core**: Includes auto-health monitoring, auto-scaling logic, auto-marketing recommendations, a growth engine with 25+ workflow templates, and an auto-SEO content engine.
-   **Workflow Execution Engine**: Manages workflow models, runners, events, and storage, supporting various step types and a Class A/B/C approval system with analytics.
-   **Legal Compliance**: Modules for GDPR/CCPA baselines, data export/delete endpoints.
-   **System Design Choices**:
    -   **Reliability & Resiliency**: Database connection retry logic, backend keep-alive monitoring.
    -   **Observability & Monitoring**: Structured JSON logging, error monitoring, frontend client logger, real-time health tiles, and performance metrics.
    -   **Autopilot Telemetry System**: Full-stack telemetry for errors, events, and performance data, with anomaly detection and daily reporting. Includes `telemetry_logs` table in PostgreSQL.
    -   **System Heartbeat + Safe Auto-Heal Layer**: Continuous health monitoring with dry-run healing suggestions (`GET /api/guardian/healing-plan`).
    -   **Telemetry Autopilot Core**: Database-backed log ingestion, anomaly detection (repeated messages, slow endpoints, high error rates), and daily reporting.
    -   **Auto-Upgrade Engine (Design Only)**: Passive planner generating structured upgrade plans without auto-applying fixes.
    -   **Guardian Executive Summary (Passive Mode Only)**: Aggregates all health data for a comprehensive system snapshot, including a health score.
    -   **Revenue Autopilot Layer (Passive)**: Data capture pipeline for sales leads and DFY requests, stored in `sales_leads` and `dfy_requests` tables.
    -   **AI CEO Engine (Advisory Mode)**: Provides strategic insights based on aggregated Guardian and Revenue data, offering revenue, reliability, and UX strategy actions.
    -   **Founder Briefing & Alerts Autopilot (Passive)**: Proactive daily briefings and notifications (via Telegram/Slack/Email) summarizing system and revenue status.
    -   **Governance**: Hardening checklist, automated health checks, CI/CD safety harness, and preflight testing.
    -   **Launch Stage Management**: Centralized configuration (`LEVQOR_LAUNCH_STAGE`) for pre-launch (dry-run, approval-required) and post-launch (autonomous execution) modes.

## External Dependencies

-   **Stripe**: Payment processing for billing and subscriptions.
-   **Vercel**: Frontend hosting and deployment.
-   **Replit**: Backend API deployment and PostgreSQL database hosting.
-   **Cloudflare**: DNS management.
-   **Resend**: Email service for authentication (magic links).
-   **OpenAI**: Provides GPT-4o-mini for AI functionalities.