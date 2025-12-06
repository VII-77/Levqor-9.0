import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const IS_PRODUCTION = NODE_ENV === "production";
const IS_LEVQOR_DOMAIN = NEXTAUTH_URL?.includes("levqor.ai");

export async function GET(req: NextRequest) {
  const session = await auth();
  
  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
    cookieName: IS_PRODUCTION && IS_LEVQOR_DOMAIN
      ? "__Secure-next-auth.session-token"
      : undefined,
  });

  const cookies = req.cookies.getAll();
  
  const productionCookie = req.cookies.get("__Secure-next-auth.session-token");
  const devCookie = req.cookies.get("authjs.session-token") ?? 
    req.cookies.get("next-auth.session-token");
  const sessionCookie = productionCookie ?? devCookie;

  return NextResponse.json({
    ok: true,
    host: req.headers.get("host"),
    cookieNames: cookies.map((c) => c.name),
    hasProductionCookie: !!productionCookie,
    hasDevCookie: !!devCookie,
    hasSessionCookie: !!sessionCookie,
    hasSession: !!session,
    sessionUser: session?.user ?? null,
    hasToken: !!token,
    tokenSub: token?.sub ?? null,
    tokenEmail: token?.email ?? null,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV,
      IS_PRODUCTION,
      IS_LEVQOR_DOMAIN,
      NEXTAUTH_URL: NEXTAUTH_URL ? "set" : "missing",
      NEXTAUTH_SECRET: NEXTAUTH_SECRET ? "set" : "missing",
    },
  });
}
