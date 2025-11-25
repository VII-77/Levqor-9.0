# Levqor X — Real-World Alignment Document

**Last Updated:** November 25, 2025  
**Version:** V22.0 (Visual Editor + Scaling Edition)

---

## Primary ICP (Ideal Customer Profile)

Levqor X targets:

### Primary Users
- **Small to Mid-Size Businesses (SMBs)** — 10-500 employees
- **Digital Agencies** — Managing multiple client workflows
- **SaaS Operations Teams** — Needing backup and retention automation
- **E-commerce Businesses** — With data compliance requirements

### Decision Makers
- Operations Managers
- IT Directors
- Compliance Officers
- Agency Owners

### Key Characteristics
- Non-technical or semi-technical users who prefer visual workflow builders
- Budget-conscious organizations seeking value (£9-149/month tiers)
- Teams requiring 7-day trial before commitment
- Organizations with data retention compliance needs (GDPR, SOC2)

---

## Real-World Workflows Supported Today

### Production-Ready Workflows

| Workflow | Status | Description |
|----------|--------|-------------|
| **Lead Capture Automation** | Live | Web form → CRM integration |
| **Email Auto-Responder** | Live | AI-categorized email replies |
| **Weekly Analytics Report** | Live | Scheduled report generation |
| **CRM Data Sync** | Live | Bi-directional data sync |
| **Slack Alert Notifications** | Live | Event-driven Slack messages |
| **Invoice Follow-up** | Live | Payment reminder sequences |
| **Customer Onboarding** | Live | Drip email + milestone tracking |
| **Social Media Monitor** | Live | Social mention tracking |

### Dashboard Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Living Canvas Brain** | Live | WebGL visualization with 5 states |
| **Health Overview** | Live | Real-time system status tiles |
| **Growth Panel** | Live | Templates + referral tracking |
| **Quickstart Panel** | Live | AI-guided workflow creation |
| **Workflow Library** | Live | 25+ starter templates (v20) |
| **Visual Workflow Editor** | Live | Drag-and-drop step configuration (v21) |
| **Approval Panel** | Live | Class A/B/C approval queue management |
| **Analytics Panel** | Live | Workflow execution metrics (v18) |
| **Workflow History** | Live | Run history and event logs (v18) |

### Billing & Plans

| Plan | Price | Status |
|------|-------|--------|
| Launch | £9/mo | Live (Stripe) |
| Growth | £29/mo | Live (Stripe) |
| Scale | £59/mo | Live (Stripe) |
| Agency | £149/mo | Live (Stripe) |
| Annual Plans | -20% | Live (Stripe) |

---

## New in v19-v22

### v19: SEO Content Engine
- Proposal-based SEO recommendations script (`scripts/automation/auto_seo_content.py`)
- Generates meta title, description, keyword suggestions
- Requires human review before implementation

### v20: Expanded Template Marketplace
- 25+ templates across 6 categories
- Categories: lead_capture, customer_support, reporting, data_sync, notifications, sales_automation
- API: `GET /api/templates` and `GET /api/templates/<id>`
- Frontend marketplace at `/templates`

### v21: Visual Workflow Editor
- `WorkflowEditor.tsx` component with drag-and-drop interface
- Step configuration panels for all step types
- Live preview of workflow changes
- Brain state integration for processing/success/error feedback

### v22: Scaling Documentation
- `docs/scaling.md` with comprehensive scaling patterns
- Load tier definitions and rate limit profiles
- Infrastructure scaling integration guide (K8s HPA, AWS ASG, Replit Autoscale)
- Capacity planning formulas

---

## Future Workflows (TODO)

### Planned Features
- [ ] **Zapier/Make Integration** — Connect to 3000+ apps
- [ ] **Slack Bot** — Direct workflow management from Slack
- [ ] **Mobile App** — iOS/Android workflow monitoring
- [ ] **API Marketplace** — Third-party workflow plugins
- [ ] **White-label Reseller** — Agency branded deployments

### Infrastructure Roadmap
- [ ] **Multi-region Deployment** — EU, US, APAC
- [ ] **Webhook Hub** — Unified webhook management
- [ ] **Custom Domains** — Per-tenant vanity URLs
- [ ] **SSO/SAML** — Enterprise authentication

---

## Safety Limits & Manual-Approval Requirements

### Automatic (No Approval Required)
- Workflow execution up to plan limits
- Email sending within rate limits
- API calls within quota
- Report generation
- Dashboard access

### Manual Approval Required
- **Database schema changes** — All migrations require human review
- **Billing changes** — Plan upgrades/downgrades confirmed by user
- **Data deletion** — Explicit user confirmation required
- **API key rotation** — User-initiated only
- **Account deletion** — Multi-step verification

### Rate Limits (Auto-Enforced)

| Tier | Global RPM | Chat API | Billing API |
|------|------------|----------|-------------|
| Low Load | 200 | 50 | 30 |
| Medium Load | 100 | 30 | 20 |
| High Load | 70 | 20 | 15 |
| Critical Load | 50 | 10 | 10 |

### Data Retention Policies
- **Trial Data** — Retained 30 days after trial expiry
- **Paid Plans** — Retained per plan terms (7-365 days)
- **Deleted Accounts** — 30-day grace period, then permanent deletion
- **Backup Exports** — Available on Growth+ plans

---

## Guardrails for Development

### Do Not Modify Without Explicit Approval
1. Authentication flows (NextAuth configuration)
2. Billing integration (Stripe webhooks, checkout)
3. Database schema (migration files)
4. Rate limiting rules (security_core)
5. Feature flags (environment variables)

### Safe to Modify
- UI components (styling, layout)
- Dashboard widgets (new panels)
- API endpoints (non-auth, non-billing)
- Documentation and help content
- Performance optimizations

### CI/CD Safety Gate
All changes must pass:
1. Frontend Lint (TypeScript/ESLint)
2. Frontend Build (Next.js compilation)
3. Backend Syntax (Python AST check)
4. Safety Gate (critical file protection)

---

## Support Escalation Path

| Tier | SLA | Support Level |
|------|-----|---------------|
| Launch | Best effort | AI-first + email |
| Growth | 24h response | AI + human email |
| Scale | 8h response | Priority queue |
| Agency | 4h response | Dedicated support |

---

*This document is maintained as part of PHASE 15 hardening. Update when workflows or policies change.*
