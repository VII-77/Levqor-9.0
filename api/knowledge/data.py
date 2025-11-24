"""
Knowledge Base Data - Core Articles
MEGA-PHASE 6 - In-memory knowledge base (no external SaaS, no DB changes)
"""

KNOWLEDGE_BASE = [
    {
        "id": "kb-001",
        "slug": "getting-started",
        "title": "Getting Started with Levqor",
        "category": "Getting Started",
        "language": "en",
        "body": (
            "Levqor is an automation platform that helps you build workflows to handle repetitive tasks. "
            "Start by creating your first workflow in the Dashboard, connecting your tools, and defining "
            "triggers and actions. All plans include a 7-day free trial with full access to features."
        )
    },
    {
        "id": "kb-002",
        "slug": "workflows-and-runs",
        "title": "How Workflows & Runs Work",
        "category": "Core Concepts",
        "language": "en",
        "body": (
            "A workflow is a set of automated steps that run when triggered. Each execution is called a 'run'. "
            "Workflows consist of: (1) Triggers - when to run, (2) Conditions - optional filters, "
            "(3) Actions - what to do. You can test workflows before activating them, and view run history "
            "in the Usage section."
        )
    },
    {
        "id": "kb-003",
        "slug": "billing-and-plans",
        "title": "Billing and Plans Overview",
        "category": "Billing",
        "language": "en",
        "body": (
            "Levqor offers 4 pricing tiers: Starter (£9/mo), Growth (£29/mo), Business (£59/mo), "
            "and Agency (£149/mo). All plans include a 7-day free trial. You can upgrade, downgrade, "
            "or cancel anytime. Card required for trial, but you won't be charged if you cancel before Day 7. "
            "We offer Done-For-You packages for one-time setup assistance."
        )
    },
    {
        "id": "kb-004",
        "slug": "integrations-and-api-keys",
        "title": "Integrations and API Keys",
        "category": "Integrations",
        "language": "en",
        "body": (
            "Levqor connects to popular tools like Stripe, email providers, CRMs, and more. "
            "To add an integration: go to Dashboard → Integrations, select the service, and follow "
            "the OAuth flow or enter your API key. API keys are encrypted and never shared. "
            "Test integrations before using them in production workflows."
        )
    },
    {
        "id": "kb-005",
        "slug": "security-and-compliance",
        "title": "Security and Compliance Overview",
        "category": "Security",
        "language": "en",
        "body": (
            "Levqor takes security seriously. All data is encrypted at rest and in transit. "
            "We comply with GDPR and offer data export/deletion on request. API keys and secrets "
            "are stored securely and never logged. For enterprise security features, see our "
            "Business and Agency plans. Contact security@levqor.ai for security inquiries."
        )
    },
    {
        "id": "kb-006",
        "slug": "workflow-limits-and-quotas",
        "title": "Workflow Limits and Quotas",
        "category": "Core Concepts",
        "language": "en",
        "body": (
            "Workflow limits vary by plan: Starter (10 workflows), Growth (50 workflows), "
            "Business (200 workflows), Agency (unlimited). Run quotas are generous and scale with your tier. "
            "You can add extra capacity with the Extra Workflow Pack add-on (+50 workflows for £10/mo). "
            "Check your current usage in Dashboard → Usage."
        )
    },
    {
        "id": "kb-007",
        "slug": "support-and-sla",
        "title": "Support and SLA Information",
        "category": "Support",
        "language": "en",
        "body": (
            "Support response times: Starter (48h), Growth (24h), Business (12h), Agency (4h). "
            "Contact support via Dashboard → Support or email support@levqor.ai. "
            "For urgent issues on Business+ plans, use priority support channels. "
            "Check system status at levqor.ai/status."
        )
    },
    {
        "id": "kb-008",
        "slug": "ai-features-overview",
        "title": "AI Features: Chat, Workflow Builder, Debug Assistant",
        "category": "AI Features",
        "language": "en",
        "body": (
            "Levqor includes AI-powered features to help you: (1) AI Chat - contextual help and Q&A, "
            "(2) Natural Language Workflow Builder - describe workflows in plain English, "
            "(3) Debug Assistant - analyze errors and get solutions, (4) Onboarding Tutor - guided setup. "
            "All AI features are included in your plan at no extra cost."
        )
    },
    {
        "id": "kb-009",
        "slug": "data-retention-and-backup",
        "title": "Data Retention and Backup Policies",
        "category": "Data Management",
        "language": "en",
        "body": (
            "Levqor automatically backs up your workflow configurations and run logs. "
            "Retention periods: Workflow configs (forever), Run logs (90 days on Starter/Growth, "
            "1 year on Business/Agency). You can export your data anytime from Dashboard → Settings → Export. "
            "Deleted workflows are retained for 30 days before permanent deletion."
        )
    },
    {
        "id": "kb-010",
        "slug": "trial-to-paid-conversion",
        "title": "Converting from Trial to Paid Plan",
        "category": "Billing",
        "language": "en",
        "body": (
            "Your trial automatically converts to a paid plan on Day 8 if you don't cancel. "
            "To avoid charges, cancel before Day 7 ends. If you cancel during trial, you keep access "
            "until Day 7, then your account becomes view-only. You can reactivate anytime by choosing "
            "a paid plan. All your workflows and data are preserved."
        )
    }
]


def search_articles(query, category=None):
    """
    Simple fuzzy search over knowledge base articles with case-insensitive matching.
    
    Args:
        query: Search string
        category: Optional category filter
    
    Returns:
        List of matching articles (up to 10)
    """
    # CRITICAL FIX: Normalize query to lowercase for case-insensitive search
    query_lower = query.lower().strip()
    results = []
    
    for article in KNOWLEDGE_BASE:
        # Filter by category if specified (case-insensitive)
        if category and article["category"].lower() != category.lower():
            continue
        
        # CRITICAL FIX: Proper case-insensitive fuzzy match
        title_lower = article["title"].lower()
        body_lower = article["body"].lower()
        
        # Check if query appears in title or body (case-insensitive)
        if query_lower in title_lower or query_lower in body_lower:
            results.append(article)
    
    # Return top 10 results
    return results[:10]
