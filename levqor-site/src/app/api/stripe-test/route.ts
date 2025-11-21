import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  return NextResponse.json({
    has_key: key.length > 0,
    key_length: key.length,
    starts_with_sk: key.startsWith("sk_"),
    first_10: key.substring(0, 10),
    env_count: Object.keys(process.env).filter(k => k.startsWith("STRIPE_")).length
  });
}
