import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Levqor's acceptable use policy - guidelines for responsible and lawful use of our automation platform.",
};

export default function AcceptableUsePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Acceptable Use Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          This Acceptable Use Policy outlines prohibited activities and responsible use guidelines
          for Levqor's automation platform. By using our services, you agree to comply with this policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Permitted Use</h2>
        <p>
          Levqor is designed for legitimate business automation, including:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Automating internal business processes (email, reporting, data sync)</li>
          <li>Connecting SaaS tools and services for workflow orchestration</li>
          <li>Processing customer data in compliance with applicable privacy laws</li>
          <li>Running scheduled jobs, background tasks, and integrations</li>
          <li>Development, testing, and staging environments for production workflows</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Prohibited Activities</h2>
        <p>
          The following activities are strictly prohibited and may result in immediate account
          suspension or termination:
        </p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Illegal or Harmful Content</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Distributing malware, viruses, or malicious code</li>
          <li>Processing, storing, or transmitting illegal content</li>
          <li>Facilitating fraud, phishing, or identity theft</li>
          <li>Violating intellectual property rights or data privacy laws (GDPR, CCPA, etc.)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Platform Abuse</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Overwhelming our API with excessive requests (see <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>)</li>
          <li>Circumventing usage limits or creating multiple accounts to avoid restrictions</li>
          <li>Reverse engineering, decompiling, or attempting to extract our source code</li>
          <li>Interfering with platform security, availability, or other users' access</li>
          <li>Attempting unauthorized access to other users' data or system resources</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Spam and Abuse</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Sending unsolicited bulk email (spam) through our services</li>
          <li>Scraping or harvesting data without authorization</li>
          <li>Automating social media activity in violation of platform terms</li>
          <li>Using our services to harass, threaten, or abuse others</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6">Reselling and Unauthorized Use</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Reselling, sublicensing, or providing automation-as-a-service to third parties</li>
          <li>Using a single account to serve multiple unrelated businesses or clients</li>
          <li>Sharing account credentials with unauthorized users</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
          <p className="font-semibold text-yellow-900 mb-2">Cryptocurrency and High-Risk Activities</p>
          <p className="text-yellow-800">
            We do not permit use of Levqor for cryptocurrency mining, trading bots, or high-frequency
            financial trading. Contact our Enterprise team if you require automation for regulated
            financial services.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Data Protection and Privacy</h2>
        <p>
          You are responsible for ensuring that your use of Levqor complies with all applicable
          data protection laws, including GDPR and CCPA. You must:
        </p>
        
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Obtain appropriate consent before processing personal data</li>
          <li>Implement security measures to protect sensitive data</li>
          <li>Honor data subject rights (access, deletion, portability)</li>
          <li>Notify us immediately of any data breach affecting our platform</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Enforcement</h2>
        <p>
          Violations of this policy may result in:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Warning and request to cease prohibited activity</li>
          <li>Temporary suspension of account access</li>
          <li>Permanent termination without refund</li>
          <li>Legal action for severe violations (illegal activity, security breaches)</li>
        </ol>

        <p className="mt-4">
          We reserve the right to investigate suspected violations and cooperate with law
          enforcement as required by law.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Reporting Violations</h2>
        <p>
          If you believe another user is violating this policy, please report it to{" "}
          <a href="mailto:abuse@levqor.ai" className="text-blue-600 hover:underline">abuse@levqor.ai</a> with
          relevant details. We take all reports seriously and will investigate promptly.
        </p>

        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Questions About Acceptable Use?</h3>
          <p className="text-gray-700 mb-4">
            If you're unsure whether your intended use complies with this policy, contact our
            support team before proceeding. We're here to help you use Levqor responsibly.
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact Support →
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12 italic">
          This Acceptable Use Policy is part of our <Link href="/terms" className="underline">Terms of Service</Link>. 
          See also: <Link href="/fair-use" className="underline">Fair Use Policy</Link>, <Link href="/privacy" className="underline">Privacy Policy</Link>. 
          Last updated: November 2025.
        </p>
      </div>
    </main>
  );
}
