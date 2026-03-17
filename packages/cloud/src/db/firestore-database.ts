/**
 * Database layer for Melaka Cloud using Firestore.
 * Stores projects, encrypted OAuth tokens, and usage records.
 */

import {
  Firestore,
  FieldValue,
  Timestamp,
  type DocumentReference,
} from 'firebase-admin/firestore';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption config
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;

// Collection names
const COLLECTIONS = {
  projects: 'melaka_projects',
  tokens: 'melaka_oauth_tokens',
  usage: 'melaka_usage',
  jobs: 'melaka_jobs',
  subscriptions: 'melaka_subscriptions',
} as const;

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
  projectId: string;
  documentPath: string;
  sourceLocale: string;
  targetLocale: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fields: Record<string, string>;
  error?: string;
  attempts: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubscriptionDoc {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  // Trial tracking
  trialStart?: Timestamp;
  trialEnd?: Timestamp;
  trialTranslationsUsed?: number;
  trialTranslationsLimit?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Encrypt sensitive data using AES-256-GCM.
 */
export function encrypt(plaintext: string, encryptionKey: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(encryptionKey, salt, 32);
  const iv = randomBytes(16);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: salt:iv:tag:encrypted (all base64)
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypt sensitive data.
 */
export function decrypt(ciphertext: string, encryptionKey: string): string {
  const [saltB64, ivB64, tagB64, encryptedB64] = ciphertext.split(':');

  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');

  const key = scryptSync(encryptionKey, salt, 32);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

export interface FirestoreDatabaseConfig {
  firestore: Firestore;
  encryptionKey: string;
}

export class MelakaFirestoreDatabase {
  private db: Firestore;
  private encryptionKey: string;

  constructor(config: FirestoreDatabaseConfig) {
    this.db = config.firestore;
    this.encryptionKey = config.encryptionKey;
  }

  // ==================== Projects ====================

  async createProject(data: {
    userId: string;
    firebaseProjectId: string;
    name: string;
    config: ProjectConfig;
  }): Promise<ProjectDoc & { id: string }> {
    const now = Timestamp.now();
    const projectData: Omit<ProjectDoc, 'id'> = {
      userId: data.userId,
      firebaseProjectId: data.firebaseProjectId,
      name: data.name,
      status: 'active',
      config: data.config,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection(COLLECTIONS.projects).add(projectData);
    return { id: docRef.id, ...projectData };
  }

  async getProject(projectId: string): Promise<(ProjectDoc & { id: string }) | null> {
    const doc = await this.db.collection(COLLECTIONS.projects).doc(projectId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ProjectDoc & { id: string };
  }

  async getProjectsByUser(userId: string): Promise<(ProjectDoc & { id: string })[]> {
    const snapshot = await this.db
      .collection(COLLECTIONS.projects)
      .where('userId', '==', userId)
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (ProjectDoc & { id: string })[];
    
    // Sort in memory to avoid requiring a composite index
    return projects.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }

  async updateProject(
    projectId: string,
    updates: Partial<ProjectConfig> & { status?: ProjectDoc['status'] }
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.collections) updateData['config.collections'] = updates.collections;
    if (updates.sourceLocale) updateData['config.sourceLocale'] = updates.sourceLocale;
    if (updates.targetLocales) updateData['config.targetLocales'] = updates.targetLocales;
    if (updates.glossary) updateData['config.glossary'] = updates.glossary;

    await this.db.collection(COLLECTIONS.projects).doc(projectId).update(updateData);
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.projects).doc(projectId).delete();
  }

  async getProjectsByFirebaseProjectId(firebaseProjectId: string): Promise<(ProjectDoc & { id: string })[]> {
    const snapshot = await this.db
      .collection(COLLECTIONS.projects)
      .where('firebaseProjectId', '==', firebaseProjectId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (ProjectDoc & { id: string })[];
  }

  // ==================== OAuth Tokens ====================

  async storeTokens(data: {
    projectId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    googleEmail: string;
  }): Promise<void> {
    const now = Timestamp.now();
    const tokenData: OAuthTokenDoc = {
      projectId: data.projectId,
      accessTokenEncrypted: encrypt(data.accessToken, this.encryptionKey),
      refreshTokenEncrypted: encrypt(data.refreshToken, this.encryptionKey),
      expiresAt: Timestamp.fromDate(data.expiresAt),
      scopes: data.scopes,
      googleEmail: data.googleEmail,
      createdAt: now,
      updatedAt: now,
    };

    // Use projectId as document ID for easy lookup
    await this.db.collection(COLLECTIONS.tokens).doc(data.projectId).set(tokenData);
  }

  async getTokens(projectId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    googleEmail: string;
  } | null> {
    const doc = await this.db.collection(COLLECTIONS.tokens).doc(projectId).get();
    if (!doc.exists) return null;

    const data = doc.data() as OAuthTokenDoc;
    return {
      accessToken: decrypt(data.accessTokenEncrypted, this.encryptionKey),
      refreshToken: decrypt(data.refreshTokenEncrypted, this.encryptionKey),
      expiresAt: data.expiresAt.toDate(),
      scopes: data.scopes,
      googleEmail: data.googleEmail,
    };
  }

  async updateAccessToken(projectId: string, accessToken: string, expiresAt: Date): Promise<void> {
    await this.db.collection(COLLECTIONS.tokens).doc(projectId).update({
      accessTokenEncrypted: encrypt(accessToken, this.encryptionKey),
      expiresAt: Timestamp.fromDate(expiresAt),
      updatedAt: Timestamp.now(),
    });
  }

  async deleteTokens(projectId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.tokens).doc(projectId).delete();
  }

  // ==================== Usage Records ====================

  async recordUsage(data: {
    projectId: string;
    userId: string;
    translationsCount: number;
    charactersCount: number;
    apiCallsCount: number;
  }): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Use composite ID for the usage period
    const usageId = `${data.projectId}_${periodStart.toISOString().slice(0, 7)}`;
    const usageRef = this.db.collection(COLLECTIONS.usage).doc(usageId);

    await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(usageRef);

      if (doc.exists) {
        transaction.update(usageRef, {
          translationsCount: FieldValue.increment(data.translationsCount),
          charactersCount: FieldValue.increment(data.charactersCount),
          apiCallsCount: FieldValue.increment(data.apiCallsCount),
        });
      } else {
        const usageData: UsageDoc = {
          projectId: data.projectId,
          userId: data.userId,
          periodStart: Timestamp.fromDate(periodStart),
          periodEnd: Timestamp.fromDate(periodEnd),
          translationsCount: data.translationsCount,
          charactersCount: data.charactersCount,
          apiCallsCount: data.apiCallsCount,
          createdAt: Timestamp.now(),
        };
        transaction.set(usageRef, usageData);
      }
    });
  }

  async getUsage(projectId: string, periodStart?: Date): Promise<UsageDoc | null> {
    const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const usageId = `${projectId}_${start.toISOString().slice(0, 7)}`;

    const doc = await this.db.collection(COLLECTIONS.usage).doc(usageId).get();
    if (!doc.exists) return null;
    return doc.data() as UsageDoc;
  }

  async getUsageHistory(projectId: string, months: number = 12): Promise<UsageDoc[]> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const snapshot = await this.db
      .collection(COLLECTIONS.usage)
      .where('projectId', '==', projectId)
      .where('periodStart', '>=', Timestamp.fromDate(cutoff))
      .orderBy('periodStart', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data()) as UsageDoc[];
  }

  // ==================== Translation Jobs ====================

  async createJob(data: {
    projectId: string;
    documentPath: string;
    sourceLocale: string;
    targetLocale: string;
    fields: Record<string, string>;
  }): Promise<string> {
    const now = Timestamp.now();
    const jobData: TranslationJobDoc = {
      projectId: data.projectId,
      documentPath: data.documentPath,
      sourceLocale: data.sourceLocale,
      targetLocale: data.targetLocale,
      status: 'pending',
      fields: data.fields,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection(COLLECTIONS.jobs).add(jobData);
    return docRef.id;
  }

  async updateJobStatus(
    jobId: string,
    status: TranslationJobDoc['status'],
    error?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (status === 'processing') {
      updateData.attempts = FieldValue.increment(1);
    }
    if (error) {
      updateData.error = error;
    }
    await this.db.collection(COLLECTIONS.jobs).doc(jobId).update(updateData);
  }

  async getJob(jobId: string): Promise<(TranslationJobDoc & { id: string }) | null> {
    const doc = await this.db.collection(COLLECTIONS.jobs).doc(jobId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as TranslationJobDoc & { id: string };
  }

  async getPendingJobs(projectId: string, limit: number = 100): Promise<(TranslationJobDoc & { id: string })[]> {
    const snapshot = await this.db
      .collection(COLLECTIONS.jobs)
      .where('projectId', '==', projectId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (TranslationJobDoc & { id: string })[];
  }

  async getJobsByProject(
    projectId: string,
    options?: {
      status?: TranslationJobDoc['status'];
      limit?: number;
    }
  ): Promise<(TranslationJobDoc & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(COLLECTIONS.jobs)
      .where('projectId', '==', projectId);

    if (options?.status) {
      query = query.where('status', '==', options.status);
    }

    const snapshot = await query.limit(options?.limit ?? 200).get();

    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (TranslationJobDoc & { id: string })[];

    // Sort in memory to avoid requiring composite indexes
    return jobs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }

  // ==================== Subscriptions ====================

  async upsertSubscription(data: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planId: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
    status: SubscriptionDoc['status'];
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialStart?: Date;
    trialEnd?: Date;
    trialTranslationsLimit?: number;
  }): Promise<void> {
    const now = Timestamp.now();
    // Use userId as document ID for easy lookup
    const docRef = this.db.collection(COLLECTIONS.subscriptions).doc(data.userId);
    const existing = await docRef.get();

    if (existing.exists) {
      const updateData: Record<string, unknown> = {
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        planId: data.planId,
        status: data.status,
        currentPeriodEnd: Timestamp.fromDate(data.currentPeriodEnd),
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        updatedAt: now,
      };
      if (data.trialStart) updateData.trialStart = Timestamp.fromDate(data.trialStart);
      if (data.trialEnd) updateData.trialEnd = Timestamp.fromDate(data.trialEnd);
      if (data.trialTranslationsLimit) updateData.trialTranslationsLimit = data.trialTranslationsLimit;
      await docRef.update(updateData);
    } else {
      const subData: SubscriptionDoc = {
        userId: data.userId,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        planId: data.planId,
        status: data.status,
        currentPeriodEnd: Timestamp.fromDate(data.currentPeriodEnd),
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        trialStart: data.trialStart ? Timestamp.fromDate(data.trialStart) : undefined,
        trialEnd: data.trialEnd ? Timestamp.fromDate(data.trialEnd) : undefined,
        trialTranslationsUsed: 0,
        trialTranslationsLimit: data.trialTranslationsLimit,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(subData);
    }
  }

  async getSubscription(userId: string): Promise<(SubscriptionDoc & { id: string }) | null> {
    const doc = await this.db.collection(COLLECTIONS.subscriptions).doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as SubscriptionDoc & { id: string };
  }

  async getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<(SubscriptionDoc & { id: string }) | null> {
    const snapshot = await this.db
      .collection(COLLECTIONS.subscriptions)
      .where('stripeCustomerId', '==', stripeCustomerId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as SubscriptionDoc & { id: string };
  }

  async getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<(SubscriptionDoc & { id: string }) | null> {
    const snapshot = await this.db
      .collection(COLLECTIONS.subscriptions)
      .where('stripeSubscriptionId', '==', stripeSubscriptionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as SubscriptionDoc & { id: string };
  }

  async updateSubscriptionStatus(
    userId: string,
    status: SubscriptionDoc['status'],
    updates?: { cancelAtPeriodEnd?: boolean; currentPeriodEnd?: Date }
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (updates?.cancelAtPeriodEnd !== undefined) {
      updateData.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;
    }
    if (updates?.currentPeriodEnd) {
      updateData.currentPeriodEnd = Timestamp.fromDate(updates.currentPeriodEnd);
    }
    await this.db.collection(COLLECTIONS.subscriptions).doc(userId).update(updateData);
  }

  async deleteSubscription(userId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.subscriptions).doc(userId).delete();
  }
}
