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
    features: [
      'CLI & SDK access',
      'Unlimited self-hosted translations',
      'Community support',
      '3 AI providers (Gemini, OpenAI, Claude)',
      'Deploy your own Cloud Functions',
    ],
    limits: {
      teamMembers: 1,
      projects: 1,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Fully managed translations',
      'No Cloud Functions needed',
      'No AI API keys needed',
      'Hosted dashboard',
      'Up to 5 team members',
      'Unlimited projects',
      'Priority email support',
    ],
    limits: {
      teamMembers: 5,
      projects: -1, // unlimited
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

export interface Subscription {
  planId: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
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
