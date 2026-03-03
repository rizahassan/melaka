/**
 * Melaka Cloud Service - GCP Edition
 * Uses Firestore + Cloud Tasks instead of Supabase + Redis
 */

import type { Firestore } from 'firebase-admin/firestore';
import { MelakaFirestoreDatabase, type ProjectDoc, type ProjectConfig } from './db/firestore-database.js';
import { MelakaCloudTasks, type CloudTasksConfig, type TaskPayload } from './cloud-tasks.js';
import { OAuthManager, type OAuthConfig, type OAuthTokens } from './oauth-manager.js';
import { createTranslationFacade, type TranslationFacade } from '@melaka/ai';

export interface MelakaCloudGCPConfig {
  // Firestore instance (from firebase-admin)
  firestore: Firestore;
  
  // Encryption key for OAuth tokens
  encryptionKey: string;
  
  // Google OAuth config
  oauth: OAuthConfig;
  
  // Cloud Tasks config
  tasks: CloudTasksConfig;
  
  // AI provider config
  ai: {
    provider: 'gemini' | 'openai' | 'claude';
    apiKey: string;
    model?: string;
  };
}

export class MelakaCloudGCP {
  private db: MelakaFirestoreDatabase;
  private tasks: MelakaCloudTasks;
  private oauth: OAuthManager;
  private translator: TranslationFacade;
  private config: MelakaCloudGCPConfig;

  constructor(config: MelakaCloudGCPConfig) {
    this.config = config;
    
    this.db = new MelakaFirestoreDatabase({
      firestore: config.firestore,
      encryptionKey: config.encryptionKey,
    });
    
    this.tasks = new MelakaCloudTasks(config.tasks);
    this.oauth = new OAuthManager(config.oauth);
    
    this.translator = createTranslationFacade({
      provider: config.ai.provider,
      apiKey: config.ai.apiKey,
      model: config.ai.model || this.getDefaultModel(config.ai.provider),
    });
  }

  private getDefaultModel(provider: 'gemini' | 'openai' | 'claude'): string {
    switch (provider) {
      case 'gemini': return 'gemini-2.0-flash';
      case 'openai': return 'gpt-4o-mini';
      case 'claude': return 'claude-sonnet-4-20250514';
    }
  }

  // ==================== OAuth Flow ====================

  /**
   * Get the OAuth authorization URL for a user.
   */
  getAuthUrl(userId: string, projectId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, projectId })).toString('base64');
    return this.oauth.getAuthUrl(state);
  }

  /**
   * Handle OAuth callback and store tokens.
   */
  async handleOAuthCallback(code: string, state: string): Promise<{
    projectId: string;
    email: string;
  }> {
    // Decode state
    const { userId, projectId } = JSON.parse(Buffer.from(state, 'base64').toString());
    
    // Exchange code for tokens
    const tokens = await this.oauth.exchangeCode(code);
    
    // Get user info
    const userInfo = await this.oauth.verifyToken(tokens.accessToken);
    
    // Store encrypted tokens
    await this.db.storeTokens({
      projectId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(tokens.expiresAt),
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      googleEmail: userInfo.email,
    });
    
    return {
      projectId,
      email: userInfo.email,
    };
  }

  // ==================== Project Management ====================

  async createProject(data: {
    userId: string;
    firebaseProjectId: string;
    name: string;
    config?: Partial<ProjectConfig>;
  }) {
    const defaultConfig: ProjectConfig = {
      collections: [],
      sourceLocale: 'en',
      targetLocales: [],
      ...data.config,
    };

    return this.db.createProject({
      userId: data.userId,
      firebaseProjectId: data.firebaseProjectId,
      name: data.name,
      config: defaultConfig,
    });
  }

  async getProject(projectId: string) {
    return this.db.getProject(projectId);
  }

  async getProjectsByUser(userId: string) {
    return this.db.getProjectsByUser(userId);
  }

  async updateProject(projectId: string, updates: Partial<ProjectConfig> & { status?: ProjectDoc['status'] }) {
    return this.db.updateProject(projectId, updates);
  }

  async deleteProject(projectId: string) {
    await this.db.deleteTokens(projectId);
    await this.db.deleteProject(projectId);
  }

  // ==================== Translation Jobs ====================

  /**
   * Queue a document for translation.
   */
  async queueTranslation(data: {
    projectId: string;
    documentPath: string;
    sourceLocale: string;
    targetLocale: string;
    fields: Record<string, string>;
  }): Promise<string> {
    // Create job in Firestore
    const jobId = await this.db.createJob(data);
    
    // Enqueue Cloud Task
    const payload: TaskPayload = {
      jobId,
      projectId: data.projectId,
      documentPath: data.documentPath,
      sourceLocale: data.sourceLocale,
      targetLocale: data.targetLocale,
      fields: data.fields,
    };
    
    await this.tasks.enqueueTranslation(payload);
    
    return jobId;
  }

  /**
   * Queue multiple translations for a document (all target locales).
   */
  async queueDocumentTranslations(data: {
    projectId: string;
    documentPath: string;
    sourceLocale: string;
    targetLocales: string[];
    fields: Record<string, string>;
  }): Promise<string[]> {
    const jobIds: string[] = [];
    const payloads: TaskPayload[] = [];
    
    for (const targetLocale of data.targetLocales) {
      const jobId = await this.db.createJob({
        projectId: data.projectId,
        documentPath: data.documentPath,
        sourceLocale: data.sourceLocale,
        targetLocale,
        fields: data.fields,
      });
      
      jobIds.push(jobId);
      payloads.push({
        jobId,
        projectId: data.projectId,
        documentPath: data.documentPath,
        sourceLocale: data.sourceLocale,
        targetLocale,
        fields: data.fields,
      });
    }
    
    await this.tasks.enqueueBatch(payloads);
    
    return jobIds;
  }

  // ==================== Usage ====================

  async recordUsage(data: {
    projectId: string;
    userId: string;
    translationsCount: number;
    charactersCount: number;
  }) {
    return this.db.recordUsage({
      ...data,
      apiCallsCount: 1,
    });
  }

  async getUsage(projectId: string) {
    return this.db.getUsage(projectId);
  }

  async getUsageHistory(projectId: string, months?: number) {
    return this.db.getUsageHistory(projectId, months);
  }

  // ==================== Accessors ====================

  get database() {
    return this.db;
  }

  get cloudTasks() {
    return this.tasks;
  }

  get oauthManager() {
    return this.oauth;
  }

  get translationFacade() {
    return this.translator;
  }
}
