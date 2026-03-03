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
          Self-host for free, or let us handle everything.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Free */}
          <PricingCard
            plan={PLANS.free}
            onSubscribe={() => {}}
            buttonText="Get Started"
            buttonHref="/docs"
            buttonVariant="secondary"
            loading={false}
          />

          {/* Pro */}
          <PricingCard
            plan={PLANS.pro}
            onSubscribe={() => handleSubscribe('pro', PLANS.pro.priceId || null)}
            buttonText="Start Free Trial"
            buttonVariant="primary"
            featured
            loading={loading === 'pro'}
          />
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Need SSO, audit logging, or translation memory?{' '}
            <a href="mailto:hello@melaka.dev" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Contact us for Enterprise pricing
            </a>
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How Melaka Pro Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step number={1} title="Connect Firebase" description="Sign in with Google and grant Firestore access" />
            <Step number={2} title="Select Collections" description="Choose which collections to translate" />
            <Step number={3} title="Done!" description="Translations happen automatically" />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQ
              question="Can I use Melaka for free?"
              answer="Yes! The CLI and SDK are completely free and open source. Self-host your own Cloud Functions with your own AI keys. Pro is for teams who want fully managed translations without any deployment."
            />
            <FAQ
              question="What's the difference between Free and Pro?"
              answer="Free: You deploy Cloud Functions to your Firebase project and manage your own AI API keys. Pro: We handle everything — just connect your Firebase and we translate automatically. No code, no AI keys needed."
            />
            <FAQ
              question="How does Melaka access my Firestore?"
              answer="You authenticate with Google OAuth and grant read/write access to specific collections. You can revoke access anytime from your Google account settings."
            />
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
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
  buttonHref,
  buttonVariant,
  featured,
  loading,
}: {
  plan: (typeof PLANS)[keyof typeof PLANS];
  onSubscribe: () => void;
  buttonText: string;
  buttonHref?: string;
  buttonVariant: 'primary' | 'secondary';
  featured?: boolean;
  loading: boolean;
}) {
  const baseClassName = `mt-8 w-full py-3 rounded-lg font-medium transition-colors block text-center ${
    buttonVariant === 'primary'
      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ${
        featured ? 'ring-2 ring-indigo-600' : ''
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
            Recommended
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
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {plan.price === 0 ? 'Self-hosted' : 'Fully managed'}
        </p>
      </div>

      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {buttonHref ? (
        <Link href={buttonHref} className={baseClassName}>
          {buttonText}
        </Link>
      ) : (
        <button onClick={onSubscribe} disabled={loading} className={baseClassName}>
          {loading ? 'Loading...' : buttonText}
        </button>
      )}
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>
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
