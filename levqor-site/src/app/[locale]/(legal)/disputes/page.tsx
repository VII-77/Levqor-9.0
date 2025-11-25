import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dispute Resolution Policy",
  description: "How to raise a dispute or complaint with Levqor, escalation process, and resolution timelines.",
};

export default function DisputesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Dispute Resolution Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          We're committed to resolving any issues quickly and fairly. This policy outlines how to
          raise a dispute, our investigation process, and escalation options.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">Our Commitment</p>
          <p className="text-blue-800">
            We take all disputes seriously and aim to resolve them within 14 business days. Most
            issues are resolved in under 5 days.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">When to File a Dispute</h2>
        <p>
          File a dispute if you experience:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Billing errors:</strong> Incorrect charges, duplicate billing, or unauthorized charges</li>
          <li><strong>Service issues:</strong> Extended downtime beyond SLA, data loss, or workflow failures</li>
          <li><strong>Refund delays:</strong> Refund not processed within stated timeframe (see <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>)</li>
          <li><strong>DFY deliverables:</strong> Work not matching agreed scope or quality standards</li>
          <li><strong>Support failures:</strong> No response within SLA timeframe (see <Link href="/support-policy" className="text-blue-600 hover:underline">Support Policy</Link>)</li>
          <li><strong>Policy violations:</strong> Belief that we violated our own terms or policies</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Before Filing a Dispute</h2>
        <p>
          Try to resolve the issue through normal support channels first:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Contact <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> with
            details of your concern</li>
          <li>Allow 24-48 hours for initial response (faster for Agency plan)</li>
          <li>If unresolved, request escalation within your support ticket</li>
          <li>If still unresolved after escalation, proceed to formal dispute</li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">How to File a Formal Dispute</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 1: Submit Dispute</h3>
        <p>
          Email <a href="mailto:disputes@levqor.ai" className="text-blue-600 hover:underline font-semibold">disputes@levqor.ai</a> with:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Subject line:</strong> "Formal Dispute - [Brief Description]"</li>
          <li><strong>Your account email:</strong> For verification</li>
          <li><strong>Detailed description:</strong> What happened, when, and why you believe it's incorrect</li>
          <li><strong>Supporting evidence:</strong> Screenshots, invoices, timestamps, correspondence</li>
          <li><strong>Desired outcome:</strong> Refund amount, service credits, or other resolution</li>
          <li><strong>Previous ticket numbers:</strong> If you've already contacted support</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 2: Acknowledgment</h3>
        <p>
          Within 2 business days, you'll receive:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Confirmation email with dispute reference number</li>
          <li>Name of assigned dispute resolution specialist</li>
          <li>Estimated timeline for investigation (typically 7-14 days)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 3: Investigation</h3>
        <p>
          Our team will:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Review your submitted evidence</li>
          <li>Check system logs, billing records, and support history</li>
          <li>May request additional information from you</li>
          <li>Consult with relevant teams (engineering, billing, DFY)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 4: Resolution</h3>
        <p>
          Within 14 business days, you'll receive:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Detailed explanation of findings</li>
          <li>Decision on dispute (upheld, partially upheld, or denied)</li>
          <li>If upheld: refund, service credits, or other remedy</li>
          <li>If denied: clear explanation with supporting evidence</li>
          <li>Information on escalation options (if not satisfied)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Escalation Process</h2>
        <p>
          If you're not satisfied with the dispute resolution:
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Level 1: Senior Review</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Reply to your dispute email requesting senior review</li>
          <li>Case reviewed by Head of Customer Success within 5 business days</li>
          <li>Final internal decision provided</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Level 2: Executive Escalation</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Email <a href="mailto:escalations@levqor.ai" className="text-blue-600 hover:underline">escalations@levqor.ai</a> with
            your dispute reference number</li>
          <li>Case reviewed by company director within 7 business days</li>
          <li>This is the final internal escalation level</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Level 3: External Resolution</h3>
        <p>
          If still unresolved, you may pursue:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Credit card chargeback:</strong> Contact your card issuer (must be within 60-120 days of charge)</li>
          <li><strong>Small claims court:</strong> For disputes under £10,000 (England and Wales)</li>
          <li><strong>Alternative dispute resolution:</strong> We're willing to participate in mediation</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">Chargeback Warning</p>
          <p className="text-yellow-800">
            Filing a chargeback before completing our dispute process may result in account suspension.
            We strongly recommend exhausting our internal escalation process first.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Common Dispute Types and Resolutions</h2>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Billing Disputes</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Duplicate charges:</strong> Full refund within 5 business days</li>
          <li><strong>Incorrect plan charge:</strong> Refund of difference + apology credit</li>
          <li><strong>Forgot to cancel:</strong> Reviewed case-by-case, may offer pro-rated refund</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Service Level Disputes</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>SLA breach:</strong> Service credits per <Link href="/sla" className="text-blue-600 hover:underline">SLA table</Link></li>
          <li><strong>Extended downtime:</strong> Pro-rated refund + service credits</li>
          <li><strong>Data loss:</strong> Full investigation, refund + compensation depending on severity</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">DFY Disputes</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Scope mismatch:</strong> Additional revisions or partial refund (see <Link href="/revisions" className="text-blue-600 hover:underline">Revisions Policy</Link>)</li>
          <li><strong>Quality issues:</strong> Rework at no charge or full/partial refund</li>
          <li><strong>Missed deadlines:</strong> Discount on future services or refund</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Response Timeframes</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Stage</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Timeframe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Dispute acknowledgment</td>
                <td className="border border-gray-300 px-4 py-2">2 business days</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Investigation & resolution</td>
                <td className="border border-gray-300 px-4 py-2">14 business days (typical: 7 days)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Senior review escalation</td>
                <td className="border border-gray-300 px-4 py-2">5 business days</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Executive escalation</td>
                <td className="border border-gray-300 px-4 py-2">7 business days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Your Rights</h2>
        <p>
          During a dispute, you have the right to:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Continued service access (unless account poses security risk)</li>
          <li>Request copy of all evidence we're considering</li>
          <li>Provide additional evidence at any stage</li>
          <li>Request case be reviewed by different team member</li>
          <li>Escalate to senior leadership</li>
          <li>Pursue external resolution if internal process doesn't satisfy</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Preventing Disputes</h2>
        <p>
          We're always working to prevent disputes by:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Clear billing notifications before charges</li>
          <li>Transparent pricing with no hidden fees</li>
          <li>Proactive communication about service issues</li>
          <li>Regular SLA reporting for Agency customers</li>
          <li>Clear DFY scope documentation and approvals</li>
        </ul>

        <div className="bg-green-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need to File a Dispute?</h3>
          <p className="text-gray-700 mb-4">
            Email <a href="mailto:disputes@levqor.ai" className="text-blue-600 hover:underline font-semibold">disputes@levqor.ai</a> with
            full details. We're committed to fair and transparent resolution.
          </p>
          <p className="text-sm text-gray-600">
            For non-dispute issues, contact <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> instead.
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Dispute Resolution Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/refunds" className="underline">Refund Policy</Link>, <Link href="/sla" className="underline">SLA</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
