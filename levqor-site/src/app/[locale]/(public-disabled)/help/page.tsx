import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center - Levqor",
  description: "Get help with Levqor automation platform. Learn about workflows, templates, Levqor Brain AI, billing, and more.",
};

const helpSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    items: [
      { title: "Quick Start Guide", description: "Create your first workflow in 5 minutes", href: "/docs#quick-start" },
      { title: "Account Setup", description: "Configure your account and preferences", href: "/docs#account" },
      { title: "Dashboard Overview", description: "Understand your dashboard and metrics", href: "/docs#dashboard" },
      { title: "7-Day Free Trial", description: "Make the most of your trial period", href: "/pricing" },
    ]
  },
  {
    id: "workflows",
    title: "Workflows & Templates",
    icon: "⚙️",
    items: [
      { title: "Creating Workflows", description: "Build automation step by step", href: "/docs#workflows" },
      { title: "Using Templates", description: "Start with pre-built workflow templates", href: "/templates" },
      { title: "Step Types", description: "HTTP requests, delays, conditions, emails", href: "/docs#step-types" },
      { title: "Testing Workflows", description: "Test and debug your automations", href: "/docs#testing" },
    ]
  },
  {
    id: "brain",
    title: "Levqor Brain Builder",
    icon: "🧠",
    items: [
      { title: "AI Workflow Creation", description: "Describe automations in plain English", href: "/docs#brain" },
      { title: "Impact Classification", description: "Understand Class A, B, and C operations", href: "/docs#impact" },
      { title: "Approval Queue", description: "Managing workflows that require approval", href: "/docs#approvals" },
      { title: "Best Prompts", description: "Tips for getting better AI results", href: "/docs#prompts" },
    ]
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    icon: "💳",
    items: [
      { title: "Pricing Plans", description: "Compare Starter, Launch, Growth, and Agency plans", href: "/pricing" },
      { title: "Upgrading Plans", description: "How to upgrade or change your subscription", href: "/docs#upgrade" },
      { title: "Refund Policy", description: "30-day money-back guarantee details", href: "/refunds" },
      { title: "Invoice & Receipts", description: "Access your billing history", href: "/docs#billing" },
    ]
  },
  {
    id: "languages",
    title: "Languages & Localization",
    icon: "🌍",
    items: [
      { title: "Supported Languages", description: "40 languages with 9 Tier-1 full translations", href: "/docs#languages" },
      { title: "Changing Language", description: "How to switch your interface language", href: "/docs#language-settings" },
      { title: "AI in Your Language", description: "Use Levqor Brain in your preferred language", href: "/docs#ai-languages" },
    ]
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: "🔒",
    items: [
      { title: "Data Protection", description: "How we protect your data", href: "/privacy" },
      { title: "Export Your Data", description: "Download all your data (GDPR/CCPA)", href: "/docs#export" },
      { title: "Delete Account", description: "Request account deletion", href: "/docs#delete" },
      { title: "Compliance", description: "Our compliance and security practices", href: "/docs#compliance" },
    ]
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers, tutorials, and guides to help you get the most out of Levqor.
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Popular:</span>
              <Link href="/docs#workflows" className="text-sm text-blue-600 hover:underline">Creating workflows</Link>
              <Link href="/pricing" className="text-sm text-blue-600 hover:underline">Pricing plans</Link>
              <Link href="/docs#brain" className="text-sm text-blue-600 hover:underline">Levqor Brain</Link>
              <Link href="/templates" className="text-sm text-blue-600 hover:underline">Templates</Link>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {helpSections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-5 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
              </div>
              <ul className="divide-y">
                {section.items.map((item) => (
                  <li key={item.title}>
                    <Link 
                      href={item.href}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 block">{item.title}</span>
                      <span className="text-sm text-gray-500">{item.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you succeed with Levqor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/support"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link 
              href="/docs"
              className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border hover:bg-gray-50 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
