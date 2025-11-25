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

export default auth((req) => {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // 1) Hard bypass for root, status, API, and all Next internals / static assets
  // This prevents catch-all slug matching and locale rewrite loops
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/status")
  ) {
    return NextResponse.next()
  }

  // 2) Canonical domain redirect: www → naked domain
  if (url.hostname === 'www.levqor.ai') {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  // 3) Auth check for protected routes
  const isAuthenticated = !!req.auth

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

  // 4) Apply i18n middleware only for content routes that need locale handling
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest|api).*)",
  ],
}
