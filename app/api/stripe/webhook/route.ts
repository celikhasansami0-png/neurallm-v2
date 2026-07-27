import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.metadata?.userId;
    if (userId) {
      await query(
        `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan)
         VALUES ($1, $2, $3, 'active', 'team')
         ON CONFLICT (user_id) DO UPDATE SET
           stripe_customer_id = $2, stripe_subscription_id = $3, status = 'active', updated_at = NOW()`,
        [userId, session.customer, session.subscription]
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE stripe_subscription_id = $1`,
      [sub.id]
    );
  }

  return NextResponse.json({ received: true });
}
