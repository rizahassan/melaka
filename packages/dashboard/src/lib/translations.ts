/**
 * Translation data fetching utilities.
 */

import {
  collection,
  collectionGroup,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  type Firestore,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';

export interface Translation {
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
  sourceHash?: string;
  model?: string;
}

export interface TranslationStats {
  totalDocuments: number;
  totalTranslations: number;
  completed: number;
  pending: number;
  failed: number;
  reviewed: number;
  completionRate: number;
  reviewRate: number;
}

/**
 * Fetch all translations for a collection.
 */
export async function fetchTranslations(
  db: Firestore,
  collectionPath: string,
  languages: string[],
  isCollectionGroup = false
): Promise<Translation[]> {
  const translations: Translation[] = [];

  // Query the collection
  const q = isCollectionGroup
    ? collectionGroup(db, collectionPath)
    : collection(db, collectionPath);

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const sourceData = docSnap.data();
    const docPath = isCollectionGroup ? docSnap.ref.parent.path : collectionPath;

    for (const language of languages) {
      const i18nRef = doc(docSnap.ref, 'i18n', language);
      const i18nSnap = await getDoc(i18nRef);

      const i18nData = i18nSnap.exists() ? i18nSnap.data() : {};
      const metadata = i18nData._melaka || {};

      // Extract fields
      const fields: Translation['fields'] = [];
      for (const [key, value] of Object.entries(sourceData)) {
        if (key.startsWith('_') || typeof value !== 'string') continue;
        fields.push({
          name: key,
          source: value,
          translation: i18nData[key] || '',
        });
      }

      translations.push({
        id: `${docSnap.id}-${language}`,
        collection: docPath,
        documentId: docSnap.id,
        language,
        fields,
        status: metadata.status || (i18nSnap.exists() ? 'completed' : 'pending'),
        reviewed: metadata.reviewed || false,
        translatedAt: metadata.translated_at?.toDate?.()?.toISOString(),
        sourceHash: metadata.source_hash,
        model: metadata.model,
      });
    }
  }

  return translations;
}

/**
 * Calculate translation statistics.
 */
export function calculateStats(translations: Translation[]): TranslationStats {
  const totalTranslations = translations.length;
  const completed = translations.filter((t) => t.status === 'completed').length;
  const pending = translations.filter((t) => t.status === 'pending').length;
  const failed = translations.filter((t) => t.status === 'failed').length;
  const reviewed = translations.filter((t) => t.reviewed).length;

  // Count unique documents
  const uniqueDocs = new Set(translations.map((t) => `${t.collection}/${t.documentId}`));

  return {
    totalDocuments: uniqueDocs.size,
    totalTranslations,
    completed,
    pending,
    failed,
    reviewed,
    completionRate: totalTranslations > 0 ? Math.round((completed / totalTranslations) * 100) : 0,
    reviewRate: completed > 0 ? Math.round((reviewed / completed) * 100) : 0,
  };
}

/**
 * Mark a translation as reviewed.
 */
export async function markAsReviewed(
  db: Firestore,
  collectionPath: string,
  documentId: string,
  language: string
): Promise<void> {
  const i18nRef = doc(db, collectionPath, documentId, 'i18n', language);
  await updateDoc(i18nRef, {
    '_melaka.reviewed': true,
    '_melaka.reviewed_at': new Date(),
  });
}

/**
 * Update a translation field.
 */
export async function updateTranslation(
  db: Firestore,
  collectionPath: string,
  documentId: string,
  language: string,
  fieldName: string,
  newValue: string
): Promise<void> {
  const i18nRef = doc(db, collectionPath, documentId, 'i18n', language);
  await updateDoc(i18nRef, {
    [fieldName]: newValue,
    '_melaka.edited': true,
    '_melaka.edited_at': new Date(),
  });
}
