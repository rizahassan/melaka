'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Self-hosted',
    features: [
      'Full SDK & CLI access',
      'Unlimited self-hosted translations',
      '3 AI providers (Gemini, OpenAI, Claude)',
      'Deploy your own Cloud Functions',
      'Community support',
    ],
    limits: {
      translations: -1, // unlimited (self-hosted)
      projects: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: 'For small projects',
    features: [
      '2,000 translations/month',
      'Fully managed — no code needed',
      'No AI API keys needed',
      'Hosted dashboard',
      '3 projects',
      'Email support',
    ],
    limits: {
      translations: 2000,
      projects: 3,
    },
    overage: 0.008, // $0.008 per translation over limit
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: 'For growing apps',
    popular: true,
    features: [
      '10,000 translations/month',
      'Everything in Starter',
      '10 projects',
      'Priority support',
      'Translation analytics',
    ],
    limits: {
      translations: 10000,
      projects: 10,
    },
    overage: 0.005, // $0.005 per translation over limit
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID,
    description: 'For high-volume apps',
    features: [
      '50,000 translations/month',
      'Everything in Pro',
      'Unlimited projects',
      'Slack support',
      'Custom AI model selection',
    ],
    limits: {
      translations: 50000,
      projects: -1, // unlimited
    },
    overage: 0.003, // $0.003 per translation over limit
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 14,
  translationLimit: 500,
} as const;

export interface Subscription {
  planId: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  translationsUsed?: number;
  translationsLimit?: number;
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
