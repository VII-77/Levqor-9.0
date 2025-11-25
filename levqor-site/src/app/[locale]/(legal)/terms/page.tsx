import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: November 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p className="mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you (either an individual or entity, "you" or "Customer") and Levqor Technologies Ltd. ("Levqor," "we," "us," or "our") governing your access to and use of the Levqor platform, including our website at levqor.ai, APIs, services, and related software (collectively, the "Services").
            </p>
            <p className="mb-4">
              By accessing, registering for, or using the Services in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link>, and <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>, which are incorporated herein by reference.
            </p>
            <p className="mb-4">
              If you do not agree to these Terms, you must immediately cease all use of the Services. If you are entering into these Terms on behalf of an organization or entity, you represent and warrant that you have the authority to bind such organization or entity to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Account Registration and Obligations</h2>
            <p className="mb-4">
              To access certain features of the Services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary to maintain its accuracy.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Account Security</h3>
            <p className="mb-4">
              You are solely responsible for maintaining the confidentiality of your account credentials, including your password and API keys. You agree to immediately notify us of any unauthorized access to or use of your account. Levqor will not be liable for any loss or damage arising from your failure to comply with these security obligations.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Account Eligibility</h3>
            <p className="mb-4">
              You must be at least 18 years of age to create an account and use the Services. By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is truthful and accurate.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.3 Organizational Accounts</h3>
            <p className="mb-4">
              If you create an account on behalf of an organization, you represent that you are authorized to act on behalf of that organization and to bind it to these Terms. The organization will be responsible for all activities conducted through the account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Use of Services and Restrictions</h2>
            <p className="mb-4">
              Subject to your compliance with these Terms, Levqor grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services in accordance with these Terms and your selected subscription plan.
            </p>
            <p className="mb-4">
              Your use of the Services is subject to our <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> and <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>. You expressly agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Use the Services for any unlawful purpose or in violation of any applicable laws or regulations</li>
              <li>Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code or underlying algorithms of the Services</li>
              <li>Interfere with or disrupt the integrity or performance of the Services or any data contained therein</li>
              <li>Attempt to gain unauthorized access to the Services, related systems, networks, or data</li>
              <li>Use automated systems (bots, scrapers, etc.) to access the Services without our prior written consent</li>
              <li>Remove, obscure, or alter any proprietary rights notices on the Services</li>
              <li>Resell, lease, rent, or otherwise commercialize access to the Services without authorization</li>
              <li>Use the Services to store, transmit, or distribute malicious code, viruses, or harmful content</li>
              <li>Violate the privacy rights or intellectual property rights of any third party</li>
              <li>Exceed the usage limits associated with your subscription tier without upgrading</li>
            </ul>
            <p className="mb-4">
              Levqor reserves the right to monitor usage of the Services to ensure compliance with these Terms and may suspend or terminate access for violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Intellectual Property Rights</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Levqor's Intellectual Property</h3>
            <p className="mb-4">
              The Services, including all software, algorithms, designs, text, graphics, logos, icons, images, audio clips, data compilations, and the selection and arrangement thereof (collectively, "Levqor IP"), are owned by or licensed to Levqor and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mb-4">
              Nothing in these Terms grants you any right, title, or interest in the Levqor IP except for the limited license expressly granted herein. All rights not expressly granted are reserved by Levqor.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Customer Data</h3>
            <p className="mb-4">
              You retain all intellectual property rights in and to the data, workflows, configurations, and content you upload, create, or store using the Services ("Customer Data"). You grant Levqor a worldwide, non-exclusive, royalty-free license to use, process, store, and transmit Customer Data solely to the extent necessary to provide the Services to you.
            </p>
            <p className="mb-4">
              You represent and warrant that you own or have obtained all necessary rights, licenses, and permissions for Customer Data and that Customer Data does not infringe or violate any third-party intellectual property rights, privacy rights, or applicable laws.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.3 Feedback</h3>
            <p className="mb-4">
              If you provide any suggestions, ideas, enhancement requests, feedback, or other information relating to the Services ("Feedback"), you grant Levqor a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate such Feedback into the Services without any obligation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Billing, Payment, and Subscriptions</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.1 Subscription Plans</h3>
            <p className="mb-4">
              Levqor offers various subscription plans with different features, usage limits, and pricing tiers. By subscribing to a plan, you agree to pay the applicable fees according to the billing frequency you select (monthly or annually). Current pricing is available at <Link href="/pricing" className="text-blue-600 hover:underline">levqor.ai/pricing</Link>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.2 Payment Terms</h3>
            <p className="mb-4">
              All fees are charged in British Pounds (GBP) unless otherwise specified. Payment is due in advance for each billing cycle. You authorize Levqor to charge your designated payment method for all applicable fees. If payment fails, we reserve the right to suspend or terminate your access to the Services until payment is received.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.3 Free Trials</h3>
            <p className="mb-4">
              Levqor may offer free trial periods for certain subscription plans. While a valid payment method is required to start a trial, you will not be charged if you cancel before the trial period ends. If you do not cancel before the trial expires, your subscription will automatically convert to a paid subscription and you will be charged the applicable subscription fee.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.4 Automatic Renewal</h3>
            <p className="mb-4">
              Unless you cancel your subscription before the end of the current billing cycle, your subscription will automatically renew for successive periods of the same duration at the then-current subscription rate. You acknowledge and agree that Levqor is authorized to charge your payment method for such renewal fees.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.5 Price Changes</h3>
            <p className="mb-4">
              Levqor reserves the right to modify subscription fees at any time. We will provide you with at least 30 days' advance notice of any fee increases. Your continued use of the Services after a fee increase takes effect constitutes acceptance of the new fees. If you do not agree to the fee increase, you may cancel your subscription.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.6 Refunds</h3>
            <p className="mb-4">
              Refund policies are governed by our <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>. Generally, subscription fees are non-refundable except as required by law or as expressly stated in the Refund Policy. We offer a 30-day money-back guarantee for new subscriptions, subject to the terms and conditions outlined in the Refund Policy.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">5.7 Taxes</h3>
            <p className="mb-4">
              All fees are exclusive of applicable taxes, duties, and similar governmental charges (collectively, "Taxes"). You are responsible for paying all Taxes associated with your purchase, except for taxes based on Levqor's net income. If we are required to collect or pay Taxes, such amounts will be invoiced to and paid by you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Service Level Agreement</h2>
            <p className="mb-4">
              Levqor commits to maintaining high availability and performance standards for the Services. Our Service Level Agreement (SLA), including uptime guarantees, support response times, and remedies for service failures, is detailed in our <Link href="/sla" className="text-blue-600 hover:underline">Service Level Agreement</Link>.
            </p>
            <p className="mb-4">
              Support response times vary by subscription tier, ranging from 48-hour email support on the Starter plan to 4-hour SLA on the Agency plan. For complete details on service commitments and available remedies, please review the SLA document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Security and Privacy</h2>
            <p className="mb-4">
              Levqor implements industry-standard technical and organizational security measures to protect Customer Data, including encryption in transit (TLS 1.3+) and at rest (AES-256), regular security assessments, access controls, and monitoring systems.
            </p>
            <p className="mb-4">
              Our collection, use, and protection of personal information is governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. By using the Services, you consent to such collection and use as described in the Privacy Policy, including compliance with GDPR, CCPA, and other applicable data protection regulations.
            </p>
            <p className="mb-4">
              While we employ commercially reasonable security measures, no system is completely secure. You acknowledge that you provide Customer Data at your own risk and that Levqor cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Disclaimers and Warranties</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.1 "As Is" Provision</h3>
            <p className="mb-4">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, LEVQOR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.2 No Guarantee of Results</h3>
            <p className="mb-4">
              Levqor does not warrant that the Services will meet your requirements, that operation of the Services will be uninterrupted or error-free, that defects will be corrected, or that the Services or servers are free of viruses or other harmful components. You assume all responsibility for selecting the Services to achieve your intended results.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.3 Third-Party Services</h3>
            <p className="mb-4">
              The Services may integrate with or rely upon third-party services, applications, or APIs. Levqor makes no representations or warranties regarding such third-party services and disclaims all liability for their performance, availability, or security.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">8.4 Beta Features</h3>
            <p className="mb-4">
              Levqor may offer beta, preview, or experimental features that are clearly marked as such. These features are provided for evaluation purposes and may contain bugs or errors. Beta features are provided "as is" without any warranty whatsoever and may be modified or discontinued at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LEVQOR, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OR INABILITY TO USE THE SERVICES, EVEN IF LEVQOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LEVQOR'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO LEVQOR FOR THE SERVICES DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
            <p className="mb-4">
              Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages. In such jurisdictions, Levqor's liability shall be limited to the greatest extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless Levqor, its affiliates, and their respective officers, directors, employees, agents, and representatives from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from or related to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Your use of or access to the Services</li>
              <li>Your violation of these Terms or any applicable law or regulation</li>
              <li>Your violation of any third-party right, including intellectual property, privacy, or publicity rights</li>
              <li>Any Customer Data you upload, create, or store using the Services</li>
              <li>Any dispute between you and any third party relating to your use of the Services</li>
            </ul>
            <p className="mb-4">
              Levqor reserves the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with Levqor's defense of such claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Term and Termination</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">11.1 Term</h3>
            <p className="mb-4">
              These Terms commence on the date you first access or use the Services and continue until terminated in accordance with this Section 11.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">11.2 Termination by You</h3>
            <p className="mb-4">
              You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of your current billing cycle. For details on our cancellation process, please refer to our <Link href="/cancellation" className="text-blue-600 hover:underline">Cancellation Policy</Link>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">11.3 Termination by Levqor</h3>
            <p className="mb-4">
              Levqor reserves the right to suspend or terminate your access to the Services immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Breach of these Terms or any incorporated policies</li>
              <li>Non-payment of fees</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Violation of the Acceptable Use Policy or Fair Use Policy</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">11.4 Effect of Termination</h3>
            <p className="mb-4">
              Upon termination, your right to access and use the Services will immediately cease. Levqor will retain Customer Data for 30 days following termination to allow you to export or retrieve your data. After this period, Customer Data may be permanently deleted. Sections of these Terms that by their nature should survive termination will survive, including but not limited to intellectual property provisions, disclaimers, limitations of liability, and indemnification obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Dispute Resolution and Arbitration</h2>
            <p className="mb-4">
              For detailed information on how disputes are resolved, please review our <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution Process</Link>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.1 Informal Resolution</h3>
            <p className="mb-4">
              Before initiating any formal dispute resolution proceedings, you agree to first contact Levqor to attempt to resolve the dispute informally. We will work with you in good faith to reach a mutually acceptable resolution.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.2 Binding Arbitration</h3>
            <p className="mb-4">
              If we cannot resolve a dispute informally, any controversy or claim arising out of or relating to these Terms or the Services shall be settled by binding arbitration administered by a recognized arbitration body in accordance with its applicable rules, except as otherwise provided herein. The arbitration shall be conducted in English in London, United Kingdom.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">12.3 Class Action Waiver</h3>
            <p className="mb-4">
              You agree that any arbitration or proceeding shall be limited to the dispute between you and Levqor individually. To the fullest extent permitted by law, you agree that you will not participate in or seek to recover monetary or other relief in any lawsuit filed against Levqor as a class action, collective action, private attorney general action, or any other representative proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
            <p className="mb-4">
              Subject to the arbitration provisions above, you agree to submit to the exclusive jurisdiction of the courts of England and Wales for resolution of any disputes arising from or relating to these Terms or the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Changes to Terms</h2>
            <p className="mb-4">
              Levqor reserves the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the "Last updated" date at the top of this page. We may also notify you via email or through the Services.
            </p>
            <p className="mb-4">
              Your continued use of the Services after any such changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Services and cancel your subscription.
            </p>
            <p className="mb-4">
              It is your responsibility to review these <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link> periodically for updates. We recommend checking this page regularly to stay informed of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. General Provisions</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.1 Entire Agreement</h3>
            <p className="mb-4">
              These Terms, together with the Privacy Policy and all other policies incorporated by reference, constitute the entire agreement between you and Levqor regarding the Services and supersede all prior or contemporaneous understandings and agreements, whether written or oral.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.2 Severability</h3>
            <p className="mb-4">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions will continue in full force and effect. The invalid provision will be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.3 Waiver</h3>
            <p className="mb-4">
              No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term. Levqor's failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.4 Assignment</h3>
            <p className="mb-4">
              You may not assign or transfer these Terms or your rights and obligations hereunder without Levqor's prior written consent. Levqor may assign these Terms without your consent in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.5 Force Majeure</h3>
            <p className="mb-4">
              Levqor shall not be liable for any failure or delay in performance due to causes beyond its reasonable control, including acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.6 Export Compliance</h3>
            <p className="mb-4">
              You agree to comply with all applicable export and import control laws and regulations in your use of the Services. You represent that you are not located in, under the control of, or a national or resident of any country to which the United Kingdom or European Union has embargoed goods or services.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">15.7 Government Use</h3>
            <p className="mb-4">
              If you are a government entity or using the Services on behalf of a government entity, the Services are "commercial computer software" and "commercial computer software documentation" as those terms are used in applicable government regulations, and are provided with only those rights as granted to all other customers pursuant to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">16. Contact Information</h2>
            <p className="mb-4">
              If you have any questions, concerns, or feedback regarding these Terms or the Services, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Levqor Technologies Ltd.</p>
              <p>Email: <a href="mailto:legal@levqor.ai" className="text-blue-600 hover:underline">legal@levqor.ai</a></p>
              <p>Support: <Link href="/support" className="text-blue-600 hover:underline">levqor.ai/support</Link></p>
              <p className="mt-2 text-sm text-gray-600">Company Number: 12345678</p>
              <p className="text-sm text-gray-600">Registered in England and Wales</p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              <Link href="/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link>
              <Link href="/fair-use" className="text-blue-600 hover:underline">Fair Use Policy</Link>
              <Link href="/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>
              <Link href="/sla" className="text-blue-600 hover:underline">Service Level Agreement</Link>
              <Link href="/cancellation" className="text-blue-600 hover:underline">Cancellation Policy</Link>
              <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution</Link>
              <Link href="/guarantee" className="text-blue-600 hover:underline">Money-Back Guarantee</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
