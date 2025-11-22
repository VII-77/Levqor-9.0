import { auth } from "@/auth"
import { NextResponse } from "next/server"

const CANONICAL_HOST = 'levqor.ai'

export default auth((req) => {
  const url = req.nextUrl.clone()
  
  // Canonical domain redirect: www → naked domain
  if (url.hostname === 'www.levqor.ai') {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  const isAuthenticated = !!req.auth
  const pathname = url.pathname

  const protectedPaths = ['/dashboard', '/admin']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
