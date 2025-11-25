import type { Metadata } from "next";
import Link from "next/link";
import LeadCaptureInline from "@/components/LeadCaptureInline";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Start your 7-day Levqor trial",
  description: "Try Levqor free for 7 days. Card required, cancel before Day 7 to avoid charges.",
  alternates: {
    canonical: 'https://levqor.ai/trial',
  },
};

export default function TrialPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <PageViewTracker page="/trial" />
      <h1 className="text-4xl font-bold text-gray-900">Free Trial Terms</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Try Levqor risk-free with our 7-day free trial. A valid credit card is required to start, but you won't be charged during the trial. If you cancel before Day 7 ends, you pay £0.
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
          <p className="font-semibold text-green-900 mb-2">7-Day Free Trial</p>
          <p className="text-green-800">
            Available on all subscription plans (Starter, Launch, Growth, Agency). Test all features with full access before committing to a subscription. Card required, but no charge if you cancel within 7 days.
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
          <li>10 team members</li>
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
          <li><strong>Credit card required:</strong> A valid payment method is required to start your trial</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">Card Required, But No Charge During Trial</p>
          <p className="text-blue-800">
            A valid credit card is required to verify your account and start the trial. You will NOT be charged during the 7-day trial period. If you cancel before the trial ends (Day 7), you pay £0. If you stay, your subscription begins on Day 8.
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
            Test Levqor for 7 days with full access. A credit card is required to start, but you won't be charged during the trial. Cancel anytime within 7 days to pay £0, or continue with a 30-day money-back guarantee.
          </p>
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            Start Free Trial →
          </Link>
        </div>

        {/* Lead Capture */}
        <div className="mt-12">
          <LeadCaptureInline source="trial" />
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
