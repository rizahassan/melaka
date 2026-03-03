'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
      <div className="fixed top-[125px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)' }} />
      <div className="fixed top-[549px] right-0 w-[500px] h-[500px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(204,50,50,0.06) 0%, transparent 70%)' }} />
    </>
  );
}

// --- Stat Card ---
function AnalyticsStatCard({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
      <p className="text-sm text-[#8090b8]">{label}</p>
      <p className={`text-3xl font-normal mt-1 ${valueColor || 'text-white'}`}>{value}</p>
    </div>
  );
}

// --- Progress Ring ---
function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const completedDash = (percentage / 100) * circumference;
  const pendingPct = 5.2; // ~23/443
  const failedPct = 1.8; // ~8/443
  const pendingDash = (pendingPct / 100) * circumference;
  const failedDash = (failedPct / 100) * circumference;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
        {/* Background track */}
        <circle cx="88" cy="88" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {/* Completed (green) */}
        <circle
          cx="88" cy="88" r={radius} fill="none"
          stroke="#22c55e" strokeWidth="14"
          strokeDasharray={`${completedDash} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Pending (amber) */}
        <circle
          cx="88" cy="88" r={radius} fill="none"
          stroke="#d4a017" strokeWidth="14"
          strokeDasharray={`${pendingDash} ${circumference}`}
          strokeDashoffset={`-${completedDash}`}
          strokeLinecap="round"
        />
        {/* Failed (red) */}
        <circle
          cx="88" cy="88" r={radius} fill="none"
          stroke="#cc3232" strokeWidth="14"
          strokeDasharray={`${failedDash} ${circumference}`}
          strokeDashoffset={`-${completedDash + pendingDash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-medium text-white">{percentage}%</span>
      </div>
    </div>
  );
}

// --- Progress Bar ---
function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

// --- Activity Icons ---
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M12.5 7.5l-5 5M7.5 7.5l5 5" />
    </svg>
  );
}

type ActivityStatus = 'Translated' | 'Reviewed' | 'Failed';

const activityConfig: Record<ActivityStatus, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Translated: { icon: CheckCircleIcon, color: 'text-green-500' },
  Reviewed: { icon: EyeIcon, color: 'text-amber-500' },
  Failed: { icon: XCircleIcon, color: 'text-red-500' },
};

export default function AnalyticsPage() {
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

  const recentActivity: { action: ActivityStatus; doc: string; lang: string; time: string }[] = [
    { action: 'Translated', doc: 'articles/intro-investing', lang: 'ms-MY', time: '2 min ago' },
    { action: 'Reviewed', doc: 'quiz/credit-score', lang: 'zh-CN', time: '15 min ago' },
    { action: 'Failed', doc: 'lessons/budgeting', lang: 'ta-IN', time: '1 hour ago' },
    { action: 'Translated', doc: 'articles/emergency-fund', lang: 'ms-MY', time: '2 hours ago' },
  ];

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#1a3a8a] hover:text-[#2a4faa] transition-colors text-base flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-medium text-white">Analytics</h1>
        </div>

        {/* Overview Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard label="Total Documents" value={stats.totalDocuments} />
          <AnalyticsStatCard label="Total Translations" value={stats.totalTranslations} />
          <AnalyticsStatCard label="Completion Rate" value={`${stats.completionRate}%`} valueColor="text-green-400" />
          <AnalyticsStatCard label="Review Rate" value={`${stats.reviewRate}%`} valueColor="text-amber-400" />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Translation Status Ring */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <h3 className="text-base font-medium text-white mb-6">Translation Status</h3>
            <ProgressRing percentage={stats.completionRate} />
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-normal text-green-400">{stats.completed}</p>
                <p className="text-xs text-[#5a6a8a]">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-normal text-amber-400">{stats.pending}</p>
                <p className="text-xs text-[#5a6a8a]">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-normal text-red-400">{stats.failed}</p>
                <p className="text-xs text-[#5a6a8a]">Failed</p>
              </div>
            </div>
          </div>

          {/* By Collection */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <h3 className="text-base font-medium text-white mb-6">By Collection</h3>
            <div className="space-y-5">
              {collections.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-[#8090b8]">{c.completion}%</span>
                  </div>
                  <ProgressBar percentage={c.completion} color="bg-blue-500" />
                  <p className="text-xs text-[#5a6a8a] mt-1.5">
                    {c.translated} translations from {c.docs} docs
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* By Language */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <h3 className="text-base font-medium text-white mb-6">By Language</h3>
            <div className="space-y-5">
              {languages.map((l) => (
                <div key={l.code}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white font-medium">{l.name} ({l.code})</span>
                    <span className="text-[#8090b8]">{l.completion}%</span>
                  </div>
                  <ProgressBar
                    percentage={l.completion}
                    color={l.code === 'ms-MY' ? 'bg-green-500' : l.code === 'zh-CN' ? 'bg-green-400' : 'bg-amber-400'}
                  />
                  <p className="text-xs text-[#5a6a8a] mt-1.5">
                    {l.translated} translations
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
            {recentActivity.map((activity, i) => {
              const config = activityConfig[activity.action];
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < recentActivity.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${config.color} shrink-0`} />
                    <div>
                      <p className="text-base text-white">
                        {activity.action}:{' '}
                        <span className="text-white/80">{activity.doc}</span>
                      </p>
                      <p className="text-xs text-[#5a6a8a]">{activity.lang}</p>
                    </div>
                  </div>
                  <span className="text-sm text-[#5a6a8a] shrink-0">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
