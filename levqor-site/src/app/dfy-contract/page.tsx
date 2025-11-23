import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DFY Engagement Terms",
  description: "Done-For-You service contract - scope, deliverables, timelines, acceptance criteria, and project governance.",
};

export default function DFYContractPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">DFY Engagement Terms</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          These terms govern all Done-For-You (DFY) automation projects. By purchasing a DFY package,
          you agree to this contract and our standard <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">Professional Services Agreement</p>
          <p className="text-blue-800">
            DFY packages are professional services engagements. We build custom workflows to your
            specifications with clear deliverables, timelines, and acceptance criteria.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">DFY Package Tiers</h2>

        <div className="space-y-4 my-6">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Starter</h3>
              <span className="text-2xl font-bold text-gray-900">£149</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Workflows:</strong> Up to 3 simple workflows</li>
              <li><strong>Complexity:</strong> Basic automations (email, Sheets, notifications)</li>
              <li><strong>Delivery:</strong> 5-7 business days</li>
              <li><strong>Revisions:</strong> 2 rounds included (see <Link href="/revisions" className="text-blue-600 hover:underline">Revisions Policy</Link>)</li>
              <li><strong>Support:</strong> 30-day bug-fix support post-delivery</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Professional</h3>
              <span className="text-2xl font-bold text-gray-900">£299</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Workflows:</strong> Up to 5 moderate workflows</li>
              <li><strong>Complexity:</strong> Multi-step, conditional logic, data transformations</li>
              <li><strong>Delivery:</strong> 7-10 business days</li>
              <li><strong>Revisions:</strong> 2 rounds included (faster turnaround)</li>
              <li><strong>Support:</strong> 30-day bug-fix + priority support access</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">DFY Enterprise</h3>
              <span className="text-2xl font-bold text-gray-900">£499</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Workflows:</strong> Up to 10 complex workflows</li>
              <li><strong>Complexity:</strong> Advanced integrations, API calls, custom logic, error handling</li>
              <li><strong>Delivery:</strong> 10-14 business days</li>
              <li><strong>Revisions:</strong> 2 rounds included (expedited turnaround)</li>
              <li><strong>Support:</strong> 30-day bug-fix + dedicated support contact</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Project Workflow</h2>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">1. Purchase and Intake</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You purchase a DFY package via Stripe checkout</li>
          <li>Within 24 hours, you receive intake form via email</li>
          <li>Complete form with workflow requirements, integrations, and goals</li>
          <li>Our team reviews and may schedule kickoff call (Professional/Enterprise)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">2. Scope Definition</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>We send detailed scope document within 2 business days</li>
          <li>Document includes: workflows to be built, integrations, acceptance criteria, timeline</li>
          <li>You review and approve scope (or request clarifications)</li>
          <li><strong>Work begins only after scope approval</strong></li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">3. Development</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Our automation engineers build workflows in your Levqor account</li>
          <li>You receive progress updates (frequency depends on package tier)</li>
          <li>Mid-project check-ins for Professional/Enterprise packages</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">4. Delivery and Testing</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Initial delivery within stated timeline</li>
          <li>Workflows activated in your dashboard with full documentation</li>
          <li>You have 7 days to test and provide revision feedback</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">5. Revisions</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>2 rounds of revisions included (see <Link href="/revisions" className="text-blue-600 hover:underline">Revisions Policy</Link>)</li>
          <li>Revisions processed within turnaround time for your package</li>
          <li>Scope changes require additional payment</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">6. Final Approval</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You confirm workflows meet acceptance criteria</li>
          <li>Project marked complete</li>
          <li>30-day bug-fix support period begins</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Client Responsibilities</h2>
        <p>
          To ensure timely delivery, you must provide:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Access:</strong> Admin access to all third-party tools to be integrated (Gmail, Sheets, Slack, etc.)</li>
          <li><strong>Credentials:</strong> API keys, OAuth tokens, or other authentication required</li>
          <li><strong>Requirements:</strong> Clear, detailed specifications in intake form</li>
          <li><strong>Timely responses:</strong> Approval/feedback within 3 business days of our requests</li>
          <li><strong>Testing:</strong> Thoroughly test delivered workflows and provide specific feedback</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">Timeline Delays</p>
          <p className="text-yellow-800">
            Delivery timelines assume prompt responses to our requests. If you don't respond within 5
            business days, the project may be paused and timelines extended accordingly.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Acceptance Criteria</h2>
        <p>
          Workflows are considered "done" when they:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Execute successfully for the specified triggers and actions</li>
          <li>Integrate correctly with all specified third-party services</li>
          <li>Match the functionality described in the approved scope document</li>
          <li>Include documentation explaining how to use and maintain them</li>
        </ul>

        <p className="mt-4">
          <strong>Acceptance is implied</strong> if you don't provide revision feedback within 14 days
          of initial delivery.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's Included</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Custom workflow design and implementation</li>
          <li>Integration setup with supported connectors (Gmail, Sheets, Slack, etc.)</li>
          <li>Testing and quality assurance</li>
          <li>Documentation (triggers, actions, expected behavior)</li>
          <li>2 rounds of revisions within scope</li>
          <li>30-day bug-fix support post-approval</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's NOT Included</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Third-party service subscriptions (you must have active accounts for Slack, Gmail, etc.)</li>
          <li>Custom API development for unsupported integrations</li>
          <li>Ongoing maintenance beyond 30-day bug-fix period (requires support plan)</li>
          <li>Training or onboarding for your team (available separately)</li>
          <li>Data migration or historical data processing</li>
          <li>Workflows beyond the package limit (requires additional purchase)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Intellectual Property</h2>
        <p>
          Upon final payment and acceptance:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You own the workflow configurations we create</li>
          <li>You may modify, duplicate, or export them</li>
          <li>We retain rights to reusable templates and patterns</li>
          <li>You may not resell or redistribute the exact workflows to third parties</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Cancellation and Refunds</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Before Work Begins</h3>
        <p>
          Full refund available if you cancel <strong>before scope approval</strong>.
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Work in Progress</h3>
        <p>
          Partial refund based on work completed:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>0-25% complete: 75% refund</li>
          <li>25-50% complete: 50% refund</li>
          <li>50-75% complete: 25% refund</li>
          <li>75-100% complete: No refund</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">After Delivery</h3>
        <p>
          Refunds available within 30 days if deliverables don't match approved scope (see <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>).
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Warranties and Limitations</h2>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>30-day warranty:</strong> Workflows will function as documented for 30 days post-delivery</li>
          <li><strong>Third-party changes:</strong> We're not responsible for breakages caused by third-party API changes</li>
          <li><strong>Data integrity:</strong> You're responsible for testing workflows with non-production data before live use</li>
          <li><strong>Uptime:</strong> Workflows are subject to platform uptime (see <Link href="/sla" className="text-blue-600 hover:underline">SLA</Link>)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Dispute Resolution</h2>
        <p>
          If you're not satisfied with DFY deliverables:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Submit revision requests (2 rounds included)</li>
          <li>If still unresolved, contact <a href="mailto:dfy@levqor.ai" className="text-blue-600 hover:underline">dfy@levqor.ai</a> for
            escalation</li>
          <li>See our <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link> for
            formal complaint process</li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Limitation of Liability</h2>
        <p className="text-sm">
          Our total liability for any DFY engagement is limited to the amount you paid for that
          package. We are not liable for indirect, consequential, or incidental damages including
          lost profits, data loss, or business interruption.
        </p>

        <div className="bg-green-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Get Started?</h3>
          <p className="text-gray-700 mb-4">
            Purchase a DFY package and receive your intake form within 24 hours. Our team will handle
            the rest, from scope definition to final delivery.
          </p>
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            View DFY Packages →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          These DFY Engagement Terms are part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/revisions" className="underline">Revisions Policy</Link>, <Link href="/refunds" className="underline">Refund Policy</Link>, <Link href="/disputes" className="underline">Dispute Resolution</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
