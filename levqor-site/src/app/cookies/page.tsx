import Link from "next/link";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Levqor',
  description: 'Learn about how Levqor uses cookies and similar technologies, and how you can manage your cookie preferences.',
  robots: 'index, follow'
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 text-lg">
            How we use cookies and similar technologies
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Last updated: November 24, 2025
          </p>
        </div>

        <section className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">🍪 What are Cookies?</h3>
          <p className="text-amber-800 leading-relaxed">
            Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, keep you logged in, and understand how you use the site. We use cookies responsibly and give you control over non-essential cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
          
          {/* Strictly Necessary */}
          <div className="border-l-4 border-red-500 pl-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                1. Strictly Necessary Cookies
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">REQUIRED</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies are essential for the website to function. They cannot be disabled in our systems.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Examples:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <div>
                    <strong>Authentication cookies</strong> - Keep you logged in to your account
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">next-auth.session-token</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <div>
                    <strong>Security cookies</strong> - Prevent fraud and protect your session
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">__Secure-csrf-token</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <div>
                    <strong>Load balancing cookies</strong> - Ensure you're connected to the right server
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">lb-session</code></div>
                  </div>
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">
                Duration: Session cookies (deleted when you close your browser) or persistent (up to 30 days)
              </div>
            </div>
            <p className="text-sm text-red-600 mt-3">
              ⚠️ These cookies cannot be disabled. Without them, core features like login and security won't work.
            </p>
          </div>

          {/* Performance/Analytics */}
          <div className="border-l-4 border-blue-500 pl-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                2. Performance & Analytics Cookies
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">OPTIONAL</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies help us understand how visitors use our website, allowing us to improve performance and user experience.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Examples:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <strong>Page view tracking</strong> - Count visits and measure traffic sources
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">_analytics_session</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <strong>Error monitoring</strong> - Detect and fix technical issues
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">_sentry_tracking</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <strong>Performance metrics</strong> - Measure page load times and optimize speed
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">_performance_id</code></div>
                  </div>
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">
                Duration: Up to 2 years
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-3">
              ℹ️ You can opt out of these cookies via the cookie banner or your browser settings.
            </p>
          </div>

          {/* Functional */}
          <div className="border-l-4 border-green-500 pl-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                3. Functional Cookies
              </h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">OPTIONAL</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies enable enhanced functionality and personalization, such as remembering your preferences.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Examples:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <div>
                    <strong>Language preference</strong> - Remember your preferred language
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">NEXT_LOCALE</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <div>
                    <strong>Theme settings</strong> - Remember light/dark mode preference
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">theme-preference</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <div>
                    <strong>Cookie consent</strong> - Remember your cookie preferences
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">levqor-cookie-consent-v1</code></div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <div>
                    <strong>Trial lifecycle</strong> - Track your trial day for personalized messages
                    <div className="text-xs text-gray-500 mt-1">Cookie name: <code className="bg-gray-200 px-1 rounded">trial-lifecycle-day</code></div>
                  </div>
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">
                Duration: Up to 1 year
              </div>
            </div>
          </div>

          {/* Marketing/Targeting */}
          <div className="border-l-4 border-purple-500 pl-6 py-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                4. Marketing & Targeting Cookies
              </h3>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">OPTIONAL</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies track your activity across websites to deliver relevant advertising and measure campaign effectiveness.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Examples:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <div>
                    <strong>Ad retargeting</strong> - Show relevant ads based on your interests
                    <div className="text-xs text-gray-500 mt-1">Cookie provider: Google Ads, Facebook Pixel</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <div>
                    <strong>Conversion tracking</strong> - Measure advertising campaign success
                    <div className="text-xs text-gray-500 mt-1">Cookie provider: Google Analytics, LinkedIn Insight</div>
                  </div>
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">
                Duration: Up to 2 years (varies by third-party provider)
              </div>
            </div>
            <p className="text-sm text-purple-600 mt-3">
              ℹ️ Currently, we do not use marketing cookies. This section is reserved for future use.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Managing Your Cookie Preferences</h2>
          <p className="text-gray-700 leading-relaxed">
            You have several options to control cookies:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🍪 Cookie Banner</h3>
              <p className="text-sm text-gray-700 mb-3">
                When you first visit our site, you'll see a cookie consent banner. You can accept all cookies or choose "Manage later" to use only essential cookies.
              </p>
              <p className="text-xs text-gray-500">
                Clear your browser's localStorage to see the banner again.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ Account Settings</h3>
              <p className="text-sm text-gray-700 mb-3">
                Logged-in users can manage cookie and analytics preferences in their <Link href="/dashboard/settings" className="text-blue-600 hover:underline">account settings</Link>.
              </p>
              <p className="text-xs text-gray-500">
                Granular control over functional and analytics cookies.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-2">🌐 Browser Settings</h3>
              <p className="text-sm text-gray-700 mb-3">
                All modern browsers allow you to control cookies. You can block all cookies, accept only first-party cookies, or delete existing cookies.
              </p>
              <p className="text-xs text-gray-500">
                Note: Blocking essential cookies will prevent login.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2">🚫 Do Not Track</h3>
              <p className="text-sm text-gray-700 mb-3">
                We respect the "Do Not Track" browser signal. When enabled, we disable non-essential analytics and tracking.
              </p>
              <p className="text-xs text-gray-500">
                Enable in your browser privacy settings.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Browser-Specific Cookie Management</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here's how to manage cookies in popular browsers:
          </p>
          
          <div className="space-y-3">
            <details className="border rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50">
                Google Chrome
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-700">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the three dots menu → Settings</li>
                  <li>Privacy and security → Cookies and other site data</li>
                  <li>Choose your preference: Block all, Allow all, or Block third-party</li>
                  <li>Click "See all cookies and site data" to manage individual cookies</li>
                </ol>
              </div>
            </details>

            <details className="border rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50">
                Mozilla Firefox
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-700">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the menu button → Settings</li>
                  <li>Privacy & Security panel</li>
                  <li>Under "Cookies and Site Data", click "Manage Data"</li>
                  <li>Select cookies to remove or "Remove All"</li>
                </ol>
              </div>
            </details>

            <details className="border rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50">
                Safari
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-700">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Safari menu → Preferences</li>
                  <li>Privacy tab</li>
                  <li>Manage Website Data to view and remove cookies</li>
                  <li>Enable "Block all cookies" or customize tracking prevention</li>
                </ol>
              </div>
            </details>

            <details className="border rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50">
                Microsoft Edge
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-700">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the three dots menu → Settings</li>
                  <li>Cookies and site permissions → Cookies and site data</li>
                  <li>Choose blocking level and manage exceptions</li>
                  <li>Click "See all cookies and site data" for granular control</li>
                </ol>
              </div>
            </details>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Some cookies are set by third-party services we use:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">Stripe (Payment Processing)</h4>
              <p className="text-sm text-gray-600">Used for secure payment processing. Essential for billing.</p>
              <p className="text-xs text-gray-500 mt-1">Privacy Policy: <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Vercel (Hosting)</h4>
              <p className="text-sm text-gray-600">Infrastructure provider for our frontend application.</p>
              <p className="text-xs text-gray-500 mt-1">Privacy Policy: <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Cloudflare (CDN & Security)</h4>
              <p className="text-sm text-gray-600">Provides DDoS protection and content delivery.</p>
              <p className="text-xs text-gray-500 mt-1">Privacy Policy: <a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a></p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Updates to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. We'll notify you of significant changes by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Updating the "Last updated" date at the top of this page</li>
            <li>Displaying a notification on our website for major changes</li>
            <li>Sending an email to registered users for significant policy updates</li>
          </ul>
        </section>

        <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Related Policies</h3>
          <p className="text-blue-800 text-sm">
            This Cookie Policy supplements our <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link>. For information about how we handle your personal data beyond cookies, please review our full Privacy Policy and <Link href="/data-rights" className="text-blue-600 hover:underline font-semibold">Data Rights</Link> page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Questions About Cookies?</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about our use of cookies, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>Email:</strong> privacy@levqor.ai</p>
            <p className="text-gray-700 mt-2"><strong>Support:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link></p>
            <p className="text-gray-700 mt-2"><strong>Data Protection Officer:</strong> dpo@levqor.ai</p>
          </div>
        </section>

        <div className="border-t pt-8 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/privacy" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1">Complete privacy practices</p>
            </Link>
            <Link href="/data-rights" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Data Rights</h4>
              <p className="text-sm text-gray-600 mt-1">Your data privacy rights</p>
            </Link>
            <Link href="/gdpr" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">GDPR Compliance</h4>
              <p className="text-sm text-gray-600 mt-1">Our GDPR commitment</p>
            </Link>
            <Link href="/dpa" className="block p-4 border rounded-lg hover:border-blue-600 hover:shadow-md transition-all">
              <h4 className="font-semibold text-gray-900">Data Processing Addendum</h4>
              <p className="text-sm text-gray-600 mt-1">Enterprise DPA details</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
