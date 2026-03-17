import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDatabase } from '@/lib/firebase-admin';

// Trial configuration (must match checkout route)
const TRIAL_TRANSLATIONS_LIMIT = 500;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
  });
}

/**
 * Map Stripe price ID to plan ID.
 */
function getPlanFromPrice(priceId: string): 'free' | 'starter' | 'pro' | 'scale' | 'enterprise' {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const scalePriceId = process.env.STRIPE_SCALE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID;
  const enterprisePriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;

  if (priceId === starterPriceId) return 'starter';
  if (priceId === proPriceId) return 'pro';
  if (priceId === scalePriceId) return 'scale';
  if (priceId === enterprisePriceId) return 'enterprise';
  return 'pro'; // Default to pro for unknown prices
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getDatabase();
  if (!db) {
    console.error('Database not configured');
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          console.error('No userId found in checkout session:', session.id);
          break;
        }

        const stripe = getStripe();
        const subscriptionId = session.subscription as string;

        if (subscriptionId) {
          // Fetch the full subscription to get details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id || '';
          const isTrialing = subscription.status === 'trialing';

          await db.upsertSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            planId: getPlanFromPrice(priceId),
            status: isTrialing ? 'trialing' : 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            // Trial tracking
            trialStart: isTrialing ? new Date() : undefined,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
            trialTranslationsLimit: isTrialing ? TRIAL_TRANSLATIONS_LIMIT : undefined,
          });

          console.log(`Subscription created for user ${userId}: ${subscriptionId} (${isTrialing ? 'trialing' : 'active'})`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe customer ID
        const existingSub = await db.getSubscriptionByStripeCustomerId(customerId);
        if (!existingSub) {
          console.error('No subscription found for customer:', customerId);
          break;
        }

        const priceId = subscription.items.data[0]?.price?.id || '';
        const status = subscription.status === 'active'
          ? 'active'
          : subscription.status === 'trialing'
            ? 'trialing'
            : subscription.status === 'past_due'
              ? 'past_due'
              : 'canceled';

        await db.upsertSubscription({
          userId: existingSub.userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          planId: getPlanFromPrice(priceId),
          status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          // Preserve trial data
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        });

        console.log(`Subscription updated for user ${existingSub.userId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSub = await db.getSubscriptionByStripeCustomerId(customerId);
        if (!existingSub) {
          console.error('No subscription found for customer:', customerId);
          break;
        }

        await db.updateSubscriptionStatus(existingSub.userId, 'canceled', {
          cancelAtPeriodEnd: false,
        });

        console.log(`Subscription canceled for user ${existingSub.userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const existingSub = await db.getSubscriptionByStripeCustomerId(customerId);
        if (!existingSub) {
          console.error('No subscription found for customer:', customerId);
          break;
        }

        await db.updateSubscriptionStatus(existingSub.userId, 'past_due');
        console.log(`Payment failed for user ${existingSub.userId}`);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
