"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  industry: string;
  aiGenerated?: boolean;
  uses: number;
};

const workflowTemplates: WorkflowTemplate[] = [
  { id: "wf-001", name: "Email to Slack Notifications", description: "Forward important emails to Slack channels instantly", category: "Communication", difficulty: "Beginner", industry: "General", aiGenerated: true, uses: 1243 },
  { id: "wf-002", name: "Lead Capture to CRM", description: "Automatically add form submissions to your CRM with enrichment", category: "Sales", difficulty: "Intermediate", industry: "SaaS", aiGenerated: true, uses: 987 },
  { id: "wf-003", name: "Invoice Creation & Email", description: "Generate invoices from Stripe and email to customers", category: "Finance", difficulty: "Advanced", industry: "E-commerce", aiGenerated: true, uses: 756 },
  { id: "wf-004", name: "Weekly Report Generator", description: "Pull data from Google Sheets and generate PDF reports", category: "Reporting", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 654 },
  { id: "wf-005", name: "Social Media Scheduler", description: "Schedule posts across Twitter, LinkedIn, Facebook", category: "Marketing", difficulty: "Beginner", industry: "Marketing", aiGenerated: true, uses: 892 },
  { id: "wf-006", name: "Customer Support Ticket Router", description: "Automatically assign support tickets based on keywords", category: "Support", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 534 },
  { id: "wf-007", name: "Meeting Notes to Notion", description: "Transcribe meeting notes and sync to Notion database", category: "Productivity", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 721 },
  { id: "wf-008", name: "Payment Reminder Automation", description: "Send automated payment reminders for overdue invoices", category: "Finance", difficulty: "Beginner", industry: "E-commerce", aiGenerated: true, uses: 445 },
  { id: "wf-009", name: "Onboarding Email Sequence", description: "Multi-step email campaign for new user onboarding", category: "Marketing", difficulty: "Intermediate", industry: "SaaS", aiGenerated: true, uses: 823 },
  { id: "wf-010", name: "Data Backup to Cloud", description: "Automated daily backups of critical data to cloud storage", category: "Operations", difficulty: "Advanced", industry: "General", aiGenerated: true, uses: 612 },
  { id: "wf-011", name: "Product Launch Checklist", description: "Coordinate tasks across teams for product launches", category: "Project Management", difficulty: "Intermediate", industry: "SaaS", aiGenerated: true, uses: 398 },
  { id: "wf-012", name: "Blog Post to Social Media", description: "Auto-share new blog posts to all social channels", category: "Marketing", difficulty: "Beginner", industry: "Marketing", aiGenerated: true, uses: 956 },
  { id: "wf-013", name: "E-commerce Order Fulfillment", description: "Trigger fulfillment workflows when orders are placed", category: "Operations", difficulty: "Advanced", industry: "E-commerce", aiGenerated: true, uses: 678 },
  { id: "wf-014", name: "Employee Onboarding Automation", description: "Automated task creation for HR onboarding process", category: "HR", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 445 },
  { id: "wf-015", name: "Calendar Event Reminder", description: "Send customized reminders before important events", category: "Productivity", difficulty: "Beginner", industry: "General", aiGenerated: true, uses: 1102 },
  { id: "wf-016", name: "Competitor Price Monitoring", description: "Track competitor pricing and alert on changes", category: "Sales", difficulty: "Advanced", industry: "E-commerce", aiGenerated: true, uses: 387 },
  { id: "wf-017", name: "Survey Response Analysis", description: "Aggregate and analyze survey responses automatically", category: "Reporting", difficulty: "Intermediate", industry: "Marketing", aiGenerated: true, uses: 524 },
  { id: "wf-018", name: "GitHub to Slack Integration", description: "Post GitHub activity updates to Slack channels", category: "Development", difficulty: "Beginner", industry: "Tech", aiGenerated: true, uses: 843 },
  { id: "wf-019", name: "Contract Renewal Reminders", description: "Alert teams 30/60/90 days before contract renewals", category: "Sales", difficulty: "Intermediate", industry: "SaaS", aiGenerated: true, uses: 456 },
  { id: "wf-020", name: "Customer Feedback Loop", description: "Collect, categorize, and route customer feedback", category: "Support", difficulty: "Advanced", industry: "General", aiGenerated: true, uses: 598 },
  { id: "wf-021", name: "Lead Scoring System", description: "Score and qualify leads based on engagement data", category: "Sales", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 421 },
  { id: "wf-022", name: "Expense Report Submission", description: "Automated expense tracking and approval workflows", category: "Finance", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 512 },
  { id: "wf-023", name: "Content Approval Pipeline", description: "Multi-stage review process for marketing content", category: "Marketing", difficulty: "Intermediate", industry: "Marketing", aiGenerated: true, uses: 367 },
  { id: "wf-024", name: "Website Health Monitor", description: "Monitor website uptime and performance metrics", category: "Operations", difficulty: "Advanced", industry: "Tech", aiGenerated: true, uses: 689 },
  { id: "wf-025", name: "Newsletter Subscriber Sync", description: "Sync newsletter subscribers across multiple platforms", category: "Marketing", difficulty: "Beginner", industry: "Marketing", aiGenerated: true, uses: 734 },
  { id: "wf-026", name: "Sales Pipeline Automation", description: "Move deals through pipeline stages automatically", category: "Sales", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 543 },
  { id: "wf-027", name: "Document Version Control", description: "Track and manage document versions automatically", category: "Productivity", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 398 },
  { id: "wf-028", name: "Event Registration Workflow", description: "Handle event registrations and confirmations", category: "Events", difficulty: "Beginner", industry: "General", aiGenerated: true, uses: 476 },
  { id: "wf-029", name: "Churn Prevention System", description: "Identify and engage at-risk customers proactively", category: "Support", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 612 },
  { id: "wf-030", name: "Time Tracking Integration", description: "Sync time entries across project management tools", category: "Productivity", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 445 },
  { id: "wf-031", name: "Affiliate Commission Tracker", description: "Calculate and notify affiliates of commissions", category: "Finance", difficulty: "Advanced", industry: "E-commerce", aiGenerated: true, uses: 356 },
  { id: "wf-032", name: "Inventory Alert System", description: "Get notified when inventory drops below threshold", category: "Operations", difficulty: "Beginner", industry: "E-commerce", aiGenerated: true, uses: 523 },
  { id: "wf-033", name: "Customer Journey Tracking", description: "Map and analyze customer interaction touchpoints", category: "Marketing", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 478 },
  { id: "wf-034", name: "Multi-Channel Support Routing", description: "Route support requests from email, chat, and social", category: "Support", difficulty: "Advanced", industry: "General", aiGenerated: true, uses: 589 },
  { id: "wf-035", name: "Referral Program Automation", description: "Track referrals and reward customers automatically", category: "Marketing", difficulty: "Intermediate", industry: "SaaS", aiGenerated: true, uses: 423 },
  { id: "wf-036", name: "Compliance Document Generator", description: "Generate compliance reports on schedule", category: "Legal", difficulty: "Advanced", industry: "Finance", aiGenerated: true, uses: 287 },
  { id: "wf-037", name: "Team Performance Dashboard", description: "Aggregate team metrics into a real-time dashboard", category: "Reporting", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 512 },
  { id: "wf-038", name: "Birthday & Anniversary Emails", description: "Send personalized greetings to customers", category: "Marketing", difficulty: "Beginner", industry: "General", aiGenerated: true, uses: 876 },
  { id: "wf-039", name: "API Rate Limit Manager", description: "Monitor and manage API usage across services", category: "Development", difficulty: "Advanced", industry: "Tech", aiGenerated: true, uses: 356 },
  { id: "wf-040", name: "Quality Assurance Checklist", description: "Automated QA workflows for product releases", category: "Operations", difficulty: "Intermediate", industry: "Tech", aiGenerated: true, uses: 445 },
  { id: "wf-041", name: "Webinar Follow-Up Sequence", description: "Automated follow-up emails after webinar attendance", category: "Marketing", difficulty: "Beginner", industry: "Marketing", aiGenerated: true, uses: 623 },
  { id: "wf-042", name: "Security Alert System", description: "Monitor and alert on security events across systems", category: "Security", difficulty: "Advanced", industry: "Tech", aiGenerated: true, uses: 498 },
  { id: "wf-043", name: "Task Delegation Workflow", description: "Automatically assign tasks based on team capacity", category: "Project Management", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 534 },
  { id: "wf-044", name: "Customer Review Aggregator", description: "Collect reviews from multiple platforms", category: "Marketing", difficulty: "Beginner", industry: "E-commerce", aiGenerated: true, uses: 687 },
  { id: "wf-045", name: "Budget Tracking & Alerts", description: "Monitor department budgets and send alerts", category: "Finance", difficulty: "Intermediate", industry: "General", aiGenerated: true, uses: 398 },
  { id: "wf-046", name: "Abandoned Cart Recovery", description: "Send automated reminders for abandoned shopping carts", category: "Sales", difficulty: "Intermediate", industry: "E-commerce", aiGenerated: true, uses: 723 },
  { id: "wf-047", name: "Knowledge Base Sync", description: "Keep knowledge base articles synchronized across platforms", category: "Support", difficulty: "Advanced", industry: "SaaS", aiGenerated: true, uses: 412 },
  { id: "wf-048", name: "Recruitment Pipeline", description: "Automate candidate tracking and communication", category: "HR", difficulty: "Advanced", industry: "General", aiGenerated: true, uses: 498 },
  { id: "wf-049", name: "Product Recommendation Engine", description: "Generate personalized product recommendations", category: "Sales", difficulty: "Advanced", industry: "E-commerce", aiGenerated: true, uses: 567 },
  { id: "wf-050", name: "Crisis Communication Plan", description: "Automated incident response and communication", category: "Operations", difficulty: "Advanced", industry: "General", aiGenerated: true, uses: 312 },
];

const categories = ["All", "Sales", "Marketing", "Finance", "Support", "Operations", "Productivity", "Development", "HR", "Legal", "Security"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const industries = ["All", "General", "SaaS", "E-commerce", "Marketing", "Tech", "Finance"];

export default function WorkflowLibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "All" || template.difficulty === difficultyFilter;
    const matchesIndustry = industryFilter === "All" || template.industry === industryFilter;
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesIndustry && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success-100 text-success-700";
      case "Intermediate": return "bg-warning-100 text-warning-700";
      case "Advanced": return "bg-error-100 text-error-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Workflow Library
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-2">
            50 pre-built workflow templates powered by AI. Click to import and customize.
          </p>
          <p className="text-sm text-neutral-500">
            All workflows include AI-generated descriptions and best practices
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-neutral-600">
            Showing {filteredTemplates.length} of {workflowTemplates.length} workflows
          </div>
        </div>
      </section>

      {/* Workflow Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="bg-white rounded-xl p-6 border border-neutral-200 shadow hover:shadow-lg transition-all group hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors flex-1">
                  {template.name}
                </h3>
                {template.aiGenerated && (
                  <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full font-medium ml-2">
                    AI
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                {template.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                  {template.category}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
                  {template.industry}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <span className="text-xs text-neutral-500">
                  {template.uses.toLocaleString()} uses
                </span>
                <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow hover:shadow-md">
                  Import
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500 text-lg">No workflows match your filters. Try adjusting your selection.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Workflow?</h2>
          <p className="text-xl mb-8 opacity-90">
            Use our AI-powered natural language builder to create workflows in plain English.
          </p>
          <Link href="/workflows/ai-create" className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
            Create with AI
          </Link>
        </div>
      </section>
    </main>
  );
}
