import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Service Level Agreement (SLA)",
  description: "Levqor's SLA - 99.9% uptime commitment, incident response times, and service credits for Agency plan customers.",
};

export default function SLAPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Service Level Agreement (SLA)</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Levqor is committed to providing reliable, enterprise-grade automation services. This SLA
          defines our uptime commitments and what happens if we don't meet them.
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
          <p className="font-semibold text-green-900 mb-2">99.9% Uptime Guarantee</p>
          <p className="text-green-800">
            Agency plan customers and those with the 99.9% SLA add-on receive our highest level of
            service commitment with guaranteed uptime and service credits for any downtime.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Uptime Commitment</h2>
        <p>
          We guarantee 99.9% uptime for the Levqor platform, measured monthly. This translates to:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Maximum downtime:</strong> 43 minutes per month</li>
          <li><strong>Annual target:</strong> 99.9% uptime (8 hours 45 minutes maximum downtime per year)</li>
          <li><strong>Monitoring:</strong> Continuous automated monitoring across all regions</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's Covered</h2>
        <p>
          This SLA applies to:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Core platform API (api.levqor.ai)</li>
          <li>Dashboard and web interface (levqor.ai)</li>
          <li>Workflow execution engine</li>
          <li>Data storage and retrieval</li>
          <li>Authentication services</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What's Not Covered (Exclusions)</h2>
        <p>
          This SLA does not apply to downtime caused by:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Scheduled maintenance (announced at least 48 hours in advance)</li>
          <li>Third-party service failures (Stripe, external APIs, integrations)</li>
          <li>Your internet connectivity or infrastructure issues</li>
          <li>Force majeure events (natural disasters, pandemics, war)</li>
          <li>Actions that violate our <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> or <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link></li>
          <li>Misuse, abuse, or unauthorized modifications to our services</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Incident Response Times</h2>
        
        <div className="bg-gray-100 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-gray-900 mb-3">Agency Plan (4-Hour SLA)</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Critical incidents:</strong> Initial response within 4 hours</li>
            <li><strong>Major incidents:</strong> Response within 8 hours</li>
            <li><strong>Minor incidents:</strong> Response within 24 hours</li>
          </ul>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-gray-900 mb-3">Growth Plan</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Priority support:</strong> Response within 24 hours</li>
            <li><strong>Standard incidents:</strong> Response within 48 hours</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">
          For full support response times across all plans, see our <Link href="/support-policy" className="text-blue-600 hover:underline">Support Policy</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Service Credits</h2>
        <p>
          If we fail to meet our 99.9% uptime commitment in any given month, eligible customers
          will receive service credits:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Monthly Uptime</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Service Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">99.0% - 99.9%</td>
                <td className="border border-gray-300 px-4 py-2">10% of monthly fee</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">95.0% - 98.9%</td>
                <td className="border border-gray-300 px-4 py-2">25% of monthly fee</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Below 95.0%</td>
                <td className="border border-gray-300 px-4 py-2">50% of monthly fee</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm">
          <strong>Note:</strong> Service credits are applied to your next billing cycle and do not
          entitle you to cash refunds. To claim a service credit, contact{" "}
          <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> within
          30 days of the incident.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Status and Incidents</h2>
        <p>
          Monitor real-time platform status and incident history at our status page. We'll also
          notify you via email for any critical incidents affecting your account.
        </p>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Enhanced SLA?</h3>
          <p className="text-gray-700 mb-4">
            Upgrade to our Agency plan (£149/month) for 99.9% uptime guarantee and 4-hour incident
            response, or add the 99.9% SLA add-on to any plan.
          </p>
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            View Pricing →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This SLA is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/support-policy" className="underline">Support Policy</Link>, <Link href="/fair-use" className="underline">Fair Use Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
