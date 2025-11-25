import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: November 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="mb-4">
              Levqor Technologies Ltd. ("Levqor," "we," "us," or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our data backup and retention management platform (the "Services") available at levqor.ai and through our associated APIs and applications.
            </p>
            <p className="mb-4">
              This Privacy Policy applies to all users of the Services, including visitors to our website, registered account holders, and enterprise customers. By accessing or using the Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
            </p>
            <p className="mb-4">
              We are committed to compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws worldwide. If you have questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-4">
              We collect various types of information to provide, maintain, and improve the Services. The categories of information we collect include:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Information You Provide Directly</h3>
            <p className="mb-4">
              When you create an account, subscribe to a plan, or interact with the Services, you may provide:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Account Information:</strong> Name, email address, company name, job title, and password</li>
              <li><strong>Billing Information:</strong> Payment card details, billing address, and transaction history (processed securely through our payment processor Stripe)</li>
              <li><strong>Profile Information:</strong> Optional profile photo, preferences, and account settings</li>
              <li><strong>Communication Data:</strong> Information you provide when contacting support, responding to surveys, or participating in promotions</li>
              <li><strong>Customer Data:</strong> Workflows, configurations, backup data, and any content you upload, create, or store using the Services</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Information Collected Automatically</h3>
            <p className="mb-4">
              When you access or use the Services, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Usage Data:</strong> Workflow execution logs, API calls, feature usage, execution times, and performance metrics</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type and version, IP address, and unique device identifiers</li>
              <li><strong>Log Data:</strong> Access times, pages viewed, referring URLs, clickstream data, and error logs</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address (city and country level, not precise geolocation)</li>
              <li><strong>Cookies and Similar Technologies:</strong> See Section 8 (Cookie Policy) for detailed information</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.3 Information from Third Parties</h3>
            <p className="mb-4">
              We may receive information about you from third-party services you connect to Levqor, such as OAuth providers (Google, Microsoft), payment processors, and integration partners. This may include authentication credentials, profile information, and usage data from connected services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Service Provision and Operation</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Providing, maintaining, and improving the Services</li>
              <li>Processing and managing your account, subscriptions, and transactions</li>
              <li>Executing workflows and backup operations as configured by you</li>
              <li>Monitoring system performance, uptime, and reliability</li>
              <li>Providing customer support and responding to inquiries</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 Security and Fraud Prevention</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Detecting, preventing, and investigating fraud, abuse, and security incidents</li>
              <li>Monitoring compliance with our <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> and <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link></li>
              <li>Protecting the rights, property, and safety of Levqor, our users, and the public</li>
              <li>Conducting security audits and vulnerability assessments</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.3 Communication and Marketing</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Sending transactional emails (account notifications, billing receipts, service updates)</li>
              <li>Providing product announcements, feature releases, and educational content (you may opt out)</li>
              <li>Conducting surveys and collecting feedback to improve the Services</li>
              <li>Sending marketing communications about Levqor products and services (with your consent where required)</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.4 Analytics and Improvement</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Analyzing usage patterns and trends to improve user experience</li>
              <li>Developing new features, products, and services</li>
              <li>Conducting research and statistical analysis</li>
              <li>Optimizing performance, reliability, and scalability</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.5 Legal Compliance</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Complying with legal obligations, court orders, and regulatory requirements</li>
              <li>Enforcing our Terms of Service and other agreements</li>
              <li>Responding to lawful requests from government authorities</li>
              <li>Protecting our legal rights and defending against legal claims</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell your personal information to third parties. We may share your information in the following limited circumstances:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Service Providers</h3>
            <p className="mb-4">
              We engage trusted third-party service providers to perform functions on our behalf, such as:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Cloud infrastructure providers (hosting, storage, databases)</li>
              <li>Payment processors (Stripe for billing and payment processing)</li>
              <li>Email service providers (transactional and marketing emails)</li>
              <li>Analytics and monitoring services</li>
              <li>Customer support and help desk platforms</li>
            </ul>
            <p className="mb-4">
              These service providers are contractually obligated to protect your information and may only use it to provide services to Levqor. They are prohibited from using your data for their own purposes.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Business Transfers</h3>
            <p className="mb-4">
              In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your information may be transferred to the acquiring entity or successor. We will provide notice before your information is transferred and becomes subject to a different privacy policy.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h3>
            <p className="mb-4">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities, including to meet national security or law enforcement requirements. We will notify you of such disclosures unless legally prohibited.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.4 Protection of Rights</h3>
            <p className="mb-4">
              We may disclose information to enforce our Terms of Service, protect our rights and property, investigate fraud or security issues, or protect the safety of our users and the public.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.5 With Your Consent</h3>
            <p className="mb-4">
              We may share your information with third parties when you explicitly consent to such sharing, such as when connecting third-party integrations or authorizing data access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p className="mb-4">
              We implement robust technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. Our security practices include:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Encryption:</strong> Data in transit is protected using TLS 1.3 or higher. Data at rest is encrypted using AES-256 encryption</li>
              <li><strong>Access Controls:</strong> Role-based access controls (RBAC), multi-factor authentication (MFA), and principle of least privilege</li>
              <li><strong>Network Security:</strong> Firewalls, intrusion detection systems (IDS), and DDoS protection</li>
              <li><strong>Security Monitoring:</strong> 24/7 monitoring, automated threat detection, and incident response procedures</li>
              <li><strong>Regular Audits:</strong> Penetration testing, vulnerability scanning, and third-party security assessments</li>
              <li><strong>Secure Development:</strong> Code reviews, static analysis, and security-focused development practices</li>
              <li><strong>Employee Training:</strong> Regular security awareness training and background checks for personnel with data access</li>
            </ul>
            <p className="mb-4">
              While we employ industry-standard security measures, no system is completely secure. We cannot guarantee absolute security of your information. You are responsible for maintaining the confidentiality of your account credentials and for any activities conducted through your account.
            </p>
            <p className="mb-4">
              In the event of a data breach that affects your personal information, we will notify you and relevant regulatory authorities in accordance with applicable data protection laws, typically within 72 hours of becoming aware of the breach.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. GDPR Compliance (European Users)</h2>
            <p className="mb-4">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have specific rights under the General Data Protection Regulation (GDPR) regarding your personal data:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">6.1 Legal Basis for Processing</h3>
            <p className="mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Contractual Necessity:</strong> To provide the Services pursuant to our Terms of Service</li>
              <li><strong>Legitimate Interests:</strong> To improve our Services, prevent fraud, and ensure security</li>
              <li><strong>Consent:</strong> For marketing communications and non-essential cookies (you may withdraw consent at any time)</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">6.2 Your GDPR Rights</h3>
            <p className="mb-4">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Right to Access:</strong> Obtain confirmation of whether we process your personal data and request a copy of such data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data in certain circumstances</li>
              <li><strong>Right to Restriction:</strong> Request restriction of processing your personal data in certain situations</li>
              <li><strong>Right to Data Portability:</strong> Receive your personal data in a structured, commonly used, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>
            <p className="mb-4">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a>. We will respond to your request within 30 days in accordance with GDPR requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. CCPA Compliance (California Users)</h2>
            <p className="mb-4">
              If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7.1 Categories of Personal Information</h3>
            <p className="mb-4">
              We collect the following categories of personal information as defined by CCPA:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Identifiers (name, email, IP address)</li>
              <li>Commercial information (purchase history, subscription details)</li>
              <li>Internet or network activity (browsing history, usage data)</li>
              <li>Geolocation data (general location from IP address)</li>
              <li>Professional or employment-related information (job title, company)</li>
              <li>Inferences drawn from the above to create a profile</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7.2 Your CCPA Rights</h3>
            <p className="mb-4">
              California residents have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected about you</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information, subject to certain exceptions</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of the sale of your personal information (we do not sell personal information)</li>
              <li><strong>Right to Non-Discrimination:</strong> Exercise your CCPA rights without discriminatory treatment</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, submit a verifiable consumer request to <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a>. We will verify your identity before processing your request and respond within 45 days.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">7.3 Sale of Personal Information</h3>
            <p className="mb-4">
              We do not sell personal information as defined by CCPA. We do not and will not sell your personal information to third parties for monetary or other valuable consideration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookie Policy</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to collect information, improve user experience, and analyze usage of the Services.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.1 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the Services to function properly (authentication, security, session management)</li>
              <li><strong>Performance Cookies:</strong> Collect information about how you use the Services to help us improve performance</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience</li>
              <li><strong>Analytics Cookies:</strong> Help us understand user behavior and measure the effectiveness of our Services</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.2 Managing Cookies</h3>
            <p className="mb-4">
              You can control cookie preferences through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. Please note that disabling certain cookies may affect the functionality of the Services. Essential cookies cannot be disabled as they are necessary for the Services to operate.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.3 Third-Party Cookies</h3>
            <p className="mb-4">
              We may use third-party services (such as analytics providers) that set cookies on your device. These third parties have their own privacy policies governing their use of information they collect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h2>
            <p className="mb-4">
              Levqor is based in the United Kingdom, and your information may be transferred to, stored, and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your jurisdiction.
            </p>
            <p className="mb-4">
              When we transfer personal data from the EEA, UK, or Switzerland to other countries, we implement appropriate safeguards, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions by the European Commission for certain countries</li>
              <li>Binding Corporate Rules where applicable</li>
              <li>Other legally recognized transfer mechanisms</li>
            </ul>
            <p className="mb-4">
              We ensure that all international data transfers comply with applicable data protection laws and that your data receives an adequate level of protection wherever it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as necessary to provide the Services, comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods vary depending on the type of information:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li><strong>Account Information:</strong> Retained while your account is active and for 30 days after account closure or cancellation</li>
              <li><strong>Billing Records:</strong> Retained for 7 years to comply with tax and accounting regulations</li>
              <li><strong>Customer Data:</strong> Retained for 30 days after subscription termination to allow data export, then permanently deleted</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days for operational and security purposes, then aggregated or deleted</li>
              <li><strong>Support Communications:</strong> Retained for 3 years to improve customer service</li>
            </ul>
            <p className="mb-4">
              After the applicable retention period, we will securely delete or anonymize your information. Anonymized or aggregated data may be retained indefinitely for analytics and research purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Children's Privacy</h2>
            <p className="mb-4">
              The Services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are under 18, do not use the Services or provide any information to us.
            </p>
            <p className="mb-4">
              If we learn that we have collected personal information from a child under 18 without parental consent, we will take steps to delete that information as quickly as possible. If you believe we may have information from or about a child under 18, please contact us at <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Your Privacy Rights and Choices</h2>
            <p className="mb-4">
              Regardless of your location, you have certain rights regarding your personal information:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.1 Access and Update</h3>
            <p className="mb-4">
              You can access and update most of your personal information directly through your account settings. For additional assistance, contact us at <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.2 Marketing Communications</h3>
            <p className="mb-4">
              You may opt out of receiving marketing emails by clicking the "unsubscribe" link in any marketing email or by adjusting your communication preferences in your account settings. Please note that you cannot opt out of transactional emails related to your account and subscriptions.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.3 Account Deletion</h3>
            <p className="mb-4">
              You may request deletion of your account and associated personal information by contacting support or through your account settings. See our <Link href="/cancellation" className="text-blue-600 hover:underline">Cancellation Policy</Link> for details on the account closure process.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.4 Data Export</h3>
            <p className="mb-4">
              You can export your Customer Data at any time through the Services. We provide data export functionality in standard formats (JSON, CSV) to facilitate data portability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs. When we make material changes, we will:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Update the "Last updated" date at the top of this page</li>
              <li>Notify you via email (to the address associated with your account)</li>
              <li>Display a prominent notice on our website or within the Services</li>
              <li>In some cases, request your explicit consent to the updated terms</li>
            </ul>
            <p className="mb-4">
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information. Your continued use of the Services after we publish or communicate notice of changes to this Privacy Policy constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Contact Us</h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Levqor Technologies Ltd.</p>
              <p className="mb-1"><strong>Data Protection Officer:</strong></p>
              <p>Email: <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a></p>
              <p className="mt-3"><strong>General Inquiries:</strong></p>
              <p>Email: <a href="mailto:support@levqor.ai" className="text-blue-600 hover:underline">support@levqor.ai</a></p>
              <p>Support Portal: <Link href="/support" className="text-blue-600 hover:underline">levqor.ai/support</Link></p>
              <p className="mt-3 text-sm text-gray-600">Company Number: 12345678</p>
              <p className="text-sm text-gray-600">Registered in England and Wales</p>
            </div>
            <p className="mb-4">
              We will respond to your inquiry within 30 days. For GDPR-related requests, we will respond within the timeframes required by applicable law (typically 30 days, extendable by an additional 60 days for complex requests).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. EU Representative</h2>
            <p className="mb-4">
              If you are located in the European Economic Area and have questions about our data protection practices, you may also contact our EU representative:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">EU GDPR Representative information will be provided upon request to <a href="mailto:privacy@levqor.ai" className="text-blue-600 hover:underline">privacy@levqor.ai</a></p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link>
              <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>
              <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>
              <Link href="/sla" className="text-blue-600 hover:underline">Service Level Agreement</Link>
              <Link href="/cancellation" className="text-blue-600 hover:underline">Cancellation Policy</Link>
              <Link href="/guarantee" className="text-blue-600 hover:underline">Money-Back Guarantee</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
