import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  SUBSCRIPTION_PLANS,
  DFY_PACKS,
  ADDONS,
  type SubscriptionTier,
  type BillingInterval,
  type DFYPackId,
  type AddonId,
} from "@/config/pricing";

export const dynamic = "force-dynamic";

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function stripeClient() {
  const secret = getEnv("STRIPE_SECRET_KEY");
  if (!secret) throw new Error("missing STRIPE_SECRET_KEY");
  return new Stripe(secret, { apiVersion: "2024-06-20" as any });
}

function getSiteUrl(): string {
  return getEnv("SITE_URL") || "https://www.levqor.ai";
}

export async function GET() {
  const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_STARTER",
    "STRIPE_PRICE_STARTER_YEAR",
    "STRIPE_PRICE_LAUNCH",
    "STRIPE_PRICE_LAUNCH_YEAR",
  ];
  const missing = requiredEnvVars.filter(k => !getEnv(k));
  return NextResponse.json({ ok: missing.length === 0, missing });
}

type RequestBody = {
  purchase_type?: "subscription" | "dfy" | "addons";
  tier?: string;
  billing_interval?: "month" | "year";
  plan?: string;
  term?: "monthly" | "yearly";
  dfy_pack?: string;
  addons?: string | string[];
};

function normalizeInterval(interval?: string, term?: string): BillingInterval {
  if (interval === "year" || term === "yearly") return "year";
  return "month";
}

function isValidTier(tier: string): tier is SubscriptionTier {
  return tier in SUBSCRIPTION_PLANS;
}

function isValidDFYPack(pack: string): pack is DFYPackId {
  return pack in DFY_PACKS;
}

function isValidAddon(addon: string): addon is AddonId {
  return addon in ADDONS;
}

export async function POST(req: Request) {
  try {
    const secret = getEnv("STRIPE_SECRET_KEY");
    if (!secret) {
      return NextResponse.json({ ok: false, error: "missing_env:SECRET" }, { status: 500 });
    }

    const body: RequestBody = await req.json();
    const purchaseType = body.purchase_type || "subscription";

    if (purchaseType === "subscription") {
      const tier = (body.tier || body.plan || "starter").toLowerCase();
      const interval = normalizeInterval(body.billing_interval, body.term);
      
      if (!isValidTier(tier)) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_tier: ${tier}`,
          available: Object.keys(SUBSCRIPTION_PLANS)
        }, { status: 400 });
      }

      const plan = SUBSCRIPTION_PLANS[tier];
      const envKey = plan.stripePriceEnvKeys[interval];
      const priceId = getEnv(envKey);
      
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `missing_env: ${envKey}`,
        }, { status: 500 });
      }

      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        subscription_data: {
          trial_period_days: 7,
        },
        success_url: `${getSiteUrl()}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getSiteUrl()}/pricing?canceled=1`,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    if (purchaseType === "dfy") {
      const pack = body.dfy_pack || "";
      
      if (!isValidDFYPack(pack)) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_dfy_pack: ${pack}`,
          available: Object.keys(DFY_PACKS)
        }, { status: 400 });
      }

      const dfyPack = DFY_PACKS[pack];
      const priceId = getEnv(dfyPack.stripePriceEnvKey);
      
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `missing_env: ${dfyPack.stripePriceEnvKey}`,
        }, { status: 500 });
      }

      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${getSiteUrl()}/welcome?session_id={CHECKOUT_SESSION_ID}&type=dfy`,
        cancel_url: `${getSiteUrl()}/pricing?canceled=1`,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    if (purchaseType === "addons") {
      let addon = typeof body.addons === "string" ? body.addons : body.addons?.[0] || "";
      
      const addonAliases: Record<string, AddonId> = {
        "PRIORITY_SUPPORT": "addon_priority_support",
        "SLA_99_9": "addon_sla_99",
        "WHITE_LABEL": "addon_white_label",
      };
      
      if (addon in addonAliases) {
        addon = addonAliases[addon];
      }
      
      if (!isValidAddon(addon)) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_addon: ${addon}`,
          available: Object.keys(ADDONS)
        }, { status: 400 });
      }

      const addonConfig = ADDONS[addon];
      const priceId = getEnv(addonConfig.stripePriceEnvKey);
      
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `missing_env: ${addonConfig.stripePriceEnvKey}`,
        }, { status: 500 });
      }

      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${getSiteUrl()}/welcome?session_id={CHECKOUT_SESSION_ID}&type=addon`,
        cancel_url: `${getSiteUrl()}/pricing?canceled=1`,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    return NextResponse.json({ 
      ok: false, 
      error: `unknown_purchase_type: ${purchaseType}` 
    }, { status: 400 });

  } catch (err: any) {
    console.error("checkout_error", {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      param: err?.param,
      statusCode: err?.statusCode,
      stack: err?.stack?.substring(0, 500)
    });
    return NextResponse.json({ 
      ok: false, 
      error: `${err?.type || 'unknown'}: ${err?.message || err}`,
      debug: { code: err?.code, param: err?.param }
    }, { status: 500 });
  }
}
