'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Translation Dashboard
          </h2>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Review, edit, and manage your Firestore translations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Documents"
            value="--"
            description="Across all collections"
            color="indigo"
          />
          <StatCard
            title="Translated"
            value="--"
            description="Completed translations"
            color="green"
          />
          <StatCard
            title="Pending"
            value="--"
            description="In progress"
            color="yellow"
          />
          <StatCard
            title="Failed"
            value="--"
            description="Need attention"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ActionCard
              href="/translations?filter=unreviewed"
              title="Review Translations"
              description="Review and approve pending translations"
              icon="📝"
            />
            <ActionCard
              href="/translations?filter=failed"
              title="Fix Failed"
              description="Retry or manually fix failed translations"
              icon="🔧"
            />
            <ActionCard
              href="/analytics"
              title="View Analytics"
              description="Translation statistics and cost tracking"
              icon="📊"
            />
          </div>
        </div>

        {/* CTA for non-authenticated users */}
        {!loading && !user && (
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                View Pricing
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {user ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Connect to Firebase to see recent translation activity
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>{' '}
                to view your translation activity
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: 'indigo' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
            <span className="text-white text-xl">📄</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </dd>
              <dd className="text-xs text-gray-400 dark:text-gray-500">
                {description}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center">
        <span className="text-3xl">{icon}</span>
        <div className="ml-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
