'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

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
}

// Mock data for development
const mockTranslations: Translation[] = [
  {
    id: '1',
    collection: 'articles',
    documentId: 'article-001',
    language: 'ms-MY',
    fields: [
      { name: 'title', source: 'Getting Started with Investing', translation: 'Memulakan Pelaburan' },
      { name: 'summary', source: 'Learn the basics of investing for beginners', translation: 'Pelajari asas pelaburan untuk pemula' },
    ],
    status: 'completed',
    reviewed: false,
    translatedAt: '2026-03-02T10:30:00Z',
  },
  {
    id: '2',
    collection: 'articles',
    documentId: 'article-002',
    language: 'zh-CN',
    fields: [
      { name: 'title', source: 'Understanding Credit Scores', translation: '了解信用评分' },
      { name: 'summary', source: 'What affects your credit score and how to improve it', translation: '影响信用评分的因素以及如何改善' },
    ],
    status: 'completed',
    reviewed: true,
    translatedAt: '2026-03-01T15:45:00Z',
  },
  {
    id: '3',
    collection: 'quiz',
    documentId: 'quiz-001',
    language: 'ms-MY',
    fields: [
      { name: 'question', source: 'What is compound interest?', translation: '' },
    ],
    status: 'failed',
    reviewed: false,
  },
  {
    id: '4',
    collection: 'lessons',
    documentId: 'lesson-001',
    language: 'ta-IN',
    fields: [
      { name: 'title', source: 'Budgeting Basics', translation: 'பட்ஜெட் அடிப்படைகள்' },
      { name: 'body', source: 'Learn how to create a budget', translation: 'பட்ஜெட் உருவாக்க கற்றுக்கொள்ளுங்கள்' },
      { name: 'summary', source: 'A guide to budgeting', translation: 'பட்ஜெட்டிற்கான வழிகாட்டி' },
    ],
    status: 'completed',
    reviewed: false,
  },
  {
    id: '5',
    collection: 'articles',
    documentId: 'article-003',
    language: 'zh-CN',
    fields: [
      { name: 'title', source: 'Retirement Planning', translation: '退休规划' },
      { name: 'summary', source: 'Plan for your future', translation: '规划你的未来' },
    ],
    status: 'pending',
    reviewed: false,
  },
];

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
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'failed'>('all');
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [translations, setTranslations] = useState(mockTranslations);

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
            <Link href="/" className="text-[#1a3a8a] hover:text-[#2a4faa] transition-colors text-base flex items-center gap-1">
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

        {/* Two-column layout */}
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
      </div>
    </main>
  );
}
