'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { CollectionSelector } from '@/components/CollectionSelector';
import { useAuth } from '@/lib/auth';
import { PLANS, redirectToPortal } from '@/lib/stripe';

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

interface SubscriptionData {
  planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
}

interface UsageData {
  totalTranslations: number;
  totalDocuments: number;
  byProject: {
    projectId: string;
    projectName: string;
    totalJobs: number;
    completed: number;
    failed: number;
    pending: number;
  }[];
  period: { start: string; end: string };
}

// Language options with display names
const AVAILABLE_LANGUAGES: { code: string; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Malay' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ta', name: 'Tamil' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
];

// Language display name lookup
const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  AVAILABLE_LANGUAGES.map(({ code, name }) => [code, name])
);

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

function LanguageBadge({ code, name }: { code: string; name: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-sm text-[#8090b8]">
      {name} <span className="ml-1 text-[#5a6a8a]">({code})</span>
    </span>
  );
}

function ProjectStatusBadge({ status }: { status: 'active' | 'paused' | 'disconnected' }) {
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

function SubscriptionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)] text-[#22c55e]',
    trialing: 'bg-[rgba(26,58,138,0.15)] border-[rgba(26,58,138,0.3)] text-[#4a7cff]',
    past_due: 'bg-[rgba(212,160,23,0.1)] border-[rgba(212,160,23,0.2)] text-[#d4a017]',
    canceled: 'bg-[rgba(204,50,50,0.1)] border-[rgba(204,50,50,0.2)] text-[#cc3232]',
  };

  const labels: Record<string, string> = {
    active: 'Active',
    trialing: 'Free Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
  };

  return (
    <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
      {labels[status] || status.replace('_', ' ')}
    </span>
  );
}

function SettingsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingLanguages, setSavingLanguages] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);
  const [selectedSourceLocale, setSelectedSourceLocale] = useState<string>('en');
  const [selectedTargetLocales, setSelectedTargetLocales] = useState<string[]>([]);

  // Show success message from Stripe checkout redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Subscription activated successfully!');
      router.replace('/settings', { scroll: false });
    }
  }, [searchParams, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/settings');
    }
  }, [user, authLoading, router]);

  // Fetch all data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [projectsRes, subRes, usageRes] = await Promise.all([
          fetch('/api/projects', { headers: { 'x-user-id': user!.uid } }),
          fetch('/api/subscription', { headers: { 'x-user-id': user!.uid } }),
          fetch('/api/usage', { headers: { 'x-user-id': user!.uid } }),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects || []);
        }

        if (subRes.ok) {
          const data = await subRes.json();
          setSubscription(data.subscription);
        }

        if (usageRes.ok) {
          const data = await usageRes.json();
          setUsage(data.usage);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleDisconnect = async (projectId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to disconnect this project? This will stop all active translations.')) {
      return;
    }

    setDisconnecting(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to disconnect project');
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setSuccessMessage('Project disconnected successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to disconnect project');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      await redirectToPortal(user.uid);
    } catch (err) {
      console.error('Portal error:', err);
      alert(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const activeProject = projects.find((p) => p.status === 'active') || projects[0];
  const planId = subscription?.planId || 'free';
  const currentPlan = PLANS[planId as keyof typeof PLANS] || PLANS.free;

  // Initialize language editing state when project loads
  useEffect(() => {
    if (activeProject) {
      setSelectedSourceLocale(activeProject.config.sourceLocale || 'en');
      setSelectedTargetLocales(activeProject.config.targetLocales || []);
    }
  }, [activeProject]);

  const handleSaveLanguages = async () => {
    if (!user || !activeProject) return;
    
    setSavingLanguages(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          sourceLocale: selectedSourceLocale,
          targetLocales: selectedTargetLocales,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save languages');
      }

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                config: {
                  ...p.config,
                  sourceLocale: selectedSourceLocale,
                  targetLocales: selectedTargetLocales,
                },
              }
            : p
        )
      );
      setEditingLanguages(false);
      setSuccessMessage('Language settings saved!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save languages');
    } finally {
      setSavingLanguages(false);
    }
  };

  const toggleTargetLocale = (code: string) => {
    setSelectedTargetLocales((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto px-6 pt-8 pb-16 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-[#1a3a8a] hover:text-[#2a4faa] transition-colors text-base flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-medium text-white">Settings</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-2xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] p-4 flex items-center justify-between">
          <p className="text-[#22c55e] text-sm">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-[#22c55e] hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#8090b8]">Loading settings...</p>
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

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Subscription / Plan */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-white">Subscription</h2>
              {subscription && <SubscriptionBadge status={subscription.status} />}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <div>
                <p className="text-white font-medium">{currentPlan.name} Plan</p>
                <p className="text-[#5a6a8a] text-sm mt-0.5">
                  {currentPlan.price === 0 ? 'Self-hosted · Free forever' : `$${currentPlan.price}/month · Fully managed`}
                </p>
                {subscription?.currentPeriodEnd && subscription.planId !== 'free' && (
                  <p className="text-[#5a6a8a] text-xs mt-1">
                    {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {subscription?.planId === 'free' || !subscription ? (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow"
                  >
                    Upgrade to Pro
                  </Link>
                ) : (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="px-4 py-2 border border-[rgba(255,255,255,0.12)] text-white rounded-xl text-sm font-medium hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-all disabled:opacity-50"
                  >
                    {portalLoading ? 'Loading...' : 'Manage Billing'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage This Month */}
          {usage && (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
              <h2 className="text-base font-medium text-white mb-4">Usage This Month</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-center">
                  <p className="text-2xl font-semibold text-white">{usage.totalDocuments}</p>
                  <p className="text-xs text-[#5a6a8a] mt-1">Total Jobs</p>
                </div>
                <div className="p-4 rounded-xl border border-[rgba(34,197,94,0.15)] bg-[rgba(34,197,94,0.05)] text-center">
                  <p className="text-2xl font-semibold text-[#22c55e]">{usage.totalTranslations}</p>
                  <p className="text-xs text-[#5a6a8a] mt-1">Completed</p>
                </div>
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-center">
                  <p className="text-2xl font-semibold text-white">{usage.byProject?.length ?? 0}</p>
                  <p className="text-xs text-[#5a6a8a] mt-1">Projects</p>
                </div>
              </div>

              {(usage.byProject?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  {usage.byProject?.map((p) => (
                    <div key={p.projectId} className="flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                      <span className="text-sm text-white">{p.projectName}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#22c55e]">{p.completed} done</span>
                        {p.pending > 0 && <span className="text-[#d4a017]">{p.pending} pending</span>}
                        {p.failed > 0 && <span className="text-[#cc3232]">{p.failed} failed</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Firebase Connection */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
            <h2 className="text-base font-medium text-white mb-4">
              Firebase Connection
            </h2>

            {projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#5a6a8a] text-sm mb-4">No projects connected</p>
                <Link
                  href="/connect"
                  className="inline-block px-5 py-2.5 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)]"
                >
                  Connect a Project
                </Link>
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-4 bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)] rounded-xl mb-3 last:mb-0"
                  >
                    <span className="text-[#22c55e]">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="10" cy="10" r="8" />
                        <path d="M7 10l2 2 4-4" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {project.name}
                      </p>
                      <p className="text-[#5a6a8a] text-xs mt-0.5">
                        {project.firebaseProjectId}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                    <button
                      onClick={() => handleDisconnect(project.id)}
                      disabled={disconnecting === project.id}
                      className="ml-2 px-3 py-1.5 text-xs font-medium text-[#cc3232] border border-[rgba(204,50,50,0.2)] rounded-lg hover:bg-[rgba(204,50,50,0.1)] transition-all disabled:opacity-50"
                    >
                      {disconnecting === project.id ? 'Removing...' : 'Disconnect'}
                    </button>
                  </div>
                ))}

                <div className="mt-4">
                  <Link
                    href="/connect"
                    className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
                  >
                    + Connect another project
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Languages */}
          {activeProject && (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-white">Languages</h2>
                {!editingLanguages ? (
                  <button
                    onClick={() => setEditingLanguages(true)}
                    className="text-sm text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLanguages(false);
                        setSelectedSourceLocale(activeProject.config.sourceLocale || 'en');
                        setSelectedTargetLocales(activeProject.config.targetLocales || []);
                      }}
                      className="text-sm text-[#5a6a8a] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLanguages}
                      disabled={savingLanguages}
                      className="text-sm text-[#22c55e] hover:text-[#2ed573] transition-colors disabled:opacity-50"
                    >
                      {savingLanguages ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {!editingLanguages ? (
                <>
                  <p className="text-[#8090b8] text-sm mb-4">
                    Source: <span className="text-white">{LANGUAGE_NAMES[activeProject.config.sourceLocale] || activeProject.config.sourceLocale}</span>
                    {' · '}Target languages for <span className="text-white">{activeProject.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.config.targetLocales.length > 0 ? (
                      activeProject.config.targetLocales.map((locale) => (
                        <LanguageBadge
                          key={locale}
                          code={locale}
                          name={LANGUAGE_NAMES[locale] || locale}
                        />
                      ))
                    ) : (
                      <p className="text-[#5a6a8a] text-sm">No target languages configured. Click Edit to add languages.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Source Language */}
                  <div>
                    <label className="block text-sm text-[#8090b8] mb-2">Source Language</label>
                    <select
                      value={selectedSourceLocale}
                      onChange={(e) => setSelectedSourceLocale(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-white text-sm focus:outline-none focus:border-[#1a3a8a] transition-colors"
                    >
                      {AVAILABLE_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-[#0c0e1a]">
                          {lang.name} ({lang.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Languages */}
                  <div>
                    <label className="block text-sm text-[#8090b8] mb-2">
                      Target Languages <span className="text-[#5a6a8a]">({selectedTargetLocales.length} selected)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                      {AVAILABLE_LANGUAGES.filter((lang) => lang.code !== selectedSourceLocale).map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => toggleTargetLocale(lang.code)}
                          className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                            selectedTargetLocales.includes(lang.code)
                              ? 'bg-[rgba(26,58,138,0.2)] border border-[#1a3a8a] text-white'
                              : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#8090b8] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {selectedTargetLocales.includes(lang.code) && (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7l3 3 5-6" />
                              </svg>
                            )}
                            {lang.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collections */}
          {activeProject && user && (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6">
              <CollectionSelector
                currentCollections={activeProject.config.collections}
                onSave={async (collections) => {
                  const res = await fetch(`/api/projects/${activeProject.id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-user-id': user.uid,
                    },
                    body: JSON.stringify({ collections }),
                  });

                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to save collections');
                  }

                  // Update local state
                  setProjects((prev) =>
                    prev.map((p) =>
                      p.id === activeProject.id
                        ? { ...p, config: { ...p.config, collections } }
                        : p
                    )
                  );
                  setSuccessMessage('Collection configuration saved!');
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
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
        <SettingsContent />
      </Suspense>
    </main>
  );
}
