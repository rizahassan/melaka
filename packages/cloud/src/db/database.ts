/**
 * Database schema and client for Melaka Cloud.
 * Uses Supabase Postgres for persistent storage.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption config
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;

export interface ProjectRow {
  id: string;
  user_id: string;
  firebase_project_id: string;
  name: string;
  status: 'active' | 'paused' | 'disconnected';
  config: ProjectConfig;
  created_at: string;
  updated_at: string;
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

export interface OAuthTokenRow {
  id: string;
  project_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string;
  scopes: string[];
  google_email: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationJobRow {
  id: string;
  project_id: string;
  document_path: string;
  source_locale: string;
  target_locale: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fields: Record<string, string>;
  error?: string;
  attempts: number;
  created_at: string;
  updated_at: string;
}

export interface UsageRecordRow {
  id: string;
  project_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  translations_count: number;
  characters_count: number;
  api_calls_count: number;
  created_at: string;
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

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
  encryptionKey: string;
}

export class MelakaDatabase {
  private client: SupabaseClient;
  private encryptionKey: string;

  constructor(config: DatabaseConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey);
    this.encryptionKey = config.encryptionKey;
  }

  // ==================== Projects ====================

  async createProject(data: {
    userId: string;
    firebaseProjectId: string;
    name: string;
    config: ProjectConfig;
  }): Promise<ProjectRow> {
    const { data: project, error } = await this.client
      .from('projects')
      .insert({
        user_id: data.userId,
        firebase_project_id: data.firebaseProjectId,
        name: data.name,
        status: 'active',
        config: data.config,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);
    return project as ProjectRow;
  }

  async getProject(projectId: string): Promise<ProjectRow | null> {
    const { data, error } = await this.client
      .from('projects')
      .select()
      .eq('id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get project: ${error.message}`);
    }
    return data as ProjectRow | null;
  }

  async getProjectsByUser(userId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.client
      .from('projects')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get projects: ${error.message}`);
    return (data || []) as ProjectRow[];
  }

  async updateProject(projectId: string, updates: Partial<ProjectConfig> & { status?: ProjectRow['status'] }): Promise<ProjectRow> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.status) updateData.status = updates.status;
    if (updates.collections || updates.sourceLocale || updates.targetLocales || updates.glossary) {
      updateData.config = updates;
    }

    const { data, error } = await this.client
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update project: ${error.message}`);
    return data as ProjectRow;
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw new Error(`Failed to delete project: ${error.message}`);
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
    const encryptedAccess = encrypt(data.accessToken, this.encryptionKey);
    const encryptedRefresh = encrypt(data.refreshToken, this.encryptionKey);

    const { error } = await this.client
      .from('oauth_tokens')
      .upsert({
        project_id: data.projectId,
        access_token_encrypted: encryptedAccess,
        refresh_token_encrypted: encryptedRefresh,
        expires_at: data.expiresAt.toISOString(),
        scopes: data.scopes,
        google_email: data.googleEmail,
      }, {
        onConflict: 'project_id',
      });

    if (error) throw new Error(`Failed to store tokens: ${error.message}`);
  }

  async getTokens(projectId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    googleEmail: string;
  } | null> {
    const { data, error } = await this.client
      .from('oauth_tokens')
      .select()
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
    if (!data) return null;

    const row = data as OAuthTokenRow;
    return {
      accessToken: decrypt(row.access_token_encrypted, this.encryptionKey),
      refreshToken: decrypt(row.refresh_token_encrypted, this.encryptionKey),
      expiresAt: new Date(row.expires_at),
      scopes: row.scopes,
      googleEmail: row.google_email,
    };
  }

  async updateAccessToken(projectId: string, accessToken: string, expiresAt: Date): Promise<void> {
    const encryptedAccess = encrypt(accessToken, this.encryptionKey);

    const { error } = await this.client
      .from('oauth_tokens')
      .update({
        access_token_encrypted: encryptedAccess,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to update access token: ${error.message}`);
  }

  async deleteTokens(projectId: string): Promise<void> {
    const { error } = await this.client
      .from('oauth_tokens')
      .delete()
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to delete tokens: ${error.message}`);
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

    // Try to get existing record for this period
    const { data: existing } = await this.client
      .from('usage_records')
      .select()
      .eq('project_id', data.projectId)
      .eq('period_start', periodStart.toISOString())
      .single();

    if (existing) {
      const row = existing as UsageRecordRow;
      const { error } = await this.client
        .from('usage_records')
        .update({
          translations_count: row.translations_count + data.translationsCount,
          characters_count: row.characters_count + data.charactersCount,
          api_calls_count: row.api_calls_count + data.apiCallsCount,
        })
        .eq('id', row.id);

      if (error) throw new Error(`Failed to update usage: ${error.message}`);
    } else {
      const { error } = await this.client
        .from('usage_records')
        .insert({
          project_id: data.projectId,
          user_id: data.userId,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          translations_count: data.translationsCount,
          characters_count: data.charactersCount,
          api_calls_count: data.apiCallsCount,
        });

      if (error) throw new Error(`Failed to create usage record: ${error.message}`);
    }
  }

  async getUsage(projectId: string, periodStart?: Date): Promise<UsageRecordRow | null> {
    const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const { data, error } = await this.client
      .from('usage_records')
      .select()
      .eq('project_id', projectId)
      .eq('period_start', start.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get usage: ${error.message}`);
    }
    return data as UsageRecordRow | null;
  }

  async getUsageHistory(projectId: string, months: number = 12): Promise<UsageRecordRow[]> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const { data, error } = await this.client
      .from('usage_records')
      .select()
      .eq('project_id', projectId)
      .gte('period_start', cutoff.toISOString())
      .order('period_start', { ascending: false });

    if (error) throw new Error(`Failed to get usage history: ${error.message}`);
    return (data || []) as UsageRecordRow[];
  }
}
