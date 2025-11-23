import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Trial Terms",
  description: "Levqor's 7-day free trial - eligibility, what's included, and when billing starts.",
};

export default function TrialPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Free Trial Terms</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Try Levqor risk-free with our 7-day free trial. No credit card required to start, and
          you can cancel anytime before the trial ends without being charged.
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
          <p className="font-semibold text-green-900 mb-2">7-Day Free Trial</p>
          <p className="text-green-800">
            Available on Growth (£59/month) and Agency (£149/month) plans. Test all features with
            full access before committing to a subscription.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's Included</h2>
        <p>
          During your 7-day trial, you get full access to your chosen plan:
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Growth Plan Trial</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>100 workflows</li>
          <li>50,000 workflow runs per month</li>
          <li>5 team members</li>
          <li>All connectors (Core + Beta)</li>
          <li>20,000 AI credits</li>
          <li>Priority support (12-hour response time)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Agency Plan Trial</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>500 workflows</li>
          <li>250,000 workflow runs per month</li>
          <li>15 team members</li>
          <li>All connectors + SSO</li>
          <li>100,000 AI credits</li>
          <li>4-hour SLA support (see <Link href="/sla" className="text-blue-600 hover:underline">SLA details</Link>)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Eligibility</h2>
        <p>
          To qualify for a free trial:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>New customers only:</strong> You must not have an existing Levqor account</li>
          <li><strong>One trial per organization:</strong> One trial per company/email domain</li>
          <li><strong>Valid email required:</strong> Business email preferred (personal emails accepted)</li>
          <li><strong>No credit card needed:</strong> Start your trial without payment information</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">No Credit Card Required</p>
          <p className="text-blue-800">
            Unlike most SaaS products, we don't ask for payment details to start your trial. You'll
            only need to add a payment method if you decide to continue after the 7 days.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">When Billing Starts</h2>
        <p>
          Your trial period lasts exactly 7 days from signup. Here's what happens:
        </p>
        
        <ol className="list-decimal list-inside space-y-3 ml-4">
          <li>
            <strong>Day 1-7:</strong> Full access to your chosen plan, no charges
          </li>
          <li>
            <strong>Day 5:</strong> We'll send a reminder email that your trial ends in 2 days
          </li>
          <li>
            <strong>Day 7:</strong> Trial expires. Choose to:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Upgrade to a paid plan (enter payment details)</li>
              <li>Downgrade to Starter or Launch plan (£9/month or £29/month)</li>
              <li>Let your account expire (no charge, workflows paused)</li>
            </ul>
          </li>
          <li>
            <strong>After Day 7:</strong> If no action taken, account moves to free tier (limited features)
          </li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Canceling Your Trial</h2>
        <p>
          You can cancel your trial at any time with no charges:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Click "Cancel Trial" in your dashboard settings</li>
          <li>Or email <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> to cancel</li>
          <li>Your workflows will remain accessible in read-only mode for 30 days</li>
          <li>Export your workflow configurations and data before canceling</li>
        </ul>

        <p className="text-sm text-gray-600 mt-4">
          See our <Link href="/cancellation" className="text-blue-600 hover:underline">Cancellation Policy</Link> for
          details on account closure and data retention.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Converting to a Paid Plan</h2>
        <p>
          To continue using Levqor after your trial:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Go to your dashboard and click "Upgrade Plan"</li>
          <li>Choose monthly or annual billing (save 17% with annual)</li>
          <li>Enter your payment details</li>
          <li>Your first payment will be charged immediately</li>
          <li>Future payments will be processed on the same date each month/year</li>
        </ol>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">30-Day Money-Back Guarantee</p>
          <p className="text-yellow-800">
            Even after your trial, you're protected by our 30-day money-back guarantee. If Levqor
            doesn't meet your needs, request a full refund within 30 days of your first payment.
            See our <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link> for details.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Trial Limitations</h2>
        <p>
          Your trial is subject to our standard policies:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link> applies to prevent abuse</li>
          <li><Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> prohibits illegal or harmful activities</li>
          <li>We reserve the right to terminate trials that violate our policies</li>
          <li>Multiple accounts or fraudulent signups may result in permanent ban</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Support During Trial</h2>
        <p>
          Trial users receive the same support as paid customers:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Growth trial:</strong> 12-hour priority support response time</li>
          <li><strong>Agency trial:</strong> 4-hour SLA for critical incidents</li>
          <li><strong>All plans:</strong> Access to documentation, guides, and in-app chat</li>
        </ul>

        <p className="text-sm text-gray-600 mt-4">
          See our <Link href="/support-policy" className="text-blue-600 hover:underline">Support Policy</Link> for
          full details on response times and channels.
        </p>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Start Your Free Trial?</h3>
          <p className="text-gray-700 mb-4">
            Test Levqor for 7 days with no credit card required. Cancel anytime, or upgrade to
            continue with a 30-day money-back guarantee.
          </p>
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            Start Free Trial →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          These Free Trial Terms are part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/refunds" className="underline">Refund Policy</Link>, <Link href="/cancellation" className="underline">Cancellation Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
