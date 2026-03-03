'use client';

import Link from 'next/link';
import { PLANS, redirectToCheckout } from '@/lib/stripe';
import { useState } from 'react';
import { Header } from '@/components/Header';

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
      <div className="fixed top-[125px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)' }} />
    </>
  );
}

// --- Check Icon ---
function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10l3 3 7-7" />
    </svg>
  );
}

// --- Chevron Icon ---
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#5a6a8a] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}

// --- FAQ Item ---
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-white pr-4">{question}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <p className="pb-5 text-sm text-[#8090b8] leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

// --- Pricing Card ---
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
    <div className={`relative rounded-2xl border bg-[rgba(255,255,255,0.03)] p-8 flex flex-col ${
      featured ? 'border-[rgba(26,58,138,0.5)]' : 'border-[rgba(255,255,255,0.06)]'
    }`}>
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#1a3a8a] to-[#2a4faa] text-white text-xs font-medium px-4 py-1.5 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-white">{plan.name}</h3>
        <div className="mt-3">
          <span className="text-4xl font-semibold text-white">${plan.price}</span>
          {plan.price > 0 && (
            <span className="text-[#5a6a8a] ml-1">/month</span>
          )}
        </div>
      </div>

      <ul className="space-y-3.5 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-sm text-[#8090b8]">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={loading}
        className={`mt-8 w-full py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 ${
          buttonVariant === 'primary'
            ? 'bg-gradient-to-r from-[#1a3a8a] to-[#2a4faa] text-white hover:from-[#1e44a0] hover:to-[#3058b8] shadow-lg shadow-[rgba(26,58,138,0.25)]'
            : 'bg-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.06)]'
        }`}
      >
        {loading ? 'Loading...' : buttonText}
      </button>
    </div>
  );
}

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
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center pt-16 pb-14">
          <h1 className="text-4xl sm:text-5xl font-semibold">
            <span className="text-gradient-hero">Simple, transparent pricing</span>
          </h1>
          <p className="mt-4 text-lg text-[#8090b8] max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 max-w-5xl mx-auto pb-20">
          <PricingCard
            plan={PLANS.free}
            onSubscribe={() => {}}
            buttonText="Get Started"
            buttonVariant="secondary"
            loading={false}
          />
          <PricingCard
            plan={PLANS.pro}
            onSubscribe={() => handleSubscribe('pro', PLANS.pro.priceId || null)}
            buttonText="Subscribe"
            buttonVariant="primary"
            featured
            loading={loading === 'pro'}
          />
          <PricingCard
            plan={PLANS.enterprise}
            onSubscribe={() => handleSubscribe('enterprise', PLANS.enterprise.priceId || null)}
            buttonText="Contact Sales"
            buttonVariant="secondary"
            loading={loading === 'enterprise'}
          />
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto pb-20">
          <h2 className="text-2xl font-medium text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-6">
            <FAQItem
              question="Can I use Melaka for free?"
              answer="Yes! The CLI and SDK are completely free and open source. You can self-host the dashboard too. Pro and Enterprise plans are for teams who want hosted features and support."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through Stripe. Enterprise customers can also pay via invoice."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="Do you offer discounts for startups?"
              answer="Yes! Contact us at hello@melaka.dev for startup pricing."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
