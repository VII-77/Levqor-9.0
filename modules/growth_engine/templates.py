"""
Growth Engine Templates - MEGA PHASE v19-v22
Provides starter workflow templates for quick onboarding.
Expanded template marketplace with 20+ templates across multiple categories.
"""
from typing import List, Dict, Optional

TEMPLATE_CATEGORIES = [
    {"id": "lead_capture", "name": "Lead Capture", "icon": "target"},
    {"id": "sales_automation", "name": "Sales Automation", "icon": "trending-up"},
    {"id": "customer_support", "name": "Customer Support", "icon": "message-circle"},
    {"id": "reporting", "name": "Reporting & KPIs", "icon": "bar-chart"},
    {"id": "data_sync", "name": "Data Sync", "icon": "refresh-cw"},
    {"id": "notifications", "name": "Notifications", "icon": "bell"},
    {"id": "onboarding", "name": "Onboarding Flows", "icon": "user-plus"},
    {"id": "ecommerce", "name": "E-commerce", "icon": "shopping-cart"},
    {"id": "internal_ops", "name": "Internal Operations", "icon": "settings"}
]

DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"]

STARTER_TEMPLATES: List[Dict] = [
    {
        "id": "tpl_lead_capture_form",
        "name": "Lead Capture Form Automation",
        "category": "lead_capture",
        "description": "Automatically capture leads from web forms, enrich with company data, and add to CRM.",
        "difficulty": "beginner",
        "recommended_audience": ["agencies", "saas", "consultants"],
        "tags": ["forms", "crm", "enrichment", "leads"],
        "estimated_setup_time": "15 min",
        "estimated_time_minutes": 15,
        "triggers": ["form_submission", "webhook"],
        "integrations": ["crm", "enrichment"],
        "steps_preview": [
            {"type": "trigger", "label": "Form submission received"},
            {"type": "action", "label": "Enrich lead data"},
            {"type": "action", "label": "Add to CRM"}
        ]
    },
    {
        "id": "tpl_email_responder",
        "name": "Smart Email Auto-Responder",
        "category": "customer_support",
        "description": "AI-powered email responder that categorizes inquiries and sends contextual replies.",
        "difficulty": "intermediate",
        "recommended_audience": ["support teams", "agencies", "ecommerce"],
        "tags": ["email", "ai", "support", "automation"],
        "estimated_setup_time": "30 min",
        "estimated_time_minutes": 30,
        "triggers": ["email_received"],
        "integrations": ["email", "ai"],
        "steps_preview": [
            {"type": "trigger", "label": "Email received"},
            {"type": "action", "label": "AI categorization"},
            {"type": "condition", "label": "Route by category"},
            {"type": "action", "label": "Send contextual reply"}
        ]
    },
    {
        "id": "tpl_weekly_analytics",
        "name": "Weekly Analytics Report",
        "category": "reporting",
        "description": "Generate and send weekly analytics summaries to stakeholders automatically.",
        "difficulty": "beginner",
        "recommended_audience": ["marketing", "executives", "agencies"],
        "tags": ["analytics", "reports", "email", "scheduled"],
        "estimated_setup_time": "20 min",
        "estimated_time_minutes": 20,
        "triggers": ["schedule_weekly"],
        "integrations": ["analytics", "email"],
        "steps_preview": [
            {"type": "trigger", "label": "Weekly schedule (Monday 9am)"},
            {"type": "action", "label": "Fetch analytics data"},
            {"type": "action", "label": "Generate report"},
            {"type": "action", "label": "Email to stakeholders"}
        ]
    },
    {
        "id": "tpl_crm_sync",
        "name": "CRM Data Sync",
        "category": "data_sync",
        "description": "Keep your CRM in sync with other tools. Bi-directional sync for contacts and deals.",
        "difficulty": "intermediate",
        "recommended_audience": ["sales teams", "operations", "agencies"],
        "tags": ["crm", "sync", "contacts", "deals"],
        "estimated_setup_time": "25 min",
        "estimated_time_minutes": 25,
        "triggers": ["data_change", "schedule"],
        "integrations": ["crm", "database"],
        "steps_preview": [
            {"type": "trigger", "label": "Contact updated"},
            {"type": "action", "label": "Sync to destination"},
            {"type": "action", "label": "Log sync result"}
        ]
    },
    {
        "id": "tpl_slack_alerts",
        "name": "Slack Alert Notifications",
        "category": "notifications",
        "description": "Send smart notifications to Slack channels based on business events.",
        "difficulty": "beginner",
        "recommended_audience": ["teams", "developers", "operations"],
        "tags": ["slack", "notifications", "alerts", "real-time"],
        "estimated_setup_time": "10 min",
        "estimated_time_minutes": 10,
        "triggers": ["event", "threshold"],
        "integrations": ["slack", "monitoring"],
        "steps_preview": [
            {"type": "trigger", "label": "Event triggered"},
            {"type": "action", "label": "Format message"},
            {"type": "action", "label": "Post to Slack"}
        ]
    },
    {
        "id": "tpl_invoice_followup",
        "name": "Invoice Follow-up Automation",
        "category": "sales_automation",
        "description": "Automatically follow up on unpaid invoices with escalating reminder sequences.",
        "difficulty": "intermediate",
        "recommended_audience": ["finance", "agencies", "freelancers"],
        "tags": ["invoices", "billing", "reminders", "collections"],
        "estimated_setup_time": "35 min",
        "estimated_time_minutes": 35,
        "triggers": ["schedule_daily", "invoice_overdue"],
        "integrations": ["billing", "email"],
        "steps_preview": [
            {"type": "trigger", "label": "Invoice overdue"},
            {"type": "condition", "label": "Check days overdue"},
            {"type": "action", "label": "Send reminder"},
            {"type": "action", "label": "Update invoice status"}
        ]
    },
    {
        "id": "tpl_customer_onboarding",
        "name": "Customer Onboarding Flow",
        "category": "onboarding",
        "description": "Guided onboarding sequence with drip emails and milestone tracking.",
        "difficulty": "intermediate",
        "recommended_audience": ["saas", "agencies", "services"],
        "tags": ["onboarding", "drip", "milestones", "customer-success"],
        "estimated_setup_time": "40 min",
        "estimated_time_minutes": 40,
        "triggers": ["signup", "milestone"],
        "integrations": ["email", "crm", "analytics"],
        "steps_preview": [
            {"type": "trigger", "label": "New signup"},
            {"type": "action", "label": "Send welcome email"},
            {"type": "delay", "label": "Wait 2 days"},
            {"type": "action", "label": "Check activation"},
            {"type": "condition", "label": "Activated?"},
            {"type": "action", "label": "Send next step email"}
        ]
    },
    {
        "id": "tpl_social_monitor",
        "name": "Social Media Monitor",
        "category": "lead_capture",
        "description": "Monitor social media mentions and capture leads from engagement.",
        "difficulty": "advanced",
        "recommended_audience": ["marketing", "agencies", "brands"],
        "tags": ["social", "monitoring", "leads", "engagement"],
        "estimated_setup_time": "45 min",
        "estimated_time_minutes": 45,
        "triggers": ["social_mention", "schedule"],
        "integrations": ["social", "crm", "ai"],
        "steps_preview": [
            {"type": "trigger", "label": "Brand mention detected"},
            {"type": "action", "label": "Analyze sentiment"},
            {"type": "condition", "label": "Positive sentiment?"},
            {"type": "action", "label": "Engage or capture lead"}
        ]
    },
    {
        "id": "tpl_daily_kpi_dashboard",
        "name": "Daily KPI Dashboard Update",
        "category": "reporting",
        "description": "Automatically update your KPI dashboard with fresh data every morning.",
        "difficulty": "beginner",
        "recommended_audience": ["executives", "operations", "marketing"],
        "tags": ["kpi", "dashboard", "daily", "metrics"],
        "estimated_setup_time": "20 min",
        "estimated_time_minutes": 20,
        "triggers": ["schedule_daily"],
        "integrations": ["analytics", "sheets", "database"],
        "steps_preview": [
            {"type": "trigger", "label": "Daily at 7am"},
            {"type": "action", "label": "Fetch KPIs from sources"},
            {"type": "action", "label": "Update dashboard"},
            {"type": "action", "label": "Post summary to Slack"}
        ]
    },
    {
        "id": "tpl_sales_followup_sequence",
        "name": "Sales Follow-up Sequence",
        "category": "sales_automation",
        "description": "Automated follow-up sequence for sales leads with personalized touches.",
        "difficulty": "intermediate",
        "recommended_audience": ["sales", "agencies", "consultants"],
        "tags": ["sales", "follow-up", "sequence", "personalization"],
        "estimated_setup_time": "30 min",
        "estimated_time_minutes": 30,
        "triggers": ["lead_created", "deal_stage_change"],
        "integrations": ["crm", "email", "ai"],
        "steps_preview": [
            {"type": "trigger", "label": "New lead added"},
            {"type": "action", "label": "Send intro email"},
            {"type": "delay", "label": "Wait 3 days"},
            {"type": "condition", "label": "Replied?"},
            {"type": "action", "label": "Send follow-up"}
        ]
    },
    {
        "id": "tpl_support_ticket_triage",
        "name": "Support Ticket Triage",
        "category": "customer_support",
        "description": "AI-powered ticket categorization and routing to the right team.",
        "difficulty": "intermediate",
        "recommended_audience": ["support teams", "saas", "ecommerce"],
        "tags": ["support", "tickets", "triage", "routing"],
        "estimated_setup_time": "25 min",
        "estimated_time_minutes": 25,
        "triggers": ["ticket_created"],
        "integrations": ["helpdesk", "ai", "slack"],
        "steps_preview": [
            {"type": "trigger", "label": "New ticket created"},
            {"type": "action", "label": "AI categorize ticket"},
            {"type": "condition", "label": "Route by category"},
            {"type": "action", "label": "Assign to team"},
            {"type": "action", "label": "Notify via Slack"}
        ]
    },
    {
        "id": "tpl_order_confirmation",
        "name": "Order Confirmation & Updates",
        "category": "ecommerce",
        "description": "Send order confirmations and shipping updates automatically.",
        "difficulty": "beginner",
        "recommended_audience": ["ecommerce", "retail", "d2c"],
        "tags": ["orders", "confirmation", "shipping", "notifications"],
        "estimated_setup_time": "15 min",
        "estimated_time_minutes": 15,
        "triggers": ["order_placed", "shipment_update"],
        "integrations": ["ecommerce", "email", "sms"],
        "steps_preview": [
            {"type": "trigger", "label": "Order placed"},
            {"type": "action", "label": "Send confirmation email"},
            {"type": "trigger", "label": "Shipment update"},
            {"type": "action", "label": "Notify customer"}
        ]
    },
    {
        "id": "tpl_abandoned_cart",
        "name": "Abandoned Cart Recovery",
        "category": "ecommerce",
        "description": "Win back customers who abandoned their cart with automated reminders.",
        "difficulty": "intermediate",
        "recommended_audience": ["ecommerce", "d2c", "retail"],
        "tags": ["cart", "recovery", "email", "revenue"],
        "estimated_setup_time": "30 min",
        "estimated_time_minutes": 30,
        "triggers": ["cart_abandoned"],
        "integrations": ["ecommerce", "email", "discount"],
        "steps_preview": [
            {"type": "trigger", "label": "Cart abandoned (1 hour)"},
            {"type": "action", "label": "Send reminder email"},
            {"type": "delay", "label": "Wait 24 hours"},
            {"type": "condition", "label": "Still abandoned?"},
            {"type": "action", "label": "Send discount offer"}
        ]
    },
    {
        "id": "tpl_team_standup",
        "name": "Daily Team Standup Bot",
        "category": "internal_ops",
        "description": "Collect daily standups from team members and post summary to Slack.",
        "difficulty": "beginner",
        "recommended_audience": ["teams", "remote", "engineering"],
        "tags": ["standup", "team", "slack", "daily"],
        "estimated_setup_time": "15 min",
        "estimated_time_minutes": 15,
        "triggers": ["schedule_daily"],
        "integrations": ["slack", "forms"],
        "steps_preview": [
            {"type": "trigger", "label": "Daily at 9am"},
            {"type": "action", "label": "Send standup prompts"},
            {"type": "delay", "label": "Wait 2 hours"},
            {"type": "action", "label": "Compile responses"},
            {"type": "action", "label": "Post summary to Slack"}
        ]
    },
    {
        "id": "tpl_expense_approval",
        "name": "Expense Approval Workflow",
        "category": "internal_ops",
        "description": "Route expense requests to managers for approval with escalation.",
        "difficulty": "intermediate",
        "recommended_audience": ["finance", "hr", "operations"],
        "tags": ["expenses", "approval", "workflow", "finance"],
        "estimated_setup_time": "25 min",
        "estimated_time_minutes": 25,
        "triggers": ["expense_submitted"],
        "integrations": ["forms", "email", "slack"],
        "steps_preview": [
            {"type": "trigger", "label": "Expense submitted"},
            {"type": "condition", "label": "Amount > $500?"},
            {"type": "action", "label": "Route to manager"},
            {"type": "delay", "label": "Wait for approval"},
            {"type": "action", "label": "Notify submitter"}
        ]
    },
    {
        "id": "tpl_review_request",
        "name": "Customer Review Request",
        "category": "sales_automation",
        "description": "Request reviews from satisfied customers at the right moment.",
        "difficulty": "beginner",
        "recommended_audience": ["ecommerce", "saas", "services"],
        "tags": ["reviews", "feedback", "email", "reputation"],
        "estimated_setup_time": "20 min",
        "estimated_time_minutes": 20,
        "triggers": ["order_delivered", "milestone_reached"],
        "integrations": ["ecommerce", "email", "reviews"],
        "steps_preview": [
            {"type": "trigger", "label": "Order delivered"},
            {"type": "delay", "label": "Wait 7 days"},
            {"type": "action", "label": "Send review request"},
            {"type": "condition", "label": "Review submitted?"},
            {"type": "action", "label": "Thank customer"}
        ]
    },
    {
        "id": "tpl_contract_renewal",
        "name": "Contract Renewal Reminders",
        "category": "sales_automation",
        "description": "Automated reminders for upcoming contract renewals with escalation.",
        "difficulty": "intermediate",
        "recommended_audience": ["sales", "account management", "agencies"],
        "tags": ["contracts", "renewals", "reminders", "retention"],
        "estimated_setup_time": "25 min",
        "estimated_time_minutes": 25,
        "triggers": ["schedule_daily"],
        "integrations": ["crm", "email", "calendar"],
        "steps_preview": [
            {"type": "trigger", "label": "Daily check"},
            {"type": "condition", "label": "Renewal in 30 days?"},
            {"type": "action", "label": "Notify account manager"},
            {"type": "action", "label": "Schedule renewal call"}
        ]
    },
    {
        "id": "tpl_new_employee_onboarding",
        "name": "New Employee Onboarding",
        "category": "onboarding",
        "description": "Automated onboarding checklist and welcome sequence for new hires.",
        "difficulty": "intermediate",
        "recommended_audience": ["hr", "operations", "growing teams"],
        "tags": ["hr", "onboarding", "employees", "checklist"],
        "estimated_setup_time": "35 min",
        "estimated_time_minutes": 35,
        "triggers": ["employee_added"],
        "integrations": ["hr", "email", "slack", "calendar"],
        "steps_preview": [
            {"type": "trigger", "label": "New employee added"},
            {"type": "action", "label": "Send welcome packet"},
            {"type": "action", "label": "Create accounts"},
            {"type": "action", "label": "Schedule training"},
            {"type": "action", "label": "Notify team"}
        ]
    },
    {
        "id": "tpl_inventory_alerts",
        "name": "Low Inventory Alerts",
        "category": "ecommerce",
        "description": "Get notified when inventory drops below threshold levels.",
        "difficulty": "beginner",
        "recommended_audience": ["ecommerce", "retail", "warehouse"],
        "tags": ["inventory", "alerts", "stock", "notifications"],
        "estimated_setup_time": "15 min",
        "estimated_time_minutes": 15,
        "triggers": ["inventory_change", "schedule_hourly"],
        "integrations": ["ecommerce", "slack", "email"],
        "steps_preview": [
            {"type": "trigger", "label": "Inventory updated"},
            {"type": "condition", "label": "Below threshold?"},
            {"type": "action", "label": "Alert team"},
            {"type": "action", "label": "Create reorder task"}
        ]
    },
    {
        "id": "tpl_content_publishing",
        "name": "Content Publishing Pipeline",
        "category": "internal_ops",
        "description": "Automated content review and publishing workflow with approvals.",
        "difficulty": "advanced",
        "recommended_audience": ["marketing", "content teams", "agencies"],
        "tags": ["content", "publishing", "approval", "workflow"],
        "estimated_setup_time": "40 min",
        "estimated_time_minutes": 40,
        "triggers": ["content_submitted"],
        "integrations": ["cms", "slack", "email"],
        "steps_preview": [
            {"type": "trigger", "label": "Content submitted"},
            {"type": "action", "label": "Notify reviewers"},
            {"type": "delay", "label": "Wait for approval"},
            {"type": "condition", "label": "Approved?"},
            {"type": "action", "label": "Schedule publish"}
        ]
    }
]


def get_starter_templates(
    category: Optional[str] = None, 
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict]:
    """Get templates with optional filtering."""
    templates = STARTER_TEMPLATES
    
    if category:
        templates = [t for t in templates if t["category"] == category]
    
    if difficulty:
        templates = [t for t in templates if t["difficulty"] == difficulty]
    
    if tag:
        templates = [t for t in templates if tag.lower() in [tg.lower() for tg in t.get("tags", [])]]
    
    if search:
        search_lower = search.lower()
        templates = [
            t for t in templates 
            if search_lower in t["name"].lower() 
            or search_lower in t["description"].lower()
            or any(search_lower in tag.lower() for tag in t.get("tags", []))
        ]
    
    return templates


def get_template_by_id(template_id: str) -> Optional[Dict]:
    """Get a single template by ID."""
    for template in STARTER_TEMPLATES:
        if template["id"] == template_id:
            return template
    return None


def get_categories() -> List[Dict]:
    """Get all template categories with metadata."""
    return TEMPLATE_CATEGORIES


def get_category_ids() -> List[str]:
    """Get just category IDs for filtering."""
    return [c["id"] for c in TEMPLATE_CATEGORIES]


def get_difficulty_levels() -> List[str]:
    """Get available difficulty levels."""
    return DIFFICULTY_LEVELS


def get_templates_by_integration(integration: str) -> List[Dict]:
    """Get templates that use a specific integration."""
    return [
        t for t in STARTER_TEMPLATES 
        if integration.lower() in [i.lower() for i in t.get("integrations", [])]
    ]


def get_templates_by_audience(audience: str) -> List[Dict]:
    """Get templates recommended for a specific audience."""
    audience_lower = audience.lower()
    return [
        t for t in STARTER_TEMPLATES
        if any(audience_lower in a.lower() for a in t.get("recommended_audience", []))
    ]


def get_template_count() -> int:
    """Get total number of templates."""
    return len(STARTER_TEMPLATES)


def get_templates_summary() -> Dict:
    """Get summary statistics about templates."""
    return {
        "total": len(STARTER_TEMPLATES),
        "by_category": {
            cat["id"]: len([t for t in STARTER_TEMPLATES if t["category"] == cat["id"]])
            for cat in TEMPLATE_CATEGORIES
        },
        "by_difficulty": {
            level: len([t for t in STARTER_TEMPLATES if t["difficulty"] == level])
            for level in DIFFICULTY_LEVELS
        }
    }
