'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { RealTimeStatus } from '@/components/RealTimeStatus';
import { useAuth } from '@/lib/auth';

interface Translation {
  id: string;
  collection: string;
  documentId: string;
  language: string;
  fields: {
    name: string;
    source: string;
    translation: string;
  }[];
  status: 'completed' | 'pending' | 'failed';
  reviewed: boolean;
  translatedAt?: string;
  projectName?: string;
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

// --- Filter Button ---
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
        active
          ? 'bg-[#1a3a8a] text-white'
          : 'text-[#8090b8] hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// --- Status Badge ---
function StatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const styles = {
    completed: 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)] text-[#22c55e]',
    pending: 'bg-[rgba(212,160,23,0.1)] border-[rgba(212,160,23,0.2)] text-[#d4a017]',
    failed: 'bg-[rgba(204,50,50,0.1)] border-[rgba(204,50,50,0.2)] text-[#cc3232]',
  };

  return (
    <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}

// --- Field Editor ---
function FieldEditor({
  field,
  onSave,
}: {
  field: { name: string; source: string; translation: string };
  onSave: (newValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(field.translation);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  return (
    <div className="p-5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#8090b8] uppercase tracking-wide">
          {field.name}
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[#1a3a8a] hover:text-[#2a4faa] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#5a6a8a] mb-1.5">Source (EN)</p>
          <p className="text-sm text-white/90 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3 rounded-xl">
            {field.source}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5a6a8a] mb-1.5">Translation</p>
          {editing ? (
            <div>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white focus:ring-1 focus:ring-[#1a3a8a] focus:border-[#1a3a8a] outline-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm shadow-[0_4px_6px_rgba(26,58,138,0.25)]"
                >
                  Save
                </button>
                <button
                  onClick={() => { setValue(field.translation); setEditing(false); }}
                  className="px-4 py-1.5 border border-[rgba(255,255,255,0.12)] text-white rounded-xl text-sm hover:border-[rgba(255,255,255,0.2)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/90 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3 rounded-xl">
              {field.translation || <span className="text-[#cc3232] italic">Missing</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Page ---
export default function TranslationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'failed'>('all');
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/translations');
    }
  }, [user, authLoading, router]);

  // Fetch translations function (extracted for re-use)
  const fetchTranslations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/translations', {
        headers: { 'x-user-id': user.uid },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch translations');
      }

      const data = await res.json();

      // Transform API response (TranslationJobDoc) to Translation format
      const mapped: Translation[] = (data.translations || []).map(
        (job: {
          id: string;
          documentPath: string;
          targetLocale: string;
          fields: Record<string, string>;
          status: string;
          createdAt: { _seconds: number } | string;
          projectName?: string;
        }) => {
          // Extract collection and documentId from documentPath (e.g. "articles/article-001")
          const pathParts = job.documentPath.split('/');
          const collection = pathParts.slice(0, -1).join('/') || pathParts[0];
          const documentId = pathParts[pathParts.length - 1];

          // Map fields from Record<string, string> to array format
          const fieldEntries = Object.entries(job.fields || {}).map(
            ([name, source]) => ({
              name,
              source: source as string,
              translation: '', // Source fields stored; translations are written to Firestore docs directly
            })
          );

          // Map status
          const statusMap: Record<string, 'completed' | 'pending' | 'failed'> = {
            completed: 'completed',
            pending: 'pending',
            processing: 'pending',
            failed: 'failed',
          };

          return {
            id: job.id,
            collection,
            documentId,
            language: job.targetLocale,
            fields: fieldEntries,
            status: statusMap[job.status] || 'pending',
            reviewed: false,
            translatedAt:
              typeof job.createdAt === 'object' && job.createdAt._seconds
                ? new Date(job.createdAt._seconds * 1000).toISOString()
                : undefined,
            projectName: job.projectName,
          };
        }
      );

      setTranslations(mapped);
    } catch (err) {
      console.error('Failed to fetch translations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch translations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch translations on mount
  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const filteredTranslations = translations.filter((t) => {
    if (filter === 'unreviewed') return !t.reviewed && t.status === 'completed';
    if (filter === 'failed') return t.status === 'failed';
    return true;
  });

  const handleMarkReviewed = (id: string) => {
    setTranslations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, reviewed: true } : t))
    );
    if (selectedTranslation?.id === id) {
      setSelectedTranslation({ ...selectedTranslation, reviewed: true });
    }
  };

  const handleSaveEdit = (id: string, fieldName: string, newValue: string) => {
    setTranslations((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          fields: t.fields.map((f) =>
            f.name === fieldName ? { ...f, translation: newValue } : f
          ),
        };
      })
    );
  };

  return (
    <main className="relative min-h-screen">
      <BackgroundEffects />
      <div className="noise-overlay" />
      <Header />

      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[#1a3a8a] hover:text-[#2a4faa] transition-colors text-base flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-medium text-white">Translations</h1>
          </div>

          {/* Filter Tabs */}
          <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-1 flex items-center gap-1">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
            <FilterButton active={filter === 'unreviewed'} onClick={() => setFilter('unreviewed')}>Unreviewed</FilterButton>
            <FilterButton active={filter === 'failed'} onClick={() => setFilter('failed')}>Failed</FilterButton>
          </div>
        </div>

        {/* Real-time Translation Status */}
        {user && (
          <RealTimeStatus
            userId={user.uid}
            pollInterval={5000}
            onStatusChange={() => {
              // Re-fetch translations when status changes (jobs complete, etc.)
              fetchTranslations();
            }}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#8090b8]">Loading translations...</p>
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

        {/* Empty State */}
        {!loading && !error && translations.length === 0 && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-12 text-center">
            <p className="text-white text-lg mb-2">No translations yet</p>
            <p className="text-[#5a6a8a] text-sm mb-4">
              Translation jobs will appear here once your connected projects start processing documents.
            </p>
            <Link
              href="/connect"
              className="inline-block px-5 py-2.5 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)]"
            >
              Connect a Project
            </Link>
          </div>
        )}

        {/* Two-column layout */}
        {!loading && !error && translations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Translation List */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
            {/* Count header */}
            <div className="px-5 pt-4 pb-3 border-b border-[rgba(255,255,255,0.04)]">
              <p className="text-base text-white">{filteredTranslations.length} Translations</p>
            </div>

            {/* List */}
            <div className="max-h-[65vh] overflow-y-auto">
              {filteredTranslations.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTranslation(t)}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 transition-colors text-left ${
                    selectedTranslation?.id === t.id
                      ? 'bg-[rgba(26,58,138,0.12)]'
                      : 'hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div>
                    <p className="text-base font-medium text-white">
                      {t.collection}/{t.documentId}
                    </p>
                    <p className="text-xs font-medium text-[#5a6a8a] mt-0.5">
                      {t.language} · {t.fields.length} fields
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    {t.reviewed && (
                      <span className="text-[#22c55e]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 8l3 3 5-5" />
                        </svg>
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {filteredTranslations.length === 0 && (
                <div className="px-5 py-12 text-center text-[#5a6a8a]">
                  No translations found
                </div>
              )}
            </div>
          </div>

          {/* Review Panel */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
            {selectedTranslation ? (
              <>
                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-white">
                      {selectedTranslation.documentId}
                    </h2>
                    <p className="text-xs text-[#5a6a8a] mt-0.5">
                      {selectedTranslation.collection} · {selectedTranslation.language}
                    </p>
                  </div>
                  {!selectedTranslation.reviewed && selectedTranslation.status === 'completed' && (
                    <button
                      onClick={() => handleMarkReviewed(selectedTranslation.id)}
                      className="px-4 py-2 bg-gradient-to-b from-[#15803d] to-[#22c55e] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(21,128,61,0.25)] hover:shadow-[0_6px_10px_rgba(21,128,61,0.35)] transition-shadow"
                    >
                      ✓ Mark Reviewed
                    </button>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {selectedTranslation.fields.map((field) => (
                    <FieldEditor
                      key={field.name}
                      field={field}
                      onSave={(newValue) =>
                        handleSaveEdit(selectedTranslation.id, field.name, newValue)
                      }
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-[#5a6a8a] text-base">Select a translation to review</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
