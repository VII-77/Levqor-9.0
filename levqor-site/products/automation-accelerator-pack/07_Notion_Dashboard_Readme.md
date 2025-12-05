# Notion Dashboard Setup Guide

This guide explains how to set up a Notion workspace to track your automation projects, clients, and revenue.

---

## Quick Start (5 Minutes)

### Step 1: Create Your Workspace

1. Go to [notion.so](https://notion.so) and sign in (or create a free account)
2. Click **"Add a page"** in the sidebar
3. Name it **"Automation Business HQ"**
4. Choose the **"Empty"** template

### Step 2: Create the Core Databases

You'll need 4 databases to track everything:

#### Database 1: Clients

Click **"+ Add a database"** and choose **"Table"**. Add these properties:

| Property | Type | Purpose |
|----------|------|---------|
| Client Name | Title | Company or contact name |
| Status | Select | Lead / Active / Completed / Lost |
| Contact Email | Email | Primary contact |
| First Contact | Date | When you first connected |
| Deal Value | Number (Currency) | Total project value |
| Source | Select | Referral / Outreach / Inbound |
| Notes | Text | Key details and context |

#### Database 2: Projects

Create another table database with these properties:

| Property | Type | Purpose |
|----------|------|---------|
| Project Name | Title | Descriptive name |
| Client | Relation | Link to Clients database |
| Status | Select | Discovery / Proposal / In Progress / Delivered / On Hold |
| Start Date | Date | When work began |
| Due Date | Date | Target completion |
| Value | Number (Currency) | Project revenue |
| Automations | Multi-select | List of automations included |
| Priority | Select | High / Medium / Low |

#### Database 3: Automations

Track individual automations:

| Property | Type | Purpose |
|----------|------|---------|
| Automation Name | Title | e.g., "Lead to CRM Pipeline" |
| Project | Relation | Link to Projects database |
| Status | Select | Draft / Building / Testing / Live / Paused |
| Tools | Multi-select | Zapier, Make, Notion, etc. |
| Time Saved | Number | Hours/week saved |
| Documentation | URL | Link to docs or video |

#### Database 4: Revenue Tracker

Track your earnings:

| Property | Type | Purpose |
|----------|------|---------|
| Description | Title | What the payment is for |
| Client | Relation | Link to Clients database |
| Amount | Number (Currency) | Payment amount |
| Date | Date | When received |
| Type | Select | Project / Retainer / Addon |
| Status | Select | Invoiced / Paid / Overdue |

---

## Setting Up Views

### Clients Database Views

1. **Pipeline View** — Kanban by Status
   - Drag clients through Lead → Active → Completed
   
2. **Revenue View** — Table sorted by Deal Value (descending)
   - See your highest-value clients at a glance

3. **Recent View** — Table filtered to Last 30 Days
   - Focus on active opportunities

### Projects Database Views

1. **Active Projects** — Kanban by Status, filtered to exclude Completed
   - Your daily working view

2. **Calendar** — Timeline by Due Date
   - See deadlines at a glance

3. **By Client** — Table grouped by Client relation
   - See all work for each client

### Automations Database Views

1. **By Status** — Kanban by Status
   - Track automation progress

2. **By Project** — Table grouped by Project relation
   - See automations per project

---

## Useful Formulas

### Calculate Project Health

Add a Formula property called "Health" to Projects:

```
if(prop("Status") == "In Progress" and prop("Due Date") < now(), "⚠️ At Risk", if(prop("Status") == "Delivered", "✅ Complete", "🔄 On Track"))
```

### Calculate Days Until Due

Add a Formula property called "Days Left":

```
if(prop("Due Date") > now(), dateBetween(prop("Due Date"), now(), "days"), 0)
```

### Calculate Monthly Revenue

In Revenue Tracker, create a new view filtered to current month, then use the built-in "Sum" at the bottom of the Amount column.

---

## Automation Ideas for Your Dashboard

Connect Notion to your other tools using the templates from `02_Workflow_Templates.json`:

### Auto-Create Client Record

When someone books a call (Calendly) → Create new entry in Clients database

### Auto-Create Project

When a proposal is accepted (Stripe payment) → Create new entry in Projects database with status "In Progress"

### Auto-Log Payments

When payment received (Stripe) → Create entry in Revenue Tracker

### Weekly Summary

Every Monday → Send Slack/email digest of active projects and revenue MTD

---

## Templates to Duplicate

### Client Meeting Notes Template

Create a template page in your Clients database with:

```
## Meeting Notes — [Date]

### Attendees
- 

### Key Discussion Points
- 

### Action Items
- [ ] 

### Next Steps
```

### Project Kickoff Template

Create a template page in your Projects database with:

```
## Project Overview

**Client:** 
**Start Date:** 
**Due Date:** 
**Value:** 

## Scope

### Included Automations
1. 
2. 
3. 

### Out of Scope
- 

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Discovery | 2 days | |
| Build | 5 days | |
| Test | 2 days | |
| Deploy | 1 day | |

## Access & Credentials

| Tool | Access Type | Notes |
|------|-------------|-------|
| | | |

## Deliverables
- [ ] Automation 1 live
- [ ] Automation 2 live
- [ ] Documentation
- [ ] Training call
```

---

## Best Practices

1. **Update daily** — Spend 5 minutes each morning updating project statuses
2. **Log everything** — Add notes after every client call
3. **Use relations** — Connect databases so data flows together
4. **Create dashboards** — Build a homepage with linked views of each database
5. **Set reminders** — Use Notion's reminder feature for follow-ups

---

## Need Help?

- **Notion Help Center:** [notion.so/help](https://notion.so/help)
- **Notion Templates Gallery:** Browse for inspiration
- **YouTube Tutorials:** Search "Notion CRM setup" for video guides

Your automation business deserves a solid foundation. This dashboard will help you stay organized as you scale.
