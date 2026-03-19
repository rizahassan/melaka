'use client';

import Link from 'next/link';
import { PLANS, TRIAL_CONFIG, redirectToCheckout, getPriceId } from '@/lib/stripe';
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
            Self-host for free, or let us handle everything with a {TRIAL_CONFIG.durationDays}-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free */}
          <PricingCard
            plan={PLANS.free}
            onSubscribe={() => {}}
            buttonText="View Docs"
            buttonHref="https://github.com/rizahassan/melaka#self-hosting"
            buttonVariant="secondary"
            loading={false}
          />

          {/* Starter */}
          <PricingCard
            plan={PLANS.starter}
            onSubscribe={() => handleSubscribe('starter', getPriceId('starter'))}
            buttonText="Start Free Trial"
            buttonVariant="secondary"
            loading={loading === 'starter'}
          />

          {/* Pro */}
          <PricingCard
            plan={PLANS.pro}
            onSubscribe={() => handleSubscribe('pro', getPriceId('pro'))}
            buttonText="Start Free Trial"
            buttonVariant="primary"
            featured
            loading={loading === 'pro'}
          />

          {/* Scale */}
          <PricingCard
            plan={PLANS.scale}
            onSubscribe={() => handleSubscribe('scale', getPriceId('scale'))}
            buttonText="Start Free Trial"
            buttonVariant="secondary"
            loading={loading === 'scale'}
          />
        </div>

        {/* Trial Info */}
        <div className="text-center">
          <p className="text-[#8090b8] text-sm">
            All paid plans include a <span className="text-white font-medium">{TRIAL_CONFIG.durationDays}-day free trial</span> with up to <span className="text-white font-medium">{TRIAL_CONFIG.translationLimit} translations</span>. No credit card required to start.
          </p>
        </div>

        {/* Enterprise CTA */}
        <div className="max-w-2xl mx-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-2">Enterprise</h3>
          <p className="text-[#8090b8] mb-6">
            Need SSO, audit logging, translation memory, or custom SLAs?
          </p>
          <a 
            href="mailto:hello@melaka.dev" 
            className="inline-block px-6 py-3 rounded-xl font-medium text-sm border border-[rgba(255,255,255,0.12)] text-white hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
          >
            Contact Sales
          </a>
        </div>

        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-medium text-white text-center mb-8">
            Compare Plans
          </h2>
          <div className="max-w-4xl mx-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left p-4 text-sm font-medium text-[#8090b8]">Feature</th>
                  <th className="p-4 text-sm font-medium text-white">Free</th>
                  <th className="p-4 text-sm font-medium text-white">Starter</th>
                  <th className="p-4 text-sm font-medium text-white bg-[rgba(26,58,138,0.1)]">Pro</th>
                  <th className="p-4 text-sm font-medium text-white">Scale</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <CompareRow label="Monthly translations" values={['Unlimited*', '2,000', '10,000', '50,000']} />
                <CompareRow label="Projects" values={['1', '3', '10', 'Unlimited']} />
                <CompareRow label="Hosted dashboard" values={[false, true, true, true]} />
                <CompareRow label="No AI keys needed" values={[false, true, true, true]} />
                <CompareRow label="Analytics" values={[false, false, true, true]} />
                <CompareRow label="Priority support" values={[false, false, true, true]} />
                <CompareRow label="Overage rate" values={['—', '$0.008', '$0.005', '$0.003']} />
              </tbody>
            </table>
            <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#5a6a8a]">* Self-hosted with your own AI API keys</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-medium text-white text-center mb-10">
            How Melaka Cloud Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step number={1} title="Connect Firebase" description="Sign in with Google and grant Firestore access to your project" />
            <Step number={2} title="Configure Collections" description="Select which collections and fields to translate" />
            <Step number={3} title="Automatic Translations" description="New documents are translated instantly to all target languages" />
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-medium text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <FAQ
            question="What counts as a translation?"
            answer="One translation = one document translated to one language. If you translate an article to 3 languages, that's 3 translations. Field count doesn't matter — a doc with 10 fields counts the same as one with 2 fields."
          />
          <FAQ
            question="What happens if I exceed my limit?"
            answer="You'll be charged the overage rate for additional translations. For example, on the Pro plan, each translation over 10,000 costs $0.005."
          />
          <FAQ
            question="Can I use Melaka completely free?"
            answer="Yes! The SDK and CLI are fully open source. Self-host your own Cloud Functions with your own AI API keys (Gemini, OpenAI, or Claude). The paid plans are for those who want fully managed translations."
          />
          <FAQ
            question="How does the free trial work?"
            answer={`You get ${TRIAL_CONFIG.durationDays} days or ${TRIAL_CONFIG.translationLimit} translations, whichever comes first. No credit card required. After the trial, you can subscribe or downgrade to the free self-hosted tier.`}
          />
          <FAQ
            question="How does Melaka access my Firestore?"
            answer="You authenticate with Google OAuth and grant read/write access to specific collections. Melaka only accesses the collections you configure. You can revoke access anytime from your Google account settings."
          />
          <FAQ
            question="Can I switch plans anytime?"
            answer="Yes! Upgrade instantly, or downgrade at the end of your billing period. Your data stays intact either way."
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
  const primaryClassName = `mt-6 w-full py-3 rounded-xl font-medium text-sm text-center block bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;
  const secondaryClassName = `mt-6 w-full py-3 rounded-xl font-medium text-sm text-center block border border-[rgba(255,255,255,0.12)] text-white hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

  const baseClassName = buttonVariant === 'primary' ? primaryClassName : secondaryClassName;

  return (
    <div
      className={`relative rounded-2xl border bg-[rgba(255,255,255,0.03)] p-6 flex flex-col ${
        featured
          ? 'border-[rgba(26,58,138,0.4)] shadow-[0_0_30px_rgba(26,58,138,0.15)]'
          : 'border-[rgba(255,255,255,0.06)]'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white text-xs font-medium px-4 py-1 rounded-full shadow-[0_4px_6px_rgba(26,58,138,0.25)]">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-medium text-white">
          {plan.name}
        </h3>
        <p className="text-xs text-[#5a6a8a] mt-1">{plan.description}</p>
        <div className="mt-4">
          <span className="text-3xl font-semibold text-white">
            ${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="text-[#8090b8] text-sm">/mo</span>
          )}
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
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
        <a href={buttonHref} target="_blank" rel="noopener noreferrer" className={baseClassName}>
          {buttonText}
        </a>
      ) : (
        <button onClick={onSubscribe} disabled={loading} className={baseClassName}>
          {loading ? 'Loading...' : buttonText}
        </button>
      )}
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: (string | boolean)[] }) {
  return (
    <tr className="border-b border-[rgba(255,255,255,0.04)]">
      <td className="p-4 text-[#8090b8]">{label}</td>
      {values.map((value, i) => (
        <td key={i} className={`p-4 text-center ${i === 2 ? 'bg-[rgba(26,58,138,0.1)]' : ''}`}>
          {typeof value === 'boolean' ? (
            value ? (
              <span className="text-[#22c55e]">✓</span>
            ) : (
              <span className="text-[#5a6a8a]">—</span>
            )
          ) : (
            <span className="text-white">{value}</span>
          )}
        </td>
      ))}
    </tr>
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
