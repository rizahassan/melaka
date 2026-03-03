'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [projectId, setProjectId] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Firebase Connection */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Firebase Connection
          </h2>

          {connected ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 text-2xl">✓</span>
              <div>
                <p className="text-green-800 dark:text-green-400 font-medium">
                  Connected to Firebase
                </p>
                <p className="text-green-600 dark:text-green-500 text-sm">
                  Project: {projectId}
                </p>
              </div>
              <button
                onClick={() => setConnected(false)}
                className="ml-auto text-sm text-red-600 hover:text-red-500"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Connect to your Firebase project to view and manage translations.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-firebase-project"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setConnected(true)}
                  disabled={!projectId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> For local development, ensure you have:
                </p>
                <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>Firebase CLI installed and authenticated</li>
                  <li>Access to the Firebase project</li>
                  <li>Firestore enabled in the project</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Languages
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Configure in <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">melaka.config.ts</code>
          </p>
          <div className="flex flex-wrap gap-2">
            <LanguageBadge code="ms-MY" name="Malay" />
            <LanguageBadge code="zh-CN" name="Chinese" />
            <LanguageBadge code="ta-IN" name="Tamil" />
          </div>
        </div>

        {/* AI Provider */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            AI Provider
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Configure in <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">melaka.config.ts</code>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">Provider</p>
              <p className="text-gray-900 dark:text-white font-medium">Gemini</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Model</p>
              <p className="text-gray-900 dark:text-white font-medium">gemini-3-flash-preview</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LanguageBadge({ code, name }: { code: string; name: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-sm">
      {name} <span className="ml-1 text-indigo-500">({code})</span>
    </span>
  );
}
