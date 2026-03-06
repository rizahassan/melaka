'use client';

import Link from 'next/link';
import { PLANS, redirectToCheckout } from '@/lib/stripe';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
      <div className="fixed top-[200px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)' }} />
      <div className="fixed top-[500px] right-0 w-[500px] h-[500px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(204,50,50,0.06) 0%, transparent 70%)' }} />
    </>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId: string | null) => {
    if (!priceId) return;

    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setLoading(planId);
    try {
      await redirectToCheckout(priceId, user.uid);
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

      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 space-y-12">
        {/* Page Header */}
        <div className="text-center pt-8">
          <h1 className="text-gradient-hero text-4xl md:text-5xl font-semibold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#8090b8] max-w-2xl mx-auto">
            Self-host for free, or let us handle everything.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="text-center">
          <p className="text-[#8090b8]">
            Need SSO, audit logging, or translation memory?{' '}
            <a href="mailto:hello@melaka.dev" className="text-[#2a4faa] hover:text-[#3058b8] font-medium transition-colors">
              Contact us for Enterprise pricing
            </a>
          </p>
        </div>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-medium text-white text-center mb-10">
            How Melaka Pro Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step number={1} title="Connect Firebase" description="Sign in with Google and grant Firestore access" />
            <Step number={2} title="Select Collections" description="Choose which collections to translate" />
            <Step number={3} title="Done!" description="Translations happen automatically" />
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-medium text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
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
        </section>
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
  const primaryClassName = `mt-8 w-full py-3 rounded-xl font-medium text-sm text-center block bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;
  const secondaryClassName = `mt-8 w-full py-3 rounded-xl font-medium text-sm text-center block border border-[rgba(255,255,255,0.12)] text-white hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

  const baseClassName = buttonVariant === 'primary' ? primaryClassName : secondaryClassName;

  return (
    <div
      className={`relative rounded-2xl border bg-[rgba(255,255,255,0.03)] p-8 ${
        featured
          ? 'border-[rgba(26,58,138,0.4)] shadow-[0_0_30px_rgba(26,58,138,0.15)]'
          : 'border-[rgba(255,255,255,0.06)]'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white text-xs font-medium px-4 py-1 rounded-full shadow-[0_4px_6px_rgba(26,58,138,0.25)]">
            Recommended
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-medium text-white">
          {plan.name}
        </h3>
        <div className="mt-4">
          <span className="text-4xl font-semibold text-white">
            ${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-[#8090b8]">/month</span>
          )}
        </div>
        <p className="mt-2 text-sm text-[#5a6a8a]">
          {plan.price === 0 ? 'Self-hosted' : 'Fully managed'}
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-[#22c55e] mt-0.5 shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8l3 3 5-5" />
              </svg>
            </span>
            <span className="text-sm text-[#8090b8]">{feature}</span>
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
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 text-center">
      <div className="w-12 h-12 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto shadow-[0_4px_12px_rgba(26,58,138,0.3)]">
        {number}
      </div>
      <h3 className="mt-4 text-base font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#8090b8]">{description}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
      <h3 className="text-base font-medium text-white mb-2">
        {question}
      </h3>
      <p className="text-sm text-[#8090b8] leading-relaxed">{answer}</p>
    </div>
  );
}
