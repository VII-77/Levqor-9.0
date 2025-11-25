import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: November 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Levqor's automation platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Levqor provides an AI-powered workflow automation platform that enables users to create, deploy, and manage automated workflows. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>AI Workflow Builder for creating automations</li>
              <li>Template gallery with pre-built workflows</li>
              <li>Monitoring and self-healing capabilities</li>
              <li>Integration with third-party services</li>
              <li>Analytics and reporting features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-gray-700 mb-4">
              You must register for an account to use certain features of the Service. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any information that changes</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
            <p className="text-gray-700 mb-4">
              Paid features of the Service require a subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Pay the applicable fees as described in our pricing</li>
              <li>Provide valid payment information</li>
              <li>Authorize recurring charges for subscription plans</li>
              <li>Fees are non-refundable except as required by law</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All plans include a 7-day free trial. You may cancel at any time before the trial ends without being charged.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or interfere with the Service</li>
              <li>Harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Use the Service for illegal activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by Levqor Ltd and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              You retain ownership of any content you create using the Service, including workflow configurations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Service Level Agreement</h2>
            <p className="text-gray-700 mb-4">
              Levqor commits to maintaining high availability:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>99.9% uptime SLA for Business and Scale plans</li>
              <li>Support response times based on your plan tier</li>
              <li>Regular backups and disaster recovery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, Levqor shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will provide notice of significant changes by email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: legal@levqor.ai<br />
              Address: Levqor Ltd, London, United Kingdom
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
