import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support Policy",
  description: "Levqor support channels, response times by plan tier, and how to get help with your automation workflows.",
};

export default function SupportPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Support Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          We're committed to helping you succeed with Levqor. This policy outlines our support
          channels, response times, and what you can expect from our team.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Support Channels</h2>
        
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-700 mb-3">
              Contact us at <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> for
              technical issues, billing questions, or general inquiries.
            </p>
            <p className="text-xs text-gray-600">Available to all plan tiers</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">In-App Chat</h3>
            <p className="text-sm text-gray-700 mb-3">
              Use the chat widget in your dashboard for quick questions and real-time assistance.
            </p>
            <p className="text-xs text-gray-600">Growth and Agency plans</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-sm text-gray-700 mb-3">
              Browse our <Link href="/docs" className="text-blue-600 hover:underline">knowledge base</Link> for
              guides, tutorials, and troubleshooting help.
            </p>
            <p className="text-xs text-gray-600">Self-service, available 24/7</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Video Calls</h3>
            <p className="text-sm text-gray-700 mb-3">
              Schedule a call with our team for complex workflows or onboarding assistance.
            </p>
            <p className="text-xs text-gray-600">Agency plan only</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Response Times by Plan</h2>

        <div className="space-y-4 my-6">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Starter Plan</h3>
              <span className="text-sm text-gray-600">£9/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Email support:</strong> 48-hour response time</li>
              <li><strong>Coverage:</strong> Business hours (9am-5pm GMT, Monday-Friday)</li>
              <li><strong>Included:</strong> General questions, billing support, basic troubleshooting</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Launch Plan</h3>
              <span className="text-sm text-gray-600">£29/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Priority email:</strong> 24-hour response time</li>
              <li><strong>Coverage:</strong> Business hours (9am-5pm GMT, Monday-Friday)</li>
              <li><strong>Included:</strong> Technical support, workflow debugging, integration help</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Growth Plan</h3>
              <span className="text-sm text-gray-600">£59/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Priority support:</strong> 12-hour response time</li>
              <li><strong>Coverage:</strong> Extended hours (8am-8pm GMT, Monday-Saturday)</li>
              <li><strong>Included:</strong> In-app chat, workflow optimization, connector setup assistance</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Agency Plan</h3>
              <span className="text-sm text-gray-600">£149/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>4-hour SLA:</strong> Critical incidents resolved within 4 hours</li>
              <li><strong>Coverage:</strong> 24/7 emergency support for critical issues</li>
              <li><strong>Included:</strong> Video calls, dedicated support contact, workflow reviews</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          For uptime commitments and incident response details, see our <Link href="/sla" className="text-blue-600 hover:underline">SLA page</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Priority Support Add-On</h2>
        <p>
          Add Priority Support to any plan for faster response times and extended coverage:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>12-hour response time</strong> (upgrade from 24-48 hours)</li>
          <li><strong>Extended hours:</strong> 8am-8pm GMT, Monday-Saturday</li>
          <li><strong>In-app chat access</strong> for quick questions</li>
          <li><strong>£29/month</strong> add-on to any plan</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What We Support</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Included Support</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Platform bugs and technical issues</li>
          <li>Account and billing questions</li>
          <li>Workflow debugging and error diagnosis</li>
          <li>Integration and connector setup</li>
          <li>Best practices and optimization advice</li>
          <li>Feature requests and product feedback</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Not Included (Requires DFY Services)</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Building custom workflows from scratch</li>
          <li>Writing code or complex logic for your specific use case</li>
          <li>Data migration or transformation services</li>
          <li>Third-party API integration development</li>
        </ul>

        <p className="text-sm mt-4">
          For custom workflow development, see our <Link href="/pricing" className="text-blue-600 hover:underline">Done-For-You packages</Link> or <Link href="/dfy-contract" className="text-blue-600 hover:underline">DFY engagement terms</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Support Hours and Holidays</h2>
        <p>
          Our support team operates during these hours:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Business hours:</strong> 9am-5pm GMT, Monday-Friday (all plans)</li>
          <li><strong>Extended hours:</strong> 8am-8pm GMT, Monday-Saturday (Growth and Agency)</li>
          <li><strong>24/7 emergency:</strong> Critical incidents only (Agency plan)</li>
          <li><strong>Holidays:</strong> Reduced support on UK bank holidays (emergency coverage maintained for Agency plan)</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">Emergency Support (Agency Only)</p>
          <p className="text-yellow-800">
            For critical production issues outside business hours, Agency plan customers can contact
            our emergency line. We'll respond within 4 hours for incidents that impact your live workflows.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Escalation Process</h2>
        <p>
          If your issue isn't resolved to your satisfaction:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Reply to your support ticket requesting escalation</li>
          <li>Your case will be reviewed by a senior support engineer within 24 hours</li>
          <li>For further escalation, email <a href="mailto:escalations@levqor.ai" className="text-blue-600 hover:underline">escalations@levqor.ai</a></li>
          <li>See our <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link> for formal complaints</li>
        </ol>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help Now?</h3>
          <p className="text-gray-700 mb-4">
            Email <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> or
            use the chat widget in your dashboard. We're here to help!
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact Support →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Support Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/sla" className="underline">SLA</Link>, <Link href="/fair-use" className="underline">Fair Use Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
