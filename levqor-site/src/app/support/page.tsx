import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Levqor - documentation, guides, and contact options for technical support.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Support & Help Center</h1>
          <p className="text-xl text-gray-600">
            Get help with Levqor. We're here to assist you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 mb-4">
              Browse our comprehensive guides and API documentation.
            </p>
            <Link href="/docs" className="text-blue-600 hover:underline font-medium">
              View Documentation →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Contact our support team for technical assistance.
            </p>
            <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline font-medium">
              support@levqor.ai →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">System Status</h3>
            <p className="text-gray-600 mb-4">
              Check the current status and uptime of Levqor services.
            </p>
            <a href="https://api.levqor.ai/health" className="text-blue-600 hover:underline font-medium">
              View Status →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-600 mb-4">
              New to Levqor? Learn how to set up your first workflow.
            </p>
            <Link href="/how-it-works" className="text-blue-600 hover:underline font-medium">
              How It Works →
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How do I get started?</h3>
              <p className="text-gray-700">Sign up for a free account, connect your tools, and create your first workflow. Check our <Link href="/docs" className="text-blue-600 hover:underline">documentation</Link> for step-by-step guides.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What's included in the free trial?</h3>
              <p className="text-gray-700">Full access to all features with no credit card required. See our <Link href="/pricing" className="text-blue-600 hover:underline">pricing page</Link> for details.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Do you offer enterprise support?</h3>
              <p className="text-gray-700">Yes! Contact our sales team at <a href="mailto:sales@levqor.ai" className="text-blue-600 hover:underline">sales@levqor.ai</a> for dedicated support options.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
