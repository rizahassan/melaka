'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface StatusCounts {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface ActiveJob {
  id: string;
  documentPath: string;
  targetLocale: string;
  status: 'pending' | 'processing';
  projectName: string;
  projectId: string;
  attempts: number;
  error: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

interface RecentJob {
  id: string;
  documentPath: string;
  targetLocale: string;
  projectName: string;
  updatedAt: unknown;
}

interface TranslationStatusData {
  status: StatusCounts;
  activeJobs: ActiveJob[];
  recentCompleted: RecentJob[];
  lastUpdated: string;
}

interface RealTimeStatusProps {
  userId: string;
  projectId?: string;
  /** Polling interval in milliseconds (default: 5000) */
  pollInterval?: number;
  /** Called when status changes (e.g. jobs complete) so parent can refresh */
  onStatusChange?: (status: StatusCounts) => void;
}

export function RealTimeStatus({
  userId,
  projectId,
  pollInterval = 5000,
  onStatusChange,
}: RealTimeStatusProps) {
  const [data, setData] = useState<TranslationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<StatusCounts | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.set('projectId', projectId);

      const res = await fetch(`/api/translations/status?${params}`, {
        headers: { 'x-user-id': userId },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch status');
      }

      const newData: TranslationStatusData = await res.json();
      setData(newData);
      setError(null);

      // Notify parent if status changed
      if (prevStatusRef.current && onStatusChange) {
        const prev = prevStatusRef.current;
        if (
          prev.completed !== newData.status.completed ||
          prev.failed !== newData.status.failed ||
          prev.pending !== newData.status.pending ||
          prev.processing !== newData.status.processing
        ) {
          onStatusChange(newData.status);
        }
      }
      prevStatusRef.current = newData.status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [userId, projectId, onStatusChange]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Polling
  useEffect(() => {
    if (!pollInterval) return;

    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, pollInterval]);

  const hasActiveWork = data && (data.status.pending > 0 || data.status.processing > 0);

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1a3a8a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#5a6a8a]">Loading status...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-[rgba(204,50,50,0.15)] bg-[rgba(204,50,50,0.05)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#cc3232]">{error}</span>
          <button onClick={fetchStatus} className="text-xs text-[#1a3a8a] hover:text-[#2a4faa]">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`rounded-2xl border transition-all ${
      hasActiveWork
        ? 'border-[rgba(26,58,138,0.25)] bg-[rgba(26,58,138,0.05)]'
        : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]'
    }`}>
      {/* Summary bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          {hasActiveWork && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]" />
            </span>
          )}

          <span className="text-sm font-medium text-white">
            {hasActiveWork
              ? `${data.status.processing} processing · ${data.status.pending} queued`
              : 'All translations up to date'}
          </span>

          {error && (
            <span className="text-xs text-[#d4a017]">· connection issue</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status pills */}
          <div className="flex items-center gap-2">
            {data.status.completed > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#22c55e]">
                {data.status.completed} done
              </span>
            )}
            {data.status.failed > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[rgba(204,50,50,0.1)] border border-[rgba(204,50,50,0.2)] text-[#cc3232]">
                {data.status.failed} failed
              </span>
            )}
          </div>

          {/* Expand icon */}
          <svg
            className={`w-4 h-4 text-[#5a6a8a] transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.04)]">
          {/* Status grid */}
          <div className="grid grid-cols-4 gap-3 mt-4 mb-4">
            <StatusCard label="Pending" count={data.status.pending} color="#d4a017" />
            <StatusCard label="Processing" count={data.status.processing} color="#4a7cff" active />
            <StatusCard label="Completed" count={data.status.completed} color="#22c55e" />
            <StatusCard label="Failed" count={data.status.failed} color="#cc3232" />
          </div>

          {/* Active jobs */}
          {data.activeJobs.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-[#8090b8] uppercase tracking-wide mb-2">
                Active Jobs
              </p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {data.activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]"
                  >
                    {/* Status indicator */}
                    {job.status === 'processing' ? (
                      <div className="w-4 h-4 border-2 border-[#4a7cff] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[rgba(212,160,23,0.4)] shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{job.documentPath}</p>
                      <p className="text-xs text-[#5a6a8a]">
                        {job.targetLocale} · {job.projectName}
                        {job.attempts > 1 && (
                          <span className="text-[#d4a017]"> · attempt {job.attempts}</span>
                        )}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-xs border shrink-0 ${
                      job.status === 'processing'
                        ? 'bg-[rgba(74,124,255,0.1)] border-[rgba(74,124,255,0.2)] text-[#4a7cff]'
                        : 'bg-[rgba(212,160,23,0.1)] border-[rgba(212,160,23,0.2)] text-[#d4a017]'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently completed */}
          {data.recentCompleted.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-[#8090b8] uppercase tracking-wide mb-2">
                Recently Completed
              </p>
              <div className="space-y-1">
                {data.recentCompleted.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs text-[#5a6a8a]"
                  >
                    <svg className="w-3.5 h-3.5 text-[#22c55e] shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 7l3 3 5-5" />
                    </svg>
                    <span className="truncate flex-1">{job.documentPath}</span>
                    <span>{job.targetLocale}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last updated */}
          <div className="mt-3 flex items-center justify-between text-xs text-[#3a4a6a]">
            <span>
              Updated {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); fetchStatus(); }}
              className="text-[#5a6a8a] hover:text-white transition-colors"
            >
              Refresh now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({
  label,
  count,
  color,
  active,
}: {
  label: string;
  count: number;
  color: string;
  active?: boolean;
}) {
  return (
    <div
      className="p-3 rounded-xl border text-center"
      style={{
        borderColor: count > 0 ? `${color}33` : 'rgba(255,255,255,0.06)',
        backgroundColor: count > 0 ? `${color}0a` : 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="flex items-center justify-center gap-1">
        {active && count > 0 && (
          <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: color, borderTopColor: 'transparent' }} />
        )}
        <p className="text-lg font-semibold" style={{ color: count > 0 ? color : '#5a6a8a' }}>
          {count}
        </p>
      </div>
      <p className="text-xs text-[#5a6a8a] mt-0.5">{label}</p>
    </div>
  );
}
