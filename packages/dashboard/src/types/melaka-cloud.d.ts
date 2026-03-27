/**
 * Type declarations for @melaka/cloud/dashboard
 * These are manually maintained since the cloud package doesn't export DTS in CI
 */

declare module '@melaka/cloud/dashboard' {
  import type { Firestore, Timestamp } from 'firebase-admin/firestore';

  export interface FirestoreDatabaseConfig {
    firestore: Firestore;
    encryptionKey: string;
  }

  export interface ProjectDoc {
    id?: string;
    userId: string;
    firebaseProjectId: string;
    name: string;
    status: 'active' | 'paused' | 'disconnected';
    config: ProjectConfig;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export interface ProjectConfig {
    collections: CollectionConfig[];
    sourceLocale: string;
    targetLocales: string[];
    glossary?: Record<string, Record<string, string>>;
  }

  export interface CollectionConfig {
    path: string;
    fields: string[];
    enabled: boolean;
  }

  export interface OAuthTokenDoc {
    projectId: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    expiresAt: Timestamp;
    scopes: string[];
    googleEmail: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export interface UsageDoc {
    id?: string;
    projectId: string;
    userId: string;
    periodStart: Timestamp;
    periodEnd: Timestamp;
    translationsCount: number;
    charactersCount: number;
    apiCallsCount: number;
    createdAt: Timestamp;
  }

  export interface TranslationJobDoc {
    id?: string;
    projectId: string;
    documentPath: string;
    sourceLocale: string;
    targetLocale: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    fields: Record<string, string>;
    attempts: number;
    error?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
  }

  export interface SubscriptionDoc {
    id?: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
    currentPeriodEnd: Timestamp;
    cancelAtPeriodEnd: boolean;
    trialStart?: Timestamp;
    trialEnd?: Timestamp;
    trialTranslationsUsed?: number;
    trialTranslationsLimit?: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scope: string;
  }

  export interface StoredTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    googleEmail: string;
  }

  export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }

  export class MelakaFirestoreDatabase {
    constructor(config: FirestoreDatabaseConfig);
    
    // Projects
    createProject(data: { userId: string; firebaseProjectId: string; name: string; config: ProjectConfig }): Promise<ProjectDoc & { id: string }>;
    getProject(projectId: string): Promise<(ProjectDoc & { id: string }) | null>;
    getProjectsByUser(userId: string): Promise<(ProjectDoc & { id: string })[]>;
    getProjectsByFirebaseProjectId(firebaseProjectId: string): Promise<(ProjectDoc & { id: string })[]>;
    updateProject(projectId: string, data: Partial<ProjectDoc>): Promise<void>;
    deleteProject(projectId: string): Promise<void>;
    
    // OAuth Tokens
    storeTokens(data: { projectId: string; accessToken: string; refreshToken: string; expiresAt: Date; scopes: string[]; googleEmail: string }): Promise<void>;
    getTokens(projectId: string): Promise<StoredTokens | null>;
    updateAccessToken(projectId: string, accessToken: string, expiresAt: Date): Promise<void>;
    deleteTokens(projectId: string): Promise<void>;
    
    // Usage
    recordUsage(data: { projectId: string; userId: string; translationsCount: number; charactersCount: number }): Promise<void>;
    getUsage(projectId: string, periodStart?: Date): Promise<UsageDoc | null>;
    getUsageHistory(projectId: string, months?: number): Promise<UsageDoc[]>;
    getUserTotalUsage(userId: string): Promise<{ translationsCount: number; charactersCount: number }>;
    
    // Jobs
    createJob(data: { projectId: string; documentPath: string; sourceLocale: string; targetLocale: string; status: string; fields: Record<string, string> }): Promise<string>;
    updateJobStatus(jobId: string, status: string, error?: string): Promise<void>;
    getJob(jobId: string): Promise<(TranslationJobDoc & { id: string }) | null>;
    getPendingJobs(projectId: string, limit?: number): Promise<(TranslationJobDoc & { id: string })[]>;
    getJobsByProject(projectId: string, options?: { limit?: number; status?: string }): Promise<(TranslationJobDoc & { id: string })[]>;
    
    // Subscriptions
    upsertSubscription(data: { 
      userId: string; 
      stripeCustomerId: string; 
      stripeSubscriptionId: string;
      planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
      status: string;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      trialStart?: Date;
      trialEnd?: Date;
      trialTranslationsLimit?: number;
    }): Promise<void>;
    getSubscription(userId: string): Promise<(SubscriptionDoc & { id: string }) | null>;
    getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<(SubscriptionDoc & { id: string }) | null>;
    getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<(SubscriptionDoc & { id: string }) | null>;
    updateSubscriptionStatus(userId: string, status: string, data?: Partial<SubscriptionDoc>): Promise<void>;
    deleteSubscription(userId: string): Promise<void>;
  }

  export class OAuthManager {
    constructor(config: OAuthConfig);
    getAuthUrl(state: string): string;
    exchangeCode(code: string): Promise<OAuthTokens>;
    refreshTokens(refreshToken: string): Promise<OAuthTokens>;
    verifyToken(accessToken: string): Promise<{ email: string; name: string; picture?: string }>;
  }

  export function encrypt(text: string, key: string): string;
  export function decrypt(encrypted: string, key: string): string;
}
