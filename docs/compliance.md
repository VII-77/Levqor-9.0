# Levqor Compliance Baseline

**Version:** v23.0 (Legal-0 Scaffold)  
**Last Updated:** November 25, 2025  
**Status:** Baseline Documentation (Non-Certified)

---

## Important Notice

This document describes Levqor's data protection practices and compliance posture. **This is a baseline document and does NOT represent formal certification** under any regulatory framework. Organizations with specific compliance requirements should conduct independent audits.

---

## Data Protection Overview

Levqor handles the following categories of data:

| Data Category | Description | Retention |
|--------------|-------------|-----------|
| Account Data | Email, name, company, preferences | Until account deletion + 30 days |
| Billing Data | Payment info (via Stripe), invoices | Per legal requirements (typically 7 years) |
| Workflow Data | Workflow definitions, execution logs | Per plan tier (7-365 days) |
| Usage Data | API calls, feature usage, metrics | 90 days rolling |
| Support Data | Tickets, chat logs | 2 years |

### Data Storage

- **Database**: PostgreSQL hosted on Replit infrastructure
- **Payment Processing**: Stripe (PCI DSS compliant)
- **File Storage**: Encrypted at rest
- **Backups**: Daily automated backups with 30-day retention

---

## GDPR/CCPA Intent (Non-Certified)

Levqor aims to operate in accordance with GDPR and CCPA principles:

### GDPR Principles Addressed

| Principle | Implementation |
|-----------|---------------|
| Lawfulness | Processing based on consent or legitimate interest |
| Purpose Limitation | Data used only for stated purposes |
| Data Minimization | Collect only necessary data |
| Accuracy | Users can update their information |
| Storage Limitation | Defined retention periods |
| Integrity & Confidentiality | Encryption, access controls |
| Accountability | Audit logging, documentation |

### CCPA Rights Supported

- Right to Know (data export)
- Right to Delete (account deletion)
- Right to Opt-Out (marketing preferences)
- Non-Discrimination (equal service regardless of choices)

**Note**: Levqor is not formally certified under GDPR or CCPA. Users requiring certified compliance should verify independently.

---

## Data Subject Rights (Export/Delete)

### Data Export

Users can request a full export of their data:

- **Endpoint**: `GET /api/me/export-data` (authenticated)
- **Classification**: Class C (requires approval for bulk operations)
- **Format**: JSON bundle containing account, workflows, and activity data
- **Processing**: Request logged, data compiled, delivered via secure download

### Data Deletion

Users can request account and data deletion:

- **Endpoint**: `POST /api/me/delete-data` (authenticated)
- **Classification**: Class C (requires manual approval)
- **Process**:
  1. Request submitted to approval queue
  2. 30-day grace period (can cancel)
  3. PII fields cleared/pseudonymized
  4. Structural logs retained with hashed identifiers
  5. Billing data retained per legal requirements

### How to Exercise Rights

1. **Self-Service**: Dashboard settings (coming soon)
2. **API**: Use authenticated endpoints above
3. **Email**: Contact privacy@levqor.ai with your request

---

## Logging & Pseudonymization

### Log Hygiene Rules

Levqor logs do NOT store:

- Raw email addresses in workflow logs
- Full names in execution events
- Full message bodies or sensitive payloads
- Passwords or API keys (even hashed)

### What IS Logged

- Truncated/hashed user identifiers (e.g., `usr_a1b2***`)
- Action types and timestamps
- Error codes (not full stack traces in production)
- Workflow IDs and step types

### Pseudonymization

When data deletion is requested:

- User identifiers replaced with pseudonymous hashes
- Email fields cleared or replaced with `[redacted]`
- Names replaced with `User <hash>`
- Historical logs retained for audit but de-identified

---

## Approval Model (Class A/B/C)

Levqor uses an impact classification system for automated actions:

| Class | Impact Level | Approval Required | Examples |
|-------|--------------|-------------------|----------|
| **A** | Safe | No | Internal logs, analytics queries |
| **B** | Low Risk | No (logged) | Workflow creation, template usage |
| **C** | Critical | **Yes** | Email sending, data export/delete, external HTTP calls |

### Class C Actions

The following actions require manual approval:

- Sending emails to external recipients
- Making HTTP requests to external URLs
- Exporting user data bundles
- Deleting user accounts/data
- Billing changes (plan upgrades/downgrades)
- Marketing campaign sends

### Approval Queue

- All Class C actions enter the approval queue
- Administrators review pending actions in the dashboard
- Actions can be approved, rejected, or modified
- Full audit trail maintained

---

## Cookie Policy

### Current Cookie Behavior

| Cookie Type | Purpose | Required |
|-------------|---------|----------|
| Session | Authentication, CSRF protection | Yes |
| Preferences | Language, theme settings | Yes |
| Analytics | Usage patterns (if consented) | No |
| Functional | Feature enhancements (if consented) | No |

### Third-Party Trackers

Levqor does NOT use:

- Third-party advertising cookies
- Social media tracking pixels
- Cross-site tracking mechanisms

### Consent

- Cookie banner displayed on first visit
- Users can choose "Accept All" or "Essential Only"
- Consent stored locally, respected across sessions
- Detailed cookie information at `/cookies`

---

## Non-Covered Areas

Levqor is NOT certified for:

| Standard | Status | Notes |
|----------|--------|-------|
| SOC 2 Type II | Not Certified | Infrastructure relies on Replit/Vercel |
| HIPAA | Not Compliant | Do not store PHI |
| PCI DSS | Via Stripe | Payment processing handled by Stripe |
| ISO 27001 | Not Certified | No formal ISMS |
| FedRAMP | Not Certified | Not designed for government use |

### Recommendations

Organizations requiring these certifications should:

1. Conduct independent security assessments
2. Review infrastructure provider certifications
3. Consider enterprise agreements with additional controls
4. Contact enterprise@levqor.ai for custom compliance arrangements

---

## Security Controls

### Authentication

- NextAuth with multiple providers (Google, Microsoft, Email)
- JWT sessions with 1-hour expiry
- Email domain denylist for spam prevention
- Rate limiting on auth endpoints

### Access Control

- Role-based access (user, admin)
- Tenant isolation for multi-tenant deployments
- API key authentication for programmatic access

### Infrastructure

- HTTPS everywhere (TLS 1.3)
- Database encryption at rest
- Network isolation via hosting provider
- Regular security patches

---

## Incident Response

### Process

1. **Detection**: Automated monitoring, user reports
2. **Triage**: Severity assessment (P1-P4)
3. **Containment**: Isolate affected systems
4. **Investigation**: Root cause analysis
5. **Remediation**: Fix and verify
6. **Notification**: Affected users notified within 72 hours for data breaches
7. **Post-Mortem**: Document and improve

### Contact

Security issues: security@levqor.ai  
Privacy concerns: privacy@levqor.ai

---

## Updates to This Document

This compliance baseline will be updated as:

- New features are added
- Regulations change
- Security practices evolve

Check the version and date at the top of this document for the latest revision.

---

*This document is part of MEGA PHASE Legal-0. It provides a compliance baseline, not certification.*
