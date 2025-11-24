# Levqor X 9.0 — V12.12 Enterprise

## Overview

Levqor X is a comprehensive data backup and retention management platform offering Done-For-You (DFY) service tiers. It features a Python Flask backend API, a Next.js frontend, a PostgreSQL database, and integrates with Stripe for billing. The platform is configured for production, including live Stripe credentials and automatic Vercel deployments. The V12.12 Enterprise upgrade focused on enhancing reliability, resiliency, observability, monitoring, and automating enterprise support while maintaining backward compatibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

Levqor X 9.0 employs a clean separation of concerns:
- **Frontend**: Next.js application deployed exclusively on Vercel (`levqor.ai` / `www.levqor.ai`).
- **Backend**: Python/Flask API deployed exclusively on Replit Autoscale (`api.levqor.ai`).
This separation ensures optimal scaling for both components and prevents deployment confusion.

### Frontend Architecture

- **Framework**: Next.js (App Router) for server-side rendering and performance.
- **Styling**: Tailwind CSS with a dark theme (slate color palette).
- **Language**: TypeScript for type safety.
- **Authentication**: NextAuth protects routes like `/dashboard` and `/dashboard/v2`.
- **Deployment**: Vercel handles automatic deployments, global edge network, and custom domains.

### Backend Architecture

- **Framework**: Python Flask with Gunicorn.
- **Database**: PostgreSQL (Replit-hosted).
- **Billing**: Stripe integration via Replit Stripe connector.
- **Scheduler**: APScheduler for background jobs (18 scheduled tasks).
- **Deployment**: Replit Autoscale for automatic scaling and per-request pricing.
- **Custom Domain**: `api.levqor.ai` configured via Cloudflare (A + TXT records, Proxy OFF).
- **Key Backend Modules**: Includes `api/billing/checkout.py` for Stripe sessions, `modules/stripe_connector.py` for Stripe integration, and `server/storage.ts` for database access.
- **DFY Pricing**: 15 LIVE Stripe price IDs configured for subscription tiers, DFY packages, and add-ons, with backward compatibility for legacy tier names.

### UI/UX Decisions

- **Dark Theme**: Predominantly dark mode using Tailwind CSS's slate color palette for a consistent and modern look.
- **Responsive Design**: Achieved using Tailwind utility classes to ensure functionality across various devices.
- **SEO**: Public pages are indexed, while private dashboard routes (`/dashboard`, `/dashboard/v2`) are explicitly excluded from search engines using `noindex`, `nofollow`, and `nocache` meta tags.

### System Design Choices

- **Reliability & Resiliency**: Implemented database connection retry logic and backend keep-alive monitoring.
- **Observability & Monitoring**: Structured JSON logging, error monitoring hooks, and a frontend client logger provide comprehensive system insights.
- **Enterprise Support**: Features tier-aware support routing and SLA mapping, with stubs for AI integration and a support ticket API.
- **Governance**: A `HARDENING_CHECKLIST.md` and automated health checks via `deployment_health_check.py` and GitHub Actions ensure pre/post-deployment governance and continuous monitoring.

## External Dependencies

### Payment Processing
- **Stripe**: Utilized for all billing and subscription management, integrated via the Replit Stripe connector in LIVE mode. Configured with 15 active GBP price IDs for various tiers and add-ons, and a webhook for event handling.

### Hosting & Deployment
- **Vercel**: Hosts the Next.js frontend application (`www.levqor.ai`).
- **Replit**: Provides the deployment environment for the Python Flask backend API (`api.levqor.ai`) using Autoscale.
- **Cloudflare**: Manages DNS for both frontend and backend domains.
- **PostgreSQL**: The database used for the project, hosted on Replit for development.

### Framework Dependencies
- **Backend**: Python 3.x, Flask, Gunicorn, Stripe SDK, APScheduler, Drizzle ORM.
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, NextAuth.
- **Database**: Drizzle ORM for schema definitions and PostgreSQL driver.

### Authentication & Security
- **NextAuth**: Planned for OAuth integration (Google/Microsoft).
- **Replit Secrets**: Manages sensitive credentials such as Stripe keys and API tokens.