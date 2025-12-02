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
