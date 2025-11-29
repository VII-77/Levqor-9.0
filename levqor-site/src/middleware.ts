import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  const pathSegments = pathname.split("/").filter(Boolean)
  const firstSegment = pathSegments[0] || ""
  const hasLocalePrefix = routing.locales.includes(
    firstSegment as (typeof routing.locales)[number]
  )
  const pathWithoutLocale = hasLocalePrefix
    ? "/" + pathSegments.slice(1).join("/")
    : pathname

  const protectedPaths = ["/dashboard", "/admin"]
  const isProtectedPath = protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  )

  if (isProtectedPath) {
    const token = await getToken({ req })
    
    if (!token) {
      const host = req.nextUrl.host
      const cookieHeader = req.headers.get("cookie") || "none"
      const hasCookie = cookieHeader.includes("authjs.session-token") || 
                        cookieHeader.includes("next-auth.session-token")
      
      console.log(`[AUTH-DEBUG] NO TOKEN for ${pathWithoutLocale} host=${host} hasCookie=${hasCookie}`)
      
      if (pathWithoutLocale.startsWith("/admin")) {
        const signinPath = hasLocalePrefix ? `/${firstSegment}/signin` : "/signin"
        return NextResponse.redirect(new URL(signinPath, req.url))
      }
    } else {
      console.log(`[AUTH-DEBUG] TOKEN OK for ${pathWithoutLocale} sub=${token.sub?.substring(0, 8)}...`)
    }
  }
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
