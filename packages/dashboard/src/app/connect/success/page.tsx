'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
      <div className="fixed top-[200px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
      <div className="fixed top-[400px] right-0 w-[500px] h-[500px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)' }} />
    </>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#22c55e]" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20l6 6 10-10" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Project Connected!
        </h1>
        <p className="mt-2 text-[#8090b8]">
          Your Firebase project <strong className="text-white">{projectId}</strong> is now connected to Melaka.
        </p>
      </div>

      {/* Next Steps */}
      <div className="mt-12 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-8">
        <h2 className="text-lg font-medium text-white mb-6">
          Next Steps
        </h2>

        <ol className="space-y-6">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-full flex items-center justify-center font-medium text-sm shadow-[0_4px_8px_rgba(26,58,138,0.3)]">
              1
            </div>
            <div>
              <h3 className="font-medium text-white">
                Select Collections
              </h3>
              <p className="text-sm text-[#5a6a8a] mt-1">
                Choose which Firestore collections you want to translate.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-full flex items-center justify-center font-medium text-sm shadow-[0_4px_8px_rgba(26,58,138,0.3)]">
              2
            </div>
            <div>
              <h3 className="font-medium text-white">
                Configure Languages
              </h3>
              <p className="text-sm text-[#5a6a8a] mt-1">
                Set your source language and target languages.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-full flex items-center justify-center font-medium text-sm shadow-[0_4px_8px_rgba(26,58,138,0.3)]">
              3
            </div>
            <div>
              <h3 className="font-medium text-white">
                Start Translating
              </h3>
              <p className="text-sm text-[#5a6a8a] mt-1">
                We&apos;ll automatically translate new and updated documents.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-8 flex gap-4">
          <Link
            href="/settings"
            className="flex-1 py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl font-medium text-center shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow"
          >
            Configure Project
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 py-3 border border-[rgba(255,255,255,0.12)] text-white rounded-xl font-medium text-center hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
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
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
