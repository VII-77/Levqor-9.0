import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const keys = [
    "STRIPE_SECRET_KEY","SITE_URL",
    "STRIPE_PRICE_STARTER","STRIPE_PRICE_STARTER_YEAR",
    "STRIPE_PRICE_PRO","STRIPE_PRICE_PRO_YEAR",
    "STRIPE_PRICE_BUSINESS","STRIPE_PRICE_BUSINESS_YEAR",
    "STRIPE_PRICE_ADDON_PRIORITY_SUPPORT",
    "STRIPE_PRICE_ADDON_SLA_99_9",
    "STRIPE_PRICE_ADDON_WHITE_LABEL"
  ];
  const present = keys.filter(k => process.env[k] && String(process.env[k]).trim() !== "");
  const missing = keys.filter(k => !present.includes(k));
  return NextResponse.json({ present, missing });
}
