# Levqor Site

## Overview

Levqor Site is a Next.js-based web application providing information about data backup and retention policies. The project is deployed on Vercel and uses modern React/Next.js patterns with TypeScript. The application appears to be a customer-facing informational site, likely part of a larger SaaS platform focused on data management and compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

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

## External Dependencies

### Hosting & Deployment
- **Vercel**: Primary hosting platform for the Next.js application
- **Project ID**: prj_0uD8XkWsrf6z7F9DHlUvyfDinas5
- **Organization**: team_brpiJYLXLxoOUdPwhMJ2TJ6e

### Development Tools
- **pytest**: Python testing framework (cache present, suggesting Python backend services may exist alongside the frontend)

### Framework Dependencies
- **Next.js**: React framework for production
- **React**: UI library
- **TypeScript**: Type system for JavaScript

Note: No database, authentication system, or API integrations are visible in the current repository structure. The application appears to be a static/server-rendered informational site without dynamic data requirements at this stage.