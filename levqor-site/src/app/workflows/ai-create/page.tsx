"use client";
import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

const NaturalLanguageWorkflowBuilder = lazy(() => import("@/components/ai/NaturalLanguageWorkflowBuilder"));

export default function AIWorkflowCreatePage() {
  const [showBuilder, setShowBuilder] = useState(true);

  const examples = [
    "When I receive an email with 'urgent' in the subject, forward it to Slack and text me",
    "Every Monday at 9am, pull sales data from Stripe and email me a summary",
    "When a customer signs up, add them to Mailchimp and send a welcome email",
    "If inventory drops below 10 units, email me and create a purchase order",
    "When someone mentions @mycompany on Twitter, log it to Google Sheets"
  ];

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🤖</span>
            <span>AI-Powered</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Create Workflows in Plain English
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Describe what you want to automate, and our AI will build the workflow for you.
            No coding or technical knowledge required.
          </p>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-neutral-600 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2">
            <span className="text-primary-500">⚡</span>
            <span>Instant workflow generation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-success-500">✓</span>
            <span>Production-ready code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary-500">🎯</span>
            <span>Smart error handling included</span>
          </div>
        </div>

        {/* Builder Component */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {showBuilder ? (
            <Suspense fallback={<div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200 text-center py-16">Loading AI Builder...</div>}>
              <NaturalLanguageWorkflowBuilder />
            </Suspense>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">AI Workflow Builder</h2>
                <p className="text-neutral-600 mb-6">
                  The AI builder component is loading...
                </p>
                <button
                  onClick={() => setShowBuilder(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Activate Builder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Example Prompts */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            Try These Examples
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">💡</span>
                  <p className="text-neutral-700 group-hover:text-primary-700 transition-colors">
                    "{example}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            How AI Workflow Creation Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Describe Your Need</h3>
              <p className="text-neutral-600">
                Write in plain English what you want to automate. Be as specific or general as you like.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">AI Generates Workflow</h3>
              <p className="text-neutral-600">
                Our AI analyzes your request and builds a complete workflow with triggers, actions, and error handling.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Review & Deploy</h3>
              <p className="text-neutral-600">
                Review the generated workflow, make tweaks if needed, then deploy with one click.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-bold text-neutral-900 mb-2">Smart Understanding</h3>
            <p className="text-sm text-neutral-600">
              AI understands context, intent, and edge cases
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold text-neutral-900 mb-2">Auto-Connect Apps</h3>
            <p className="text-sm text-neutral-600">
              Automatically suggests and configures integrations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold text-neutral-900 mb-2">Built-in Resilience</h3>
            <p className="text-sm text-neutral-600">
              Error handling and retry logic included by default
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-neutral-900 mb-2">Instant Deploy</h3>
            <p className="text-sm text-neutral-600">
              Go from idea to live workflow in under 5 minutes
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Not Sure What to Build?</h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our library of 50 pre-built workflow templates for inspiration.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/workflows/library" className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
              Browse Templates
            </Link>
            <Link href="/workflows/daily" className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-xl font-semibold hover:bg-primary-800 transition-all">
              See Workflow of the Day
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
