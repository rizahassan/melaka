/**
 * Melaka Cloud Service - Main entry point.
 *
 * Orchestrates all components:
 * - OAuth authentication
 * - Project management
 * - Firestore listeners
 * - Translation queue and workers
 */

import { ProjectManager, type Project } from './project-manager.js';
import { FirestoreListener } from './firestore-listener.js';
import { TranslationQueue } from './translation-queue.js';
import { TranslationWorker, type WorkerConfig } from './translation-worker.js';
import { OAuthManager, type OAuthConfig } from './oauth-manager.js';

export interface CloudServiceConfig {
  oauth: OAuthConfig;
  redis: {
    url: string;
  };
  ai: WorkerConfig;
  workerCount?: number;
}

export class MelakaCloudService {
  private projectManager: ProjectManager;
  private oauthManager: OAuthManager;
  private queue: TranslationQueue;
  private listener: FirestoreListener;
  private workers: TranslationWorker[] = [];
  private projects: Map<string, Project> = new Map();

  constructor(config: CloudServiceConfig) {
    this.projectManager = new ProjectManager();
    this.oauthManager = new OAuthManager(config.oauth);
    this.queue = new TranslationQueue({ redisUrl: config.redis.url });
    this.listener = new FirestoreListener(this.queue, {
      onError: (projectId, error) => {
        console.error(`Listener error for project ${projectId}:`, error);
        this.handleProjectError(projectId, error.message);
      },
      onDocument: (projectId, docPath, action) => {
        console.log(`[${projectId}] ${action}: ${docPath}`);
      },
    });

    // Create workers
    const workerCount = config.workerCount ?? 3;
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(
        new TranslationWorker(this.queue, this.projectManager, config.ai)
      );
    }
  }

  /**
   * Start the cloud service.
   */
  async start(): Promise<void> {
    console.log('Starting Melaka Cloud Service...');

    // Start workers
    for (const worker of this.workers) {
      worker.start().catch((error) => {
        console.error('Worker error:', error);
      });
    }

    console.log(`Started ${this.workers.length} translation workers`);
  }

  /**
   * Stop the cloud service.
   */
  async stop(): Promise<void> {
    console.log('Stopping Melaka Cloud Service...');

    // Stop all workers
    for (const worker of this.workers) {
      worker.stop();
    }

    // Stop all listeners
    this.listener.stopAll();

    // Cleanup projects
    await this.projectManager.cleanupAll();

    // Close queue
    await this.queue.close();

    console.log('Melaka Cloud Service stopped');
  }

  /**
   * Get OAuth authorization URL.
   */
  getAuthUrl(userId: string): string {
    return this.oauthManager.getAuthUrl(userId);
  }

  /**
   * Handle OAuth callback and create project.
   */
  async handleOAuthCallback(
    code: string,
    userId: string,
    firebaseProjectId: string
  ): Promise<Project> {
    // Exchange code for tokens
    const tokens = await this.oauthManager.exchangeCode(code);

    // Verify token and get user info
    const userInfo = await this.oauthManager.verifyToken(tokens.accessToken);
    console.log(`OAuth successful for ${userInfo.email}`);

    // Create project
    const project: Project = {
      id: `${userId}-${firebaseProjectId}`,
      userId,
      firebaseProjectId,
      config: {
        collections: [],
        sourceLocale: 'en',
        targetLocales: [],
      },
      tokens,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return project;
  }

  /**
   * Connect a project and start listening.
   */
  async connectProject(project: Project): Promise<void> {
    // Initialize Firebase Admin for this project
    const firestore = await this.projectManager.initializeProject(project);

    // Test connection
    const connected = await this.projectManager.testConnection(project);
    if (!connected) {
      throw new Error('Failed to connect to Firestore');
    }

    // Store project
    this.projects.set(project.id, project);

    // Start listening if project has collections configured
    if (project.config.collections.length > 0) {
      await this.listener.startListening(project, firestore);
      console.log(`Started listening to project ${project.id}`);
    }
  }

  /**
   * Update project configuration.
   */
  async updateProjectConfig(
    projectId: string,
    config: Partial<Project['config']>
  ): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Stop existing listener
    this.listener.stopListening(projectId);

    // Update config
    project.config = { ...project.config, ...config };
    project.updatedAt = new Date();

    // Restart listener with new config
    const firestore = this.projectManager.getFirestore(projectId);
    if (firestore && project.config.collections.length > 0) {
      await this.listener.startListening(project, firestore);
    }
  }

  /**
   * Disconnect a project.
   */
  async disconnectProject(projectId: string): Promise<void> {
    // Stop listener
    this.listener.stopListening(projectId);

    // Cleanup Firebase Admin
    await this.projectManager.cleanupProject(projectId);

    // Remove from projects
    this.projects.delete(projectId);

    console.log(`Disconnected project ${projectId}`);
  }

  /**
   * Handle project errors.
   */
  private handleProjectError(projectId: string, error: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'error';
      project.errorMessage = error;
    }
  }

  /**
   * Get service status.
   */
  async getStatus(): Promise<{
    projects: number;
    listeners: number;
    workers: { running: boolean; activeJobs: number }[];
    queue: { pending: number; processing: number; completed: number; failed: number };
  }> {
    const queueStats = await this.queue.getStats();

    return {
      projects: this.projects.size,
      listeners: this.listener.getActiveCount(),
      workers: this.workers.map((w) => w.getStatus()),
      queue: queueStats,
    };
  }

  /**
   * List connected projects.
   */
  listProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get a project by ID.
   */
  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }
}

// Re-export for convenience
export { TranslationWorker };
