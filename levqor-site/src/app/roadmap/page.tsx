import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "See what's next for Levqor. Our product roadmap includes upcoming features, integrations, and platform improvements.",
};

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Product Roadmap</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See what we're building next. Our roadmap is driven by customer feedback
          and our vision for reliable, intelligent automation.
        </p>
      </div>

      <div className="space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Now (Q4 2025)</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">✅ Levqor X 9.0 Launch</h3>
              <p className="text-gray-700 text-sm">
                New DFY service tiers, enhanced self-healing engine, and 99.9% uptime SLA for Enterprise.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">✅ Dashboard V2</h3>
              <p className="text-gray-700 text-sm">
                Completely redesigned dashboard with real-time monitoring and improved analytics.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">✅ Stripe Billing Integration</h3>
              <p className="text-gray-700 text-sm">
                Seamless subscription management with 15 pricing tiers and automatic billing.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Next (Q1 2026)</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🔄 Advanced Workflow Templates</h3>
              <p className="text-gray-700 text-sm">
                100+ pre-built templates for common automation tasks across sales, marketing, and ops.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🤖 AI Workflow Builder</h3>
              <p className="text-gray-700 text-sm">
                Describe workflows in plain English and let AI generate the automation for you.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">📊 Custom Dashboards</h3>
              <p className="text-gray-700 text-sm">
                Build custom dashboards with widgets, filters, and team-specific views.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Later (Q2-Q3 2026)</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🌐 Multi-Region Support</h3>
              <p className="text-gray-700 text-sm">
                Deploy workflows in EU, US, and Asia regions for lower latency and data sovereignty.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🔐 Advanced RBAC</h3>
              <p className="text-gray-700 text-sm">
                Role-based access control with teams, permissions, and audit logs for Enterprise.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">📱 Mobile App</h3>
              <p className="text-gray-700 text-sm">
                Monitor workflows, respond to alerts, and manage integrations from iOS and Android.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🔗 Marketplace</h3>
              <p className="text-gray-700 text-sm">
                Community-contributed workflow templates, connectors, and extensions.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Future</h2>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="border-l-4 border-gray-400 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🧠 Predictive Monitoring</h3>
              <p className="text-gray-700 text-sm">
                AI-powered prediction of failures before they happen based on historical patterns.
              </p>
            </div>
            <div className="border-l-4 border-gray-400 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">🔀 Workflow Versioning</h3>
              <p className="text-gray-700 text-sm">
                Git-like version control for workflows with branching, merging, and rollback.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-8 mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Have a Feature Request?</h3>
        <p className="text-gray-700 mb-4">
          We'd love to hear from you. Our roadmap is shaped by customer feedback.
          Let us know what features would make Levqor more valuable for your team.
        </p>
        <Link href="/contact" className="text-blue-600 hover:underline font-medium">
          Contact Us →
        </Link>
      </div>
    </main>
  );
}
