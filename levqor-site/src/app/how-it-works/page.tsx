"use client";
import type { Metadata } from "next";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-12 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      <div className="text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          How Levqor Works
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Automate your workflows with self-healing capabilities and intelligent monitoring.
          Set it up once, let it run forever.
        </p>
      </div>

      <div className="space-y-16">
        <div className="flex gap-8 items-start animate-fade-in-up group hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '100ms' }}>
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
            1
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Connect Your Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Integrate with 50+ popular apps and services including Gmail, Slack, Google Sheets,
              Stripe, Salesforce, and more. No code required—just authenticate and select the
              data you want to work with.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>One-click OAuth integrations</li>
              <li>Secure credential management</li>
              <li>Custom API connections supported</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start animate-fade-in-up group hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '200ms' }}>
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
            2
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Build Your Workflow</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Create automated workflows using our visual builder or templates. Define triggers,
              actions, and conditions to automate repetitive tasks across your tools.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Drag-and-drop workflow builder</li>
              <li>Pre-built templates for common tasks</li>
              <li>Conditional logic and branching</li>
              <li>AI-powered suggestions</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start animate-fade-in-up group hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '300ms' }}>
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
            3
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Monitor & Self-Heal</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Levqor continuously monitors your workflows and automatically recovers from failures.
              Rate limits, API errors, and network issues are handled intelligently without your intervention.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Automatic retry with exponential backoff</li>
              <li>Intelligent error detection and recovery</li>
              <li>Real-time alerts and notifications</li>
              <li>99.9% uptime SLA guarantee</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-8 items-start animate-fade-in-up group hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '400ms' }}>
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
            4
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Pay Only for Results</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Unlike other automation platforms, you only pay for successful workflow executions.
              No hidden fees, no surprise charges. Clear, transparent pricing based on actual value delivered.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Usage-based billing</li>
              <li>No charge for failed runs</li>
              <li>Volume discounts available</li>
              <li>Cancel anytime</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white mt-16 shadow-2xl animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-3xl font-bold mb-4">Ready to Automate?</h2>
        <p className="text-xl mb-8 opacity-90">
          Start your 7-day free trial today.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signin" className="group px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Start Free Trial
            <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link href="/pricing" className="px-8 py-4 bg-primary-700 text-white border-2 border-white rounded-xl font-semibold hover:bg-primary-800 transition-all">
            View Pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
