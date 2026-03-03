/**
 * Project Manager - Manages connected customer projects.
 */

import { initializeApp, cert, type App, deleteApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { OAuthTokens } from './oauth-manager.js';

export interface ProjectConfig {
  collections: {
    path: string;
    fields: string[];
    isCollectionGroup?: boolean;
  }[];
  sourceLocale: string;
  targetLocales: string[];
  glossary?: Record<string, Record<string, string>>;
}

export interface Project {
  id: string;
  userId: string;
  firebaseProjectId: string;
  config: ProjectConfig;
  tokens: OAuthTokens;
  status: 'active' | 'paused' | 'error';
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
  errorMessage?: string;
}

export class ProjectManager {
  private apps: Map<string, App> = new Map();
  private firestores: Map<string, Firestore> = new Map();

  /**
   * Initialize a Firebase Admin app for a customer project.
   */
  async initializeProject(project: Project): Promise<Firestore> {
    const appName = `project-${project.id}`;

    // Check if already initialized
    if (this.apps.has(project.id)) {
      return this.firestores.get(project.id)!;
    }

    // Create a credential from the OAuth tokens
    // Note: In production, you'd use the access token to create a custom credential
    // For now, we'll use the default credential pattern
    const app = initializeApp(
      {
        projectId: project.firebaseProjectId,
        credential: {
          getAccessToken: async () => ({
            access_token: project.tokens.accessToken,
            expires_in: Math.floor((project.tokens.expiresAt - Date.now()) / 1000),
          }),
        },
      },
      appName
    );

    const firestore = getFirestore(app);

    this.apps.set(project.id, app);
    this.firestores.set(project.id, firestore);

    return firestore;
  }

  /**
   * Get Firestore instance for a project.
   */
  getFirestore(projectId: string): Firestore | undefined {
    return this.firestores.get(projectId);
  }

  /**
   * Cleanup a project's resources.
   */
  async cleanupProject(projectId: string): Promise<void> {
    const app = this.apps.get(projectId);
    if (app) {
      await deleteApp(app);
      this.apps.delete(projectId);
      this.firestores.delete(projectId);
    }
  }

  /**
   * Cleanup all projects.
   */
  async cleanupAll(): Promise<void> {
    for (const projectId of this.apps.keys()) {
      await this.cleanupProject(projectId);
    }
  }

  /**
   * List collection paths for a project.
   */
  async listCollections(projectId: string): Promise<string[]> {
    const firestore = this.firestores.get(projectId);
    if (!firestore) {
      throw new Error(`Project ${projectId} not initialized`);
    }

    const collections = await firestore.listCollections();
    return collections.map((col) => col.id);
  }

  /**
   * Test connection to a project.
   */
  async testConnection(project: Project): Promise<boolean> {
    try {
      const firestore = await this.initializeProject(project);
      await firestore.listCollections();
      return true;
    } catch (error) {
      console.error(`Connection test failed for project ${project.id}:`, error);
      return false;
    }
  }
}
