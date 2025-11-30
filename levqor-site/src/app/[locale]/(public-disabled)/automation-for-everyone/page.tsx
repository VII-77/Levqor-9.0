import Link from "next/link";
import { designTokens } from "@/config/design-tokens";

export default function AutomationForEveryonePage() {
  const languages = [
    { name: "English", code: "en", flag: "🇬🇧", tier: "Tier 1" },
    { name: "Deutsch", code: "de", flag: "🇩🇪", tier: "Tier 1" },
    { name: "Français", code: "fr", flag: "🇫🇷", tier: "Tier 1" },
    { name: "Español", code: "es", flag: "🇪🇸", tier: "Tier 1" },
    { name: "Português", code: "pt", flag: "🇵🇹", tier: "Tier 1" },
    { name: "Italiano", code: "it", flag: "🇮🇹", tier: "Tier 1" },
    { name: "हिन्दी", code: "hi", flag: "🇮🇳", tier: "Tier 1" },
    { name: "العربية", code: "ar", flag: "🇸🇦", tier: "Tier 1", rtl: true },
    { name: "中文", code: "zh-Hans", flag: "🇨🇳", tier: "Tier 1" },
  ];

  const tier2Languages = ["日本語 (Japanese)", "한국어 (Korean)", "Русский (Russian)", "Nederlands (Dutch)", "Polski (Polish)", "Türkçe (Turkish)"];
  const tier3Languages = ["Svenska", "Norsk", "Dansk", "Suomi", "Ελληνικά", "עברית", "ไทย", "Tiếng Việt", "Bahasa Indonesia", "Filipino", "Українська", "Čeština", "Română", "Magyar", "Hrvatski"];

  const useCases = [
    { icon: "👨‍💼", title: "Small Business Owners", description: "Automate invoicing, customer follow-ups, and inventory management in any language" },
    { icon: "🎓", title: "Students & Educators", description: "Create study workflows, grade tracking, and assignment reminders" },
    { icon: "🏥", title: "Healthcare Professionals", description: "Patient appointment reminders, record management, and compliance workflows" },
    { icon: "💼", title: "Freelancers", description: "Client communication, project tracking, and automated billing" },
    { icon: "🏭", title: "Manufacturing", description: "Quality control checklists, supply chain alerts, and maintenance schedules" },
    { icon: "🏪", title: "Retail", description: "Inventory alerts, sales reporting, and customer loyalty programs" },
  ];

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 -z-10" />
      
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🌍</span>
            <span>Available in 40 Languages</span>
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Automation for Everyone
            </span>
          </h1>
          <p className="text-2xl text-neutral-600 max-w-3xl mx-auto mb-4">
            No matter where you are or what language you speak, powerful automation is within reach.
          </p>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-8">
            Levqor works in your language, supports your timezone, and understands your business context.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signin" className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-lg shadow-lg">
              Start Free Trial
            </Link>
            <Link href="/workflows/library" className="px-8 py-4 border-2 border-neutral-800 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-800 hover:text-white transition-all text-lg">
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-8">
            <h2 className="text-3xl font-bold mb-4">Full Tier-1 Language Support</h2>
            <p className="text-lg opacity-90">
              Complete UI translations, AI support, and documentation in 9 major languages
            </p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {languages.map((lang, index) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className={`font-bold text-neutral-900 ${lang.rtl ? 'text-right' : ''}`}>
                      {lang.name}
                    </div>
                    <div className="text-sm text-primary-600 font-medium">{lang.tier}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Additional Language Support</h3>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-neutral-700 mb-2">Tier 2 Languages (Core UI + Docs):</div>
                <div className="flex flex-wrap gap-2">
                  {tier2Languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-white border border-neutral-300 rounded-full text-sm text-neutral-700">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-neutral-700 mb-2">Tier 3 Languages (Machine Translation + AI):</div>
                <div className="flex flex-wrap gap-2">
                  {tier3Languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-white border border-neutral-300 rounded-full text-sm text-neutral-600">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-neutral-900 mb-4 text-center">
          Built for Every Industry
        </h2>
        <p className="text-xl text-neutral-600 text-center mb-12 max-w-3xl mx-auto">
          Whether you're running a corner shop in Mumbai or a tech startup in Berlin, 
          Levqor adapts to your needs.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="bg-white rounded-xl p-6 border border-neutral-200 shadow hover:shadow-lg transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{useCase.title}</h3>
              <p className="text-neutral-600 leading-relaxed">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-200">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Global by Default</h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-500">✓</span>
                <span>Automatic timezone detection and conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">✓</span>
                <span>Currency formatting for 180+ countries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">✓</span>
                <span>Date/time localization for every region</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">✓</span>
                <span>Regional compliance (GDPR, CCPA, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl p-8 border border-secondary-200">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">AI That Speaks Your Language</h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">✓</span>
                <span>Natural language workflow builder in 40 languages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">✓</span>
                <span>Context-aware help and debugging assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">✓</span>
                <span>Multilingual error messages and documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">✓</span>
                <span>Localized templates and best practices</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Note */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-neutral-200">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            One Global Price
          </h2>
          <p className="text-xl text-neutral-600 mb-6">
            No regional pricing tricks. Everyone pays the same fair price, 
            converted to your local currency.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm text-neutral-600 mb-8">
            <span className="px-4 py-2 bg-neutral-100 rounded-lg">£9/month = €10.50 = $11.50</span>
            <span className="px-4 py-2 bg-neutral-100 rounded-lg">£29/month = €34 = $37</span>
            <span className="px-4 py-2 bg-neutral-100 rounded-lg">£59/month = €69 = $75</span>
            <span className="px-4 py-2 bg-neutral-100 rounded-lg">£149/month = €174 = $190</span>
          </div>
          <p className="text-sm text-neutral-500 mb-6">
            Approximate conversions. Final price in your currency shown at checkout.
          </p>
          <Link href="/pricing" className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all">
            View Full Pricing →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users automating work in their own language.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signin" className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all shadow-lg">
              Start Free Trial
            </Link>
            <Link href="/global-support" className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-xl font-semibold hover:bg-primary-800 transition-all">
              Learn About Global Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
