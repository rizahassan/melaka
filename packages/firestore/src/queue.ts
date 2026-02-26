/**
 * Melaka Firestore - Task Queue
 *
 * Functions for enqueueing translation tasks to Cloud Tasks.
 */

import type { Firestore } from 'firebase-admin/firestore';
import {
  generateBatchId,
  type MelakaConfig,
  type CollectionConfig,
  getEffectiveMaxConcurrency,
} from '@melaka/core';
import type { TranslationTaskPayload } from '@melaka/core';
import { createTaskPayload } from './task-handler';

/**
 * Task queue interface for Cloud Functions.
 */
export interface TaskQueue {
  enqueue(
    data: TranslationTaskPayload,
    options?: { scheduleDelaySeconds?: number }
  ): Promise<void>;
}

/**
 * Options for enqueueing translations.
 */
export interface EnqueueOptions {
  /**
   * Task queue instance.
   */
  queue: TaskQueue;

  /**
   * Base delay between task scheduling (staggering).
   */
  staggerDelayMs?: number;
}

/**
 * Result of enqueueing translations.
 */
export interface EnqueueResult {
  /**
   * Batch ID for tracking.
   */
  batchId: string;

  /**
   * Number of tasks enqueued.
   */
  tasksEnqueued: number;

  /**
   * Number of tasks that failed to enqueue.
   */
  failed: number;

  /**
   * Error messages for failed tasks.
   */
  errors: string[];
}

/**
 * Enqueue translation tasks for a single document.
 *
 * Creates one task per target language.
 *
 * @param collectionPath - Collection path
 * @param documentId - Document ID
 * @param config - Melaka configuration
 * @param collectionConfig - Collection configuration
 * @param options - Queue options
 * @returns Enqueue result
 */
export async function enqueueDocumentTranslation(
  collectionPath: string,
  documentId: string,
  config: MelakaConfig,
  collectionConfig: CollectionConfig,
  options: EnqueueOptions
): Promise<EnqueueResult> {
  const batchId = generateBatchId();
  const staggerDelay = options.staggerDelayMs || 100;
  let tasksEnqueued = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < config.languages.length; i++) {
    const language = config.languages[i];

    try {
      const payload = createTaskPayload(
        collectionPath,
        documentId,
        language,
        collectionConfig,
        batchId
      );

      await options.queue.enqueue(payload, {
        scheduleDelaySeconds: Math.floor((i * staggerDelay) / 1000),
      });

      tasksEnqueued++;
    } catch (error) {
      failed++;
      errors.push(
        `Failed to enqueue ${documentId}/${language}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    batchId,
    tasksEnqueued,
    failed,
    errors,
  };
}

/**
 * Enqueue translation tasks for all documents in a collection.
 *
 * @param firestore - Firestore instance
 * @param config - Melaka configuration
 * @param collectionConfig - Collection configuration
 * @param options - Queue options
 * @returns Enqueue result
 */
export async function enqueueCollectionTranslation(
  firestore: Firestore,
  config: MelakaConfig,
  collectionConfig: CollectionConfig,
  options: EnqueueOptions
): Promise<EnqueueResult> {
  const batchId = generateBatchId();
  const maxConcurrency = getEffectiveMaxConcurrency(config, collectionConfig);
  const staggerDelay = options.staggerDelayMs || 100;

  let tasksEnqueued = 0;
  let failed = 0;
  const errors: string[] = [];

  // Query collection
  let query: FirebaseFirestore.Query;
  if (collectionConfig.isCollectionGroup) {
    query = firestore.collectionGroup(collectionConfig.path);
  } else {
    query = firestore.collection(collectionConfig.path);
  }

  const snapshots = await query.select().get();
  const totalDocs = snapshots.docs.length;
  const totalTasks = totalDocs * config.languages.length;

  let taskIndex = 0;

  for (const doc of snapshots.docs) {
    const collectionPath = collectionConfig.isCollectionGroup
      ? doc.ref.parent.path
      : collectionConfig.path;

    for (const language of config.languages) {
      try {
        const payload = createTaskPayload(
          collectionPath,
          doc.id,
          language,
          collectionConfig,
          batchId
        );

        // Calculate delay for staggering
        const delaySeconds = Math.floor((taskIndex * staggerDelay) / 1000);

        await options.queue.enqueue(payload, {
          scheduleDelaySeconds: delaySeconds,
        });

        tasksEnqueued++;
      } catch (error) {
        failed++;
        errors.push(
          `Failed to enqueue ${doc.id}/${language}: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      taskIndex++;
    }
  }

  return {
    batchId,
    tasksEnqueued,
    failed,
    errors,
  };
}
