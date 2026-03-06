'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';

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

// --- Step Card ---
function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 text-center">
      <div className="w-12 h-12 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-semibold text-white shadow-[0_4px_12px_rgba(26,58,138,0.3)]">
        {number}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-[#8090b8] leading-relaxed">{description}</p>
    </div>
  );
}

// --- Feature Card ---
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-[rgba(255,255,255,0.12)] transition-colors">
      <div className="mb-3">{icon}</div>
      <h3 className="text-base font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-[#8090b8] leading-relaxed">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();

  // If logged in, redirect to dashboard
  if (!loading && user) {
    return (
      <meta httpEquiv="refresh" content="0;url=/dashboard" />
    );
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-gradient-hero text-5xl md:text-6xl font-semibold leading-tight mb-6 max-w-3xl mx-auto">
          Automatic Firestore Translations
        </h1>
        <p className="text-lg text-[#8090b8] mb-10 max-w-2xl mx-auto leading-relaxed">
          Connect your Firebase project and get AI-powered translations in minutes.
          No code changes. No deployment. Just works.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-base font-medium shadow-[0_10px_15px_rgba(26,58,138,0.2),0_4px_6px_rgba(26,58,138,0.2)] hover:shadow-[0_10px_20px_rgba(26,58,138,0.35)] transition-shadow"
          >
            Get Started Free
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3 border border-[rgba(255,255,255,0.12)] text-white rounded-xl text-base font-medium hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-medium text-white text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <StepCard number={1} title="Connect Firebase" description="Sign in with Google and authorize access to your Firestore collections." />
          <StepCard number={2} title="Select Collections" description="Choose which collections to translate and pick your target languages." />
          <StepCard number={3} title="Auto-Translate" description="Translations appear in i18n subcollections automatically when content changes." />
        </div>
      </div>

      {/* Features */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-medium text-white text-center mb-10">Why Melaka Cloud?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<svg className="w-6 h-6 text-[#2a4faa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
            title="Zero Code Changes"
            description="No Cloud Functions to deploy. No SDK to integrate. Just connect and go."
          />
          <FeatureCard
            icon={<svg className="w-6 h-6 text-[#2a4faa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>}
            title="AI-Powered"
            description="Powered by Gemini, GPT-4, and Claude for high-quality translations."
          />
          <FeatureCard
            icon={<svg className="w-6 h-6 text-[#2a4faa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
            title="Real-Time"
            description="Translations happen automatically when your content changes."
          />
          <FeatureCard
            icon={<svg className="w-6 h-6 text-[#2a4faa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
            title="Secure"
            description="OAuth tokens encrypted. Minimal permissions. Revoke access anytime."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-12 text-center">
          <h2 className="text-2xl font-medium text-white mb-3">Ready to Go Global?</h2>
          <p className="text-[#8090b8] mb-8 text-lg">
            Start translating your Firestore content in minutes.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-base font-medium shadow-[0_10px_15px_rgba(26,58,138,0.2),0_4px_6px_rgba(26,58,138,0.2)] hover:shadow-[0_10px_20px_rgba(26,58,138,0.35)] transition-shadow"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-8 text-center border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-sm text-[#5a6a8a]">© 2026 Melaka. Open source SDK available on GitHub.</p>
      </footer>
    </main>
  );
}
