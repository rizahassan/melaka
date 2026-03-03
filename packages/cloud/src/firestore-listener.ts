/**
 * Firestore Listener - Watches customer collections for changes.
 * Uses Cloud Tasks for job queuing.
 */

import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore';
import type { MelakaCloudTasks, TaskPayload } from './cloud-tasks.js';
import type { MelakaFirestoreDatabase } from './db/firestore-database.js';

export interface Project {
  id: string;
  firebaseProjectId: string;
  config: {
    collections: CollectionConfig[];
    sourceLocale: string;
    targetLocales: string[];
    glossary?: Record<string, Record<string, string>>;
  };
}

export interface CollectionConfig {
  path: string;
  fields: string[];
  isCollectionGroup?: boolean;
  enabled?: boolean;
}

export interface ListenerOptions {
  onError?: (projectId: string, error: Error) => void;
  onDocument?: (projectId: string, docPath: string, action: 'create' | 'update') => void;
}

export class FirestoreListener {
  private listeners: Map<string, (() => void)[]> = new Map();
  private tasks: MelakaCloudTasks;
  private db: MelakaFirestoreDatabase;
  private options: ListenerOptions;

  constructor(
    tasks: MelakaCloudTasks,
    db: MelakaFirestoreDatabase,
    options: ListenerOptions = {}
  ) {
    this.tasks = tasks;
    this.db = db;
    this.options = options;
  }

  /**
   * Start listening to a project's collections.
   */
  async startListening(project: Project, firestore: Firestore): Promise<void> {
    const unsubscribes: (() => void)[] = [];

    for (const collectionConfig of project.config.collections) {
      if (collectionConfig.enabled === false) continue;

      const { path, fields, isCollectionGroup } = collectionConfig;

      const query = isCollectionGroup
        ? firestore.collectionGroup(path)
        : firestore.collection(path);

      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          for (const change of snapshot.docChanges()) {
            if (change.type === 'added' || change.type === 'modified') {
              this.handleDocumentChange(
                project,
                change.doc,
                fields,
                change.type === 'added' ? 'create' : 'update'
              );
            }
          }
        },
        (error) => {
          console.error(`Listener error for ${project.id}/${path}:`, error);
          this.options.onError?.(project.id, error);
        }
      );

      unsubscribes.push(unsubscribe);
    }

    this.listeners.set(project.id, unsubscribes);
  }

  /**
   * Handle a document change.
   */
  private async handleDocumentChange(
    project: Project,
    doc: DocumentSnapshot,
    fields: string[],
    action: 'create' | 'update'
  ): Promise<void> {
    const data = doc.data();
    if (!data) return;

    // Skip if this is an i18n subcollection document
    if (doc.ref.path.includes('/i18n/')) return;

    // Extract translatable fields
    const translatableData: Record<string, string> = {};
    for (const field of fields) {
      if (typeof data[field] === 'string' && data[field].trim()) {
        translatableData[field] = data[field];
      }
    }

    // Skip if no translatable content
    if (Object.keys(translatableData).length === 0) return;

    // Notify callback
    this.options.onDocument?.(project.id, doc.ref.path, action);

    // Queue translation jobs for each target locale
    for (const targetLocale of project.config.targetLocales) {
      // Create job in Firestore database
      const jobId = await this.db.createJob({
        projectId: project.id,
        documentPath: doc.ref.path,
        sourceLocale: project.config.sourceLocale,
        targetLocale,
        fields: translatableData,
      });

      // Enqueue Cloud Task
      const payload: TaskPayload = {
        jobId,
        projectId: project.id,
        documentPath: doc.ref.path,
        sourceLocale: project.config.sourceLocale,
        targetLocale,
        fields: translatableData,
      };

      await this.tasks.enqueueTranslation(payload);
    }
  }

  /**
   * Stop listening to a project.
   */
  stopListening(projectId: string): void {
    const unsubscribes = this.listeners.get(projectId);
    if (unsubscribes) {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
      this.listeners.delete(projectId);
    }
  }

  /**
   * Stop all listeners.
   */
  stopAll(): void {
    for (const projectId of this.listeners.keys()) {
      this.stopListening(projectId);
    }
  }

  /**
   * Check if listening to a project.
   */
  isListening(projectId: string): boolean {
    return this.listeners.has(projectId);
  }

  /**
   * Get count of active listeners.
   */
  getActiveCount(): number {
    return this.listeners.size;
  }
}
