import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "https://www.levqor.ai";

/**
 * Routes that require the user to be authenticated.
 * We treat any locale prefix (/en, /de, /ar, etc.) as the first segment,
 * and then check the second segment against this list.
 */
const PROTECTED_SEGMENTS = new Set([
  "dashboard",
  "billing",
  "revenue",
  "builder",
  "templates",
  "onboarding",
  "trial",
  "admin",
]);

const PUBLIC_PATHS = [
  "/",
  "/signin",
  "/signup",
  "/api/auth",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  return false;
}

function getLocaleAndSegment(pathname: string): { locale: string | null; segment: string | null } {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { locale: null, segment: null };
  if (parts.length === 1) return { locale: parts[0], segment: null };
  return { locale: parts[0], segment: parts[1] ?? null };
}

/**
 * Auth-aware middleware. Auth.js injects `req.auth` for us.
 * We NEVER call getToken() manually anymore.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const { locale, segment } = getLocaleAndSegment(pathname);

  const isProtected =
    !!segment &&
    PROTECTED_SEGMENTS.has(segment);

  if (isProtected && !req.auth) {
    const callbackUrl = encodeURIComponent(pathname);
    const signInUrl = new URL(`/signin?callbackUrl=${callbackUrl}`, NEXTAUTH_URL);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
