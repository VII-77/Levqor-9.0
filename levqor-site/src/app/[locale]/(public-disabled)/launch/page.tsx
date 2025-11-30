import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Levqor - AI-Powered Workflow Automation Platform",
  description: "Automate your business processes with Levqor. Create powerful workflows using AI, templates, or build from scratch. 40 languages supported.",
};

const features = [
  {
    icon: "🧠",
    title: "Levqor Brain AI",
    description: "Describe what you want to automate in plain English. Our AI creates the workflow for you."
  },
  {
    icon: "⚙️",
    title: "Visual Workflow Editor",
    description: "Drag and drop steps, configure conditions, and test your automations visually."
  },
  {
    icon: "📋",
    title: "25+ Templates",
    description: "Start with pre-built templates for lead capture, customer support, data sync, and more."
  },
  {
    icon: "🔒",
    title: "Safe & Secure",
    description: "Class-based approval system ensures critical operations require human review."
  },
  {
    icon: "📊",
    title: "Analytics & Insights",
    description: "Track workflow performance, monitor health, and optimize your automations."
  },
  {
    icon: "🌍",
    title: "40 Languages",
    description: "Use Levqor in your preferred language with full localization support."
  }
];

const pricingTiers = [
  { name: "Starter", price: "£9", period: "/month", highlight: false },
  { name: "Launch", price: "£29", period: "/month", highlight: true },
  { name: "Growth", price: "£59", period: "/month", highlight: false },
  { name: "Agency", price: "£149", period: "/month", highlight: false }
];

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now Live - Start Your 7-Day Free Trial
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Automate Your Business with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Levqor
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Create powerful workflow automations using AI, templates, or build from scratch. 
              Trusted by businesses worldwide for data backup, retention, and process automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                href="/templates"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
              >
                Browse Templates
              </Link>
            </div>
            
            <p className="mt-6 text-gray-400 text-sm">
              No credit card required for trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Automate
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From AI-powered workflow creation to enterprise-grade security, 
              Levqor has all the tools you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400">
              Start with a 7-day free trial. No credit card required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`rounded-xl p-6 text-center ${
                  tier.highlight 
                    ? "bg-gradient-to-b from-blue-600 to-purple-600 text-white" 
                    : "bg-slate-800 border border-slate-700 text-white"
                }`}
              >
                {tier.highlight && (
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-sm opacity-80">{tier.period}</span>
                </div>
                <Link
                  href="/pricing"
                  className={`block w-full py-2 rounded-lg font-medium transition-colors ${
                    tier.highlight
                      ? "bg-white text-purple-600 hover:bg-gray-100"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-blue-400 hover:underline">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Automate?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of businesses using Levqor to save time and reduce errors.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/refunds" className="hover:text-white">Refund Policy</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
            <Link href="/help" className="hover:text-white">Help Center</Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            © {new Date().getFullYear()} Levqor Technologies Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
