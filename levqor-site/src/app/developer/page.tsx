'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const tiers = [
  {
    name: 'Sandbox',
    price: '$0',
    period: 'forever',
    calls: '1,000 calls/month',
    features: [
      'Sandbox API access',
      'Mock data responses',
      '1,000 requests/month',
      'Community support',
      'API documentation',
      'Code examples',
    ],
    cta: 'Get Started Free',
    href: '/developer/keys',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    calls: '10,000 calls/month',
    features: [
      'Production API access',
      'Real-time job processing',
      '10,000 requests/month',
      'Email support',
      'Webhook notifications',
      'Advanced analytics',
    ],
    cta: 'Upgrade to Pro',
    href: '/developer/keys',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: 'per month',
    calls: 'Unlimited calls',
    features: [
      'Unlimited API access',
      'Priority processing',
      'Unlimited requests',
      'SLA guarantee (99.9%)',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

const features = [
  {
    icon: '🚀',
    title: 'Fast Integration',
    description: 'Get up and running in minutes with our simple RESTful API and comprehensive documentation.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime SLA. Your data is encrypted and protected.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Track your API usage, monitor performance, and optimize costs with our built-in dashboard.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Average response time under 120ms. Optimized infrastructure for maximum performance.',
  },
];

const codeExample = `// Install the Levqor SDK
npm install @levqor/sdk

// Initialize with your API key
import { Levqor } from '@levqor/sdk';

const client = new Levqor({
  apiKey: process.env.LEVQOR_API_KEY
});

// Create a job
const job = await client.jobs.create({
  workflow: 'data-enrichment',
  payload: { /* your data */ }
});

// Check status
const status = await client.jobs.get(job.id);
console.log(status);`;

export default function DeveloperPage() {
  const { data: session } = useSession();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    if (!session) {
      window.location.href = '/signin?callbackUrl=/developer';
      return;
    }

    setUpgrading(true);
    try {
      const res = await fetch('/api/portal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout. Please try again.');
        setUpgrading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Levqor API</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Power your applications with AI-driven job orchestration. Simple, reliable, and built for scale.
          </p>
          <div className="flex gap-4 justify-center">
            {session ? (
              <>
                <Link
                  href="/developer/keys"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get API Key
                </Link>
                <Link
                  href="/developer/docs"
                  className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  View Docs
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sign In to Start
                </Link>
                <Link
                  href="#pricing"
                  className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Get Started in Minutes
          </h2>
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{codeExample}</code>
            </pre>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/developer/docs"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View Full Documentation →
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Start free, upgrade when you need to scale
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${
                tier.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{tier.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                  {tier.calls}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.name === 'Sandbox' ? (
                <Link
                  href="/developer/keys"
                  className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {tier.cta}
                </Link>
              ) : tier.name === 'Enterprise' ? (
                <Link
                  href="/contact"
                  className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgrading}
                  className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {upgrading ? 'Processing...' : tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers building with Levqor API
          </p>
          <Link
            href={session ? "/developer/keys" : "/signin"}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            {session ? "Get Your API Key" : "Sign Up Free"}
          </Link>
        </div>
      </div>
    </div>
  );
}
