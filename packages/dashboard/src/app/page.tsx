'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

// --- Icon Components ---

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-4-4z" />
      <path d="M12 2v4h4" />
      <path d="M8 10h4" />
      <path d="M8 13h4" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.57 2.44L1.18 15.18a1.5 1.5 0 0 0 1.3 2.24h14.86a1.5 1.5 0 0 0 1.3-2.24L11.25 2.44a1.38 1.38 0 0 0-2.68 0z" />
      <path d="M10 7v4" />
      <circle cx="10" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="12" height="15" rx="2" />
      <path d="M7 2h6v2H7z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3.5a3 3 0 0 0-4.24 0l-.71.71L7 7.76 3.05 11.71a1 1 0 0 0 0 1.41l3.54 3.54a1 1 0 0 0 1.41 0L12 12.71l3.54-3.55.71-.71a3 3 0 0 0 0-4.24z" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="3" height="8" rx="0.5" />
      <rect x="8.5" y="6" width="3" height="12" rx="0.5" />
      <rect x="14" y="2" width="3" height="16" rx="0.5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
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

// --- Stat Card ---

type StatColor = 'blue' | 'green' | 'amber' | 'red';

const statColorConfig: Record<StatColor, { iconBg: string; accentFrom: string; accentTo: string; iconColor: string }> = {
  blue: {
    iconBg: 'bg-[rgba(26,58,138,0.2)]',
    accentFrom: 'from-[#1a3a8a]',
    accentTo: 'to-[#2a5fcc]',
    iconColor: 'text-blue-400',
  },
  green: {
    iconBg: 'bg-[rgba(34,197,94,0.15)]',
    accentFrom: 'from-[#15803d]',
    accentTo: 'to-[#22c55e]',
    iconColor: 'text-green-400',
  },
  amber: {
    iconBg: 'bg-[rgba(212,160,23,0.15)]',
    accentFrom: 'from-[#b8860b]',
    accentTo: 'to-[#d4a017]',
    iconColor: 'text-amber-400',
  },
  red: {
    iconBg: 'bg-[rgba(204,50,50,0.15)]',
    accentFrom: 'from-[#991b1b]',
    accentTo: 'to-[#cc3232]',
    iconColor: 'text-red-400',
  },
};

function StatCard({
  title,
  value,
  description,
  color,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  color: StatColor;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const config = statColorConfig[color];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 transition-colors hover:border-[rgba(255,255,255,0.1)]">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.accentFrom} ${config.accentTo} opacity-60`} />

      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} rounded-xl w-10 h-10 flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-[#8090b8]">{title}</p>
          <p className="text-2xl font-normal text-white mt-0.5">{value}</p>
          <p className="text-xs text-[#5a6a8a] mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

// --- Action Card ---

function ActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5 transition-all hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
    >
      <div className="bg-[rgba(255,255,255,0.05)] rounded-xl w-10 h-10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#8090b8]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base text-white">{title}</p>
        <p className="text-sm text-[#5a6a8a] mt-0.5">{description}</p>
      </div>
      <ArrowRightIcon className="w-4 h-4 text-[#5a6a8a] shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// --- Activity Item ---

type ActivityStatus = 'translated' | 'reviewed' | 'failed';

const activityStatusConfig: Record<ActivityStatus, { icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  translated: { icon: CheckCircleIcon, iconColor: 'text-green-500' },
  reviewed: { icon: EyeIcon, iconColor: 'text-amber-500' },
  failed: { icon: XCircleIcon, iconColor: 'text-red-500' },
};

function ActivityItem({
  status,
  path,
  locale,
  time,
  isLast,
}: {
  status: ActivityStatus;
  path: string;
  locale: string;
  time: string;
  isLast?: boolean;
}) {
  const config = activityStatusConfig[status];
  const StatusIcon = config.icon;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={`flex items-center justify-between px-5 py-4 ${!isLast ? 'border-b border-[rgba(255,255,255,0.04)]' : ''}`}>
      <div className="flex items-center gap-3">
        <StatusIcon className={`w-5 h-5 ${config.iconColor} shrink-0`} />
        <div>
          <p className="text-base text-white">
            {label}:{' '}
            <span className="text-white/80">{path}</span>
          </p>
          <p className="text-xs text-[#5a6a8a]">{locale}</p>
        </div>
      </div>
      <span className="text-sm text-[#5a6a8a] shrink-0">{time}</span>
    </div>
  );
}

// --- Background Glow ---

function BackgroundEffects() {
  return (
    <>
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      {/* Blue radial glow top-left */}
      <div
        className="fixed top-0 left-0 w-[600px] h-[600px] -z-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Amber radial glow center */}
      <div
        className="fixed top-[132px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)',
        }}
      />
      {/* Red radial glow bottom-right */}
      <div
        className="fixed top-[564px] right-0 w-[500px] h-[500px] -z-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(204,50,50,0.06) 0%, transparent 70%)',
        }}
      />
    </>
  );
}

// --- Demo data ---

const demoStats = [
  { title: 'Total Documents', value: '156', description: 'Across all collections', color: 'blue' as StatColor, icon: FileTextIcon },
  { title: 'Translated', value: '412', description: 'Completed translations', color: 'green' as StatColor, icon: CheckCircleIcon },
  { title: 'Pending', value: '23', description: 'In progress', color: 'amber' as StatColor, icon: ClockIcon },
  { title: 'Failed', value: '8', description: 'Need attention', color: 'red' as StatColor, icon: AlertTriangleIcon },
];

const demoActions = [
  { href: '/translations?filter=unreviewed', title: 'Review Translations', description: 'Review and approve pending translations', icon: ClipboardCheckIcon },
  { href: '/translations?filter=failed', title: 'Fix Failed', description: 'Retry or manually fix failed translations', icon: WrenchIcon },
  { href: '/analytics', title: 'View Analytics', description: 'Translation statistics and cost tracking', icon: BarChartIcon },
];

const demoActivity: { status: ActivityStatus; path: string; locale: string; time: string }[] = [
  { status: 'translated', path: 'articles/intro-investing', locale: 'ms-MY', time: '2 min ago' },
  { status: 'reviewed', path: 'quiz/credit-score', locale: 'zh-CN', time: '15 min ago' },
  { status: 'failed', path: 'lessons/budgeting', locale: 'ta-IN', time: '1 hour ago' },
  { status: 'translated', path: 'articles/emergency-fund', locale: 'ms-MY', time: '2 hours ago' },
];

// --- Page ---

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />

      <Header />

      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-2 pt-4">
          <h2 className="text-gradient-hero text-4xl sm:text-5xl font-medium tracking-tight">
            Translation Dashboard
          </h2>
          <p className="text-[#8090b8] text-base">
            Review, edit, and manage your Firestore translations
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {demoActions.map((action) => (
              <ActionCard key={action.title} {...action} />
            ))}
          </div>
        </section>

        {/* CTA Buttons */}
        {!loading && !user && (
          <section className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-2xl text-base shadow-[0_10px_15px_rgba(26,58,138,0.25),0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_10px_20px_rgba(26,58,138,0.4)] transition-shadow"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 border border-[rgba(255,255,255,0.12)] text-white rounded-2xl text-base hover:border-[rgba(255,255,255,0.2)] transition-colors"
            >
              View Pricing
            </Link>
          </section>
        )}

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
            {user ? (
              demoActivity.map((item, i) => (
                <ActivityItem
                  key={i}
                  {...item}
                  isLast={i === demoActivity.length - 1}
                />
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-[#5a6a8a]">
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in
                  </Link>{' '}
                  to view your translation activity
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
