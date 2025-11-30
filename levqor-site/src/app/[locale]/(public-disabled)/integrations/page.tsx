"use client";
import { useState } from "react";
import Link from "next/link";

const INTEGRATION_TABS = [
  { id: "all", label: "All" },
  { id: "communication", label: "Communication" },
  { id: "productivity", label: "Productivity" },
  { id: "sales", label: "Sales & CRM" },
  { id: "payments", label: "Payments" },
  { id: "development", label: "Development" },
  { id: "cloud", label: "Cloud & Storage" },
];

interface Integration {
  name: string;
  description: string;
  category: string;
  status: "available" | "coming_soon";
  icon: string;
}

const INTEGRATIONS: Integration[] = [
  { name: "Slack", description: "Send messages and alerts to Slack channels", category: "communication", status: "available", icon: "💬" },
  { name: "Gmail", description: "Send and manage emails automatically", category: "communication", status: "available", icon: "📧" },
  { name: "Microsoft Teams", description: "Integrate with Teams for collaboration", category: "communication", status: "coming_soon", icon: "👥" },
  { name: "Twilio", description: "SMS and voice notifications", category: "communication", status: "coming_soon", icon: "📱" },
  { name: "SendGrid", description: "Transactional email delivery", category: "communication", status: "coming_soon", icon: "✉️" },
  { name: "Discord", description: "Send notifications to Discord servers", category: "communication", status: "available", icon: "🎮" },
  { name: "Google Sheets", description: "Read and write spreadsheet data", category: "productivity", status: "available", icon: "📊" },
  { name: "Airtable", description: "Sync with Airtable bases", category: "productivity", status: "coming_soon", icon: "📋" },
  { name: "Notion", description: "Connect with Notion databases", category: "productivity", status: "available", icon: "📝" },
  { name: "Trello", description: "Manage Trello boards and cards", category: "productivity", status: "coming_soon", icon: "📌" },
  { name: "Asana", description: "Task and project management", category: "productivity", status: "coming_soon", icon: "✅" },
  { name: "Salesforce", description: "CRM data sync and automation", category: "sales", status: "coming_soon", icon: "☁️" },
  { name: "HubSpot", description: "Marketing and sales automation", category: "sales", status: "coming_soon", icon: "🧲" },
  { name: "Pipedrive", description: "Sales pipeline management", category: "sales", status: "coming_soon", icon: "📈" },
  { name: "Intercom", description: "Customer messaging platform", category: "sales", status: "coming_soon", icon: "💬" },
  { name: "Zendesk", description: "Customer support ticketing", category: "sales", status: "coming_soon", icon: "🎫" },
  { name: "Stripe", description: "Payment processing and subscriptions", category: "payments", status: "available", icon: "💳" },
  { name: "PayPal", description: "PayPal payment integration", category: "payments", status: "coming_soon", icon: "💰" },
  { name: "Chargebee", description: "Subscription billing management", category: "payments", status: "coming_soon", icon: "📃" },
  { name: "Paddle", description: "SaaS billing platform", category: "payments", status: "coming_soon", icon: "🏓" },
  { name: "Square", description: "Point of sale and payments", category: "payments", status: "coming_soon", icon: "🔲" },
  { name: "GitHub", description: "Repository and issue management", category: "development", status: "coming_soon", icon: "🐙" },
  { name: "GitLab", description: "DevOps lifecycle management", category: "development", status: "coming_soon", icon: "🦊" },
  { name: "Jira", description: "Project and issue tracking", category: "development", status: "coming_soon", icon: "📋" },
  { name: "Linear", description: "Modern issue tracking", category: "development", status: "coming_soon", icon: "📐" },
  { name: "Sentry", description: "Error monitoring and tracking", category: "development", status: "coming_soon", icon: "🐛" },
  { name: "Webhooks", description: "Custom HTTP webhook triggers", category: "development", status: "available", icon: "🔗" },
  { name: "AWS S3", description: "Cloud object storage", category: "cloud", status: "coming_soon", icon: "🪣" },
  { name: "Google Drive", description: "File storage and sync", category: "cloud", status: "coming_soon", icon: "📁" },
  { name: "Dropbox", description: "Cloud file storage", category: "cloud", status: "coming_soon", icon: "📦" },
  { name: "Azure Blob", description: "Microsoft cloud storage", category: "cloud", status: "coming_soon", icon: "☁️" },
  { name: "Cloudflare", description: "CDN and edge computing", category: "cloud", status: "coming_soon", icon: "🌐" },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = INTEGRATIONS.filter((integration) => {
    const matchesTab = activeTab === "all" || integration.category === activeTab;
    const matchesSearch = searchQuery === "" || 
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const availableCount = filteredIntegrations.filter(i => i.status === "available").length;
  const comingSoonCount = filteredIntegrations.filter(i => i.status === "coming_soon").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Integrations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect Levqor with 50+ popular tools and services. Build powerful workflows
            across your entire tech stack.
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {INTEGRATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4 mb-8 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            {availableCount} Available
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
            {comingSoonCount} Coming Soon
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.name}
              className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                integration.status === "available"
                  ? "border-green-200 hover:shadow-md hover:border-green-300"
                  : "border-gray-200 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      integration.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {integration.status === "available" ? "Available" : "Coming Soon"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-16">
            <p className="text-gray-500">No integrations found matching your criteria</p>
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need a Custom Integration?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            We support custom API connections for Enterprise plans. Connect to any REST API
            or webhook endpoint with our flexible integration framework.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Contact Sales
            </Link>
            <Link href="/docs" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition">
              View API Docs
            </Link>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Connect?</h2>
          <p className="text-gray-700 mb-8">
            Start automating workflows across all your favorite tools.
          </p>
          <Link href="/signin" className="inline-block px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
