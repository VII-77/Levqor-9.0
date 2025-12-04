import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from '@/components/providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ConciergeButton from '@/components/ConciergeButton'
import './globals.css'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.levqor.ai'),
  title: {
    default: 'Levqor – Automate work. Ship faster. Pay only for results.',
    template: '%s | Levqor'
  },
  description: 'Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.',
  keywords: ['automation', 'workflows', 'AI', 'agencies', 'productivity', 'SaaS', 'no-code', 'business automation'],
  authors: [{ name: 'Levqor' }],
  creator: 'Levqor',
  publisher: 'Levqor',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.levqor.ai',
    siteName: 'Levqor',
    title: 'Levqor – Automate work. Ship faster. Pay only for results.',
    description: 'Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Levqor - AI-Powered Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levqor – Automate work. Ship faster. Pay only for results.',
    description: 'AI-powered automation layer for agencies and teams. Automate workflows and only pay for successful results.',
    images: ['/og-image.png'],
    creator: '@levqor',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased tracking-tight">
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <Header />
          <Providers>
            {children}
          </Providers>
          <Footer />
          <CookieBanner />
          <ConciergeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
