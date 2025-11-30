import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-10-29.clover',
});

async function computeHmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${hashHex}`;
}

async function persistSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.levqor.ai';
  const internalSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  const payload = JSON.stringify({
    event_id: event.id,
    event_type: event.type,
    created: event.created,
    data: event.data.object,
  });
  
  const signature = await computeHmacSha256(payload, internalSecret);
  
  try {
    const response = await fetch(`${backendUrl}/api/billing/webhook-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'stripe',
        'X-Webhook-Signature': signature,
        'X-Stripe-Event-Id': event.id,
      },
      body: payload,
    });
    
    if (!response.ok) {
      console.error('Failed to persist webhook event:', await response.text());
    }
  } catch (error) {
    console.error('Error persisting webhook event:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get('stripe-signature') || '';
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (e: any) {
      return new NextResponse(JSON.stringify({ error: 'Invalid signature', detail: e?.message }), { status: 400 });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe] Checkout completed: ${session.id}, customer: ${session.customer}`);
        await persistSubscriptionEvent(event);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription created: ${subscription.id}, status: ${subscription.status}`);
        await persistSubscriptionEvent(event);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        await persistSubscriptionEvent(event);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
        await persistSubscriptionEvent(event);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid}`);
        await persistSubscriptionEvent(event);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Invoice payment failed: ${invoice.id}`);
        await persistSubscriptionEvent(event);
        break;
      }
    }
    
    return NextResponse.json({ ok: true, event_id: event.id });
  } catch (e: any) {
    console.error('[Stripe Webhook] Handler error:', e);
    return new NextResponse(JSON.stringify({ error: 'handler_failed', detail: e?.message }), { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/stripe/webhook' });
}
