'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🌏 Melaka
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/translations"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Translations
              </Link>
              <Link
                href="/analytics"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Analytics
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Settings
                </Link>
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
