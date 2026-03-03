'use client';

import { useState } from 'react';
import Link from 'next/link';

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
];

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
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Translations
              </h1>
            </div>
            <div className="flex gap-2">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                All
              </FilterButton>
              <FilterButton
                active={filter === 'unreviewed'}
                onClick={() => setFilter('unreviewed')}
              >
                Unreviewed
              </FilterButton>
              <FilterButton
                active={filter === 'failed'}
                onClick={() => setFilter('failed')}
              >
                Failed
              </FilterButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Translation List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {filteredTranslations.length} Translations
              </h2>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
              {filteredTranslations.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setSelectedTranslation(t)}
                  className={`px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedTranslation?.id === t.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t.collection}/{t.documentId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.language} • {t.fields.length} fields
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      {t.reviewed && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {filteredTranslations.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No translations found
                </li>
              )}
            </ul>
          </div>

          {/* Side-by-side Review Panel */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {selectedTranslation ? (
              <>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedTranslation.documentId}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedTranslation.collection} • {selectedTranslation.language}
                    </p>
                  </div>
                  {!selectedTranslation.reviewed && selectedTranslation.status === 'completed' && (
                    <button
                      onClick={() => handleMarkReviewed(selectedTranslation.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      ✓ Mark Reviewed
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
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
              <div className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                Select a translation to review
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

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
      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const styles = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          {field.name}
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-500"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Source */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Source (EN)</p>
          <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
            {field.source}
          </p>
        </div>

        {/* Translation */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Translation</p>
          {editing ? (
            <div>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setValue(field.translation);
                    setEditing(false);
                  }}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              {field.translation || <span className="text-red-400 italic">Missing</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
