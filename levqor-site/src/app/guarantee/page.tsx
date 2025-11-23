import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Money-Back Guarantee",
  description: "30-day money-back guarantee. 99.9% uptime SLA. Enterprise-grade reliability with no questions asked refunds.",
};

export default function GuaranteePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Our Guarantees</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          At Levqor, we stand behind our product with iron-clad guarantees. Your success is our success,
          and we're committed to delivering exceptional value and reliability.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">30-Day Money-Back Guarantee</h2>
        <p>
          Try Levqor risk-free for 30 days. If you're not completely satisfied with our platform for any reason,
          contact us within 30 days of your purchase and we'll refund your payment. No questions asked.
        </p>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
          <p className="font-semibold text-green-900 mb-2">100% Money-Back Promise</p>
          <p className="text-green-800">
            We believe in our product so strongly that we offer a full refund within the first 30 days.
            Simply email <a href="mailto:support@levqor.ai" className="underline">support@levqor.ai</a> and we'll process your refund immediately.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">99.9% Uptime SLA</h2>
        <p>
          For paid plans, we guarantee 99.9% uptime for our platform. If we fail to meet this commitment,
          you're eligible for service credits as outlined in our Service Level Agreement.
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Real-time status monitoring at <a href="https://api.levqor.ai/health" className="text-blue-600 hover:underline">api.levqor.ai/health</a></li>
          <li>Automatic incident notifications</li>
          <li>Transparent uptime reporting</li>
          <li>Service credits for downtime exceeding SLA thresholds</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Data Security Guarantee</h2>
        <p>
          Your data security is paramount. We guarantee:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>End-to-end encryption for data in transit and at rest</li>
          <li>SOC 2 Type II compliance (in progress)</li>
          <li>Regular third-party security audits</li>
          <li>GDPR and data privacy compliance</li>
          <li>No selling or sharing of your data</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">7-Day Free Trial Guarantee</h2>
        <p>
          Try any plan risk-free with our 7-day free trial. Here's our guarantee:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Card required:</strong> A valid payment method is required to start your trial</li>
          <li><strong>No charge during trial:</strong> You won't be billed during the 7-day trial period</li>
          <li><strong>Cancel anytime:</strong> Cancel before Day 7 ends and pay £0</li>
          <li><strong>Automatic billing:</strong> If you don't cancel, your plan renews on Day 8 at the standard price</li>
          <li><strong>One trial per account:</strong> Trial is per organization, not per plan tier</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Support Response Guarantee</h2>
        <p>
          We commit to responding to all support inquiries within our tier-specific SLAs:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Starter:</strong> 48 business hours (email only)</li>
          <li><strong>Launch:</strong> 24 business hours (priority email)</li>
          <li><strong>Growth:</strong> 12 business hours (priority support + chat)</li>
          <li><strong>Agency:</strong> 4-hour SLA for critical issues (24/7 emergency support)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Fair Billing Guarantee</h2>
        <p>
          You only pay for successful workflow executions. Failed runs due to our infrastructure issues
          are never charged. Clear, transparent pricing with no hidden fees or surprise charges.
        </p>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Questions About Our Guarantees?</h3>
          <p className="text-gray-700 mb-4">
            We're here to help. Contact our team if you have any questions about our commitments.
          </p>
          <div className="flex gap-4">
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">
              Contact Support →
            </Link>
            <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
              View Pricing →
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          All guarantees subject to our <Link href="/terms" className="underline">Terms of Service</Link> and
          <Link href="/fair-use" className="underline ml-1">Fair Use Policy</Link>.
        </p>
      </div>
    </main>
  );
}
