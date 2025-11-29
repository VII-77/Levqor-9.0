import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || null;

  // Collect cookie names without exposing values
  const rawCookies = (req as any).cookies?.getAll
    ? (req as any).cookies.getAll()
    : [];
  const cookieNames = Array.isArray(rawCookies)
    ? rawCookies.map((c: any) => c?.name).filter(Boolean)
    : [];

  return NextResponse.json(
    {
      ok: true,
      message: "Auth debug endpoint is alive.",
      host,
      cookieNames,
      timestamp: new Date().toISOString(),
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      },
    },
    { status: 200 }
  );
}
