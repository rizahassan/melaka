/**
 * Translation Worker - Processes translation jobs from the queue.
 */

import { z } from 'zod';
import { createTranslationFacade, type TranslationFacade } from '@melaka/ai';
import type { TranslationQueue, TranslationJob } from './translation-queue.js';
import type { ProjectManager } from './project-manager.js';
import { hashContent } from '@melaka/core';

export interface WorkerConfig {
  aiProvider: 'gemini' | 'openai' | 'claude';
  aiApiKey: string;
  aiModel?: string;
  concurrency?: number;
  pollIntervalMs?: number;
}

function getDefaultModel(provider: 'gemini' | 'openai' | 'claude'): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.0-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'claude':
      return 'claude-sonnet-4-20250514';
  }
}

export class TranslationWorker {
  private queue: TranslationQueue;
  private projectManager: ProjectManager;
  private translator: TranslationFacade;
  private concurrency: number;
  private pollIntervalMs: number;
  private aiModel: string;
  private running = false;
  private activeJobs = 0;

  constructor(
    queue: TranslationQueue,
    projectManager: ProjectManager,
    config: WorkerConfig
  ) {
    this.queue = queue;
    this.projectManager = projectManager;
    this.concurrency = config.concurrency ?? 5;
    this.pollIntervalMs = config.pollIntervalMs ?? 1000;
    this.aiModel = config.aiModel ?? getDefaultModel(config.aiProvider);

    this.translator = createTranslationFacade({
      provider: config.aiProvider,
      apiKey: config.aiApiKey,
      model: config.aiModel || getDefaultModel(config.aiProvider),
    });
  }

  /**
   * Start the worker.
   */
  async start(): Promise<void> {
    this.running = true;
    console.log('Translation worker started');

    while (this.running) {
      // Check if we can process more jobs
      if (this.activeJobs < this.concurrency) {
        const job = await this.queue.dequeue();
        if (job) {
          this.processJob(job).catch((error) => {
            console.error(`Error processing job ${job.id}:`, error);
          });
        }
      }

      // Wait before polling again
      await this.sleep(this.pollIntervalMs);
    }
  }

  /**
   * Stop the worker.
   */
  stop(): void {
    this.running = false;
    console.log('Translation worker stopping...');
  }

  /**
   * Process a single translation job.
   */
  private async processJob(job: TranslationJob): Promise<void> {
    this.activeJobs++;

    try {
      console.log(`Processing job ${job.id}: ${job.documentPath} -> ${job.targetLocale}`);

      // Get Firestore instance for this project
      const firestore = this.projectManager.getFirestore(job.projectId);
      if (!firestore) {
        throw new Error(`Project ${job.projectId} not initialized`);
      }

      // Build dynamic schema based on fields
      const schemaShape: Record<string, z.ZodString> = {};
      for (const field of Object.keys(job.fields)) {
        schemaShape[field] = z.string();
      }
      const schema = z.object(schemaShape);

      // Translate the fields
      const result = await this.translator.translate(
        job.fields,
        schema,
        {
          targetLanguage: job.targetLocale,
          glossary: job.glossary?.[job.targetLocale],
        }
      );

      if (!result.success || !result.output) {
        throw new Error(result.error || 'Translation failed');
      }

      // Write to i18n subcollection
      const i18nDocRef = firestore.doc(`${job.documentPath}/i18n/${job.targetLocale}`);

      await i18nDocRef.set(
        {
          ...result.output,
          _melaka: {
            translated_at: new Date(),
            source_locale: job.sourceLocale,
            source_hash: hashContent(job.fields),
            model: this.aiModel,
            status: 'completed',
          },
        },
        { merge: true }
      );

      // Mark job as completed
      await this.queue.complete(job);
      console.log(`Completed job ${job.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed job ${job.id}:`, errorMessage);
      await this.queue.fail(job, errorMessage);
    } finally {
      this.activeJobs--;
    }
  }

  /**
   * Sleep helper.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get worker status.
   */
  getStatus(): { running: boolean; activeJobs: number } {
    return {
      running: this.running,
      activeJobs: this.activeJobs,
    };
  }
}
