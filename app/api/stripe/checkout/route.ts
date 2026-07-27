import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  team: process.env.STRIPE_PRICE_TEAM!,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planId } = await req.json();
  const priceId = PRICE_IDS[planId];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId },
    subscription_data: { trial_period_days: 14, metadata: { userId } },
  });

  return NextResponse.json({ url: session.url });
}
