"""
Growth Engine Templates - MEGA PHASE v11-v14
Provides starter workflow templates for quick onboarding
"""
from typing import List, Dict, Optional

TEMPLATE_CATEGORIES = [
    "lead_capture",
    "customer_support",
    "reporting",
    "data_sync",
    "notifications",
    "sales_automation"
]

STARTER_TEMPLATES: List[Dict] = [
    {
        "id": "tpl_lead_capture_form",
        "name": "Lead Capture Form Automation",
        "category": "lead_capture",
        "description": "Automatically capture leads from web forms, enrich with company data, and add to CRM.",
        "difficulty": "beginner",
        "estimated_time_minutes": 15,
        "triggers": ["form_submission", "webhook"],
        "integrations": ["crm", "enrichment"]
    },
    {
        "id": "tpl_email_responder",
        "name": "Smart Email Auto-Responder",
        "category": "customer_support",
        "description": "AI-powered email responder that categorizes inquiries and sends contextual replies.",
        "difficulty": "intermediate",
        "estimated_time_minutes": 30,
        "triggers": ["email_received"],
        "integrations": ["email", "ai"]
    },
    {
        "id": "tpl_weekly_analytics",
        "name": "Weekly Analytics Report",
        "category": "reporting",
        "description": "Generate and send weekly analytics summaries to stakeholders automatically.",
        "difficulty": "beginner",
        "estimated_time_minutes": 20,
        "triggers": ["schedule_weekly"],
        "integrations": ["analytics", "email"]
    },
    {
        "id": "tpl_crm_sync",
        "name": "CRM Data Sync",
        "category": "data_sync",
        "description": "Keep your CRM in sync with other tools. Bi-directional sync for contacts and deals.",
        "difficulty": "intermediate",
        "estimated_time_minutes": 25,
        "triggers": ["data_change", "schedule"],
        "integrations": ["crm", "database"]
    },
    {
        "id": "tpl_slack_alerts",
        "name": "Slack Alert Notifications",
        "category": "notifications",
        "description": "Send smart notifications to Slack channels based on business events.",
        "difficulty": "beginner",
        "estimated_time_minutes": 10,
        "triggers": ["event", "threshold"],
        "integrations": ["slack", "monitoring"]
    },
    {
        "id": "tpl_invoice_followup",
        "name": "Invoice Follow-up Automation",
        "category": "sales_automation",
        "description": "Automatically follow up on unpaid invoices with escalating reminder sequences.",
        "difficulty": "intermediate",
        "estimated_time_minutes": 35,
        "triggers": ["schedule_daily", "invoice_overdue"],
        "integrations": ["billing", "email"]
    },
    {
        "id": "tpl_customer_onboarding",
        "name": "Customer Onboarding Flow",
        "category": "customer_support",
        "description": "Guided onboarding sequence with drip emails and milestone tracking.",
        "difficulty": "intermediate",
        "estimated_time_minutes": 40,
        "triggers": ["signup", "milestone"],
        "integrations": ["email", "crm", "analytics"]
    },
    {
        "id": "tpl_social_monitor",
        "name": "Social Media Monitor",
        "category": "lead_capture",
        "description": "Monitor social media mentions and capture leads from engagement.",
        "difficulty": "advanced",
        "estimated_time_minutes": 45,
        "triggers": ["social_mention", "schedule"],
        "integrations": ["social", "crm", "ai"]
    }
]


def get_starter_templates(category: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict]:
    templates = STARTER_TEMPLATES
    
    if category:
        templates = [t for t in templates if t["category"] == category]
    
    if difficulty:
        templates = [t for t in templates if t["difficulty"] == difficulty]
    
    return templates


def get_template_by_id(template_id: str) -> Optional[Dict]:
    for template in STARTER_TEMPLATES:
        if template["id"] == template_id:
            return template
    return None


def get_categories() -> List[str]:
    return TEMPLATE_CATEGORIES


def get_templates_by_integration(integration: str) -> List[Dict]:
    return [
        t for t in STARTER_TEMPLATES 
        if integration in t.get("integrations", [])
    ]
