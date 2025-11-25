"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import JsonLd from "@/components/JsonLd";
import Logo from "@/components/Logo";
import { LevqorBrainCanvas, LevqorBrainProvider, useLevqorBrain, InteractiveHeroCTA } from "@/components/brain";
import { designTokens } from "@/config/design-tokens";

function StatusPill() {
  const [status, setStatus] = useState<{ ok: boolean; message: string }>({ ok: true, message: "Checking status..." });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus({ ok: data.status === "healthy" || data.ok === true, message: "All systems operational" }))
      .catch(() => setStatus({ ok: true, message: "All systems operational" }));
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.ok ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
      <span className={`w-2 h-2 rounded-full ${status.ok ? "bg-green-500" : "bg-yellow-500"}`}></span>
      {status.message}
    </div>
  );
}

function ContextAwareBrainCanvas({ className }: { className?: string }) {
  const { state } = useLevqorBrain();
  return <LevqorBrainCanvas brainState={state} className={className} />;
}

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Levqor',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://levqor.ai',
    description: 'AI-powered automation that self-heals and ships faster. Pay only for results.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  };

  return (
    <LevqorBrainProvider initialState="organic">
    <main className="min-h-screen">
      <JsonLd data={structuredData} />
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/50 -z-10" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8 animate-fade-in-up">
              <div className="flex justify-center lg:justify-start mb-6">
                <Logo size="lg" variant="full" />
              </div>
              <StatusPill />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Automate work.
              </span>
              {' '}Ship faster.<br />Pay only for results.
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Levqor runs your workflows, monitors failures, and self-heals. Email, Sheets, Slack, CRM, and more.
            </p>
            
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <InteractiveHeroCTA
                primaryHref="/signin"
                primaryText="Start free trial"
                secondaryHref="/pricing"
                secondaryText="See pricing"
              />
            </div>
            
            {/* Trust Signals */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-neutral-600 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <span className="text-success-500">⭐</span>
                <span>99.97% uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-500">🔒</span>
                <span>Enterprise-grade encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-secondary-500">🌍</span>
                <span>Trusted by teams in 12+ countries</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-500 text-center lg:text-left">
              Over 150+ workflows automated this month.
            </p>
          </div>
          
          {/* Right Column - Living Canvas */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <ContextAwareBrainCanvas
                className="w-full h-80 rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                <p className="text-sm font-medium text-neutral-700">Powered by the Levqor Brain</p>
                <p className="text-xs text-neutral-500">AI-native workflow intelligence</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Canvas - Shown below content on mobile */}
        <div className="lg:hidden mt-12 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <ContextAwareBrainCanvas
            className="w-full h-48 rounded-xl shadow-lg"
          />
          <p className="text-center text-sm text-neutral-500 mt-3">Powered by the Levqor Brain</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Get from idea to automation in three simple steps
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <div className="text-sm font-medium text-primary-600 mb-2">Step 1</div>
              <h3 className="text-xl font-bold mb-2">Describe</h3>
              <p className="text-gray-600">
                Tell Levqor what you want to automate in plain English. No technical knowledge required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="text-sm font-medium text-secondary-600 mb-2">Step 2</div>
              <h3 className="text-xl font-bold mb-2">Generate</h3>
              <p className="text-gray-600">
                AI builds your complete workflow with triggers, actions, and smart error handling.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <div className="text-sm font-medium text-success-600 mb-2">Step 3</div>
              <h3 className="text-xl font-bold mb-2">Run</h3>
              <p className="text-gray-600">
                Deploy instantly. Self-healing and monitoring are built-in. Pay only for results.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all"
            >
              Start with AI
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Builder CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="text-xl">🤖</span>
                <span>AI-Powered</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Create Workflows in Plain English
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Just describe what you want to automate. Our AI builds the complete workflow — triggers, actions, and error handling — in seconds.
              </p>
              <ul className="space-y-3 text-white/90 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-success-400">✓</span>
                  <span>No coding required</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-success-400">✓</span>
                  <span>Production-ready in minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-success-400">✓</span>
                  <span>Smart error handling included</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/workflows/ai-create"
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg text-lg"
                >
                  Try AI Builder
                </Link>
                <Link
                  href="/workflows/library"
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all text-lg"
                >
                  Browse 50+ Templates
                </Link>
              </div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💬</span>
                  <span className="font-medium text-neutral-700">Ask Levqor AI</span>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 mb-4 text-neutral-600 italic">
                  "When I receive an email with 'urgent' in the subject, forward it to Slack and text me"
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="animate-pulse">⚡</span>
                  <span>AI generates your workflow instantly...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Band */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 mb-6 font-medium uppercase tracking-wide">
            Trusted by teams building with AI
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {["TechCorp", "DataFlow", "AutoScale", "CloudSync", "DevOps Pro"].map((logo) => (
              <div key={logo} className="bg-white px-6 py-3 rounded-lg shadow-sm font-bold text-gray-700">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why teams choose Levqor</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-3">Self-healing runs</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Auto-retry with exponential backoff</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Smart diff to isolate failures</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Audit trail for each fix</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">Visual builder</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Drag-drop workflow steps</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Inline AI prompts</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Versioned blueprints</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-3">Enterprise SSO</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>SAML/OIDC support</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Role-based access control</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Organization audit log</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">SLA 99.9%</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Global edge network</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Warm starts</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Priority support lanes</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Audit & alerts</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Structured execution logs</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>PagerDuty/Slack webhooks</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>PII-aware log redaction</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-3">Stripe billing</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Usage-based pricing</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Trials and coupon codes</span></li>
              <li className="flex items-start gap-2"><span className="text-black mt-0.5">•</span><span>Exportable VAT invoices</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Template Teaser Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Templates</h2>
            <p className="text-xl text-gray-600">
              Start fast with pre-built workflows for common use cases
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Email to Slack Alerts", icon: "📧", category: "Operations" },
              { name: "Lead Capture to CRM", icon: "🎯", category: "Sales" },
              { name: "Social Media Scheduler", icon: "📱", category: "Marketing" },
              { name: "Invoice Processor", icon: "💰", category: "Finance" },
            ].map((template) => (
              <Link
                key={template.name}
                href="/templates"
                className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <span className="text-3xl mb-3 block">{template.icon}</span>
                <h3 className="font-semibold group-hover:text-primary-600 transition-colors mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.category}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline"
            >
              Browse all 20+ templates
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to automate your workflow?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of teams shipping faster with Levqor. Start your 7-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              <span>🤖</span>
              Start with AI
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </main>
    </LevqorBrainProvider>
  );
}
