import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { getToken } from "next-auth/jwt";
import { routing } from '@/i18n/routing';

const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "https://www.levqor.ai";
const NODE_ENV = process.env.NODE_ENV;
const IS_PRODUCTION = NODE_ENV === "production";

const locales = ['en', 'es', 'ar', 'hi', 'zh-Hans', 'de', 'fr', 'it', 'pt'];

const intlMiddleware = createIntlMiddleware(routing);

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

function stripLocale(pathname: string): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`);
  return pathname.replace(localePattern, '/');
}

function getPathSegment(pathname: string): string | null {
  const cleanPath = stripLocale(pathname);
  const parts = cleanPath.split("/").filter(Boolean);
  return parts[0] ?? null;
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const segment = getPathSegment(pathname);
  const isProtected = !!segment && PROTECTED_SEGMENTS.has(segment);

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: IS_PRODUCTION && NEXTAUTH_URL?.includes("levqor.ai")
        ? "__Secure-next-auth.session-token"
        : undefined,
    });

    if (NODE_ENV !== "production") {
      console.log("[MIDDLEWARE_AUTH_CHECK]", JSON.stringify({
        pathname,
        segment,
        hasToken: !!token,
        tokenEmail: token?.email ?? null,
        isProduction: IS_PRODUCTION,
        timestamp: new Date().toISOString(),
      }));
    }

    if (!token) {
      const callbackUrl = encodeURIComponent(pathname);
      const signInUrl = new URL(`/signin?callbackUrl=${callbackUrl}`, NEXTAUTH_URL);
      if (NODE_ENV !== "production") {
        console.log("[MIDDLEWARE_REDIRECT_SIGNIN]", JSON.stringify({
          pathname,
          signInUrl: signInUrl.toString(),
          timestamp: new Date().toISOString(),
        }));
      }
      return NextResponse.redirect(signInUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
