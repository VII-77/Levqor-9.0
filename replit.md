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

## Marketing & Content

-   **Content Engine Template**: `levqor-site/templates/content-engine-template.md` — Reusable template for generating 6 content assets (video script, Twitter thread, LinkedIn post, email, Instagram carousel, mini-article) from a single idea seed. All content drives traffic to the £47 Automation Accelerator Pack.
-   **Product Pages**: Dynamic product pages at `/[locale]/products/[slug]` with modular components and telemetry tracking.
-   **Product Config**: `levqor-site/src/config/products.ts` — Auto-generated from JSON specs in `levqor-site/products/*.product.json`.

## Repeatable Launch Pattern v1.0

The locked-in machine for launching any new product. One slug in → everything out.

### Pipeline Flow

```
products/<slug>.product.json
    ↓
npx tsx scripts/compile-product.ts --slug=<slug>
    ↓
├── ZIP archive → dist/products/<slug>/
├── Google Drive upload → driveDownloadUrl in config
├── src/config/products.ts updated with all fields
└── public/assets/Levqor-Omega-Empire-Pack/products/<slug>/ created
    ↓
Drop real PNGs into Omega folders
    ↓
git push → Vercel deploys → Product page live
    ↓
Create Gumroad listing with Drive URL as content
```

### Required Inputs Per Product

1. **slug** — Machine name (e.g., `ascend-launch-system`)
2. **name** — Human name (e.g., `Ascend Launch System`)
3. **price** — USD amount (e.g., `17`)
4. **description** — What it does (plain English)
5. **tags** — Comma-separated categories

### Key Scripts

| Script | Purpose |
|--------|---------|
| `scripts/compile-product.ts` | Master compiler: ZIP, Drive upload, config update, Omega tree |
| `scripts/omega-assets.ts` | Creates per-product Omega folder structure |
| `scripts/generate-omega-pack.ts` | Creates root Omega pack structure |
| `scripts/creator-panel.ts` | CLI with 34 commands for product/content management |

### Omega Asset Structure (Per Product)

```
public/assets/Levqor-Omega-Empire-Pack/products/<slug>/
├── Product-Cover/          (3 variants)
├── Thumbnails/             (6 variants)
├── Hero-Banners/           (2 variants)
├── Social-Posts/           (15 posts across 3 styles)
├── Carousel-Posts/         (5 slides)
├── CTA-Cards/              (6 variants)
├── Ad-Creatives/           (8 ads)
├── Video-Frames/           (12 frames)
└── Brand-Geometry-Pack/    (13 elements)
```

### Frontend Wiring

- **ProductConfig** auto-populates `coverImage`, `thumbnailImage`, `heroImage`
- **ProductCard** shows thumbnail with graceful fallback
- **ProductHero** shows hero/cover with graceful fallback
- URLs: `/assets/Levqor-Omega-Empire-Pack/products/<slug>/...`
- Filesystem: `public/assets/Levqor-Omega-Empire-Pack/products/<slug>/...`

### HYBRID FLUX WAVE Brand Style

| Element | Hex |
|---------|-----|
| Deep Space Black | #000000 |
| Midnight Graphite | #0C0F14 |
| Neon Flux Blue | #3A8CFF |
| Aurora Pulse Teal | #31F7D9 |
| Plasma Purple | #8F5BFF |

### Human Checklist Per Launch

1. Run agent prompt with slug/name/price/description/tags
2. Generate real PNGs using Omega Empire prompts → drop into `public/assets/.../products/<slug>/`
3. Create Gumroad listing: title, price, description, Content URL = Drive URL
4. Optional: `npm run creator:panel status` or `metrics:today`

### Session Strategy

- **CRITICAL**: NextAuth must use `strategy: "jwt"` (middleware uses `getToken()`)
- **CRITICAL**: Static assets MUST live in `public/` directory
- **CRITICAL**: Google Drive uploads require `supportsAllDrives: true`