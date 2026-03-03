'use client';

import Link from 'next/link';

export default function AnalyticsPage() {
  // Mock data
  const stats = {
    totalDocuments: 156,
    totalTranslations: 468,
    completed: 412,
    pending: 23,
    failed: 8,
    reviewed: 298,
    completionRate: 88,
    reviewRate: 72,
  };

  const collections = [
    { name: 'articles', docs: 78, translated: 156, completion: 100 },
    { name: 'quiz', docs: 45, translated: 82, completion: 91 },
    { name: 'lessons', docs: 33, translated: 54, completion: 82 },
  ];

  const languages = [
    { code: 'ms-MY', name: 'Malay', translated: 145, completion: 93 },
    { code: 'zh-CN', name: 'Chinese', translated: 142, completion: 91 },
    { code: 'ta-IN', name: 'Tamil', translated: 125, completion: 80 },
  ];

  const recentActivity = [
    { action: 'Translated', doc: 'articles/intro-investing', lang: 'ms-MY', time: '2 min ago' },
    { action: 'Reviewed', doc: 'quiz/credit-score', lang: 'zh-CN', time: '15 min ago' },
    { action: 'Failed', doc: 'lessons/budgeting', lang: 'ta-IN', time: '1 hour ago' },
    { action: 'Translated', doc: 'articles/emergency-fund', lang: 'ms-MY', time: '2 hours ago' },
  ];

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
              Analytics
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Documents" value={stats.totalDocuments} />
          <StatCard label="Total Translations" value={stats.totalTranslations} />
          <StatCard
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color="green"
          />
          <StatCard
            label="Review Rate"
            value={`${stats.reviewRate}%`}
            color="indigo"
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Ring */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Translation Status
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${stats.completionRate * 4.4} 440`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.completionRate}%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </div>

          {/* By Collection */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              By Collection
            </h3>
            <div className="space-y-4">
              {collections.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{c.name}</span>
                    <span className="text-gray-500">{c.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${c.completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.translated} translations from {c.docs} docs
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* By Language */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              By Language
            </h3>
            <div className="space-y-4">
              {languages.map((l) => (
                <div key={l.code}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      {l.name} ({l.code})
                    </span>
                    <span className="text-gray-500">{l.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${l.completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {l.translated} translations
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.map((activity, i) => (
              <li key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ActivityIcon action={activity.action} />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.action}: <span className="font-medium">{activity.doc}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.lang}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: string | number;
  color?: 'gray' | 'green' | 'indigo';
}) {
  const colorClasses = {
    gray: 'text-gray-900 dark:text-white',
    green: 'text-green-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

function ActivityIcon({ action }: { action: string }) {
  const icons: Record<string, { icon: string; color: string }> = {
    Translated: { icon: '✓', color: 'bg-green-100 text-green-600' },
    Reviewed: { icon: '👁', color: 'bg-indigo-100 text-indigo-600' },
    Failed: { icon: '✗', color: 'bg-red-100 text-red-600' },
  };

  const { icon, color } = icons[action] || { icon: '?', color: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </span>
  );
}
