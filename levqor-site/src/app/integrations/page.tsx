import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect Levqor with 50+ popular apps and services. Gmail, Slack, Sheets, Stripe, Salesforce, and more.",
};

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Integrations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect Levqor with 50+ popular tools and services. Build powerful workflows
            across your entire tech stack.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Communication</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Slack</li>
              <li>• Gmail</li>
              <li>• Microsoft Teams</li>
              <li>• Twilio</li>
              <li>• SendGrid</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Productivity</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Google Sheets</li>
              <li>• Airtable</li>
              <li>• Notion</li>
              <li>• Trello</li>
              <li>• Asana</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sales & CRM</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Salesforce</li>
              <li>• HubSpot</li>
              <li>• Pipedrive</li>
              <li>• Intercom</li>
              <li>• Zendesk</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payments</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Stripe</li>
              <li>• PayPal</li>
              <li>• Chargebee</li>
              <li>• Paddle</li>
              <li>• Square</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Development</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• GitHub</li>
              <li>• GitLab</li>
              <li>• Jira</li>
              <li>• Linear</li>
              <li>• Sentry</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cloud & Storage</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• AWS S3</li>
              <li>• Google Drive</li>
              <li>• Dropbox</li>
              <li>• Azure Blob</li>
              <li>• Cloudflare</li>
            </ul>
          </div>
        </div>

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
