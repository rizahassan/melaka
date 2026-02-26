/**
 * Melaka Firestore - Cloud Task Handler
 *
 * Task queue handler for async translation processing.
 */

import type { DocumentReference } from 'firebase-admin/firestore';
import {
  TranslationTaskPayloadSchema,
  type TranslationTaskPayload,
  type MelakaConfig,
  findCollectionConfig,
} from '@melaka/core';
import { processTranslation, type ProcessResult } from './processor';

/**
 * Task handler context with Firebase dependencies.
 */
export interface TaskHandlerContext {
  /**
   * Firestore instance.
   */
  firestore: FirebaseFirestore.Firestore;

  /**
   * Melaka configuration.
   */
  config: MelakaConfig;

  /**
   * API key for AI provider (resolved from secret).
   */
  apiKey: string;
}

/**
 * Handle a translation task from Cloud Tasks.
 *
 * This function is called by the `onTaskDispatched` Cloud Function.
 *
 * @param payload - Task payload
 * @param context - Handler context with Firestore and config
 * @returns Processing result
 *
 * @example
 * ```typescript
 * // In generated Cloud Function:
 * export const melakaTranslateTask = onTaskDispatched(
 *   { secrets: [geminiApiKey] },
 *   async (request) => {
 *     const result = await handleTranslationTask(request.data, {
 *       firestore: getFirestore(),
 *       config: await loadConfig(),
 *       apiKey: geminiApiKey.value(),
 *     });
 *
 *     if (!result.success) {
 *       throw new Error(result.error);
 *     }
 *   }
 * );
 * ```
 */
export async function handleTranslationTask(
  payload: unknown,
  context: TaskHandlerContext
): Promise<ProcessResult> {
  // 1. Validate payload
  const parseResult = TranslationTaskPayloadSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      skipped: false,
      error: `Invalid task payload: ${parseResult.error.message}`,
    };
  }

  const taskPayload = parseResult.data as TranslationTaskPayload;

  // 2. Get document reference
  const docRef = context.firestore
    .collection(taskPayload.collectionPath)
    .doc(taskPayload.documentId);

  // 3. Read document
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    return {
      success: true,
      skipped: true,
      error: 'Document no longer exists',
    };
  }

  const docData = docSnapshot.data();
  if (!docData) {
    return {
      success: true,
      skipped: true,
      error: 'Document has no data',
    };
  }

  // 4. Find collection config
  const collectionConfig = findCollectionConfig(
    context.config,
    taskPayload.collectionPath
  );

  if (!collectionConfig) {
    return {
      success: false,
      skipped: false,
      error: `Collection not configured: ${taskPayload.collectionPath}`,
    };
  }

  // 5. Inject API key into config
  const configWithKey: MelakaConfig = {
    ...context.config,
    ai: {
      ...context.config.ai,
      apiKey: context.apiKey,
    },
  };

  // 6. Process translation
  return processTranslation(
    docRef,
    docData,
    taskPayload.targetLanguage,
    configWithKey,
    collectionConfig,
    {
      forceUpdate: collectionConfig.forceUpdate,
    }
  );
}

/**
 * Create task payload for enqueueing.
 *
 * @param collectionPath - Collection path
 * @param documentId - Document ID
 * @param targetLanguage - Target locale
 * @param config - Collection configuration
 * @param batchId - Batch identifier
 * @returns Task payload
 */
export function createTaskPayload(
  collectionPath: string,
  documentId: string,
  targetLanguage: string,
  config: import('@melaka/core').CollectionConfig,
  batchId: string
): TranslationTaskPayload {
  return {
    collectionPath,
    documentId,
    targetLanguage,
    config,
    batchId,
  };
}
