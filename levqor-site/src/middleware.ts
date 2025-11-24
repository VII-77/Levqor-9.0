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
  
  // Canonical domain redirect: www → naked domain
  if (url.hostname === 'www.levqor.ai') {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  const isAuthenticated = !!req.auth
  const pathname = url.pathname

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
