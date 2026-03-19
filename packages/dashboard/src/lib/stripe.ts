'use client';

import { loadStripe } from '@stripe/stripe-js';

// Re-export from shared plans module
export { PLANS, TRIAL_CONFIG, type PlanId } from './plans';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export interface Subscription {
  planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  translationsUsed?: number;
  translationsLimit?: number;
}

/**
 * Get price ID for a plan from environment.
 */
export function getPriceId(planId: string): string | null {
  switch (planId) {
    case 'starter':
      return process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || null;
    case 'pro':
      return process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null;
    case 'scale':
      return process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID || null;
    default:
      return null;
  }
}

/**
 * Create a Stripe Checkout session for subscription.
 */
export async function createCheckoutSession(priceId: string, userId: string): Promise<string> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}

/**
 * Redirect to Stripe Checkout.
 */
export async function redirectToCheckout(priceId: string, userId: string): Promise<void> {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const sessionId = await createCheckoutSession(priceId, userId);
  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw error;
  }
}

/**
 * Create a Stripe Customer Portal session.
 */
export async function createPortalSession(userId: string): Promise<string> {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create portal session');
  }

  const { url } = await response.json();
  return url;
}

/**
 * Redirect to Stripe Customer Portal.
 */
export async function redirectToPortal(userId: string): Promise<void> {
  const url = await createPortalSession(userId);
  window.location.href = url;
}
