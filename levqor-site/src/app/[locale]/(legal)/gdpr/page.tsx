import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

export default function GDPRPage() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="text-6xl mb-6">🛡️</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Privacy & GDPR
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-4">
            How Levqor protects your data and helps you stay compliant with global privacy regulations.
          </p>
          <p className="text-sm text-neutral-500 bg-warning-50 border border-warning-200 rounded-lg px-4 py-2 max-w-3xl mx-auto">
            ⚠️ This page provides educational information about our privacy practices. For official legal policies, see our <Link href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center shadow">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-2xl font-bold text-primary-600 mb-1">AES-256</div>
            <div className="text-sm text-neutral-600">Encryption at Rest</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center shadow">
            <div className="text-3xl mb-2">🌍</div>
            <div className="text-2xl font-bold text-secondary-600 mb-1">GDPR</div>
            <div className="text-sm text-neutral-600">Fully Compliant</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center shadow">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-success-600 mb-1">SOC 2</div>
            <div className="text-sm text-neutral-600">Type II Certified</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="p-8 space-y-8">
            {/* Data Protection */}
            <section>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Data Protection Principles</h2>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                We built Levqor with privacy-first architecture. Your data is encrypted, isolated, and accessible only to you.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">End-to-End Encryption</h3>
                    <p className="text-sm text-neutral-600">
                      All data transmitted between your browser and our servers uses TLS 1.3. Data at rest is encrypted with AES-256.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Data Residency</h3>
                    <p className="text-sm text-neutral-600">
                      EU customer data is stored exclusively in EU data centers (Frankfurt). We never transfer EU data outside the EU.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Zero Access Architecture</h3>
                    <p className="text-sm text-neutral-600">
                      Levqor staff cannot access your workflow data without explicit authorization. All access is logged and auditable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* GDPR Rights */}
            <section className="border-t border-neutral-200 pt-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Your GDPR Rights</h2>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                Under GDPR, you have complete control over your personal data. Here's how to exercise your rights:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-bold text-neutral-900 mb-2">✓ Right to Access</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Export all your data in machine-readable format (JSON, CSV).
                  </p>
                  <Link href="/dashboard/settings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Export Data →
                  </Link>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-bold text-neutral-900 mb-2">✓ Right to Erasure</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Delete your account and all associated data permanently.
                  </p>
                  <Link href="/dashboard/settings" className="text-sm text-error-600 hover:text-error-700 font-medium">
                    Delete Account →
                  </Link>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-bold text-neutral-900 mb-2">✓ Right to Rectification</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Update or correct your personal information anytime.
                  </p>
                  <Link href="/dashboard/settings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Edit Profile →
                  </Link>
                </div>

                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-bold text-neutral-900 mb-2">✓ Right to Portability</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Take your data to another service in standard formats.
                  </p>
                  <Link href="/dashboard/settings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Export Data →
                  </Link>
                </div>
              </div>
            </section>

            {/* PII Masking */}
            <section className="border-t border-neutral-200 pt-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">PII Masking & Protection</h2>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                Levqor automatically detects and masks Personally Identifiable Information (PII) in logs and error reports.
              </p>
              
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                <h3 className="font-bold text-neutral-900 mb-4">Automatically Masked Data Types:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>Email addresses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>Phone numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>Credit card numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>Social security numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>IP addresses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-primary-500">•</span>
                    <span>API keys & tokens</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
                  <div className="text-sm font-mono text-neutral-700">
                    <div className="mb-2 text-neutral-500">// Example: Error log with PII masking</div>
                    <div>Email sent to: j***@example.com</div>
                    <div>Card ending in: ****1234</div>
                    <div>API key: sk_***************************</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance Certifications */}
            <section className="border-t border-neutral-200 pt-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Compliance & Certifications</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">GDPR Compliant</h3>
                    <p className="text-sm text-neutral-600">
                      Full compliance with EU General Data Protection Regulation, audited annually.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">SOC 2 Type II</h3>
                    <p className="text-sm text-neutral-600">
                      Independently audited controls for security, availability, and confidentiality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">ISO 27001</h3>
                    <p className="text-sm text-neutral-600">
                      International standard for information security management systems.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">CCPA Compliant</h3>
                    <p className="text-sm text-neutral-600">
                      California Consumer Privacy Act compliance for US customers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t border-neutral-200 pt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Questions or Concerns?</h2>
              <p className="text-neutral-700 mb-4">
                Our Data Protection Officer is available to answer any privacy or compliance questions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Contact DPO
                </Link>
                <Link href="/privacy" className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-all">
                  Full Privacy Policy
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
