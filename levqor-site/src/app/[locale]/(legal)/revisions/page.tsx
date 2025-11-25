import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DFY Revisions Policy",
  description: "Revision rounds included with Done-For-You packages, change request process, and additional work billing.",
};

export default function RevisionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">DFY Revisions Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          All Done-For-You (DFY) packages include revision rounds to ensure your workflows meet your
          exact requirements. This policy explains what's included and how additional work is billed.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">Revisions Included</p>
          <p className="text-blue-800">
            Every DFY package includes 2 rounds of revisions at no extra cost. Additional revisions
            are billed hourly or as a fixed-price change request.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What Counts as a Revision?</h2>
        <p>
          A revision is any change to the delivered workflow that:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Stays within original scope:</strong> Adjusts implementation details without changing project goals</li>
          <li><strong>Fixes misunderstandings:</strong> Corrects deliverables that don't match your specifications</li>
          <li><strong>Refines functionality:</strong> Tweaks triggers, actions, or logic based on initial testing</li>
          <li><strong>Updates integrations:</strong> Reconnects or reconfigures existing connectors</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's NOT a Revision?</h2>
        <p>
          These are considered <strong>scope changes</strong> and are billed separately:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>New features:</strong> Adding functionality not in the original scope</li>
          <li><strong>Additional workflows:</strong> Building new workflows beyond the package limit</li>
          <li><strong>Different integrations:</strong> Replacing one connector with a completely different one</li>
          <li><strong>Architectural changes:</strong> Fundamentally redesigning the workflow approach</li>
          <li><strong>Third-party API work:</strong> Custom development for external services</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Revisions by Package Tier</h2>

        <div className="space-y-4 my-6">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Starter</h3>
              <span className="text-sm text-gray-600">£149 one-time</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Included revisions:</strong> 2 rounds</li>
              <li><strong>Turnaround time:</strong> 3-5 business days per revision</li>
              <li><strong>Scope:</strong> Up to 3 simple workflows</li>
              <li><strong>Additional revisions:</strong> £50 per round</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Professional</h3>
              <span className="text-sm text-gray-600">£299 one-time</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Included revisions:</strong> 2 rounds</li>
              <li><strong>Turnaround time:</strong> 2-4 business days per revision</li>
              <li><strong>Scope:</strong> Up to 5 moderate workflows</li>
              <li><strong>Additional revisions:</strong> £75 per round</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Enterprise</h3>
              <span className="text-sm text-gray-600">£499 one-time</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Included revisions:</strong> 2 rounds</li>
              <li><strong>Turnaround time:</strong> 1-3 business days per revision</li>
              <li><strong>Scope:</strong> Up to 10 complex workflows</li>
              <li><strong>Additional revisions:</strong> £100 per round</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Revision Process</h2>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 1: Initial Delivery</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You receive completed workflows in your Levqor dashboard</li>
          <li>Detailed documentation provided (triggers, actions, expected behavior)</li>
          <li>You have 7 days to review and test</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 2: Request Revisions</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Reply to your DFY delivery email with specific change requests</li>
          <li>Provide clear examples of what needs to be adjusted</li>
          <li>Include screenshots, error messages, or workflow run IDs if applicable</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 3: Scope Clarification</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Our team reviews your requests within 1 business day</li>
          <li>We confirm if changes are covered by included revisions or require additional fees</li>
          <li>For scope changes, you'll receive a quote before work begins</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 4: Revised Delivery</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Updates delivered within turnaround time for your package</li>
          <li>You review and either approve or request next revision round</li>
          <li>Process repeats until revisions exhausted or workflows approved</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Step 5: Final Approval</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You confirm workflows meet requirements</li>
          <li>Project marked complete</li>
          <li>30-day support period begins for bug fixes (see below)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Post-Delivery Support</h2>
        <p>
          After final approval, you receive <strong>30 days of bug-fix support</strong> at no charge:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Covered:</strong> Workflows not functioning as documented, errors, integration failures</li>
          <li><strong>Not covered:</strong> New features, scope changes, or different requirements</li>
          <li><strong>Response time:</strong> 2 business days for bug reports</li>
          <li><strong>Fix delivery:</strong> 3-5 business days depending on complexity</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">30-Day Window</p>
          <p className="text-yellow-800">
            Bug-fix support expires 30 days after final approval. After that, maintenance falls under
            standard support (see <Link href="/support-policy" className="text-blue-600 hover:underline">Support Policy</Link>) or
            requires a new DFY engagement.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Additional Work Billing</h2>
        <p>
          If you need changes beyond included revisions, we offer two billing options:
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Option 1: Per-Revision Fixed Price</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Starter: £50 per additional revision round</li>
          <li>Professional: £75 per additional revision round</li>
          <li>Enterprise: £100 per additional revision round</li>
          <li>Billed upfront before work begins</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Option 2: Hourly Rate</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Standard rate:</strong> £75/hour</li>
          <li><strong>Best for:</strong> Scope expansions, complex changes, or uncertain time estimates</li>
          <li>Billed in 15-minute increments</li>
          <li>You'll receive a time estimate before work begins</li>
          <li>Invoiced after work completion with detailed time log</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Refunds for Unsatisfactory Work</h2>
        <p>
          If we fail to deliver work that meets the agreed scope after 2 revision rounds:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You may request a full or partial refund</li>
          <li>We'll review the original scope documentation and delivered work</li>
          <li>Refund amount based on percentage of work not meeting requirements</li>
          <li>See our <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link> and <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution</Link> for
            full details</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Revision Best Practices</h2>
        <p>
          To get the most from your included revisions:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Be specific:</strong> Provide clear, actionable feedback rather than vague requests</li>
          <li><strong>Batch changes:</strong> Submit all revision requests for a round at once</li>
          <li><strong>Test thoroughly:</strong> Ensure you've identified all issues before requesting revisions</li>
          <li><strong>Prioritize:</strong> Focus on critical functionality first, nice-to-haves later</li>
          <li><strong>Document scope:</strong> Keep original requirements clear to avoid scope creep</li>
        </ul>

        <div className="bg-green-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Revisions?</h3>
          <p className="text-gray-700 mb-4">
            Reply to your DFY delivery email with revision requests, or contact{" "}
            <a href="mailto:dfy@levqor.ai" className="text-blue-600 hover:underline">dfy@levqor.ai</a> if
            you need clarification on what's covered.
          </p>
          <Link href="/dfy-contract" className="text-blue-600 hover:underline font-medium">
            View DFY Contract Terms →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Revisions Policy is part of our <Link href="/dfy-contract" className="underline">DFY engagement terms</Link>. 
          See also: <Link href="/refunds" className="underline">Refund Policy</Link>, <Link href="/support-policy" className="underline">Support Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
