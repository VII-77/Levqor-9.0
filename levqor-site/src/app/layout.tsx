import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Providers } from '@/components/providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'

// Force cache clear - deployment timestamp: 2025-11-11T12:32

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL('https://levqor.ai'),
  title: {
    default: 'Levqor – Automate work. Ship faster. Pay only for results.',
    template: '%s | Levqor'
  },
  description: 'Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.',
  keywords: ['automation', 'workflow', 'no-code', 'zapier alternative', 'make.com alternative', 'ai automation', 'self-healing workflows'],
  authors: [{ name: 'Levqor Technologies' }],
  creator: 'Levqor',
  openGraph: {
    title: 'Levqor – Automate work. Ship faster. Pay only for results.',
    description: 'Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.',
    url: 'https://levqor.ai',
    siteName: 'Levqor',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Levqor - AI-powered automation platform',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levqor – Automate work. Ship faster. Pay only for results.',
    description: 'Levqor is the AI-powered automation layer for agencies and teams. Automate workflows, ship client work faster, and only pay for successful results.',
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
  alternates: {
    canonical: 'https://levqor.ai',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased tracking-tight">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />

          <Providers>
            {children}
          </Providers>

          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
