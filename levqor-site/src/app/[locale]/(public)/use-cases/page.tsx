import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Use Cases",
  description: "Discover how teams use Levqor to automate workflows across sales, marketing, customer success, and operations.",
};

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Use Cases</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how teams across industries use Levqor to automate critical workflows
            and save thousands of hours every month.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sales & CRM Automation</h2>
            <p className="text-gray-700 mb-4">
              Automatically sync leads between your website, email, and CRM. Update deal stages,
              send follow-up emails, and notify your team when hot leads come in.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Auto-sync leads from web forms to Salesforce/HubSpot</li>
              <li>• Send personalized follow-up sequences</li>
              <li>• Alert sales team on high-value opportunities</li>
              <li>• Update deal stages based on customer actions</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Email & Communication</h2>
            <p className="text-gray-700 mb-4">
              Automate email workflows, parse incoming messages, and route them to the right teams.
              Never miss an important customer request.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Parse support emails and create tickets</li>
              <li>• Send automated status updates</li>
              <li>• Route urgent requests to on-call team</li>
              <li>• Sync email activity to Slack channels</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer Success</h2>
            <p className="text-gray-700 mb-4">
              Monitor customer health, automate onboarding sequences, and proactively reach out
              before churn happens.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Automated onboarding email drips</li>
              <li>• Track product usage and engagement</li>
              <li>• Alert CSMs when accounts go cold</li>
              <li>• Send NPS surveys at key milestones</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Reporting & Analytics</h2>
            <p className="text-gray-700 mb-4">
              Pull data from multiple sources, generate automated reports, and share insights
              with stakeholders on autopilot.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Daily/weekly automated reports to Slack</li>
              <li>• Sync metrics to Google Sheets dashboards</li>
              <li>• Alert on anomalies and threshold breaches</li>
              <li>• Consolidate data across tools</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Billing & Subscriptions</h2>
            <p className="text-gray-700 mb-4">
              Automate Stripe billing events, handle failed payments, and keep your finance
              team in sync with subscription changes.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Notify finance on successful payments</li>
              <li>• Auto-retry failed payment methods</li>
              <li>• Update CRM with subscription status</li>
              <li>• Send dunning emails for past-due accounts</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">DevOps & IT Operations</h2>
            <p className="text-gray-700 mb-4">
              Automate deployments, monitor infrastructure, and respond to incidents faster
              with intelligent workflows.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Auto-deploy on git push with status notifications</li>
              <li>• Monitor health checks and alert on failures</li>
              <li>• Create incident tickets from error logs</li>
              <li>• Sync deployment data to project management</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Workflows?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 7-day free trial. Build your first workflow in minutes.
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
      </div>
    </div>
  );
}
