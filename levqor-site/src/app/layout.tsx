import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import Link from 'next/link'
import './globals.css'

// Force cache clear - deployment timestamp: 2025-11-11T12:32

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL('https://levqor.ai'),
  title: {
    default: 'Levqor — Automate work. Ship faster. Pay only for results.',
    template: '%s | Levqor'
  },
  description: 'Levqor runs your workflows, monitors failures, and self-heals. Email, Sheets, Slack, CRM, and more. Enterprise-grade automation platform with 99.9% SLA.',
  keywords: ['automation', 'workflow', 'no-code', 'zapier alternative', 'make.com alternative', 'ai automation', 'self-healing workflows'],
  authors: [{ name: 'Levqor Technologies' }],
  creator: 'Levqor',
  openGraph: {
    title: 'Levqor — Automate work. Ship faster. Pay only for results.',
    description: 'Self-healing workflows that monitor failures and auto-recover. Connect Email, Sheets, Slack, CRM with no code.',
    url: 'https://levqor.ai',
    siteName: 'Levqor',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Levqor - Self-Healing Automation Engine',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levqor — Automate work. Ship faster.',
    description: 'Self-healing workflows with 99.9% SLA. Connect 50+ apps, no code required.',
    images: ['/og-image.png'],
    creator: '@levqor',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased tracking-tight">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-black hover:text-gray-700 transition">
                Levqor
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-700 hover:text-black font-medium transition">
                  Home
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-black font-medium transition">
                  Pricing
                </Link>
                <Link href="/docs" className="text-gray-700 hover:text-black font-medium transition">
                  Docs
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-black font-medium transition">
                  Contact
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/signin" className="text-gray-700 hover:text-black font-medium transition">
                  Sign in
                </Link>
                <Link href="/signin" className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  Start free trial
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <Providers>
          {children}
        </Providers>

        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              <div className="md:col-span-2">
                <h3 className="text-white text-2xl font-bold mb-4">Levqor</h3>
                <p className="text-sm mb-4 max-w-xs">
                  Automate work. Ship faster. Pay only for results. The self-driven automation engine for modern teams.
                </p>
                <div className="flex gap-4">
                  <a href="https://twitter.com/levqor" className="text-gray-400 hover:text-white transition" aria-label="Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="https://github.com/levqor" className="text-gray-400 hover:text-white transition" aria-label="GitHub">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link href="/docs" className="hover:text-white transition">Docs</Link></li>
                  <li><a href="https://api.levqor.ai/public/changelog" className="hover:text-white transition">Changelog</a></li>
                  <li><a href="https://api.levqor.ai/health" className="hover:text-white transition">Status</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><a href="https://api.levqor.ai/.well-known/security.txt" className="hover:text-white transition">Security</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-sm text-center">
              <p className="mb-2">&copy; {new Date().getFullYear()} Levqor Technologies Ltd. All rights reserved.</p>
              <p className="text-xs text-gray-500">Company Number: 12345678 • Registered in England and Wales</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
