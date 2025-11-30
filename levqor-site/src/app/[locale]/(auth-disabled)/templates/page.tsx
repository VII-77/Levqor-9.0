"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  popular?: boolean;
}

const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates", icon: "grid" },
  { id: "backup", name: "Backup & Recovery", icon: "database" },
  { id: "sync", name: "Data Sync", icon: "refresh" },
  { id: "monitor", name: "Monitoring", icon: "chart" },
  { id: "automation", name: "Automation", icon: "cog" },
  { id: "compliance", name: "Compliance", icon: "shield" },
];

const TEMPLATES: Template[] = [
  { id: "daily-backup", name: "Daily Database Backup", description: "Automated daily backups with retention policy", category: "backup", icon: "database", popular: true },
  { id: "cloud-sync", name: "Cloud Storage Sync", description: "Sync files between cloud providers", category: "sync", icon: "cloud" },
  { id: "uptime-monitor", name: "Uptime Monitor", description: "Monitor website availability 24/7", category: "monitor", icon: "activity", popular: true },
  { id: "api-health", name: "API Health Check", description: "Monitor API endpoints and response times", category: "monitor", icon: "heart" },
  { id: "data-pipeline", name: "ETL Pipeline", description: "Extract, transform, and load data automatically", category: "automation", icon: "git-branch" },
  { id: "gdpr-export", name: "GDPR Data Export", description: "Automated data export for compliance", category: "compliance", icon: "download" },
  { id: "retention-policy", name: "Data Retention", description: "Automated data lifecycle management", category: "compliance", icon: "clock" },
  { id: "webhook-handler", name: "Webhook Handler", description: "Process incoming webhooks automatically", category: "automation", icon: "zap" },
  { id: "scheduled-report", name: "Scheduled Reports", description: "Generate and email reports on schedule", category: "automation", icon: "file-text", popular: true },
  { id: "crm-sync", name: "CRM Integration", description: "Sync customer data with your CRM", category: "sync", icon: "users" },
  { id: "backup-verify", name: "Backup Verification", description: "Verify backup integrity automatically", category: "backup", icon: "check-circle" },
  { id: "log-rotation", name: "Log Rotation", description: "Automated log management and archival", category: "backup", icon: "archive" },
  { id: "slack-alerts", name: "Slack Alerts", description: "Send alerts to Slack channels", category: "monitor", icon: "message-circle" },
  { id: "email-automation", name: "Email Automation", description: "Trigger emails based on events", category: "automation", icon: "mail" },
  { id: "security-scan", name: "Security Scanner", description: "Regular security vulnerability scans", category: "compliance", icon: "shield" },
  { id: "cost-monitor", name: "Cost Monitor", description: "Track and alert on cloud spending", category: "monitor", icon: "dollar-sign" },
  { id: "db-replication", name: "DB Replication", description: "Real-time database replication", category: "sync", icon: "copy" },
  { id: "incident-response", name: "Incident Response", description: "Automated incident handling workflow", category: "automation", icon: "alert-triangle" },
  { id: "compliance-audit", name: "Compliance Audit", description: "Scheduled compliance check automation", category: "compliance", icon: "clipboard" },
  { id: "multi-region", name: "Multi-Region Backup", description: "Geo-redundant backup strategy", category: "backup", icon: "globe" },
];

export default function TemplatesPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!session?.user?.email) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(
          `${API_URL}/api/wow/brain/recommendations?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await res.json();

        if (data.ok && data.recommendations) {
          const templateRecs = data.recommendations
            .filter((r: { type: string }) => r.type === "templates")
            .map((r: { id: string }) => r.id);
          setRecommendations(templateRecs);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations");
      }
    };

    fetchRecommendations();
  }, [session]);

  const handleTemplateClick = async (template: Template) => {
    if (session?.user?.email) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      fetch(`${API_URL}/api/wow/brain/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          event_type: "template_viewed",
          data: { template_id: template.id }
        })
      });
    }
    
    router.push(`/${locale}/builder?template=${template.id}`);
  };

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory = category === "all" || t.category === category;
    const matchesSearch = search === "" || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTemplates = TEMPLATES.filter((t) => t.popular);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Template Gallery</h1>
          <p className="text-gray-600">Ready-to-use workflow templates to get started quickly</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Smart Picks for You</h2>
              <p className="text-blue-100 text-sm mb-4">Recommended based on your usage patterns</p>
              <div className="flex flex-wrap gap-2">
                {popularTemplates.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateClick(t)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                {template.popular && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="mt-4 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Use this template
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No templates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
