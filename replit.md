# Levqor X 9.0

## Overview

Levqor X is a comprehensive data backup and retention management platform with Done-For-You (DFY) service tiers. The project consists of a Python Flask backend API, a Next.js frontend, PostgreSQL database, and Stripe billing integration. Currently configured for development with TEST mode Stripe credentials, ready for production deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

### DFY Pricing Realignment - COMPLETED ✅
- **New Pricing Tiers**: Starter (£9/£90), Launch (£29/£290), Growth (£59/£590), Agency (£149/£1490)
- **Backend**: Updated checkout API to support new tiers with Stripe connector integration
- **Frontend**: Pricing page rebuilt with new tier structure
- **Stripe**: All 8 checkout endpoints working in TEST mode
- **Security**: Removed conflicting environment variables, using Replit Stripe connector exclusively

## System Architecture

### Frontend Architecture

**Framework**: Next.js (App Router)
- **Rationale**: Next.js App Router provides server-side rendering, optimal performance, and modern React patterns
- **Styling**: Tailwind CSS with a dark theme (slate color palette)
- **TypeScript**: Fully typed for type safety and developer experience

**Component Structure**
- Page-based routing using Next.js 13+ App Router convention
- Client-side navigation with Next.js Link components
- Responsive design with Tailwind utility classes

### Deployment

**Platform**: Vercel
- **Rationale**: Native Next.js hosting with automatic deployments, edge network, and zero-config setup
- **Configuration**: 
  - Node.js 20.x runtime
  - Root directory set to `levqor-site`
  - Standard Next.js build process
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
- **API Server**: Flask REST API on port 8000
- **WSGI Server**: Gunicorn with 2 workers, 4 threads, port reuse enabled
- **Database**: PostgreSQL (Replit-hosted, development database)
- **Billing**: Stripe integration via Replit Stripe connector
- **Scheduler**: APScheduler for background jobs (18 scheduled tasks)

**Key Backend Modules**:
- `api/billing/checkout.py`: Stripe checkout session creation for DFY tiers
- `modules/stripe_connector.py`: Replit Stripe connector integration (5min credential cache)
- `server/storage.ts`: Database access layer
- `shared/schema.ts`: Drizzle ORM schema definitions

**DFY Pricing Configuration**:
- 8 price IDs stored as secrets (STRIPE_PRICE_STARTER, etc.)
- Per-request Stripe credential refresh to avoid caching issues
- Backward compatibility for legacy tier names (scale→growth, business→agency)

## External Dependencies

### Payment Processing
- **Stripe**: Billing and subscription management
- **Integration**: Replit Stripe connector (TEST mode for development)
- **Price IDs**: 8 active GBP prices for DFY tiers (monthly + yearly variants)

### Hosting & Deployment
- **Vercel**: Frontend hosting (Next.js application)
- **Replit**: Backend development environment
- **PostgreSQL**: Database (Replit-hosted development database)

### Framework Dependencies
- **Backend**: Python 3.x, Flask, Gunicorn, Stripe SDK, APScheduler
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: Drizzle ORM, PostgreSQL driver

### Authentication & Security
- **Planned**: NextAuth (OAuth with Google/Microsoft)
- **Secrets**: Managed via Replit secrets (Stripe keys, webhook secrets, auth credentials)