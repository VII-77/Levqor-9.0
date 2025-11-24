"use client";
import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

export default function FounderPlaybookPage() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-in-up">
        <div className="text-6xl mb-6">📖</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          The Founder's Playbook
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
          Essential automation strategies from founders who scaled from 0 to $1M+ ARR.
          Free download, no email required.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-lg shadow-lg">
          Download Playbook (PDF) →
        </button>
      </section>

      {/* Contents Preview */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-8">
            <h2 className="text-3xl font-bold mb-4">What's Inside</h2>
            <p className="text-lg opacity-90">
              47 pages of battle-tested automation strategies, frameworks, and real-world examples.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Chapter 1 */}
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Chapter 1: The Automation Mindset
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  <span>Why 80% of founders waste time on the wrong automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  <span>The 10x ROI framework for prioritizing workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">•</span>
                  <span>How to identify your highest-leverage automation opportunities</span>
                </li>
              </ul>
            </div>

            {/* Chapter 2 */}
            <div className="border-l-4 border-secondary-500 pl-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Chapter 2: The 7 Core Workflows Every Startup Needs
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500">•</span>
                  <span>Lead capture & qualification (saves 15 hours/week)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500">•</span>
                  <span>Customer onboarding sequences that reduce churn by 35%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500">•</span>
                  <span>Revenue operations dashboard (automated weekly reporting)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-500">•</span>
                  <span>Support ticket routing & escalation logic</span>
                </li>
              </ul>
            </div>

            {/* Chapter 3 */}
            <div className="border-l-4 border-success-500 pl-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Chapter 3: Scaling from 10 to 10,000 Workflows
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-success-500">•</span>
                  <span>Version control & testing strategies for production workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500">•</span>
                  <span>Error handling patterns that prevent midnight emergencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500">•</span>
                  <span>Team collaboration frameworks (when to split vs. centralize)</span>
                </li>
              </ul>
            </div>

            {/* Chapter 4 */}
            <div className="border-l-4 border-warning-500 pl-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Chapter 4: Real Case Studies
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-warning-500">•</span>
                  <span>SaaS Company: $0 → $1.2M ARR with 80% automated ops</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-500">•</span>
                  <span>E-commerce Brand: Reduced fulfillment time by 73%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-500">•</span>
                  <span>Agency: 3-person team managing 50+ clients with automation</span>
                </li>
              </ul>
            </div>

            {/* Chapter 5 */}
            <div className="border-l-4 border-error-500 pl-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Chapter 5: Advanced Strategies
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-error-500">•</span>
                  <span>Multi-cloud failover architectures for mission-critical workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error-500">•</span>
                  <span>AI-powered workflow optimization (when to use, when to avoid)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error-500">•</span>
                  <span>Compliance automation for GDPR, SOC 2, and ISO 27001</span>
                </li>
              </ul>
            </div>

            {/* Bonus Section */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                🎁 Bonus: Templates & Checklists
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>Pre-launch automation checklist (23 items)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>ROI calculator spreadsheet for workflow prioritization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>15 ready-to-use workflow templates (copy-paste)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>Team onboarding guide for automation-first culture</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-8 bg-neutral-50 text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-lg shadow-lg mb-4">
              Download Full Playbook (PDF) →
            </button>
            <p className="text-sm text-neutral-600">
              Free download · No email required · 47 pages · Updated November 2025
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
          What Founders Are Saying
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow">
            <div className="flex items-center gap-2 mb-4 text-warning-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <p className="text-neutral-700 mb-4 italic">
              "This playbook saved me 6 months of trial and error. The ROI framework alone is worth $10k in consulting fees."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                SK
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Sarah Kim</div>
                <div className="text-sm text-neutral-600">Founder, CloudMetrics</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow">
            <div className="flex items-center gap-2 mb-4 text-warning-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <p className="text-neutral-700 mb-4 italic">
              "We went from manual chaos to 80% automated ops in 90 days. The case studies gave us a clear roadmap."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold">
                MR
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Mike Rodriguez</div>
                <div className="text-sm text-neutral-600">CTO, ShipFast</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow">
            <div className="flex items-center gap-2 mb-4 text-warning-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <p className="text-neutral-700 mb-4 italic">
              "Finally, automation advice that's practical and not overly technical. Implemented 5 workflows on day one."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                AL
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Alex Lee</div>
                <div className="text-sm text-neutral-600">CEO, Growth Labs</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow">
            <div className="flex items-center gap-2 mb-4 text-warning-500">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <p className="text-neutral-700 mb-4 italic">
              "The compliance automation section is gold. Helped us pass SOC 2 audit 3 months ahead of schedule."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white font-bold">
                JW
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Jessica Wong</div>
                <div className="text-sm text-neutral-600">VP Eng, SecureData</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white shadow-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-xl mb-8 opacity-90">
            Turn these strategies into reality with Levqor's automation platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signin" className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
              Start Free Trial
            </Link>
            <Link href="/workflows/library" className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-xl font-semibold hover:bg-primary-800 transition-all">
              Browse Workflow Library
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
