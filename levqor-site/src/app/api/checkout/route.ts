import { NextResponse } from "next/server";
import Stripe from "stripe";

// force dynamic to avoid caching
export const dynamic = "force-dynamic";

function readEnv() {
  return {
    SECRET: process.env.STRIPE_SECRET_KEY,
    SITE_URL: process.env.SITE_URL || "",
    STARTER_M: process.env.STRIPE_PRICE_STARTER,
    STARTER_Y: process.env.STRIPE_PRICE_STARTER_YEAR,
    PRO_M:     process.env.STRIPE_PRICE_PRO,
    PRO_Y:     process.env.STRIPE_PRICE_PRO_YEAR,
    BIZ_M:     process.env.STRIPE_PRICE_BUSINESS,
    BIZ_Y:     process.env.STRIPE_PRICE_BUSINESS_YEAR,
    ADDON_SUPPORT: process.env.STRIPE_PRICE_ADDON_PRIORITY_SUPPORT,
    ADDON_SLA:     process.env.STRIPE_PRICE_ADDON_SLA_99_9,
    ADDON_WL:      process.env.STRIPE_PRICE_ADDON_WHITE_LABEL,
  };
}

function missingEnv(e: ReturnType<typeof readEnv>) {
  return Object.entries(e).filter(([_k,v]) => !v || String(v).trim()==="").map(([k])=>k);
}

function stripeClient(secret?: string) {
  if (!secret) throw new Error("missing STRIPE_SECRET_KEY");
  return new Stripe(secret, { apiVersion: "2024-06-20" as any });
}

export async function GET() {
  const env = readEnv();
  const missing = missingEnv(env);
  return NextResponse.json({ ok: missing.length===0, missing });
}

type Body = {
  plan: "starter"|"pro"|"business",
  term: "monthly"|"yearly",
  addons?: ("PRIORITY_SUPPORT"|"SLA_99_9"|"WHITE_LABEL")[]
};

export async function POST(req: Request) {
  try {
    const env = readEnv();
    const miss = missingEnv(env);
    if (miss.length) return NextResponse.json({ ok:false, error:`missing_env:${miss.join(",")}` }, { status:500 });

    const { plan, term, addons=[] } = await req.json() as Body;

    const coreMap: Record<string,string> = {
      "starter:monthly": String(env.STARTER_M),
      "starter:yearly":  String(env.STARTER_Y),
      "pro:monthly":     String(env.PRO_M),
      "pro:yearly":      String(env.PRO_Y),
      "business:monthly":String(env.BIZ_M),
      "business:yearly": String(env.BIZ_Y),
    };
    const core = coreMap[`${plan}:${term}`];
    if (!core) return NextResponse.json({ ok:false, error:"invalid_plan_term" }, { status:400 });

    const addonMap: Record<string,string> = {
      "PRIORITY_SUPPORT": String(env.ADDON_SUPPORT || ""),
      "SLA_99_9":         String(env.ADDON_SLA || ""),
      "WHITE_LABEL":      String(env.ADDON_WL || ""),
    };
    const line_items = [{ price: core, quantity: 1 }].concat(
      addons.map(a => {
        const id = addonMap[a];
        if (!id) throw new Error(`missing_addon_price:${a}`);
        return { price:id, quantity:1 };
      })
    );

    const stripe = stripeClient(env.SECRET);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items,
      allow_promotion_codes: true,
      success_url: `${env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.SITE_URL}/pricing?canceled=1`,
    });

    if (!session.url) return NextResponse.json({ ok:false, error:"no_session_url" }, { status:500 });
    return NextResponse.json({ ok:true, url:session.url });
  } catch (err:any) {
    console.error("checkout_error", {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      param: err?.param,
      statusCode: err?.statusCode,
      raw: err?.raw,
      stack: err?.stack?.substring(0, 500)
    });
    const errorDetails = `${err?.type || 'unknown'}: ${err?.message || err}`;
    return NextResponse.json({ ok:false, error:errorDetails, debug: { code: err?.code, param: err?.param } }, { status:500 });
  }
}
