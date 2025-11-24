import Link from "next/link";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Processing Addendum (DPA) | Levqor',
  description: 'Data Processing Addendum for Levqor customers. Learn about our data processing practices and sub-processors.',
  robots: 'index, follow'
}

export default function DPAPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Processing Addendum (DPA)
          </h1>
          <p className="text-gray-600 text-sm">
            Last updated: November 24, 2025
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            This Data Processing Addendum ("DPA") outlines the relationship between Levqor ("Processor") and our customers ("Controller") regarding the processing of personal data under the General Data Protection Regulation (GDPR) and other applicable data protection laws.
          </p>
          <p className="text-gray-700 leading-relaxed">
            When you use Levqor services, you act as the data controller for any personal data you upload or manage through our platform. Levqor acts as your data processor, processing this data solely on your behalf and in accordance with your instructions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Data Processing Scope</h2>
          <h3 className="text-xl font-semibold text-gray-800">2.1 Types of Personal Data</h3>
          <p className="text-gray-700 leading-relaxed">
            Levqor may process the following categories of personal data on your behalf:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Account Data:</strong> Email addresses, names, company information</li>
            <li><strong>Usage Data:</strong> Workflow configurations, automation settings, system logs</li>
            <li><strong>Billing Data:</strong> Payment information (processed by Stripe, our payment processor)</li>
            <li><strong>Support Data:</strong> Communications, support tickets, feedback submissions</li>
            <li><strong>Technical Data:</strong> IP addresses, browser information, device identifiers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6">2.2 Data Subjects</h3>
          <p className="text-gray-700 leading-relaxed">
            Data subjects may include your employees, contractors, customers, and any other individuals whose personal data you choose to process using Levqor services.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6">2.3 Processing Activities</h3>
          <p className="text-gray-700 leading-relaxed">
            Levqor processes personal data to provide automation services, maintain platform security, provide customer support, and improve our services as described in our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">3. Sub-Processors</h2>
          <p className="text-gray-700 leading-relaxed">
            Levqor engages the following third-party sub-processors to assist in providing our services:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Stripe, Inc.</h4>
              <p className="text-sm text-gray-600">Payment processing and billing</p>
              <p className="text-sm text-gray-500">Location: United States (GDPR-compliant with SCCs)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Replit, Inc.</h4>
              <p className="text-sm text-gray-600">Infrastructure hosting and database services</p>
              <p className="text-sm text-gray-500">Location: United States (GDPR-compliant)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Vercel, Inc.</h4>
              <p className="text-sm text-gray-600">Frontend application hosting and CDN</p>
              <p className="text-sm text-gray-500">Location: United States (GDPR-compliant)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Cloudflare, Inc.</h4>
              <p className="text-sm text-gray-600">DNS management and DDoS protection</p>
              <p className="text-sm text-gray-500">Location: Global (GDPR-compliant)</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            Note: We will notify you of any changes to our sub-processors in accordance with applicable laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">4. Data Protection & Security</h2>
          <p className="text-gray-700 leading-relaxed">
            Levqor implements appropriate technical and organizational measures to protect personal data, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Incident response and breach notification procedures</li>
            <li>Employee training on data protection and security best practices</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            For detailed information about our security measures, please see our <Link href="/security" className="text-blue-600 hover:underline">Security page</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">5. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Personal data may be transferred to and processed in countries outside the European Economic Area (EEA). When we transfer data internationally, we ensure appropriate safeguards are in place, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Data Processing Agreements with sub-processors ensuring GDPR compliance</li>
            <li>Transfer Impact Assessments where required</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/gdpr" className="text-blue-600 hover:underline">GDPR page</Link> for more details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">6. Data Subject Requests</h2>
          <p className="text-gray-700 leading-relaxed">
            As a data controller, you are responsible for responding to data subject requests. Levqor will assist you by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Providing tools to export, modify, or delete personal data</li>
            <li>Processing data export and deletion requests submitted via our API</li>
            <li>Assisting with impact assessments when required</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            End users can submit requests through our <Link href="/data-rights" className="text-blue-600 hover:underline">Data Rights page</Link>. We commit to responding to verified requests within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">7. Data Retention & Deletion</h2>
          <p className="text-gray-700 leading-relaxed">
            Upon termination of your Levqor subscription:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Your data will be retained for 30 days to allow for account recovery</li>
            <li>After 30 days, all personal data will be permanently deleted from our systems</li>
            <li>Backup data will be deleted in accordance with our retention schedule (maximum 90 days)</li>
            <li>You may request immediate deletion at any time by contacting support</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">8. Breach Notification</h2>
          <p className="text-gray-700 leading-relaxed">
            In the event of a personal data breach, Levqor will:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Notify you without undue delay (within 72 hours where feasible)</li>
            <li>Provide details of the nature of the breach and affected data</li>
            <li>Describe measures taken to mitigate the breach</li>
            <li>Assist you in meeting your notification obligations to supervisory authorities and data subjects</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">9. Audits & Compliance</h2>
          <p className="text-gray-700 leading-relaxed">
            Upon reasonable notice, Levqor will make available to you information necessary to demonstrate compliance with this DPA and applicable data protection laws. We maintain:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>SOC 2 Type II compliance (in progress)</li>
            <li>GDPR-compliant data processing practices</li>
            <li>Regular third-party security assessments</li>
            <li>Documentation of technical and organizational measures</li>
          </ul>
        </section>

        <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">⚖️ Legal Disclaimer</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            This DPA summary is provided for informational purposes. For binding legal commitments, please refer to your signed service agreement and our <Link href="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>. Enterprise customers may request a custom DPA through our support team.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">10. Contact & Questions</h2>
          <p className="text-gray-700 leading-relaxed">
            For questions about this DPA or data processing practices, please contact:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>Email:</strong> privacy@levqor.ai</p>
            <p className="text-gray-700 mt-2"><strong>Data Protection Officer:</strong> dpo@levqor.ai</p>
            <p className="text-gray-700 mt-2"><strong>Support:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link></p>
          </div>
        </section>

        <div className="border-t pt-8 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Legal Documents</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/privacy" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1">How we collect and use your data</p>
            </Link>
            <Link href="/terms" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Terms of Service</h4>
              <p className="text-sm text-gray-600 mt-1">Legal agreement for using Levqor</p>
            </Link>
            <Link href="/gdpr" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">GDPR Compliance</h4>
              <p className="text-sm text-gray-600 mt-1">Our commitment to GDPR standards</p>
            </Link>
            <Link href="/security" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Security</h4>
              <p className="text-sm text-gray-600 mt-1">How we protect your data</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
