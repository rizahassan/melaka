'use client';

import Link from 'next/link';
import { PLANS, redirectToCheckout } from '@/lib/stripe';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId: string | null) => {
    if (!priceId) return;

    setLoading(planId);
    try {
      await redirectToCheckout(priceId);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🌏 Melaka
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Start free, scale as you grow. No hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Free */}
          <PricingCard
            plan={PLANS.free}
            onSubscribe={() => {}}
            buttonText="Get Started"
            buttonVariant="secondary"
            loading={false}
          />

          {/* Pro */}
          <PricingCard
            plan={PLANS.pro}
            onSubscribe={() => handleSubscribe('pro', PLANS.pro.priceId || null)}
            buttonText="Subscribe"
            buttonVariant="primary"
            featured
            loading={loading === 'pro'}
          />

          {/* Enterprise */}
          <PricingCard
            plan={PLANS.enterprise}
            onSubscribe={() => handleSubscribe('enterprise', PLANS.enterprise.priceId || null)}
            buttonText="Contact Sales"
            buttonVariant="secondary"
            loading={loading === 'enterprise'}
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQ
              question="Can I use Melaka for free?"
              answer="Yes! The CLI and SDK are completely free and open source. You can self-host the dashboard too. Pro and Enterprise plans are for teams who want hosted features and support."
            />
            <FAQ
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through Stripe. Enterprise customers can also pay via invoice."
            />
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQ
              question="Do you offer discounts for startups?"
              answer="Yes! Contact us at hello@melaka.dev for startup pricing."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function PricingCard({
  plan,
  onSubscribe,
  buttonText,
  buttonVariant,
  featured,
  loading,
}: {
  plan: (typeof PLANS)[keyof typeof PLANS];
  onSubscribe: () => void;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  featured?: boolean;
  loading: boolean;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${
        featured ? 'ring-2 ring-indigo-600' : ''
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {plan.name}
        </h3>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            ${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={loading}
        className={`mt-8 w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          buttonVariant === 'primary'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {loading ? 'Loading...' : buttonText}
      </button>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {question}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{answer}</p>
    </div>
  );
}
