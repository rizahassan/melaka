'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';

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

interface UsageData {
  planId: string;
  status: string;
  translations: {
    used: number;
    limit: number;
    remaining: number;
    isOverage: boolean;
  };
  projects: {
    count: number;
    limit: number;
  };
  trial?: {
    isTrialing: boolean;
    trialEnd: string | null;
  };
}

interface DashboardStats {
  totalTranslations: number;
  translationsThisMonth: number;
  activeCollections: number;
  targetLanguages: number;
}

// --- Background Effects ---
function BackgroundEffects() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#080a14] via-[#0c0e1a] to-[#10132a] -z-30" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(26,58,138,0.12) 0%, transparent 70%)' }} />
      <div className="fixed top-[132px] left-[calc(50%-151px)] w-[800px] h-[800px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(212,160,23,0.04) 0%, transparent 70%)' }} />
      <div className="fixed top-[364px] right-0 w-[500px] h-[500px] -z-20" style={{ background: 'radial-gradient(circle at center, rgba(204,50,50,0.06) 0%, transparent 70%)' }} />
    </>
  );
}

// --- Stat Card ---
function StatCard({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
      <p className="text-sm text-[#8090b8]">{label}</p>
      <p className={`text-3xl font-normal mt-1 ${valueColor || 'text-white'}`}>{value}</p>
    </div>
  );
}

// --- Status Badge ---
function StatusBadge({ status }: { status: 'active' | 'paused' | 'disconnected' }) {
  const styles = {
    active: 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)] text-[#22c55e]',
    paused: 'bg-[rgba(212,160,23,0.1)] border-[rgba(212,160,23,0.2)] text-[#d4a017]',
    disconnected: 'bg-[rgba(204,50,50,0.1)] border-[rgba(204,50,50,0.2)] text-[#cc3232]',
  };

  return (
    <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      // Fetch projects and usage in parallel
      const [projectsRes, usageRes] = await Promise.all([
        fetch('/api/projects', { headers: { 'x-user-id': user?.uid || '' } }),
        fetch('/api/usage', { headers: { 'x-user-id': user?.uid || '' } }),
      ]);
      
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
        
        // Calculate stats from projects
        if (data.projects?.length > 0) {
          const project = data.projects[0];
          setStats({
            totalTranslations: 0,
            translationsThisMonth: 0,
            activeCollections: project.config.collections.filter((c: { enabled: boolean }) => c.enabled !== false).length,
            targetLanguages: project.config.targetLocales.length,
          });
        }
      }
      
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
        // Update stats with usage data
        setStats(prev => prev ? {
          ...prev,
          totalTranslations: usageData.translations?.used || 0,
          translationsThisMonth: usageData.translations?.used || 0,
        } : null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingProjects(false);
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <BackgroundEffects />
        <div className="noise-overlay" />
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#8090b8]">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-white">Dashboard</h1>
        </div>

        {/* Loading State */}
        {loadingProjects && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#8090b8]">Loading projects...</p>
            </div>
          </div>
        )}

        {/* No projects - show onboarding */}
        {!loadingProjects && projects.length === 0 && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-12 text-center">
            <p className="text-white text-lg mb-2">Welcome to Melaka Cloud!</p>
            <p className="text-[#5a6a8a] text-sm mb-6 max-w-md mx-auto">
              Connect your Firebase project to start translating your Firestore content automatically.
            </p>
            <Link
              href="/connect"
              className="inline-block px-6 py-3 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow"
            >
              Connect Firebase Project
            </Link>
          </div>
        )}

        {/* Has projects - show dashboard */}
        {!loadingProjects && projects.length > 0 && (
          <>
            {/* Usage Banner */}
            {usage && (
              <section className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-medium text-white">
                      {usage.planId.charAt(0).toUpperCase() + usage.planId.slice(1)} Plan
                      {usage.trial?.isTrialing && (
                        <span className="ml-2 text-xs bg-[rgba(212,160,23,0.2)] text-[#d4a017] px-2 py-0.5 rounded-full">
                          Trial
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-[#5a6a8a] mt-0.5">
                      {usage.translations.limit === -1 
                        ? 'Unlimited translations (self-hosted)'
                        : `${usage.translations.used.toLocaleString()} / ${usage.translations.limit.toLocaleString()} translations this month`
                      }
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
                  >
                    {usage.planId === 'free' ? 'Upgrade' : 'Manage Plan'} →
                  </Link>
                </div>
                {usage.translations.limit !== -1 && (
                  <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${usage.translations.isOverage ? 'bg-[#cc3232]' : 'bg-[#22c55e]'}`}
                      style={{ width: `${Math.min(100, (usage.translations.used / usage.translations.limit) * 100)}%` }} 
                    />
                  </div>
                )}
              </section>
            )}

            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Translations" value={stats?.totalTranslations || 0} />
              <StatCard label="This Month" value={stats?.translationsThisMonth || 0} />
              <StatCard label="Collections" value={stats?.activeCollections || 0} valueColor="text-[#2a4faa]" />
              <StatCard label="Languages" value={stats?.targetLanguages || 0} valueColor="text-[#d4a017]" />
            </section>

            {/* Projects List */}
            <section>
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                  <h2 className="text-base font-medium text-white">Your Projects</h2>
                  <Link
                    href="/connect"
                    className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
                  >
                    + Add Project
                  </Link>
                </div>
                <div>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <div>
                        <p className="text-base font-medium text-white">{project.name}</p>
                        <p className="text-xs text-[#5a6a8a] mt-0.5">{project.firebaseProjectId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={project.status} />
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
                        >
                          Manage →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/translations"
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-[rgba(255,255,255,0.12)] transition-colors group"
              >
                <h3 className="text-base font-medium text-white mb-1.5 group-hover:text-white">Review Translations</h3>
                <p className="text-sm text-[#5a6a8a]">View and edit your translations</p>
              </Link>
              <Link
                href="/analytics"
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-[rgba(255,255,255,0.12)] transition-colors group"
              >
                <h3 className="text-base font-medium text-white mb-1.5 group-hover:text-white">Analytics</h3>
                <p className="text-sm text-[#5a6a8a]">Translation stats and usage</p>
              </Link>
              <Link
                href="/settings"
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-[rgba(255,255,255,0.12)] transition-colors group"
              >
                <h3 className="text-base font-medium text-white mb-1.5 group-hover:text-white">Settings</h3>
                <p className="text-sm text-[#5a6a8a]">Configure languages and billing</p>
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
