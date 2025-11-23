import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Request a Demo",
  description: "See Levqor in action. Schedule a personalized demo with our team or watch a product walkthrough video.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Request a Demo</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See Levqor in action. Schedule a personalized demo with our team or
            explore the platform yourself with a free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">🎥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Live Demo</h2>
            <p className="text-gray-700 mb-6">
              Schedule a 30-minute call with our team. We'll walk you through the platform,
              answer your questions, and help you design workflows for your specific use cases.
            </p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Personalized walkthrough of the platform</li>
              <li>• Discussion of your automation needs</li>
              <li>• Custom workflow design session</li>
              <li>• Pricing and onboarding guidance</li>
            </ul>
            <Link href="/contact" className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Schedule Live Demo
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Self-Guided Tour</h2>
            <p className="text-gray-700 mb-6">
              Prefer to explore on your own? Sign up for a 7-day free trial and take our
              interactive product tour.
            </p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Instant access to full platform</li>
              <li>• Interactive tutorials and guides</li>
              <li>• Pre-built workflow templates</li>
              <li>• Free tier with generous limits</li>
            </ul>
            <Link href="/signin" className="block w-full text-center px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
              Start Free Trial
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll See</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✨ Workflow Builder</h3>
              <p className="text-gray-700 text-sm">
                Visual drag-and-drop interface for building automation workflows without code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔌 Integrations</h3>
              <p className="text-gray-700 text-sm">
                One-click connections to 50+ popular tools including Slack, Gmail, Stripe, and more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Monitoring Dashboard</h3>
              <p className="text-gray-700 text-sm">
                Real-time monitoring with alerts, execution logs, and performance analytics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Self-Healing Workflows</h3>
              <p className="text-gray-700 text-sm">
                Automatic retry logic and error recovery that keeps workflows running smoothly.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Common Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How long is the demo?</h3>
              <p className="text-gray-700">
                Live demos typically run 30 minutes. We can extend if you have more questions
                or want to dive deeper into specific features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Do I need technical knowledge?</h3>
              <p className="text-gray-700">
                Not at all! Levqor is designed for non-technical users. We'll show you how
                to build workflows without writing any code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Can I try it before buying?</h3>
              <p className="text-gray-700">
                Yes! We offer a 7-day free trial with full access to all features. A credit card is required to start, but you won't be charged during the trial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What happens after the demo?</h3>
              <p className="text-gray-700">
                No pressure! We'll send you a follow-up email with resources, pricing info,
                and next steps. You decide when and if you want to move forward.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Have other questions? We're here to help.
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline font-medium">
            Contact our team →
          </Link>
        </div>
      </div>
    </div>
  );
}
