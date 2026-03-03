'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';

function ConnectContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!projectId.trim()) {
      alert('Please enter your Firebase Project ID');
      return;
    }

    setLoading(true);

    // Get user ID (in production, get from auth)
    const userId = 'demo-user'; // TODO: Replace with actual user ID

    // Redirect to OAuth flow
    window.location.href = `/api/oauth?userId=${encodeURIComponent(userId)}&projectId=${encodeURIComponent(projectId)}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Connect Your Firebase Project
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Grant Melaka access to translate your Firestore collections automatically.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            {error === 'access_denied'
              ? 'Access was denied. Please try again and approve the permissions.'
              : `Connection failed: ${error}`}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        {/* Step 1: Project ID */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Firebase Project ID
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="my-firebase-project"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Find this in your Firebase Console → Project Settings
          </p>
        </div>

        {/* Permissions Info */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Permissions we'll request:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Read your Firestore collections
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Write to i18n subcollections (translations only)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              View your Google account email
            </li>
          </ul>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading || !projectId.trim()}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          You can revoke access anytime from your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Google Account Settings
          </a>
        </p>
      </div>

      {/* Back Link */}
      <p className="mt-6 text-center">
        <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          ← Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
        <ConnectContent />
      </Suspense>
    </main>
  );
}
