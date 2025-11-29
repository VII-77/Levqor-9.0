import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "unknown";
  const cookies = req.cookies;
  
  const authCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token", 
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];
  
  const foundCookies: Record<string, { present: boolean; length: number }> = {};
  for (const name of authCookieNames) {
    const cookie = cookies.get(name);
    if (cookie) {
      foundCookies[name] = {
        present: true,
        length: cookie.value.length,
      };
    }
  }
  
  let tokenResult: { has_token: boolean; error?: string; token_sub?: string } = { has_token: false };
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    tokenResult = {
      has_token: !!token,
      token_sub: token?.sub ? `${token.sub.substring(0, 8)}...` : undefined,
    };
  } catch (err) {
    tokenResult = { 
      has_token: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }

  let sessionResult: { has_session: boolean; error?: string; user_email?: string } = { has_session: false };
  try {
    const session = await auth();
    sessionResult = {
      has_session: !!session?.user,
      user_email: session?.user?.email 
        ? `${session.user.email.substring(0, 5)}...@...` 
        : undefined,
    };
  } catch (err) {
    sessionResult = { 
      has_session: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }

  return NextResponse.json({
    safe_mode: true,
    host,
    nextauth_url: process.env.NEXTAUTH_URL || "NOT_SET",
    has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    secret_length: process.env.NEXTAUTH_SECRET?.length || 0,
    has_any_auth_cookie: Object.keys(foundCookies).length > 0,
    found_cookies: foundCookies,
    all_cookie_names: Array.from(cookies.getAll().map(c => c.name)),
    token: tokenResult,
    session: sessionResult,
    diagnosis: getDiagnosis(foundCookies, tokenResult, sessionResult),
  });
}

function getDiagnosis(
  cookies: Record<string, unknown>,
  token: { has_token: boolean; error?: string },
  session: { has_session: boolean; error?: string }
): string {
  if (Object.keys(cookies).length === 0) {
    return "NO_COOKIES: No auth cookies found. OAuth callback may not have set cookies, or cookies are being blocked (domain mismatch, SameSite, etc).";
  }
  if (!token.has_token && token.error) {
    return `TOKEN_ERROR: ${token.error}. Secret mismatch or cookie corruption.`;
  }
  if (!token.has_token) {
    return "TOKEN_DECODE_FAILED: Cookies present but getToken() returned null. Likely secret mismatch between auth.ts and middleware.";
  }
  if (!session.has_session && session.error) {
    return `SESSION_ERROR: ${session.error}. auth() failed even though getToken() worked.`;
  }
  if (!session.has_session) {
    return "SESSION_MISSING: Token exists but session is null. Check session callback in auth.ts.";
  }
  return "OK: Cookies, token, and session all valid. Auth should be working.";
}
