import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

export default function GlobalSupportPage() {
  const supportTiers = [
    { tier: "Starter", sla: "48 hours", channels: ["Email"], hours: "Business hours (9-5 GMT)" },
    { tier: "Launch", sla: "24 hours", channels: ["Email", "Priority queue"], hours: "Extended hours (8-8 GMT)" },
    { tier: "Growth", sla: "12 hours", channels: ["Email", "Chat", "Priority"], hours: "Extended hours (8-8 GMT)" },
    { tier: "Agency", sla: "4 hours", channels: ["Email", "Chat", "Phone", "Dedicated"], hours: "24/7 coverage" },
  ];

  const globalRegions = [
    { region: "🇬🇧 United Kingdom", languages: ["English"], availability: "24/7", localTeam: true },
    { region: "🇩🇪 Germany", languages: ["German", "English"], availability: "Business hours", localTeam: true },
    { region: "🇫🇷 France", languages: ["French", "English"], availability: "Business hours", localTeam: true },
    { region: "🇪🇸 Spain", languages: ["Spanish", "English"], availability: "Business hours", localTeam: true },
    { region: "🇺🇸 United States", languages: ["English"], availability: "Extended hours", localTeam: false },
    { region: "🇮🇳 India", languages: ["Hindi", "English"], availability: "Extended hours", localTeam: false },
    { region: "🇨🇳 China", languages: ["中文", "English"], availability: "Business hours", localTeam: false },
  ];

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="animate-fade-in-up">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Global Support
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-2">
            24/7 support in 40 languages. No matter where you are, we're here to help.
          </p>
          <p className="text-sm text-neutral-500">
            AI-powered assistance with human escalation when you need it.
          </p>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
          Support by Plan
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportTiers.map((plan, index) => (
            <div
              key={plan.tier}
              className="bg-white rounded-xl p-6 border-2 border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.tier}</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary-600 mb-1">{plan.sla}</div>
                <div className="text-sm text-neutral-600">Response time SLA</div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="text-sm font-semibold text-neutral-700">Channels:</div>
                {plan.channels.map(channel => (
                  <div key={channel} className="flex items-center gap-2 text-sm text-neutral-600">
                    <span className="text-primary-500">✓</span>
                    <span>{channel}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="text-xs text-neutral-500">{plan.hours}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 text-center">
          <p className="text-neutral-700 mb-4">
            All plans include AI-powered instant answers and access to our community knowledge base.
          </p>
          <Link href="/pricing" className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Compare Plans →
          </Link>
        </div>
      </section>

      {/* Global Coverage */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
          Global Coverage
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {globalRegions.map((region, index) => (
            <div
              key={region.region}
              className="bg-white rounded-xl p-6 border border-neutral-200 shadow hover:shadow-lg transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-neutral-900">{region.region}</h3>
                {region.localTeam && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    Local Team
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Languages:</span>
                  <span className="text-neutral-700 font-medium">{region.languages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Availability:</span>
                  <span className="text-neutral-700 font-medium">{region.availability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-neutral-600 mb-4">
            Don't see your region? We're expanding globally every month.
          </p>
          <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact us about regional support →
          </Link>
        </div>
      </section>

      {/* AI Support Features */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h2 className="text-3xl font-bold">AI-Powered Support</h2>
            </div>
            <p className="text-lg opacity-90">
              Get instant answers to common questions with our AI support assistant, available 24/7 in all 40 languages.
            </p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Instant Responses</h3>
                  <p className="text-sm text-neutral-600">
                    Get answers in seconds, not hours. Our AI understands context and provides actionable solutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  🌐
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Multilingual</h3>
                  <p className="text-sm text-neutral-600">
                    Ask questions in any of 40 supported languages and get responses in your preferred language.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Context-Aware</h3>
                  <p className="text-sm text-neutral-600">
                    AI understands your account, workflows, and usage patterns to provide personalized help.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Human Escalation</h3>
                  <p className="text-sm text-neutral-600">
                    Complex issues are automatically escalated to our human support team with full context.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6">
              <h3 className="font-bold text-neutral-900 mb-3">Common Questions Resolved by AI:</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>Workflow debugging and error troubleshooting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>Integration setup and configuration guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>Billing and subscription questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>Best practices and optimization recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Need Help Now?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our team is standing by to assist you, wherever you are in the world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
              Contact Support
            </Link>
            <Link href="/community" className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-xl font-semibold hover:bg-primary-800 transition-all">
              Visit Community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
