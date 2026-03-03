'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { user, loading } = useAuth();

  // If logged in, redirect to dashboard
  if (!loading && user) {
    return (
      <meta httpEquiv="refresh" content="0;url=/dashboard" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            Automatic Firestore Translations
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your Firebase project and get AI-powered translations in minutes. 
            No code changes. No deployment. Just works.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-800/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Firebase</h3>
              <p className="text-gray-400">
                Sign in with Google and authorize access to your Firestore collections.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Collections</h3>
              <p className="text-gray-400">
                Choose which collections to translate and pick your target languages.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Translate</h3>
              <p className="text-gray-400">
                Translations appear in i18n subcollections automatically when content changes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Melaka Cloud?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🚀 Zero Code Changes</h3>
              <p className="text-gray-400">
                No Cloud Functions to deploy. No SDK to integrate. Just connect and go.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🤖 AI-Powered</h3>
              <p className="text-gray-400">
                Powered by Gemini, GPT-4, and Claude for high-quality translations.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">⚡ Real-Time</h3>
              <p className="text-gray-400">
                Translations happen automatically when your content changes.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🔒 Secure</h3>
              <p className="text-gray-400">
                OAuth tokens encrypted. Minimal permissions. Revoke access anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Global?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start translating your Firestore content in minutes.
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500">
        <p>© 2026 Melaka. Open source SDK available on GitHub.</p>
      </footer>
    </div>
  );
}
