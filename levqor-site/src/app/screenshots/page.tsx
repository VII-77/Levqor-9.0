import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Screenshots",
  description: "See Levqor in action. Browse screenshots of our workflow builder, dashboard, monitoring tools, and integrations.",
};

export default function ScreenshotsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Screenshots</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See Levqor in action. Browse our platform's key features and interfaces.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800">Dashboard Overview</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Main Dashboard</h3>
              <p className="text-gray-700 text-sm">
                Real-time view of all workflows, execution history, and performance metrics.
                Monitor success rates and system health at a glance.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-gray-800">Workflow Builder</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Visual Workflow Editor</h3>
              <p className="text-gray-700 text-sm">
                Drag-and-drop interface for building workflows. Connect triggers, actions,
                and conditions without writing code.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-bold text-gray-800">Integrations</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Integrations Hub</h3>
              <p className="text-gray-700 text-sm">
                Connect to 50+ apps with one-click OAuth. Manage credentials and configure
                data flows between your tools.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-gray-800">Analytics</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-700 text-sm">
                Detailed charts and metrics showing execution times, success rates,
                cost analysis, and optimization opportunities.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🚨</div>
                <h3 className="text-xl font-bold text-gray-800">Monitoring</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-700 text-sm">
                Live alerts, error tracking, and self-healing workflows. Get notified
                instantly when issues occur.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-800">Execution Logs</h3>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Detailed Logging</h3>
              <p className="text-gray-700 text-sm">
                Complete execution traces with timestamps, payloads, and error details
                for debugging and auditing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to See It Live?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Sign up for a free account and explore the platform yourself. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Start Free Trial
            </Link>
            <Link href="/tour" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition">
              Take the Tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
