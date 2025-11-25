import type { Metadata } from "next";
import Link from "next/link";
import SupportForm from "@/components/SupportForm";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Levqor - AI-powered first-line support, documentation, guides, and contact options.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Support & Help Center</h1>
          <p className="text-xl text-gray-600">
            Get help with Levqor. We're here to assist you.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Support</h2>
              <p className="text-gray-600">Get instant answers from Levqor Brain</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Our AI assistant handles first-line questions instantly. For complex issues 
            that need human attention, we'll automatically escalate to our support team.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-white/70 px-3 py-1.5 rounded-full text-gray-700">
              ✓ Instant answers to common questions
            </span>
            <span className="bg-white/70 px-3 py-1.5 rounded-full text-gray-700">
              ✓ Auto-escalation for complex issues
            </span>
            <span className="bg-white/70 px-3 py-1.5 rounded-full text-gray-700">
              ✓ 24/7 availability
            </span>
          </div>
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

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
          <SupportForm />
        </div>

        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How do I get started?</h3>
              <p className="text-gray-700">Sign up for a free account, connect your tools, and create your first workflow. Check our <Link href="/docs" className="text-blue-600 hover:underline">documentation</Link> for step-by-step guides.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What's included in the free trial?</h3>
              <p className="text-gray-700">Full access to all features for 7 days. A credit card is required to start, but you won't be charged during the trial. See our <Link href="/pricing" className="text-blue-600 hover:underline">pricing page</Link> for details.</p>
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
