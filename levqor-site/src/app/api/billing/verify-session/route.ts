import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "missing_session_id" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "missing_stripe_key" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" as any });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "session_not_complete" }, { status: 400 });
    }

    const subscription = session.subscription as Stripe.Subscription | null;
    const customer = session.customer as Stripe.Customer | null;

    let planName = "Levqor";
    if (subscription?.items?.data?.[0]?.price?.nickname) {
      planName = subscription.items.data[0].price.nickname;
    } else if (subscription?.items?.data?.[0]?.price?.product) {
      const product = await stripe.products.retrieve(
        subscription.items.data[0].price.product as string
      );
      planName = product.name || "Levqor";
    }

    return NextResponse.json({
      plan: planName,
      status: subscription?.status || session.status,
      email: customer?.email || session.customer_email,
    });
  } catch (err: any) {
    console.error("verify-session error:", err?.message);
    return NextResponse.json(
      { error: "verification_failed", detail: err?.message },
      { status: 500 }
    );
  }
}
