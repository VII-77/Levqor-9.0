import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function readEnv() {
  return {
    SECRET: process.env.STRIPE_SECRET_KEY,
    SITE_URL: process.env.SITE_URL || "https://www.levqor.ai",
    STARTER_M: process.env.STRIPE_PRICE_STARTER,
    STARTER_Y: process.env.STRIPE_PRICE_STARTER_YEAR,
    LAUNCH_M:  process.env.STRIPE_PRICE_LAUNCH,
    LAUNCH_Y:  process.env.STRIPE_PRICE_LAUNCH_YEAR,
    GROWTH_M:  process.env.STRIPE_PRICE_GROWTH,
    GROWTH_Y:  process.env.STRIPE_PRICE_GROWTH_YEAR,
    AGENCY_M:  process.env.STRIPE_PRICE_AGENCY,
    AGENCY_Y:  process.env.STRIPE_PRICE_AGENCY_YEAR,
    DFY_STARTER:      process.env.STRIPE_PRICE_DFY_STARTER,
    DFY_PROFESSIONAL: process.env.STRIPE_PRICE_DFY_PROFESSIONAL,
    DFY_ENTERPRISE:   process.env.STRIPE_PRICE_DFY_ENTERPRISE,
    ADDON_PRIORITY_SUPPORT: process.env.STRIPE_PRICE_ADDON_PRIORITY_SUPPORT,
    ADDON_SLA_99:           process.env.STRIPE_PRICE_ADDON_SLA_99,
    ADDON_WHITE_LABEL:      process.env.STRIPE_PRICE_ADDON_WHITE_LABEL,
    ADDON_EXTRA_WORKFLOWS:  process.env.STRIPE_PRICE_ADDON_EXTRA_WORKFLOWS,
  };
}

function stripeClient(secret?: string) {
  if (!secret) throw new Error("missing STRIPE_SECRET_KEY");
  return new Stripe(secret, { apiVersion: "2024-06-20" as any });
}

export async function GET() {
  const env = readEnv();
  const required = ["SECRET", "STARTER_M", "STARTER_Y", "LAUNCH_M", "LAUNCH_Y"];
  const missing = required.filter(k => !env[k as keyof typeof env]);
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

export async function POST(req: Request) {
  try {
    const env = readEnv();
    if (!env.SECRET) {
      return NextResponse.json({ ok: false, error: "missing_env:SECRET" }, { status: 500 });
    }

    const body: RequestBody = await req.json();
    console.log("CHECKOUT-DEBUG", JSON.stringify(body, null, 2));

    const purchaseType = body.purchase_type || "subscription";

    if (purchaseType === "subscription") {
      const tier = body.tier || body.plan || "starter";
      const interval = body.billing_interval || (body.term === "yearly" ? "year" : "month");
      
      const priceMap: Record<string, string | undefined> = {
        "starter:month":  env.STARTER_M,
        "starter:year":   env.STARTER_Y,
        "launch:month":   env.LAUNCH_M,
        "launch:year":    env.LAUNCH_Y,
        "growth:month":   env.GROWTH_M,
        "growth:year":    env.GROWTH_Y,
        "agency:month":   env.AGENCY_M,
        "agency:year":    env.AGENCY_Y,
        "starter:monthly": env.STARTER_M,
        "starter:yearly":  env.STARTER_Y,
        "launch:monthly":  env.LAUNCH_M,
        "launch:yearly":   env.LAUNCH_Y,
        "growth:monthly":  env.GROWTH_M,
        "growth:yearly":   env.GROWTH_Y,
        "agency:monthly":  env.AGENCY_M,
        "agency:yearly":   env.AGENCY_Y,
      };

      const priceId = priceMap[`${tier}:${interval}`];
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_plan: ${tier}:${interval}`,
          available: Object.keys(priceMap).filter(k => priceMap[k])
        }, { status: 400 });
      }

      const stripe = stripeClient(env.SECRET);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        subscription_data: {
          trial_period_days: 7,
        },
        success_url: `${env.SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.SITE_URL}/pricing?canceled=1`,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    if (purchaseType === "dfy") {
      const pack = body.dfy_pack || "";
      const dfyMap: Record<string, string | undefined> = {
        "dfy_starter":      env.DFY_STARTER,
        "dfy_professional": env.DFY_PROFESSIONAL,
        "dfy_enterprise":   env.DFY_ENTERPRISE,
      };

      const priceId = dfyMap[pack];
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_dfy_pack: ${pack}`,
          available: Object.keys(dfyMap)
        }, { status: 400 });
      }

      const stripe = stripeClient(env.SECRET);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${env.SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}&type=dfy`,
        cancel_url: `${env.SITE_URL}/pricing?canceled=1`,
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    if (purchaseType === "addons") {
      const addon = typeof body.addons === "string" ? body.addons : body.addons?.[0] || "";
      const addonMap: Record<string, string | undefined> = {
        "addon_priority_support": env.ADDON_PRIORITY_SUPPORT,
        "addon_sla_99":           env.ADDON_SLA_99,
        "addon_white_label":      env.ADDON_WHITE_LABEL,
        "addon_extra_workflows":  env.ADDON_EXTRA_WORKFLOWS,
        "PRIORITY_SUPPORT":       env.ADDON_PRIORITY_SUPPORT,
        "SLA_99_9":               env.ADDON_SLA_99,
        "WHITE_LABEL":            env.ADDON_WHITE_LABEL,
      };

      const priceId = addonMap[addon];
      if (!priceId) {
        return NextResponse.json({ 
          ok: false, 
          error: `invalid_addon: ${addon}`,
          available: Object.keys(addonMap)
        }, { status: 400 });
      }

      const stripe = stripeClient(env.SECRET);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${env.SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}&type=addon`,
        cancel_url: `${env.SITE_URL}/pricing?canceled=1`,
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
