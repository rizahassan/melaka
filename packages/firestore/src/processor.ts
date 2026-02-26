/**
 * Melaka Firestore - Translation Processor
 *
 * Core translation logic that processes documents and writes translations.
 */

import type { DocumentReference, DocumentData, Timestamp } from 'firebase-admin/firestore';
import {
  separateContent,
  hashContent,
  mergeGlossaries,
  createTranslationSchema,
  type MelakaConfig,
  type CollectionConfig,
  type MelakaMetadata,
  getEffectiveAIConfig,
} from '@melaka/core';
import { createTranslationFacade, type TranslationResponse } from '@melaka/ai';
import {
  readMelakaMetadata,
  writeTranslation,
  markTranslationFailed,
} from './i18n';

/**
 * Options for processing a translation.
 */
export interface ProcessOptions {
  /**
   * Force re-translation even if content unchanged.
   */
  forceUpdate?: boolean;

  /**
   * Timestamp to use for translated_at field.
   */
  timestamp?: Timestamp;
}

/**
 * Result of processing a translation.
 */
export interface ProcessResult {
  /**
   * Whether processing succeeded.
   */
  success: boolean;

  /**
   * Whether translation was skipped (content unchanged).
   */
  skipped: boolean;

  /**
   * Error message if failed.
   */
  error?: string;

  /**
   * Duration in milliseconds.
   */
  durationMs?: number;
}

/**
 * Process a single document translation.
 *
 * @param docRef - Document reference to translate
 * @param docData - Document data
 * @param targetLanguage - Target locale code
 * @param config - Root Melaka configuration
 * @param collectionConfig - Collection-specific configuration
 * @param options - Processing options
 * @returns Processing result
 */
export async function processTranslation(
  docRef: DocumentReference,
  docData: DocumentData,
  targetLanguage: string,
  config: MelakaConfig,
  collectionConfig: CollectionConfig,
  options: ProcessOptions = {}
): Promise<ProcessResult> {
  const startTime = Date.now();

  try {
    // 1. Separate content into translatable and non-translatable
    const { translatable, nonTranslatable, detectedTypes } = separateContent(
      docData as Record<string, unknown>,
      collectionConfig.fields
    );

    // Check if there's anything to translate
    if (Object.keys(translatable).length === 0) {
      return {
        success: true,
        skipped: true,
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Calculate content hash for change detection
    const sourceHash = hashContent(translatable);

    // 3. Check if translation is already current (unless forceUpdate)
    if (!options.forceUpdate) {
      const existingMetadata = await readMelakaMetadata(docRef, targetLanguage);

      if (
        existingMetadata &&
        existingMetadata.status === 'completed' &&
        existingMetadata.source_hash === sourceHash
      ) {
        return {
          success: true,
          skipped: true,
          durationMs: Date.now() - startTime,
        };
      }
    }

    // 4. Create translation schema
    const schema = createTranslationSchema({ translatable, detectedTypes });

    // 5. Get effective AI config and create facade
    const aiConfig = getEffectiveAIConfig(config, collectionConfig);
    const facade = createTranslationFacade(aiConfig);

    // 6. Merge glossaries
    const glossary = mergeGlossaries(config.glossary, collectionConfig.glossary);

    // 7. Perform translation
    const response: TranslationResponse<Record<string, unknown>> = await facade.translate(
      translatable,
      schema,
      {
        targetLanguage,
        prompt: collectionConfig.prompt,
        glossary,
        temperature: aiConfig.temperature,
      }
    );

    // 8. Handle translation result
    const timestamp = options.timestamp || (await getTimestamp(docRef));

    if (!response.success || !response.output) {
      await markTranslationFailed(
        docRef,
        targetLanguage,
        response.error || 'Unknown translation error',
        timestamp
      );

      return {
        success: false,
        skipped: false,
        error: response.error,
        durationMs: Date.now() - startTime,
      };
    }

    // 9. Create metadata
    const metadata: MelakaMetadata = {
      source_hash: sourceHash,
      translated_at: timestamp,
      model: facade.getModel(),
      status: 'completed',
      reviewed: false,
    };

    // 10. Write translation
    await writeTranslation(
      docRef,
      targetLanguage,
      response.output,
      nonTranslatable,
      metadata
    );

    return {
      success: true,
      skipped: false,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const timestamp = options.timestamp || (await getTimestamp(docRef));

    const errorMessage = error instanceof Error ? error.message : String(error);

    try {
      await markTranslationFailed(docRef, targetLanguage, errorMessage, timestamp);
    } catch {
      // Ignore errors while marking failed
    }

    return {
      success: false,
      skipped: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Process translations for all configured languages.
 *
 * @param docRef - Document reference to translate
 * @param docData - Document data
 * @param config - Root Melaka configuration
 * @param collectionConfig - Collection-specific configuration
 * @param options - Processing options
 * @returns Results for each language
 */
export async function processAllLanguages(
  docRef: DocumentReference,
  docData: DocumentData,
  config: MelakaConfig,
  collectionConfig: CollectionConfig,
  options: ProcessOptions = {}
): Promise<Record<string, ProcessResult>> {
  const results: Record<string, ProcessResult> = {};

  for (const language of config.languages) {
    results[language] = await processTranslation(
      docRef,
      docData,
      language,
      config,
      collectionConfig,
      options
    );
  }

  return results;
}

/**
 * Get a Firestore Timestamp.
 */
async function getTimestamp(docRef: DocumentReference): Promise<Timestamp> {
  const { Timestamp } = await import('firebase-admin/firestore');
  return Timestamp.now();
}
