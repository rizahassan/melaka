import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDatabase } from '@/lib/firebase-admin';

// Trial configuration
const TRIAL_DAYS = 14;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Check if user already has a subscription with a Stripe customer
    const db = getDatabase();
    let customerId: string | undefined;
    let hasHadTrial = false;

    if (db) {
      const existingSub = await db.getSubscription(userId);
      if (existingSub?.stripeCustomerId) {
        customerId = existingSub.stripeCustomerId;
      }
      // Don't give trial if they've already had one
      if (existingSub?.trialStart) {
        hasHadTrial = true;
      }
    }

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: { userId },
      // Allow promotion codes
      allow_promotion_codes: true,
    };

    // Add trial period if user hasn't had one before
    if (!hasHadTrial) {
      sessionParams.subscription_data = {
        trial_period_days: TRIAL_DAYS,
        metadata: { userId },
      };
      // Don't require payment method for trial
      sessionParams.payment_method_collection = 'if_required';
    }

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      // In subscription mode, customer is created automatically
      // Just need to collect their email
      sessionParams.customer_email = request.headers.get('x-user-email') || undefined;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
