'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

interface Project {
  id: string;
  name: string;
  firebaseProjectId: string;
  status: 'active' | 'paused' | 'disconnected';
  config: {
    collections: { path: string; fields: string[]; enabled: boolean }[];
    sourceLocale: string;
    targetLocales: string[];
  };
}

interface TranslationJob {
  id: string;
  documentPath: string;
  targetLocale: string;
  status: string;
  fields: Record<string, string>;
  createdAt: { _seconds: number } | string;
  projectName?: string;
}

interface AnalyticsStats {
  totalDocuments: number;
  totalTranslations: number;
  completed: number;
  pending: number;
  failed: number;
  completionRate: number;
}

interface CollectionStat {
  name: string;
  docs: number;
  translated: number;
  completion: number;
}

interface LanguageStat {
  code: string;
  name: string;
  translated: number;
  completion: number;
}

interface ActivityItem {
  action: 'Translated' | 'Reviewed' | 'Failed';
  doc: string;
  lang: string;
  time: string;
}

// Language display name lookup
const LANGUAGE_NAMES: Record<string, string> = {
  'ms-MY': 'Malay', 'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
  'ta-IN': 'Tamil', 'en': 'English', 'ja': 'Japanese', 'ko': 'Korean',
  'fr': 'French', 'de': 'German', 'es': 'Spanish', 'pt': 'Portuguese',
  'it': 'Italian', 'ar': 'Arabic', 'hi': 'Hindi', 'th': 'Thai',
  'vi': 'Vietnamese', 'id': 'Indonesian', 'nl': 'Dutch', 'ru': 'Russian',
};

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

const LANG_COLORS = ['bg-green-500', 'bg-green-400', 'bg-amber-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'];

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalDocuments: 0, totalTranslations: 0, completed: 0,
    pending: 0, failed: 0, completionRate: 0,
  });
  const [collections, setCollections] = useState<CollectionStat[]>([]);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/analytics');
    }
  }, [user, authLoading, router]);

  // Fetch analytics data from projects + translations
  useEffect(() => {
    if (!user) return;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        // Fetch projects and translations in parallel
        const [projectsRes, translationsRes] = await Promise.all([
          fetch('/api/projects', { headers: { 'x-user-id': user!.uid } }),
          fetch('/api/translations', { headers: { 'x-user-id': user!.uid } }),
        ]);

        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        if (!translationsRes.ok) throw new Error('Failed to fetch translations');

        const projectsData = await projectsRes.json();
        const translationsData = await translationsRes.json();

        const fetchedProjects: Project[] = projectsData.projects || [];
        const jobs: TranslationJob[] = translationsData.translations || [];

        setProjects(fetchedProjects);

        // Calculate stats
        const completed = jobs.filter((j) => j.status === 'completed').length;
        const pending = jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length;
        const failed = jobs.filter((j) => j.status === 'failed').length;
        const total = jobs.length;

        // Count unique document paths
        const uniqueDocs = new Set(jobs.map((j) => j.documentPath));

        setStats({
          totalDocuments: uniqueDocs.size,
          totalTranslations: total,
          completed,
          pending,
          failed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });

        // Calculate per-collection stats
        const collectionMap = new Map<string, { docs: Set<string>; translated: number; total: number }>();
        for (const job of jobs) {
          const parts = job.documentPath.split('/');
          const collName = parts[0] || job.documentPath;
          if (!collectionMap.has(collName)) {
            collectionMap.set(collName, { docs: new Set(), translated: 0, total: 0 });
          }
          const entry = collectionMap.get(collName)!;
          entry.docs.add(job.documentPath);
          entry.total++;
          if (job.status === 'completed') entry.translated++;
        }

        const collStats: CollectionStat[] = Array.from(collectionMap.entries()).map(
          ([name, data]) => ({
            name,
            docs: data.docs.size,
            translated: data.translated,
            completion: data.total > 0 ? Math.round((data.translated / data.total) * 100) : 0,
          })
        );
        setCollections(collStats);

        // Calculate per-language stats
        const langMap = new Map<string, { translated: number; total: number }>();
        for (const job of jobs) {
          const lang = job.targetLocale;
          if (!langMap.has(lang)) {
            langMap.set(lang, { translated: 0, total: 0 });
          }
          const entry = langMap.get(lang)!;
          entry.total++;
          if (job.status === 'completed') entry.translated++;
        }

        const langStats: LanguageStat[] = Array.from(langMap.entries()).map(
          ([code, data]) => ({
            code,
            name: LANGUAGE_NAMES[code] || code,
            translated: data.translated,
            completion: data.total > 0 ? Math.round((data.translated / data.total) * 100) : 0,
          })
        );
        setLanguages(langStats);

        // Build recent activity from the most recent jobs
        const sortedJobs = [...jobs].sort((a, b) => {
          const aTime = typeof a.createdAt === 'object' && a.createdAt._seconds
            ? a.createdAt._seconds
            : 0;
          const bTime = typeof b.createdAt === 'object' && b.createdAt._seconds
            ? b.createdAt._seconds
            : 0;
          return bTime - aTime;
        });

        const activity: ActivityItem[] = sortedJobs.slice(0, 10).map((job) => {
          const statusAction: ActivityStatus =
            job.status === 'failed' ? 'Failed' : 'Translated';

          const createdAt =
            typeof job.createdAt === 'object' && job.createdAt._seconds
              ? new Date(job.createdAt._seconds * 1000).toISOString()
              : undefined;

          return {
            action: statusAction,
            doc: job.documentPath,
            lang: job.targetLocale,
            time: timeAgo(createdAt),
          };
        });
        setRecentActivity(activity);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#1a3a8a] hover:text-[#2a4faa] transition-colors text-base flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-medium text-white">Analytics</h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#8090b8]">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-[rgba(204,50,50,0.2)] bg-[rgba(204,50,50,0.05)] p-6 text-center">
            <p className="text-[#cc3232] mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* No Projects State */}
        {!loading && !error && projects.length === 0 && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-12 text-center">
            <p className="text-white text-lg mb-2">No projects connected</p>
            <p className="text-[#5a6a8a] text-sm mb-4">
              Connect a Firebase project to start seeing analytics.
            </p>
            <Link
              href="/connect"
              className="inline-block px-5 py-2.5 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)]"
            >
              Connect a Project
            </Link>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && projects.length > 0 && (
          <>
            {/* Overview Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsStatCard label="Total Documents" value={stats.totalDocuments} />
              <AnalyticsStatCard label="Total Translations" value={stats.totalTranslations} />
              <AnalyticsStatCard label="Completion Rate" value={`${stats.completionRate}%`} valueColor="text-green-400" />
              <AnalyticsStatCard label="Languages" value={languages.length} valueColor="text-amber-400" />
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
                {collections.length === 0 ? (
                  <p className="text-[#5a6a8a] text-sm text-center py-8">No collections yet</p>
                ) : (
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
                )}
              </div>

              {/* By Language */}
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
                <h3 className="text-base font-medium text-white mb-6">By Language</h3>
                {languages.length === 0 ? (
                  <p className="text-[#5a6a8a] text-sm text-center py-8">No languages yet</p>
                ) : (
                  <div className="space-y-5">
                    {languages.map((l, i) => (
                      <div key={l.code}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-white font-medium">{l.name} ({l.code})</span>
                          <span className="text-[#8090b8]">{l.completion}%</span>
                        </div>
                        <ProgressBar
                          percentage={l.completion}
                          color={LANG_COLORS[i % LANG_COLORS.length]}
                        />
                        <p className="text-xs text-[#5a6a8a] mt-1.5">
                          {l.translated} translations
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-white">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-8 text-center">
                  <p className="text-[#5a6a8a] text-sm">No recent activity</p>
                </div>
              ) : (
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
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
