/**
 * Melaka Firestore - i18n Operations
 *
 * Functions for reading/writing to i18n subcollections.
 */

import type { Firestore, DocumentReference, DocumentData, Timestamp } from 'firebase-admin/firestore';
import type { MelakaMetadata, TranslationStatus } from '@melaka/core';

/**
 * Path to i18n subcollection for a document.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @returns Path string to i18n document
 *
 * @example
 * ```typescript
 * const path = getI18nPath(docRef, 'ms-MY');
 * // 'products/abc123/i18n/ms-MY'
 * ```
 */
export function getI18nPath(docRef: DocumentReference, locale: string): string {
  return `${docRef.path}/i18n/${locale}`;
}

/**
 * Get the i18n document reference for a locale.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @returns DocumentReference to i18n document
 */
export function getI18nRef(
  docRef: DocumentReference,
  locale: string
): DocumentReference {
  return docRef.collection('i18n').doc(locale);
}

/**
 * Read an existing translation from i18n subcollection.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @returns Translation data or null if not exists
 */
export async function readTranslation(
  docRef: DocumentReference,
  locale: string
): Promise<DocumentData | null> {
  const i18nRef = getI18nRef(docRef, locale);
  const snapshot = await i18nRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() || null;
}

/**
 * Read the Melaka metadata from an existing translation.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @returns Melaka metadata or null if not exists
 */
export async function readMelakaMetadata(
  docRef: DocumentReference,
  locale: string
): Promise<MelakaMetadata | null> {
  const translation = await readTranslation(docRef, locale);

  if (!translation || !translation._melaka) {
    return null;
  }

  return translation._melaka as MelakaMetadata;
}

/**
 * Write a translation to i18n subcollection.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @param translatedContent - Translated fields
 * @param nonTranslatableContent - Copied fields
 * @param metadata - Melaka metadata
 */
export async function writeTranslation(
  docRef: DocumentReference,
  locale: string,
  translatedContent: Record<string, unknown>,
  nonTranslatableContent: Record<string, unknown>,
  metadata: MelakaMetadata
): Promise<void> {
  const i18nRef = getI18nRef(docRef, locale);

  const finalDoc = {
    ...translatedContent,
    ...nonTranslatableContent,
    _melaka: metadata,
  };

  await i18nRef.set(finalDoc);
}

/**
 * Update the Melaka metadata for an existing translation.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @param metadata - Partial metadata to update
 */
export async function updateMelakaMetadata(
  docRef: DocumentReference,
  locale: string,
  metadata: Partial<MelakaMetadata>
): Promise<void> {
  const i18nRef = getI18nRef(docRef, locale);

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    updates[`_melaka.${key}`] = value;
  }

  await i18nRef.update(updates);
}

/**
 * Mark a translation as failed.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @param error - Error message
 * @param timestamp - Timestamp for the failure
 */
export async function markTranslationFailed(
  docRef: DocumentReference,
  locale: string,
  error: string,
  timestamp: Timestamp
): Promise<void> {
  const i18nRef = getI18nRef(docRef, locale);
  const existing = await i18nRef.get();

  if (existing.exists) {
    // Update existing document
    await i18nRef.update({
      '_melaka.status': 'failed' as TranslationStatus,
      '_melaka.error': error,
      '_melaka.translated_at': timestamp,
    });
  } else {
    // Create minimal failed document
    await i18nRef.set({
      _melaka: {
        status: 'failed' as TranslationStatus,
        error,
        translated_at: timestamp,
        source_hash: '',
        model: '',
        reviewed: false,
      },
    });
  }
}

/**
 * Delete a translation from i18n subcollection.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 */
export async function deleteTranslation(
  docRef: DocumentReference,
  locale: string
): Promise<void> {
  const i18nRef = getI18nRef(docRef, locale);
  await i18nRef.delete();
}

/**
 * Delete all translations for a document.
 *
 * @param docRef - Parent document reference
 */
export async function deleteAllTranslations(
  docRef: DocumentReference
): Promise<void> {
  const i18nCollection = docRef.collection('i18n');
  const snapshots = await i18nCollection.get();

  const batch = docRef.firestore.batch();
  for (const doc of snapshots.docs) {
    batch.delete(doc.ref);
  }

  await batch.commit();
}

/**
 * List all locales that have translations for a document.
 *
 * @param docRef - Parent document reference
 * @returns Array of locale codes
 */
export async function listTranslationLocales(
  docRef: DocumentReference
): Promise<string[]> {
  const i18nCollection = docRef.collection('i18n');
  const snapshots = await i18nCollection.select().get();

  return snapshots.docs.map((doc) => doc.id);
}

/**
 * Check if a translation exists and is up-to-date.
 *
 * @param docRef - Parent document reference
 * @param locale - Target locale code
 * @param sourceHash - Current source content hash
 * @returns Whether translation exists and matches source hash
 */
export async function isTranslationCurrent(
  docRef: DocumentReference,
  locale: string,
  sourceHash: string
): Promise<boolean> {
  const metadata = await readMelakaMetadata(docRef, locale);

  if (!metadata) {
    return false;
  }

  return (
    metadata.status === 'completed' &&
    metadata.source_hash === sourceHash
  );
}

/**
 * Get translation status summary for a document.
 *
 * @param docRef - Parent document reference
 * @param locales - Locales to check
 * @returns Status for each locale
 */
export async function getTranslationStatus(
  docRef: DocumentReference,
  locales: string[]
): Promise<Record<string, TranslationStatus | 'missing'>> {
  const status: Record<string, TranslationStatus | 'missing'> = {};

  for (const locale of locales) {
    const metadata = await readMelakaMetadata(docRef, locale);
    status[locale] = metadata?.status || 'missing';
  }

  return status;
}
