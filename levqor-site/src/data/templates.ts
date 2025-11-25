export interface Template {
  id: string;
  name: string;
  shortDescription: string;
  category: 'marketing' | 'sales' | 'operations' | 'hr' | 'finance' | 'customer-success' | 'data' | 'it-devops';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  track: 'individual' | 'business' | 'enterprise';
  examplePrompt: string;
}

export const templates: Template[] = [
  {
    id: 'lead-capture-crm',
    name: 'Lead Capture to CRM',
    shortDescription: 'Automatically add form submissions to your CRM with enriched data',
    category: 'sales',
    difficulty: 'beginner',
    track: 'business',
    examplePrompt: 'When someone fills out our contact form, add them to HubSpot with their company info enriched from Clearbit'
  },
  {
    id: 'email-to-slack',
    name: 'Email to Slack Alerts',
    shortDescription: 'Forward important emails to Slack channels instantly',
    category: 'operations',
    difficulty: 'beginner',
    track: 'individual',
    examplePrompt: 'When I receive an email with "urgent" in the subject, forward it to our #alerts Slack channel'
  },
  {
    id: 'social-scheduler',
    name: 'Social Media Scheduler',
    shortDescription: 'Schedule and publish content across social platforms',
    category: 'marketing',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'Every Monday at 9am, take content from our Google Sheet and post it to Twitter and LinkedIn'
  },
  {
    id: 'invoice-processor',
    name: 'Invoice Processor',
    shortDescription: 'Extract data from invoices and update accounting systems',
    category: 'finance',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'When a new invoice PDF arrives in email, extract the amount and vendor, then log it in QuickBooks'
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Loop',
    shortDescription: 'Collect and analyze customer feedback automatically',
    category: 'customer-success',
    difficulty: 'beginner',
    track: 'business',
    examplePrompt: 'When a customer submits a support ticket, send them a satisfaction survey after 24 hours'
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding',
    shortDescription: 'Automate new hire setup across all tools',
    category: 'hr',
    difficulty: 'advanced',
    track: 'enterprise',
    examplePrompt: 'When a new employee is added to BambooHR, create accounts in Slack, Google Workspace, and GitHub'
  },
  {
    id: 'data-sync',
    name: 'Database Sync',
    shortDescription: 'Keep multiple databases in sync automatically',
    category: 'data',
    difficulty: 'advanced',
    track: 'enterprise',
    examplePrompt: 'Every hour, sync new customers from Salesforce to our PostgreSQL database and Airtable'
  },
  {
    id: 'deploy-notifications',
    name: 'Deploy Notifications',
    shortDescription: 'Alert team when deployments happen',
    category: 'it-devops',
    difficulty: 'beginner',
    track: 'individual',
    examplePrompt: 'When a new deployment is pushed to GitHub main branch, post details to Slack and update Notion'
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes Automation',
    shortDescription: 'Transcribe and distribute meeting notes automatically',
    category: 'operations',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'After a Zoom meeting ends, transcribe it with AI and send summary to all attendees'
  },
  {
    id: 'expense-approval',
    name: 'Expense Approval Flow',
    shortDescription: 'Route expense reports for approval automatically',
    category: 'finance',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'When an expense report is submitted, route it to the right manager based on amount and department'
  },
  {
    id: 'content-repurpose',
    name: 'Content Repurposing',
    shortDescription: 'Turn blog posts into social media content',
    category: 'marketing',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'When a new blog post is published, use AI to create 5 tweet threads and 3 LinkedIn posts'
  },
  {
    id: 'lead-scoring',
    name: 'AI Lead Scoring',
    shortDescription: 'Score leads based on behavior and firmographics',
    category: 'sales',
    difficulty: 'advanced',
    track: 'enterprise',
    examplePrompt: 'Score each new lead based on company size, industry, and website visits, then alert sales if hot'
  },
  {
    id: 'churn-prediction',
    name: 'Churn Risk Alerts',
    shortDescription: 'Identify at-risk customers before they leave',
    category: 'customer-success',
    difficulty: 'advanced',
    track: 'enterprise',
    examplePrompt: 'Analyze customer activity weekly and alert CSM if engagement drops below threshold'
  },
  {
    id: 'pto-tracker',
    name: 'PTO Request Handler',
    shortDescription: 'Automate time-off requests and calendar updates',
    category: 'hr',
    difficulty: 'beginner',
    track: 'business',
    examplePrompt: 'When someone requests PTO in Slack, check balance, get manager approval, and update calendar'
  },
  {
    id: 'report-generator',
    name: 'Weekly Report Generator',
    shortDescription: 'Compile data from multiple sources into reports',
    category: 'data',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'Every Friday, pull metrics from GA, Stripe, and CRM to create a PDF report and email it to leadership'
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    shortDescription: 'Automatically triage and escalate incidents',
    category: 'it-devops',
    difficulty: 'advanced',
    track: 'enterprise',
    examplePrompt: 'When an alert fires in PagerDuty, create Jira ticket, notify on-call, and start Zoom bridge'
  },
  {
    id: 'newsletter-automation',
    name: 'Newsletter Automation',
    shortDescription: 'Curate and send newsletters automatically',
    category: 'marketing',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'Every week, gather top articles from RSS feeds and draft a newsletter in Mailchimp'
  },
  {
    id: 'contract-renewal',
    name: 'Contract Renewal Reminders',
    shortDescription: 'Never miss a renewal deadline',
    category: 'sales',
    difficulty: 'beginner',
    track: 'business',
    examplePrompt: '30 days before a contract expires, alert the account owner and create renewal task in CRM'
  },
  {
    id: 'backup-automation',
    name: 'Automated Backups',
    shortDescription: 'Schedule and verify data backups',
    category: 'it-devops',
    difficulty: 'intermediate',
    track: 'enterprise',
    examplePrompt: 'Daily at 2am, backup production database to S3 and verify integrity, alert if failed'
  },
  {
    id: 'review-aggregator',
    name: 'Review Aggregator',
    shortDescription: 'Collect and analyze reviews from multiple platforms',
    category: 'customer-success',
    difficulty: 'intermediate',
    track: 'business',
    examplePrompt: 'Monitor G2, Capterra, and App Store for new reviews, then summarize weekly in a report'
  }
];

export const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'sales', name: 'Sales' },
  { id: 'operations', name: 'Operations' },
  { id: 'hr', name: 'HR' },
  { id: 'finance', name: 'Finance' },
  { id: 'customer-success', name: 'Customer Success' },
  { id: 'data', name: 'Data & Analytics' },
  { id: 'it-devops', name: 'IT & DevOps' }
];

export const difficulties = [
  { id: 'beginner', name: 'Beginner', color: 'bg-green-100 text-green-800' },
  { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'advanced', name: 'Advanced', color: 'bg-red-100 text-red-800' }
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  if (category === 'all') return templates;
  return templates.filter(t => t.category === category);
}
