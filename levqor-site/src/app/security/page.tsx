import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & data protection – Levqor',
  description: 'Learn how Levqor protects your data with encryption, access control, audit logging, and compliance-ready practices.',
  alternates: {
    canonical: 'https://levqor.ai/security',
  },
};

export default function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-6">Security</h1>
      <p className="text-lg text-gray-600 mb-8">
        Enterprise-grade encryption, strict access controls, and audit logging across the platform.
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Encryption</h2>
          <p className="text-gray-600">
            All data is encrypted at rest and in transit using industry-standard AES-256 encryption. 
            TLS 1.3 is enforced for all API communications.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Access Control</h2>
          <p className="text-gray-600">
            Role-based access control (RBAC) ensures users only access resources they need. 
            Multi-factor authentication (MFA) is available for all accounts.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Compliance</h2>
          <p className="text-gray-600">
            Levqor maintains compliance with GDPR, SOC 2, and industry best practices. 
            Regular security audits and penetration testing ensure ongoing protection.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Audit Logging</h2>
          <p className="text-gray-600">
            Comprehensive audit logs track all system activities, providing full visibility 
            into who accessed what and when. Logs are retained for compliance requirements.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Report Security Issues</h2>
          <p className="text-gray-600 mb-3">
            If you discover a security vulnerability, please report it to{' '}
            <a href="mailto:security@levqor.ai" className="text-blue-600 hover:underline">
              security@levqor.ai
            </a>
            . We take all reports seriously and respond promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
