"""Workflow Library & Daily Workflow Routes - HYPERGROWTH CYCLE 5"""

from flask import jsonify, request
from . import workflows_bp
import logging
from datetime import datetime

log = logging.getLogger(__name__)

# Workflow library data (50 templates)
WORKFLOW_TEMPLATES = [
    {"id": "wf-001", "title": "Email to Slack Notifications", "description": "Forward important emails to Slack channels instantly", "category": "Communication", "difficulty": "Beginner", "industry": "General", "tags": ["email", "slack", "notifications"], "uses": 1243},
    {"id": "wf-002", "title": "Lead Capture to CRM", "description": "Automatically add form submissions to your CRM with enrichment", "category": "Sales", "difficulty": "Intermediate", "industry": "SaaS", "tags": ["crm", "leads", "sales"], "uses": 987},
    {"id": "wf-003", "title": "Invoice Creation & Email", "description": "Generate invoices from Stripe and email to customers", "category": "Finance", "difficulty": "Advanced", "industry": "E-commerce", "tags": ["billing", "stripe", "invoices"], "uses": 756},
    {"id": "wf-004", "title": "Weekly Report Generator", "description": "Pull data from Google Sheets and generate PDF reports", "category": "Reporting", "difficulty": "Intermediate", "industry": "General", "tags": ["reporting", "pdf", "automation"], "uses": 654},
    {"id": "wf-005", "title": "Social Media Scheduler", "description": "Schedule posts across Twitter, LinkedIn, Facebook", "category": "Marketing", "difficulty": "Beginner", "industry": "Marketing", "tags": ["social", "scheduling", "marketing"], "uses": 892},
    {"id": "wf-006", "title": "Customer Support Ticket Router", "description": "Automatically assign support tickets based on keywords", "category": "Support", "difficulty": "Advanced", "industry": "SaaS", "tags": ["support", "routing", "ai"], "uses": 534},
    {"id": "wf-007", "title": "Meeting Notes to Notion", "description": "Transcribe meeting notes and sync to Notion database", "category": "Productivity", "difficulty": "Intermediate", "industry": "General", "tags": ["notion", "notes", "productivity"], "uses": 721},
    {"id": "wf-008", "title": "Payment Reminder Automation", "description": "Send automated payment reminders for overdue invoices", "category": "Finance", "difficulty": "Beginner", "industry": "E-commerce", "tags": ["billing", "reminders", "automation"], "uses": 445},
    {"id": "wf-009", "title": "Onboarding Email Sequence", "description": "Multi-step email campaign for new user onboarding", "category": "Marketing", "difficulty": "Intermediate", "industry": "SaaS", "tags": ["email", "onboarding", "marketing"], "uses": 823},
    {"id": "wf-010", "title": "Data Backup to Cloud", "description": "Automated daily backups of critical data to cloud storage", "category": "Operations", "difficulty": "Advanced", "industry": "General", "tags": ["backup", "cloud", "security"], "uses": 612},
    {"id": "wf-011", "title": "Product Launch Checklist", "description": "Coordinate tasks across teams for product launches", "category": "Project Management", "difficulty": "Intermediate", "industry": "SaaS", "tags": ["project", "launch", "coordination"], "uses": 398},
    {"id": "wf-012", "title": "Blog Post to Social Media", "description": "Auto-share new blog posts to all social channels", "category": "Marketing", "difficulty": "Beginner", "industry": "Marketing", "tags": ["blog", "social", "automation"], "uses": 956},
    {"id": "wf-013", "title": "E-commerce Order Fulfillment", "description": "Trigger fulfillment workflows when orders are placed", "category": "Operations", "difficulty": "Advanced", "industry": "E-commerce", "tags": ["ecommerce", "fulfillment", "orders"], "uses": 678},
    {"id": "wf-014", "title": "Employee Onboarding Automation", "description": "Automated task creation for HR onboarding process", "category": "HR", "difficulty": "Intermediate", "industry": "General", "tags": ["hr", "onboarding", "automation"], "uses": 445},
    {"id": "wf-015", "title": "Calendar Event Reminder", "description": "Send customized reminders before important events", "category": "Productivity", "difficulty": "Beginner", "industry": "General", "tags": ["calendar", "reminders", "productivity"], "uses": 1102},
    {"id": "wf-016", "title": "Competitor Price Monitoring", "description": "Track competitor pricing and alert on changes", "category": "Sales", "difficulty": "Advanced", "industry": "E-commerce", "tags": ["pricing", "monitoring", "competitive"], "uses": 387},
    {"id": "wf-017", "title": "Survey Response Analysis", "description": "Aggregate and analyze survey responses automatically", "category": "Reporting", "difficulty": "Intermediate", "industry": "Marketing", "tags": ["surveys", "analysis", "reporting"], "uses": 524},
    {"id": "wf-018", "title": "GitHub to Slack Integration", "description": "Post GitHub activity updates to Slack channels", "category": "Development", "difficulty": "Beginner", "industry": "Tech", "tags": ["github", "slack", "devops"], "uses": 843},
    {"id": "wf-019", "title": "Contract Renewal Reminders", "description": "Alert teams 30/60/90 days before contract renewals", "category": "Sales", "difficulty": "Intermediate", "industry": "SaaS", "tags": ["contracts", "reminders", "sales"], "uses": 456},
    {"id": "wf-020", "title": "Customer Feedback Loop", "description": "Collect, categorize, and route customer feedback", "category": "Support", "difficulty": "Advanced", "industry": "General", "tags": ["feedback", "support", "routing"], "uses": 598},
    {"id": "wf-021", "title": "Lead Scoring System", "description": "Score and qualify leads based on engagement data", "category": "Sales", "difficulty": "Advanced", "industry": "SaaS", "tags": ["leads", "scoring", "sales"], "uses": 421},
    {"id": "wf-022", "title": "Expense Report Submission", "description": "Automated expense tracking and approval workflows", "category": "Finance", "difficulty": "Intermediate", "industry": "General", "tags": ["expenses", "finance", "approval"], "uses": 512},
    {"id": "wf-023", "title": "Content Approval Pipeline", "description": "Multi-stage review process for marketing content", "category": "Marketing", "difficulty": "Intermediate", "industry": "Marketing", "tags": ["content", "approval", "marketing"], "uses": 367},
    {"id": "wf-024", "title": "Website Health Monitor", "description": "Monitor website uptime and performance metrics", "category": "Operations", "difficulty": "Advanced", "industry": "Tech", "tags": ["monitoring", "uptime", "performance"], "uses": 689},
    {"id": "wf-025", "title": "Newsletter Subscriber Sync", "description": "Sync newsletter subscribers across multiple platforms", "category": "Marketing", "difficulty": "Beginner", "industry": "Marketing", "tags": ["newsletter", "sync", "marketing"], "uses": 734},
    {"id": "wf-026", "title": "Sales Pipeline Automation", "description": "Move deals through pipeline stages automatically", "category": "Sales", "difficulty": "Advanced", "industry": "SaaS", "tags": ["sales", "pipeline", "automation"], "uses": 543},
    {"id": "wf-027", "title": "Document Version Control", "description": "Track and manage document versions automatically", "category": "Productivity", "difficulty": "Intermediate", "industry": "General", "tags": ["documents", "version", "control"], "uses": 398},
    {"id": "wf-028", "title": "Event Registration Workflow", "description": "Handle event registrations and confirmations", "category": "Events", "difficulty": "Beginner", "industry": "General", "tags": ["events", "registration", "automation"], "uses": 476},
    {"id": "wf-029", "title": "Churn Prevention System", "description": "Identify and engage at-risk customers proactively", "category": "Support", "difficulty": "Advanced", "industry": "SaaS", "tags": ["churn", "retention", "support"], "uses": 612},
    {"id": "wf-030", "title": "Time Tracking Integration", "description": "Sync time entries across project management tools", "category": "Productivity", "difficulty": "Intermediate", "industry": "General", "tags": ["time", "tracking", "productivity"], "uses": 445},
    {"id": "wf-031", "title": "Affiliate Commission Tracker", "description": "Calculate and notify affiliates of commissions", "category": "Finance", "difficulty": "Advanced", "industry": "E-commerce", "tags": ["affiliate", "commission", "finance"], "uses": 356},
    {"id": "wf-032", "title": "Inventory Alert System", "description": "Get notified when inventory drops below threshold", "category": "Operations", "difficulty": "Beginner", "industry": "E-commerce", "tags": ["inventory", "alerts", "ecommerce"], "uses": 523},
    {"id": "wf-033", "title": "Customer Journey Tracking", "description": "Map and analyze customer interaction touchpoints", "category": "Marketing", "difficulty": "Advanced", "industry": "SaaS", "tags": ["customer", "journey", "analytics"], "uses": 478},
    {"id": "wf-034", "title": "Multi-Channel Support Routing", "description": "Route support requests from email, chat, and social", "category": "Support", "difficulty": "Advanced", "industry": "General", "tags": ["support", "routing", "multichannel"], "uses": 589},
    {"id": "wf-035", "title": "Referral Program Automation", "description": "Track referrals and reward customers automatically", "category": "Marketing", "difficulty": "Intermediate", "industry": "SaaS", "tags": ["referral", "rewards", "marketing"], "uses": 423},
    {"id": "wf-036", "title": "Compliance Document Generator", "description": "Generate compliance reports on schedule", "category": "Legal", "difficulty": "Advanced", "industry": "Finance", "tags": ["compliance", "legal", "reporting"], "uses": 287},
    {"id": "wf-037", "title": "Team Performance Dashboard", "description": "Aggregate team metrics into a real-time dashboard", "category": "Reporting", "difficulty": "Intermediate", "industry": "General", "tags": ["performance", "dashboard", "metrics"], "uses": 512},
    {"id": "wf-038", "title": "Birthday & Anniversary Emails", "description": "Send personalized greetings to customers", "category": "Marketing", "difficulty": "Beginner", "industry": "General", "tags": ["email", "marketing", "personalization"], "uses": 876},
    {"id": "wf-039", "title": "API Rate Limit Manager", "description": "Monitor and manage API usage across services", "category": "Development", "difficulty": "Advanced", "industry": "Tech", "tags": ["api", "monitoring", "devops"], "uses": 356},
    {"id": "wf-040", "title": "Quality Assurance Checklist", "description": "Automated QA workflows for product releases", "category": "Operations", "difficulty": "Intermediate", "industry": "Tech", "tags": ["qa", "testing", "automation"], "uses": 445},
    {"id": "wf-041", "title": "Webinar Follow-Up Sequence", "description": "Automated follow-up emails after webinar attendance", "category": "Marketing", "difficulty": "Beginner", "industry": "Marketing", "tags": ["webinar", "email", "marketing"], "uses": 623},
    {"id": "wf-042", "title": "Security Alert System", "description": "Monitor and alert on security events across systems", "category": "Security", "difficulty": "Advanced", "industry": "Tech", "tags": ["security", "monitoring", "alerts"], "uses": 498},
    {"id": "wf-043", "title": "Task Delegation Workflow", "description": "Automatically assign tasks based on team capacity", "category": "Project Management", "difficulty": "Intermediate", "industry": "General", "tags": ["project", "delegation", "automation"], "uses": 534},
    {"id": "wf-044", "title": "Customer Review Aggregator", "description": "Collect reviews from multiple platforms", "category": "Marketing", "difficulty": "Beginner", "industry": "E-commerce", "tags": ["reviews", "aggregation", "marketing"], "uses": 687},
    {"id": "wf-045", "title": "Budget Tracking & Alerts", "description": "Monitor department budgets and send alerts", "category": "Finance", "difficulty": "Intermediate", "industry": "General", "tags": ["budget", "finance", "alerts"], "uses": 398},
    {"id": "wf-046", "title": "Abandoned Cart Recovery", "description": "Send automated reminders for abandoned shopping carts", "category": "Sales", "difficulty": "Intermediate", "industry": "E-commerce", "tags": ["ecommerce", "cart", "sales"], "uses": 723},
    {"id": "wf-047", "title": "Knowledge Base Sync", "description": "Keep knowledge base articles synchronized across platforms", "category": "Support", "difficulty": "Advanced", "industry": "SaaS", "tags": ["knowledge", "support", "sync"], "uses": 412},
    {"id": "wf-048", "title": "Recruitment Pipeline", "description": "Automate candidate tracking and communication", "category": "HR", "difficulty": "Advanced", "industry": "General", "tags": ["recruitment", "hr", "automation"], "uses": 498},
    {"id": "wf-049", "title": "Product Recommendation Engine", "description": "Generate personalized product recommendations", "category": "Sales", "difficulty": "Advanced", "industry": "E-commerce", "tags": ["recommendations", "ai", "sales"], "uses": 567},
    {"id": "wf-050", "title": "Crisis Communication Plan", "description": "Automated incident response and communication", "category": "Operations", "difficulty": "Advanced", "industry": "General", "tags": ["crisis", "communication", "operations"], "uses": 312},
]

# Daily workflow rotation (3 featured workflows)
DAILY_WORKFLOWS = [
    {
        "id": "daily-001",
        "title": "Smart Email Triage & Auto-Response",
        "description": "Automatically categorize incoming emails and send smart auto-replies based on content",
        "longDescription": "This workflow uses AI to analyze incoming emails, categorize them by urgency and topic, and automatically send contextual responses to common queries. It saves hours of manual email sorting and ensures timely responses to important messages.",
        "category": "Productivity",
        "difficulty": "Intermediate",
        "estimatedTime": "15 mins to set up",
        "aiPrompt": "When an email arrives in my inbox, analyze the subject and content to determine if it's urgent, informational, or actionable. If it matches common queries (pricing, support, general info), send an appropriate auto-response. Otherwise, categorize it and add a label.",
        "steps": [
            "Connect your Gmail or Outlook account",
            "Define email categories (Urgent, Sales, Support, General)",
            "Create auto-response templates for common queries",
            "Set up AI classification rules",
            "Configure notification preferences",
            "Test with sample emails"
        ],
        "benefits": [
            "Save 2-3 hours per day on email management",
            "Never miss urgent messages",
            "Instant responses to common questions",
            "Clean, organized inbox automatically"
        ],
        "useCases": [
            "Customer support teams handling high email volume",
            "Sales teams managing inbound leads",
            "Executives with overflowing inboxes",
            "Anyone wanting better email work-life balance"
        ]
    },
    {
        "id": "daily-002",
        "title": "Weekly Team Performance Dashboard",
        "description": "Aggregate team metrics from multiple tools into a beautiful weekly summary",
        "longDescription": "Pull data from project management tools, CRM, support systems, and analytics platforms to create a comprehensive weekly performance dashboard. Automatically generated and sent every Monday morning.",
        "category": "Reporting",
        "difficulty": "Advanced",
        "estimatedTime": "30 mins to set up",
        "aiPrompt": "Every Monday at 9am, collect data from Jira (tickets closed), Salesforce (deals won), Intercom (support volume), and Google Analytics (website traffic). Generate a visual dashboard PDF and email it to all managers.",
        "steps": [
            "Connect data sources (Jira, Salesforce, Intercom, Analytics)",
            "Define key performance metrics to track",
            "Design dashboard layout and visualizations",
            "Set up automated weekly schedule",
            "Configure email distribution list",
            "Review first report and refine"
        ],
        "benefits": [
            "Complete team visibility in one place",
            "No more manual report compilation",
            "Data-driven decision making",
            "Celebrate wins automatically"
        ],
        "useCases": [
            "Team leads needing weekly status updates",
            "C-suite executives tracking company KPIs",
            "Department managers coordinating across teams",
            "Remote teams staying aligned"
        ]
    },
    {
        "id": "daily-003",
        "title": "Social Proof Notification System",
        "description": "Display real-time customer activity notifications on your website",
        "longDescription": "Show subtle notifications when customers sign up, make purchases, or complete actions on your site. Creates FOMO and social proof to boost conversions. All data is real and pulled from your actual systems.",
        "category": "Marketing",
        "difficulty": "Beginner",
        "estimatedTime": "20 mins to set up",
        "aiPrompt": "When a customer signs up or makes a purchase in Stripe, send the event to my website widget to display 'Sarah from London just signed up' style notifications. Limit to 1 per minute to avoid spam.",
        "steps": [
            "Connect Stripe or your payment platform",
            "Install notification widget on your website",
            "Define trigger events (signups, purchases, trials)",
            "Customize notification templates",
            "Set display frequency and position",
            "Test with sample events"
        ],
        "benefits": [
            "Increase conversion rates by 15-25%",
            "Build trust with real social proof",
            "No coding required for setup",
            "Works on any website platform"
        ],
        "useCases": [
            "E-commerce stores showing recent purchases",
            "SaaS products highlighting new signups",
            "Course platforms showing enrollments",
            "Service businesses displaying bookings"
        ]
    }
]


@workflows_bp.route('/library', methods=['GET'])
def get_workflow_library():
    """
    Get workflow library with filtering support.
    Query params: category, difficulty, industry, q (search), language
    """
    try:
        # Get filter params
        category = request.args.get('category', '').strip()
        difficulty = request.args.get('difficulty', '').strip()
        industry = request.args.get('industry', '').strip()
        search_query = request.args.get('q', '').strip().lower()
        language = request.args.get('language', 'en')
        
        # Filter workflows
        filtered = WORKFLOW_TEMPLATES
        
        if category and category.lower() != 'all':
            filtered = [w for w in filtered if w['category'].lower() == category.lower()]
        
        if difficulty and difficulty.lower() != 'all':
            filtered = [w for w in filtered if w['difficulty'].lower() == difficulty.lower()]
        
        if industry and industry.lower() != 'all':
            filtered = [w for w in filtered if w['industry'].lower() == industry.lower()]
        
        if search_query:
            filtered = [w for w in filtered if 
                search_query in w['title'].lower() or 
                search_query in w['description'].lower() or
                any(search_query in tag.lower() for tag in w.get('tags', []))
            ]
        
        log.info(f"Workflow library: {len(filtered)}/{len(WORKFLOW_TEMPLATES)} workflows (filters: category={category}, difficulty={difficulty}, industry={industry}, q={search_query}, language={language})")
        
        return jsonify({
            "workflows": filtered,
            "total": len(filtered),
            "language": language
        }), 200
        
    except Exception as e:
        log.error(f"Error in workflow library: {e}")
        return jsonify({"error": "Failed to load workflow library"}), 500


@workflows_bp.route('/daily', methods=['GET'])
def get_daily_workflow():
    """
    Get daily featured workflow (rotates based on day of month).
    Query params: language
    """
    try:
        language = request.args.get('language', 'en')
        
        # Rotate based on day of month
        day_index = datetime.now().day % len(DAILY_WORKFLOWS)
        workflow = DAILY_WORKFLOWS[day_index].copy()
        
        # Add dynamic stats
        workflow['date'] = datetime.now().strftime('%Y-%m-%d')
        workflow['shareCount'] = 50 + (day_index * 27)  # Pseudo-random but stable per day
        workflow['likeCount'] = 100 + (day_index * 43)
        workflow['language'] = language
        
        log.info(f"Daily workflow: {workflow['id']} (language={language})")
        
        return jsonify(workflow), 200
        
    except Exception as e:
        log.error(f"Error in daily workflow: {e}")
        return jsonify({"error": "Failed to load daily workflow"}), 500
