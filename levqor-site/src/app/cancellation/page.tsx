import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "How to cancel your Levqor subscription, account closure, and data retention after cancellation.",
};

export default function CancellationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Cancellation Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          You can cancel your Levqor subscription at any time with no penalties or cancellation fees.
          This page explains how cancellation works and what happens to your data.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
          <p className="font-semibold text-blue-900 mb-2">No Cancellation Fees</p>
          <p className="text-blue-800">
            Cancel anytime with no hidden fees or penalties. You'll retain access until the end of
            your current billing period.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">How to Cancel</h2>
        <p>
          You can cancel your subscription in two ways:
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Option 1: In-App Cancellation (Recommended)</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Log in to your Levqor dashboard</li>
          <li>Go to <strong>Settings → Billing</strong></li>
          <li>Click <strong>"Cancel Subscription"</strong></li>
          <li>Confirm your cancellation</li>
          <li>You'll receive an email confirmation immediately</li>
        </ol>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Option 2: Email Cancellation</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Email <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a> with
            "Cancel Subscription" in the subject line</li>
          <li>Include your account email and reason for cancellation (optional)</li>
          <li>We'll process your cancellation within 24 hours</li>
          <li>You'll receive confirmation via email</li>
        </ol>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">When Cancellation Takes Effect</h2>
        <p>
          Your cancellation timing depends on your billing cycle:
        </p>
        
        <div className="bg-gray-100 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-gray-900 mb-3">Monthly Subscriptions</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Cancel before renewal:</strong> Access continues until end of current month, no further charges</li>
            <li><strong>Cancel mid-cycle:</strong> Access continues until end of paid period, no refund for unused time</li>
            <li><strong>Example:</strong> Cancel on Nov 15 (billed Nov 1), you keep access until Nov 30</li>
          </ul>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-gray-900 mb-3">Annual Subscriptions</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Cancel before renewal:</strong> Access continues until end of current year, no further charges</li>
            <li><strong>Cancel mid-year:</strong> Access continues until end of paid year, partial refund may apply (see <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>)</li>
            <li><strong>Example:</strong> Cancel in Month 6 of 12, you keep access through Month 12</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Canceling During Trial</h2>
        <p>
          If you cancel during your 7-day free trial:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You will <strong>not</strong> be charged</li>
          <li>Your account will immediately downgrade to free tier</li>
          <li>Workflows will be paused but remain accessible in read-only mode</li>
          <li>See our <Link href="/trial" className="text-blue-600 hover:underline">Trial Terms</Link> for full details</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">What Happens After Cancellation</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6">Immediate Effects</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your subscription will not auto-renew</li>
          <li>You'll receive a cancellation confirmation email</li>
          <li>Access continues until the end of your paid period</li>
          <li>No further charges will be made</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">At End of Billing Period</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Active workflows will be paused</li>
          <li>Dashboard access switches to read-only mode</li>
          <li>You can still export workflows and data for 30 days</li>
          <li>Account downgrades to free tier (limited features)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Data Retention</h2>
        <p>
          After cancellation, your data is retained as follows:
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Data Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Workflow configurations</td>
                <td className="border border-gray-300 px-4 py-2">90 days (read-only)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Execution logs</td>
                <td className="border border-gray-300 px-4 py-2">30 days</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Account data (email, settings)</td>
                <td className="border border-gray-300 px-4 py-2">Indefinitely (unless deleted)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Billing history</td>
                <td className="border border-gray-300 px-4 py-2">7 years (legal requirement)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for
          full data retention and deletion details.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Permanent Account Deletion</h2>
        <p>
          To permanently delete your account and all associated data:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Cancel your subscription (if active)</li>
          <li>Wait for your billing period to end</li>
          <li>Go to <strong>Settings → Account → Delete Account</strong></li>
          <li>Or email <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a> with
            "Delete My Account" in the subject</li>
          <li>Confirm deletion (this action is irreversible)</li>
        </ol>

        <div className="bg-red-50 border-l-4 border-red-500 p-6 my-6">
          <p className="font-semibold text-red-900 mb-2">⚠️ Permanent Deletion Warning</p>
          <p className="text-red-800">
            Account deletion is <strong>irreversible</strong>. All workflows, logs, and configurations
            will be permanently deleted within 30 days. Export your data before deleting your account.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Reactivating a Canceled Subscription</h2>
        <p>
          Changed your mind? You can reactivate anytime:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Before period ends:</strong> Go to Settings → Billing → Resume Subscription</li>
          <li><strong>After period ends:</strong> Sign in and choose a new plan (workflows restored from backup)</li>
          <li><strong>Data recovery:</strong> Workflows available for 90 days after cancellation</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Canceling Add-Ons</h2>
        <p>
          You can cancel individual add-ons (Priority Support, 99.9% SLA, White Label) without
          canceling your base subscription:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Go to <strong>Settings → Billing → Manage Add-Ons</strong></li>
          <li>Click "Cancel" next to the add-on you want to remove</li>
          <li>Add-on access continues until end of current billing cycle</li>
          <li>Future charges for that add-on will stop</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Canceling DFY Services</h2>
        <p>
          Done-For-You packages are one-time purchases and cannot be canceled after work begins.
          See our <Link href="/dfy-contract" className="text-blue-600 hover:underline">DFY engagement terms</Link> and <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link> for
          details on DFY cancellations and refunds.
        </p>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Before canceling, let us know how we can improve. We're here to help make Levqor work
            for you. Contact our support team to discuss your concerns.
          </p>
          <Link href="/support" className="text-blue-600 hover:underline font-medium">
            Contact Support →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Cancellation Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/refunds" className="underline">Refund Policy</Link>, <Link href="/trial" className="underline">Trial Terms</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
