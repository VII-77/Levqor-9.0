import Link from "next/link";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Transparency | Levqor',
  description: 'Learn how Levqor uses artificial intelligence, what data is processed, and our commitment to responsible AI practices.',
  robots: 'index, follow'
}

export default function AITransparencyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Transparency
          </h1>
          <p className="text-gray-600 text-sm">
            Last updated: November 24, 2025
          </p>
        </div>

        <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🤖 Our Commitment to Transparency</h3>
          <p className="text-blue-800 leading-relaxed">
            At Levqor, we believe in being transparent about how we use artificial intelligence. This page explains when, how, and why AI is used in our platform, what data is processed, and how we protect your privacy and ensure responsible AI practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Current AI Implementation Status</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>Important:</strong> As of November 2025, AI features in Levqor are currently in <strong>stub/demo mode</strong> for most users. This means:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>AI features display example responses and workflows for demonstration purposes</li>
            <li>No actual data is sent to external AI providers unless explicitly enabled for your account</li>
            <li>When real AI is activated, you will be notified and can opt-in or opt-out</li>
          </ul>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-green-800 text-sm">
              ✅ <strong>Privacy Protection:</strong> In stub mode, your data remains entirely within Levqor's infrastructure. No external AI providers have access to your information.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Where AI is Used</h2>
          <p className="text-gray-700 leading-relaxed">
            When AI features are enabled, artificial intelligence may be used in the following areas:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Workflow Creator</h3>
              <p className="text-gray-600 text-sm mt-1">
                Converts natural language descriptions into workflow configurations. Example: "Send weekly reports to my team" becomes a scheduled automation.
              </p>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Help Panel</h3>
              <p className="text-gray-600 text-sm mt-1">
                Provides contextual assistance and answers questions about platform features. Helps users understand errors and optimize workflows.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900">Debug Assistant</h3>
              <p className="text-gray-600 text-sm mt-1">
                Analyzes error messages and suggests fixes. Helps identify common configuration mistakes and optimization opportunities.
              </p>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900">Onboarding Guide</h3>
              <p className="text-gray-600 text-sm mt-1">
                Provides personalized setup recommendations based on your industry and use case.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">3. AI Providers & Models</h2>
          <p className="text-gray-700 leading-relaxed">
            When AI features are fully activated, Levqor may use the following AI providers and models:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">OpenAI GPT-4o-mini</h4>
              <p className="text-sm text-gray-600">Used for natural language understanding, workflow generation, and contextual help</p>
              <p className="text-sm text-gray-500 mt-1">Provider: OpenAI LLC (United States)</p>
              <p className="text-sm text-gray-500">Privacy Policy: <a href="https://openai.com/policies/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">openai.com/policies/privacy-policy</a></p>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            Note: We may add or change AI providers as technology evolves. You will be notified of significant changes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">4. What Data is Sent to AI</h2>
          <p className="text-gray-700 leading-relaxed">
            When you interact with AI features, the following types of data may be processed:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6">Data We Send:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Workflow descriptions:</strong> Natural language descriptions you provide</li>
            <li><strong>Error messages:</strong> Technical errors for debugging assistance</li>
            <li><strong>Usage context:</strong> Current page, feature being used (to provide relevant help)</li>
            <li><strong>Anonymized metadata:</strong> Industry, company size (for better recommendations)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6">Data We DO NOT Send:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Credentials & secrets:</strong> API keys, passwords, authentication tokens</li>
            <li><strong>Actual backup data:</strong> Your files, databases, or backup contents</li>
            <li><strong>Payment information:</strong> Credit card numbers, billing details</li>
            <li><strong>Personal identifiable information (PII):</strong> Unless you explicitly include it in a query</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Best Practice:</strong> Avoid including sensitive information (passwords, API keys, customer PII) when describing workflows or asking questions. Our AI features are designed to work with general descriptions.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">5. Data Retention by AI Providers</h2>
          <p className="text-gray-700 leading-relaxed">
            OpenAI's data retention policy (as of our last review):
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>API requests are retained for 30 days for abuse monitoring</li>
            <li>After 30 days, data is deleted from their systems</li>
            <li>Your data is <strong>not</strong> used to train OpenAI models (API data is excluded from training)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            For the most current information, please review OpenAI's privacy policy directly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">6. AI Limitations & Risks</h2>
          <p className="text-gray-700 leading-relaxed">
            We want to be transparent about the limitations and potential risks of AI:
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">Hallucinations</h4>
              <p className="text-sm text-gray-600">AI may generate plausible-sounding but incorrect information. Always verify critical configurations.</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900">Bias</h4>
              <p className="text-sm text-gray-600">AI models may reflect biases present in their training data. We actively work to mitigate this.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900">Context Limitations</h4>
              <p className="text-sm text-gray-600">AI has limited context about your specific business needs. Human oversight is recommended.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Security</h4>
              <p className="text-sm text-gray-600">While we implement safeguards, avoid sharing highly sensitive information in AI interactions.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">7. Your Control & Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            You have full control over AI features:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Opt-Out:</strong> You can disable AI features entirely in your account settings</li>
            <li><strong>Data Deletion:</strong> Request deletion of AI interaction history via our <Link href="/data-rights" className="text-blue-600 hover:underline">Data Rights page</Link></li>
            <li><strong>Review & Correct:</strong> View and correct any AI-generated configurations before saving</li>
            <li><strong>Human Alternative:</strong> All AI features have manual alternatives available</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">8. Responsible AI Principles</h2>
          <p className="text-gray-700 leading-relaxed">
            Levqor is committed to responsible AI development and deployment:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Transparency:</strong> Clear disclosure when AI is being used</li>
            <li><strong>Privacy-First:</strong> Minimizing data sent to AI providers</li>
            <li><strong>Human Oversight:</strong> AI assists humans, never replaces human judgment</li>
            <li><strong>Accountability:</strong> We take responsibility for AI-generated content</li>
            <li><strong>Fairness:</strong> Regular audits to detect and mitigate bias</li>
            <li><strong>Safety:</strong> Safeguards against harmful or inappropriate outputs</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">9. Future AI Features</h2>
          <p className="text-gray-700 leading-relaxed">
            We are exploring additional AI capabilities:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Predictive analytics for backup optimization</li>
            <li>Anomaly detection for unusual access patterns</li>
            <li>Automated workflow suggestions based on usage patterns</li>
            <li>Natural language query interface for data analytics</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            You will be notified before any new AI features are activated for your account.
          </p>
        </section>

        <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Legal Notice</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            This AI Transparency page is informational and does not override or modify our <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link> or <Link href="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>. For binding legal commitments, please refer to those documents.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">10. Questions & Feedback</h2>
          <p className="text-gray-700 leading-relaxed">
            We welcome your questions and feedback about our AI practices:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>Email:</strong> ai-feedback@levqor.ai</p>
            <p className="text-gray-700 mt-2"><strong>Privacy Questions:</strong> privacy@levqor.ai</p>
            <p className="text-gray-700 mt-2"><strong>Support:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link></p>
          </div>
        </section>

        <div className="border-t pt-8 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/privacy" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1">How we protect your data</p>
            </Link>
            <Link href="/data-rights" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Data Rights</h4>
              <p className="text-sm text-gray-600 mt-1">Your rights regarding your data</p>
            </Link>
            <Link href="/security" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Security</h4>
              <p className="text-sm text-gray-600 mt-1">Our security measures</p>
            </Link>
            <Link href="/dpa" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Data Processing Addendum</h4>
              <p className="text-sm text-gray-600 mt-1">GDPR compliance details</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
