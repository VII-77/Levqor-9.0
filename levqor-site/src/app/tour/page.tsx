import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product Tour",
  description: "Take a guided tour of Levqor's automation platform. Learn how to build, monitor, and scale workflows.",
};

export default function TourPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Product Tour</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Take a guided tour through Levqor's powerful automation platform.
          See how easy it is to build, monitor, and scale workflows.
        </p>
      </div>

      <div className="space-y-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your dashboard gives you a real-time view of all active workflows, recent runs,
            and system health. Monitor success rates, execution times, and error patterns at a glance.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Live workflow status and execution history</li>
            <li>Performance metrics and analytics</li>
            <li>Quick access to recent failures for debugging</li>
            <li>Usage and billing overview</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Workflow Builder</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Build workflows visually with our drag-and-drop interface, or use templates to get
            started instantly. Define triggers, actions, and conditions without writing code.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Visual workflow editor with drag-and-drop</li>
            <li>50+ pre-built templates for common tasks</li>
            <li>Conditional logic and branching</li>
            <li>Test workflows before going live</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Integrations Hub</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Connect to 50+ popular tools with one-click OAuth. Manage credentials securely
            and configure how data flows between your apps.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>One-click authentication for major platforms</li>
            <li>Secure credential storage and rotation</li>
            <li>Custom API connections supported</li>
            <li>Test connections before building workflows</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              4
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoring & Alerts</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Get real-time alerts when workflows fail, performance degrades, or unusual patterns
            are detected. Our self-healing engine automatically retries and recovers from common failures.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Real-time failure notifications via Slack/email</li>
            <li>Automatic retry with exponential backoff</li>
            <li>Detailed execution logs and error traces</li>
            <li>Performance anomaly detection</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              5
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Understand how your workflows perform over time. Identify bottlenecks, optimize
            execution paths, and track cost savings from automation.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Execution time trends and performance charts</li>
            <li>Cost analysis and ROI tracking</li>
            <li>Success/failure rate breakdowns</li>
            <li>AI-powered optimization suggestions</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-center text-white mt-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Sign up for a free account and take the tour yourself.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signin" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition">
            Start Free Trial
          </Link>
          <Link href="/how-it-works" className="px-8 py-4 bg-blue-600 text-white border-2 border-white rounded-xl font-semibold hover:bg-blue-700 transition">
            How It Works
          </Link>
        </div>
      </div>
    </main>
  );
}
