import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

export async function GET(req: NextRequest) {
  const session = await auth();
  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });

  const cookies = req.cookies.getAll();
  const sessionCookie =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");

  return NextResponse.json({
    ok: true,
    host: req.headers.get("host"),
    cookieNames: cookies.map((c) => c.name),
    hasSecureCookie: !!sessionCookie,
    hasSessionCookie: !!sessionCookie,
    hasSession: !!session,
    sessionUser: session?.user ?? null,
    hasToken: !!token,
    tokenSub: token?.sub ?? null,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV,
      NEXTAUTH_URL: NEXTAUTH_URL ? "set" : "missing",
      NEXTAUTH_SECRET: NEXTAUTH_SECRET ? "set" : "missing",
    },
  });
}
