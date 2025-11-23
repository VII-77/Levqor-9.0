import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Levqor automates workflows with self-healing capabilities and intelligent monitoring.",
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">How Levqor Works</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Automate your workflows with self-healing capabilities and intelligent monitoring.
          Set it up once, let it run forever.
        </p>
      </div>

      <div className="space-y-16">
        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            1
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Integrate with 50+ popular apps and services including Gmail, Slack, Google Sheets,
              Stripe, Salesforce, and more. No code required—just authenticate and select the
              data you want to work with.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>One-click OAuth integrations</li>
              <li>Secure credential management</li>
              <li>Custom API connections supported</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0 w-16 h-16 bg-green-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            2
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Build Your Workflow</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Create automated workflows using our visual builder or templates. Define triggers,
              actions, and conditions to automate repetitive tasks across your tools.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Drag-and-drop workflow builder</li>
              <li>Pre-built templates for common tasks</li>
              <li>Conditional logic and branching</li>
              <li>AI-powered suggestions</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0 w-16 h-16 bg-purple-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            3
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Monitor & Self-Heal</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Levqor continuously monitors your workflows and automatically recovers from failures.
              Rate limits, API errors, and network issues are handled intelligently without your intervention.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Automatic retry with exponential backoff</li>
              <li>Intelligent error detection and recovery</li>
              <li>Real-time alerts and notifications</li>
              <li>99.9% uptime SLA guarantee</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0 w-16 h-16 bg-orange-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            4
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Pay Only for Results</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Unlike other automation platforms, you only pay for successful workflow executions.
              No hidden fees, no surprise charges. Clear, transparent pricing based on actual value delivered.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Usage-based billing</li>
              <li>No charge for failed runs</li>
              <li>Volume discounts available</li>
              <li>Cancel anytime</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-center text-white mt-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Automate?</h2>
        <p className="text-xl mb-8 opacity-90">
          Start your free trial today. No credit card required.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signin" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition">
            Start Free Trial
          </Link>
          <Link href="/pricing" className="px-8 py-4 bg-blue-600 text-white border-2 border-white rounded-xl font-semibold hover:bg-blue-700 transition">
            View Pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
