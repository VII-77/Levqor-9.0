import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Levqor's refund policy - 30-day money-back guarantee and subscription cancellation terms.",
};

export default function RefundsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Refund Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          We stand behind our product with a 30-day money-back guarantee. If Levqor doesn't meet
          your needs, we'll refund your purchase—no questions asked.
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 my-6">
          <p className="font-semibold text-green-900 mb-2">30-Day Money-Back Guarantee</p>
          <p className="text-green-800">
            Contact us within 30 days of your purchase and we'll process a full refund.
            Simply email <a href="mailto:support@levqor.ai" className="underline">support@levqor.ai</a> with
            your account details.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Subscription Refunds</h2>
        <p>
          For monthly and annual subscriptions (Starter, Launch, Growth, Agency plans):
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>First 30 days:</strong> Full refund, no questions asked</li>
          <li><strong>After 30 days:</strong> Pro-rated refund may be available at our discretion</li>
          <li><strong>Trial users:</strong> If you cancel during your 7-day free trial, you won't be charged</li>
          <li><strong>Automatic renewals:</strong> Cancel anytime before your next billing cycle to avoid charges</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Done-For-You (DFY) Package Refunds</h2>
        <p>
          For one-time DFY packages (Starter £149, Professional £299, Enterprise £499):
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Before work begins:</strong> Full refund available</li>
          <li><strong>Work in progress:</strong> Partial refund based on deliverables completed</li>
          <li><strong>After delivery:</strong> Refunds available within 30 days if deliverables don't match the agreed scope</li>
          <li><strong>Revision requests:</strong> See our <Link href="/revisions" className="text-blue-600 hover:underline">Revisions Policy</Link> for changes to completed work</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Add-On Refunds</h2>
        <p>
          Recurring add-ons (Priority Support, 99.9% SLA, White Label) follow the same 30-day
          refund policy as subscriptions. Cancel anytime to stop future charges.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Processing Times</h2>
        <p>
          Refunds are typically processed within 5-7 business days. You'll receive an email
          confirmation when your refund is approved. Depending on your payment method, it may
          take an additional 3-5 days for the funds to appear in your account.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Exceptions</h2>
        <p>Refunds are not available for:</p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Usage beyond fair use limits (see <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>)</li>
          <li>Accounts suspended for violating our <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link></li>
          <li>Services already fully consumed (e.g., AI credits, workflow runs)</li>
        </ul>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            If you're experiencing issues or have questions about our refund policy, please contact
            our support team before requesting a refund. We're here to help make Levqor work for you.
          </p>
          <Link href="/support" className="text-blue-600 hover:underline font-medium">
            Contact Support →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Refund Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          For disputes, see our <Link href="/disputes" className="underline">Dispute Resolution Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
