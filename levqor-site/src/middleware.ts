import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const CANONICAL_HOST = 'levqor.ai'

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  if (url.hostname === 'www.levqor.ai') {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] || ''
  const hasLocalePrefix = routing.locales.includes(firstSegment as typeof routing.locales[number])
  const pathWithoutLocale = hasLocalePrefix 
    ? '/' + pathSegments.slice(1).join('/') || '/'
    : pathname

  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    pathWithoutLocale === path || pathWithoutLocale.startsWith(path + '/')
  )

  if (isProtectedPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const signinPath = hasLocalePrefix ? `/${firstSegment}/signin` : '/signin'
      return NextResponse.redirect(new URL(signinPath, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
