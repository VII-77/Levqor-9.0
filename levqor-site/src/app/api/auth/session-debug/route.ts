import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "unknown";
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = req.cookies.getAll();
    const cookieNames = cookies.map((c) => c.name);

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    let session = null;
    try {
      session = await auth();
    } catch (sessionErr) {
      console.error("[session-debug] auth() error:", sessionErr);
    }

    const hasSecureCookie = cookieNames.some((n) => n.includes("Secure"));
    const hasSessionCookie = cookieNames.some(
      (n) => n.includes("session-token") || n.includes("authjs")
    );

    return NextResponse.json({
      ok: true,
      host,
      cookieNames,
      hasSecureCookie,
      hasSessionCookie,
      hasToken: !!token,
      tokenSub: token?.sub ? `${String(token.sub).substring(0, 8)}...` : null,
      hasSession: !!session,
      sessionUser: session?.user
        ? { email: session.user.email ?? null }
        : null,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "not set",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "not set",
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[session-debug] Error:", errMessage);
    return NextResponse.json(
      {
        ok: false,
        error: errMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
