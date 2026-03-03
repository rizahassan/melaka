'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Project Connected!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your Firebase project <strong>{projectId}</strong> is now connected to Melaka.
        </p>
      </div>

      {/* Next Steps */}
      <div className="mt-12 bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Next Steps
        </h2>

        <ol className="space-y-6">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Select Collections
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose which Firestore collections you want to translate.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Configure Languages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set your source language and target languages.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Start Translating
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We'll automatically translate new and updated documents.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-8 flex gap-4">
          <Link
            href="/settings"
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium text-center hover:bg-indigo-700"
          >
            Configure Project
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium text-center hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnectSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
