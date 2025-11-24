import Link from "next/link";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Data Rights | Levqor',
  description: 'Learn about your data rights under GDPR and how to exercise them, including access, rectification, erasure, and portability.',
  robots: 'index, follow'
}

export default function DataRightsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Data Rights
          </h1>
          <p className="text-gray-600 text-lg">
            Understanding and exercising your rights regarding personal data
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Last updated: November 24, 2025
          </p>
        </div>

        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🛡️ Your Privacy Matters</h3>
          <p className="text-blue-800 leading-relaxed">
            You have important rights regarding your personal data. This page explains each right in simple terms and shows you how to exercise them. We're committed to responding to all verified requests promptly and transparently.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Rights Under GDPR & Privacy Laws</h2>
          
          {/* Right 1: Access */}
          <div className="border-l-4 border-green-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              1. Right of Access
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can request a copy of all personal data we hold about you.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>What you'll receive:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>Your account information (email, name, settings)</li>
              <li>Usage data (workflows created, automations configured)</li>
              <li>Billing history (subscription details, invoices)</li>
              <li>Support interactions (tickets, communications)</li>
            </ul>
            <div className="bg-green-50 rounded p-3">
              <p className="text-sm text-green-800">
                <strong>How to request:</strong> Submit a data export request below, and we'll send you a complete copy within 30 days.
              </p>
            </div>
          </div>

          {/* Right 2: Rectification */}
          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              2. Right to Rectification
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can ask us to correct inaccurate or incomplete personal data.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Examples:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>Update your email address or name</li>
              <li>Correct company information in your profile</li>
              <li>Fix billing address errors</li>
            </ul>
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>How to update:</strong> Most information can be updated directly in your <Link href="/dashboard/settings" className="underline">account settings</Link>. For other corrections, contact support.
              </p>
            </div>
          </div>

          {/* Right 3: Erasure */}
          <div className="border-l-4 border-red-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              3. Right to Erasure ("Right to be Forgotten")
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can request deletion of your personal data in certain circumstances.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>When you can request deletion:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>The data is no longer necessary for the purpose it was collected</li>
              <li>You withdraw consent and there's no other legal basis for processing</li>
              <li>You object to processing and there are no overriding legitimate grounds</li>
              <li>The data was unlawfully processed</li>
            </ul>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Limitations:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>We may need to retain certain data for legal/compliance reasons (e.g., tax records for 7 years)</li>
              <li>Billing records must be kept for accounting purposes</li>
              <li>Anonymized analytics data may be retained</li>
            </ul>
            <div className="bg-red-50 rounded p-3">
              <p className="text-sm text-red-800">
                <strong>How to request:</strong> Submit a deletion request below. We'll confirm deletion within 30 days or explain any data we must legally retain.
              </p>
            </div>
          </div>

          {/* Right 4: Restriction */}
          <div className="border-l-4 border-yellow-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              4. Right to Restriction of Processing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can ask us to temporarily stop processing your data in certain situations.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>When you can restrict processing:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>You're contesting the accuracy of the data</li>
              <li>Processing is unlawful but you don't want erasure</li>
              <li>We no longer need the data, but you need it for legal claims</li>
              <li>You've objected to processing pending verification of legitimate grounds</li>
            </ul>
            <div className="bg-yellow-50 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>How to request:</strong> Contact our support team with details of your restriction request.
              </p>
            </div>
          </div>

          {/* Right 5: Portability */}
          <div className="border-l-4 border-purple-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5. Right to Data Portability
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can receive your data in a structured, commonly used format and transmit it to another service.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>What's included:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>Workflow configurations (JSON format)</li>
              <li>Automation settings (CSV/JSON)</li>
              <li>Account preferences and settings</li>
            </ul>
            <div className="bg-purple-50 rounded p-3">
              <p className="text-sm text-purple-800">
                <strong>How to request:</strong> Use the data export request below. We'll provide machine-readable formats suitable for transfer to other platforms.
              </p>
            </div>
          </div>

          {/* Right 6: Object */}
          <div className="border-l-4 border-orange-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              6. Right to Object
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can object to processing of your personal data in certain circumstances.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>You can object to:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>Direct marketing (we'll stop immediately)</li>
              <li>Processing based on legitimate interests (unless we demonstrate compelling grounds)</li>
              <li>Processing for research or statistical purposes (in certain cases)</li>
            </ul>
            <div className="bg-orange-50 rounded p-3">
              <p className="text-sm text-orange-800">
                <strong>How to object:</strong> Contact our support team or use your account settings to manage marketing preferences.
              </p>
            </div>
          </div>

          {/* Right 7: Withdraw Consent */}
          <div className="border-l-4 border-indigo-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              7. Right to Withdraw Consent
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> Where processing is based on consent, you can withdraw that consent at any time.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>Examples:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mb-3">
              <li>Opt out of marketing emails</li>
              <li>Disable optional analytics</li>
              <li>Turn off AI features</li>
              <li>Revoke cookie consent</li>
            </ul>
            <div className="bg-indigo-50 rounded p-3">
              <p className="text-sm text-indigo-800">
                <strong>How to withdraw:</strong> Use the consent withdrawal request below or manage preferences in your account settings.
              </p>
            </div>
          </div>

          {/* Right 8: Complain */}
          <div className="border-l-4 border-pink-500 pl-6 py-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              8. Right to Lodge a Complaint
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>What it means:</strong> You can file a complaint with your data protection authority if you believe we've violated your rights.
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <strong>UK Supervisory Authority:</strong>
            </p>
            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
              <p><strong>Information Commissioner's Office (ICO)</strong></p>
              <p className="mt-1">Website: <a href="https://ico.org.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
              <p>Helpline: 0303 123 1113</p>
            </div>
            <p className="text-gray-600 text-sm mt-3">
              We encourage you to contact us first so we can address your concerns directly.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 my-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit a Data Rights Request</h2>
          <p className="text-gray-700 mb-6">
            Use the options below to exercise your rights. We'll respond to verified requests within 30 days.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border-2 border-green-200 hover:border-green-500 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-semibold text-gray-900 mb-2">Request Data Export</h3>
              <p className="text-sm text-gray-600 mb-4">Get a complete copy of your personal data</p>
              <Link href="/api/privacy/export" className="text-sm text-green-600 hover:underline font-medium">
                Submit Export Request →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-red-200 hover:border-red-500 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🗑️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Request Data Deletion</h3>
              <p className="text-sm text-gray-600 mb-4">Permanently delete your personal data</p>
              <Link href="/api/privacy/delete" className="text-sm text-red-600 hover:underline font-medium">
                Submit Deletion Request →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-indigo-200 hover:border-indigo-500 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-semibold text-gray-900 mb-2">Withdraw Consent</h3>
              <p className="text-sm text-gray-600 mb-4">Revoke consent for data processing</p>
              <Link href="/api/privacy/consent/withdraw" className="text-sm text-indigo-600 hover:underline font-medium">
                Withdraw Consent →
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              <strong>📧 Alternative:</strong> You can also email your request to <a href="mailto:privacy@levqor.ai" className="underline">privacy@levqor.ai</a> or contact our support team.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">How We Process Requests</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Request Received</h4>
                <p className="text-sm text-gray-600">We log your request and send an acknowledgment email</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Identity Verification</h4>
                <p className="text-sm text-gray-600">We verify your identity to protect your data (may request additional information)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Processing</h4>
                <p className="text-sm text-gray-600">We fulfill your request (export data, delete records, etc.)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Confirmation</h4>
                <p className="text-sm text-gray-600">We send confirmation of the action taken within 30 days</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Is there a fee for exercising my rights?</h4>
              <p className="text-sm text-gray-600">No, we process all requests free of charge unless they are manifestly unfounded or excessive.</p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">How long does it take to process my request?</h4>
              <p className="text-sm text-gray-600">We aim to respond within 30 days. For complex requests, we may extend this by 2 months with notification.</p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Can I request deletion while keeping my account?</h4>
              <p className="text-sm text-gray-600">Partial deletion is possible for certain data types. Contact support to discuss your specific needs.</p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">What format will my data export be in?</h4>
              <p className="text-sm text-gray-600">Exports are provided in common formats (JSON, CSV) that are machine-readable and portable.</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Related Policies</h3>
          <p className="text-blue-800 text-sm mb-4">
            This page supplements our <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link> and <Link href="/gdpr" className="text-blue-600 hover:underline font-semibold">GDPR page</Link>. For complete legal terms, please review those documents.
          </p>
        </section>

        <div className="border-t pt-8 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/privacy" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1">How we collect and use data</p>
            </Link>
            <Link href="/gdpr" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">GDPR Compliance</h4>
              <p className="text-sm text-gray-600 mt-1">Our GDPR compliance details</p>
            </Link>
            <Link href="/dpa" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Data Processing Addendum</h4>
              <p className="text-sm text-gray-600 mt-1">DPA for enterprise customers</p>
            </Link>
            <Link href="/cookies" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Cookie Policy</h4>
              <p className="text-sm text-gray-600 mt-1">How we use cookies</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
