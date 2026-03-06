'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
    </>
  );
}

function ConnectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const error = searchParams.get('error');
  const errorDetail = searchParams.get('detail');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login?redirect=/connect');
    return null;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8090b8]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!projectId.trim()) {
      alert('Please enter your Firebase Project ID');
      return;
    }

    if (!user) {
      alert('Please sign in first');
      router.push('/login?redirect=/connect');
      return;
    }

    setLoading(true);

    // Use actual user ID from Firebase Auth
    const userId = user.uid;

    // Redirect to OAuth flow
    window.location.href = `/api/oauth?userId=${encodeURIComponent(userId)}&projectId=${encodeURIComponent(projectId)}`;
  };

  return (
    <div className="relative max-w-2xl mx-auto px-6 pt-8 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-white">
          Connect Your Firebase Project
        </h1>
        <p className="mt-2 text-sm text-[#8090b8]">
          Grant Melaka access to translate your Firestore collections automatically.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-[rgba(204,50,50,0.2)] bg-[rgba(204,50,50,0.05)]">
          <p className="text-[#cc3232] text-sm">
            {error === 'access_denied'
              ? 'Access was denied. Please try again and approve the permissions.'
              : `Connection failed: ${error}`}
          </p>
          {errorDetail && (
            <p className="mt-2 text-xs text-[#cc3232]/70">
              Details: {errorDetail}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-8">
        {/* Step 1: Project ID */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#8090b8] mb-1.5">
            Firebase Project ID
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="my-firebase-project"
            className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-white placeholder-[#5a6a8a] focus:outline-none focus:ring-1 focus:ring-[#2a4faa] focus:border-[#2a4faa] transition-colors"
          />
          <p className="mt-2 text-xs text-[#5a6a8a]">
            Find this in your Firebase Console → Project Settings
          </p>
        </div>

        {/* Permissions Info */}
        <div className="mb-8 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <h3 className="font-medium text-white text-sm mb-2">
            Permissions we&apos;ll request:
          </h3>
          <ul className="text-sm text-[#8090b8] space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-[#22c55e]">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8l3 3 5-5" />
                </svg>
              </span>
              Read your Firestore collections
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#22c55e]">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8l3 3 5-5" />
                </svg>
              </span>
              Write to i18n subcollections (translations only)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#22c55e]">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8l3 3 5-5" />
                </svg>
              </span>
              View your Google account email
            </li>
          </ul>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading || !projectId.trim()}
          className="w-full py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl font-medium text-sm shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-shadow"
        >
          {loading ? (
            'Redirecting to Google...'
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect with Google
            </>
          )}
        </button>

        {/* Security Note */}
        <p className="mt-4 text-xs text-center text-[#5a6a8a]">
          You can revoke access anytime from your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2a4faa] hover:text-[#3058b8] transition-colors"
          >
            Google Account Settings
          </a>
        </p>
      </div>

      {/* Back Link */}
      <p className="mt-6 text-center">
        <Link href="/dashboard" className="text-sm text-[#5a6a8a] hover:text-[#8090b8] transition-colors flex items-center justify-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11L5 7l4-4" />
          </svg>
          Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ConnectContent />
      </Suspense>
    </main>
  );
}
