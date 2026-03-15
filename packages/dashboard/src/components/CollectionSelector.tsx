'use client';

import { useState, useEffect } from 'react';

interface CollectionConfig {
  path: string;
  fields: string[];
  enabled: boolean;
}

interface CollectionSelectorProps {
  currentCollections: CollectionConfig[];
  onSave: (collections: CollectionConfig[]) => Promise<void>;
}

export function CollectionSelector({
  currentCollections,
  onSave,
}: CollectionSelectorProps) {
  const [collections, setCollections] = useState<CollectionConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [newPath, setNewPath] = useState('');
  const [newFields, setNewFields] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFields, setEditFields] = useState('');

  useEffect(() => {
    setCollections(currentCollections.map((c) => ({ ...c })));
  }, [currentCollections]);

  const addCollection = () => {
    setAddError(null);
    const path = newPath.trim();
    const fields = newFields.split(',').map((f) => f.trim()).filter(Boolean);

    if (!path) { setAddError('Collection path is required'); return; }
    if (fields.length === 0) { setAddError('At least one field is required'); return; }
    if (collections.some((c) => c.path === path)) { setAddError('Collection already exists'); return; }

    setCollections((prev) => [...prev, { path, fields, enabled: true }]);
    setNewPath('');
    setNewFields('');
    setHasChanges(true);
  };

  const removeCollection = (index: number) => {
    setCollections((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
    if (editingIndex === index) setEditingIndex(null);
  };

  const toggleCollection = (index: number) => {
    setCollections((prev) => prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c)));
    setHasChanges(true);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditFields(collections[index].fields.join(', '));
  };

  const saveFieldEdit = (index: number) => {
    const fields = editFields.split(',').map((f) => f.trim()).filter(Boolean);
    if (fields.length === 0) return;
    setCollections((prev) => prev.map((c, i) => (i === index ? { ...c, fields } : c)));
    setEditingIndex(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(collections);
      setHasChanges(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium text-white">Collections</h2>
        <p className="text-sm text-[#5a6a8a] mt-0.5">
          Define which Firestore collections and fields to translate. Use your exact collection path and field names.
        </p>
      </div>

      {collections.length > 0 && (
        <div className="space-y-2">
          {collections.map((coll, index) => (
            <div
              key={`${coll.path}-${index}`}
              className={`rounded-xl border transition-all ${
                coll.enabled
                  ? 'border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.03)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleCollection(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                    coll.enabled
                      ? 'bg-[#22c55e] border-[#22c55e]'
                      : 'border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]'
                  }`}
                >
                  {coll.enabled && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white font-mono">{coll.path}</p>
                  {editingIndex === index ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={editFields}
                        onChange={(e) => setEditFields(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveFieldEdit(index)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-sm text-white focus:border-[#1a3a8a] focus:ring-1 focus:ring-[#1a3a8a] outline-none font-mono"
                        placeholder="field1, field2, field3"
                      />
                      <button onClick={() => saveFieldEdit(index)} className="px-3 py-1.5 text-xs font-medium text-[#22c55e] border border-[rgba(34,197,94,0.2)] rounded-lg hover:bg-[rgba(34,197,94,0.1)] transition-all">Save</button>
                      <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 text-xs font-medium text-[#5a6a8a] border border-[rgba(255,255,255,0.1)] rounded-lg hover:text-white transition-all">Cancel</button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#5a6a8a] mt-0.5">
                      Fields: <span className="text-[#8090b8] font-mono">{coll.fields.join(', ')}</span>
                    </p>
                  )}
                </div>

                {editingIndex !== index && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => startEditing(index)} className="p-1.5 text-[#5a6a8a] hover:text-white transition-colors" title="Edit fields">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" /></svg>
                    </button>
                    <button onClick={() => removeCollection(index)} className="p-1.5 text-[#5a6a8a] hover:text-[#cc3232] transition-colors" title="Remove collection">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] p-4 space-y-3">
        <p className="text-xs font-medium text-[#8090b8] uppercase tracking-wide">Add Collection</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#5a6a8a] mb-1.5">Collection Path</label>
            <input
              type="text"
              value={newPath}
              onChange={(e) => { setNewPath(e.target.value); setAddError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && addCollection()}
              placeholder="e.g. articles"
              className="w-full px-3 py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-sm text-white placeholder:text-[#3a4a6a] focus:border-[#1a3a8a] focus:ring-1 focus:ring-[#1a3a8a] outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-[#5a6a8a] mb-1.5">Fields to Translate (comma-separated)</label>
            <input
              type="text"
              value={newFields}
              onChange={(e) => { setNewFields(e.target.value); setAddError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && addCollection()}
              placeholder="e.g. title, description, body"
              className="w-full px-3 py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-sm text-white placeholder:text-[#3a4a6a] focus:border-[#1a3a8a] focus:ring-1 focus:ring-[#1a3a8a] outline-none font-mono"
            />
          </div>
        </div>
        {addError && <p className="text-xs text-[#cc3232]">{addError}</p>}
        <button onClick={addCollection} className="px-4 py-2 text-sm font-medium text-[#8090b8] border border-[rgba(255,255,255,0.1)] rounded-lg hover:border-[rgba(255,255,255,0.2)] hover:text-white transition-all">
          + Add Collection
        </button>
      </div>

      <div className="p-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)]">
        <p className="text-xs text-[#5a6a8a]">
          Enter the exact Firestore collection paths and string field names you want to translate.
          Only string fields will be processed. If a collection or field doesn&apos;t exist, the translation job will report an error.
        </p>
      </div>

      {hasChanges && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#d4a017]">You have unsaved changes</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-sm font-medium shadow-[0_4px_6px_rgba(26,58,138,0.25)] hover:shadow-[0_6px_12px_rgba(26,58,138,0.35)] transition-shadow disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Collection Config'}
          </button>
        </div>
      )}
    </div>
  );
}
