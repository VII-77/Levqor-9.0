import { auth } from "@/auth"
import { NextResponse } from "next/server"
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

const CANONICAL_HOST = 'levqor.ai'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

// Paths that should bypass i18n middleware entirely (no locale prefix)
const bypassI18nPaths = ['/status', '/robots.txt', '/sitemap.xml']

export default auth((req) => {
  const url = req.nextUrl.clone()
  const pathname = url.pathname
  
  // Bypass middleware for Next.js internal data requests (critical for client-side navigation)
  // Without this, /_next/data/*/status.json gets rewritten by i18n and causes 404
  if (pathname.startsWith('/_next/data/')) {
    return NextResponse.next()
  }
  
  // Canonical domain redirect: www → naked domain
  if (url.hostname === 'www.levqor.ai') {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  const isAuthenticated = !!req.auth

  // Bypass i18n middleware for specific paths (serve directly without locale prefix)
  if (bypassI18nPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // Strip locale prefix for auth check to support localized protected routes
  // Matches: /en/dashboard, /de/dashboard, /fr/dashboard, /es/dashboard
  const pathWithoutLocale = pathname.replace(/^\/(en|de|fr|es)(\/|$)/, '$2')

  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    pathWithoutLocale.startsWith(path)
  )

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Apply i18n middleware for all requests
  return intlMiddleware(req)
})

export const config = {
  // Exclude API routes, Next.js internals, and static assets from middleware
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'],
}
