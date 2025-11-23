import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, tutorials, and updates from the Levqor team on automation, workflows, and building better products.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Levqor Blog</h1>
          <p className="text-xl text-gray-600">
            Insights on automation, workflows, and building reliable systems.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition">
            <div className="text-sm text-gray-500 mb-2">November 2025</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Introducing Levqor X 9.0: Self-Healing Workflows at Scale
            </h2>
            <p className="text-gray-700 mb-4">
              We're excited to announce Levqor X 9.0 with major improvements to our self-healing
              engine, new DFY service tiers, and 99.9% uptime SLA for Enterprise customers.
            </p>
            <Link href="/docs" className="text-blue-600 hover:underline font-medium">
              Read more →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition">
            <div className="text-sm text-gray-500 mb-2">October 2025</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              How to Build Reliable Automation: 5 Design Patterns
            </h2>
            <p className="text-gray-700 mb-4">
              Learn the core patterns we use to ensure workflows run smoothly even when external
              APIs fail, rate limits kick in, or networks hiccup.
            </p>
            <Link href="/docs" className="text-blue-600 hover:underline font-medium">
              Read more →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition">
            <div className="text-sm text-gray-500 mb-2">September 2025</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Customer Story: How Acme Corp Saved 200 Hours/Month with Levqor
            </h2>
            <p className="text-gray-700 mb-4">
              Acme Corp automated their entire lead-to-CRM pipeline and reduced manual data entry
              from 8 hours/day to zero. Here's how they did it.
            </p>
            <Link href="/docs" className="text-blue-600 hover:underline font-medium">
              Read more →
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            More posts coming soon. Subscribe to our newsletter for updates.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
