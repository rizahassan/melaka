/**
 * Melaka Core Types
 * 
 * This file contains all the core TypeScript interfaces and types
 * used throughout the Melaka SDK.
 */

import { Timestamp } from 'firebase-admin/firestore';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Root configuration for Melaka.
 * Define in `melaka.config.ts` at your project root.
 */
export interface MelakaConfig {
  /**
   * Target languages for translation (BCP 47 format).
   * @example ['ms-MY', 'zh-CN', 'ta-IN']
   */
  languages: string[];

  /**
   * AI provider configuration.
   */
  ai: AIConfig;

  /**
   * Firebase region for deployed functions.
   * @default 'us-central1'
   */
  region?: string;

  /**
   * Default settings applied to all collections.
   */
  defaults?: DefaultsConfig;

  /**
   * Shared glossary applied to all collections.
   * Maps source terms to translations.
   */
  glossary?: Record<string, string>;

  /**
   * Collections to translate.
   */
  collections: CollectionConfig[];
}

/**
 * AI provider configuration.
 */
export interface AIConfig {
  /**
   * AI provider to use.
   */
  provider: 'gemini' | 'openai' | 'claude';

  /**
   * Model name/identifier.
   * @example 'gemini-2.5-flash'
   * @example 'gpt-4o-mini'
   * @example 'claude-sonnet-4-20250514'
   */
  model: string;

  /**
   * Temperature for generation (0-1).
   * Lower = more consistent, higher = more creative.
   * @default 0.3
   */
  temperature?: number;

  /**
   * Firebase secret name for API key.
   * @example 'GEMINI_API_KEY'
   */
  apiKeySecret?: string;

  /**
   * API key directly (for local development only).
   * Prefer `apiKeySecret` for production.
   */
  apiKey?: string;
}

/**
 * Default settings for all collections.
 */
export interface DefaultsConfig {
  /**
   * Number of documents to process per batch.
   * @default 20
   */
  batchSize?: number;

  /**
   * Maximum concurrent translation tasks.
   * @default 10
   */
  maxConcurrency?: number;

  /**
   * Force re-translation even if content unchanged.
   * @default false
   */
  forceUpdate?: boolean;
}

/**
 * Configuration for a collection to translate.
 */
export interface CollectionConfig {
  /**
   * Firestore collection path.
   * @example 'articles'
   * @example 'quiz'
   */
  path: string;

  /**
   * Use collection group query (for subcollections).
   * @default false
   */
  isCollectionGroup?: boolean;

  /**
   * Fields to translate.
   * If omitted, auto-detects translatable string fields.
   */
  fields?: string[];

  /**
   * Detailed field mapping configuration.
   * Use for fine-grained control over translation behavior.
   */
  fieldMappings?: FieldMapping[];

  /**
   * Custom prompt/context for AI translation.
   * Helps the AI understand the content type.
   */
  prompt?: string;

  /**
   * Collection-specific glossary (merged with shared glossary).
   */
  glossary?: Record<string, string>;

  /**
   * Override AI config for this collection.
   */
  ai?: Partial<AIConfig>;

  /**
   * Override batch size for this collection.
   */
  batchSize?: number;

  /**
   * Override max concurrency for this collection.
   */
  maxConcurrency?: number;

  /**
   * Override force update for this collection.
   */
  forceUpdate?: boolean;
}

/**
 * Detailed field mapping configuration.
 */
export interface FieldMapping {
  /**
   * Field name in source document.
   */
  sourceField: string;

  /**
   * Field name in translation (defaults to sourceField).
   */
  targetField?: string;

  /**
   * Schema type for the field.
   * Used for schema generation and to determine translatability.
   */
  schemaType?: SchemaType;

  /**
   * Whether the field is required.
   * Translation fails if required field is missing.
   */
  required?: boolean;

  /**
   * Description to help AI understand field context.
   */
  description?: string;
}

/**
 * Supported schema types for field mappings.
 */
export type SchemaType =
  | 'string'
  | 'string[]'
  | 'number'
  | 'number[]'
  | 'boolean'
  | 'object'
  | 'object[]'
  | 'object|null'
  | 'DocumentReference'
  | 'DocumentReference[]';

// ============================================================================
// Translation Types
// ============================================================================

/**
 * Metadata stored with each translation in the i18n subcollection.
 */
export interface MelakaMetadata {
  /**
   * SHA256 hash of source content for change detection.
   */
  source_hash: string;

  /**
   * Timestamp when translation was created/updated.
   */
  translated_at: Timestamp;

  /**
   * AI model used for translation.
   */
  model: string;

  /**
   * Translation status.
   */
  status: TranslationStatus;

  /**
   * Whether translation has been human-reviewed.
   */
  reviewed: boolean;

  /**
   * Error message if status is 'failed'.
   */
  error?: string;
}

/**
 * Translation status values.
 */
export type TranslationStatus = 'completed' | 'failed' | 'pending';

/**
 * Payload for translation Cloud Task.
 */
export interface TranslationTaskPayload {
  /**
   * Full path to the document's collection.
   */
  collectionPath: string;

  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Target language code.
   */
  targetLanguage: string;

  /**
   * Collection configuration.
   */
  config: CollectionConfig;

  /**
   * Batch ID for tracking.
   */
  batchId: string;
}

/**
 * Result of a translation operation.
 */
export interface TranslationResult {
  /**
   * Whether translation succeeded.
   */
  success: boolean;

  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Target language.
   */
  language: string;

  /**
   * Error message if failed.
   */
  error?: string;

  /**
   * Duration in milliseconds.
   */
  durationMs?: number;
}

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Result of a migration/batch translation operation.
 */
export interface MigrationResult {
  /**
   * Whether migration completed successfully.
   */
  success: boolean;

  /**
   * Human-readable message.
   */
  message: string;

  /**
   * Batch ID for tracking.
   */
  batchId: string;

  /**
   * Total documents in collection.
   */
  totalDocuments: number;

  /**
   * Number of tasks successfully enqueued.
   */
  tasksEnqueued: number;

  /**
   * Number of tasks that failed to enqueue.
   */
  failed: number;
}

/**
 * Progress of a translation migration.
 */
export interface ProgressResult {
  /**
   * Total documents in collection.
   */
  totalDocuments: number;

  /**
   * Successfully translated documents.
   */
  completedCount: number;

  /**
   * Failed translations.
   */
  failedCount: number;

  /**
   * Pending translations.
   */
  pendingCount: number;

  /**
   * Progress percentage (0-100).
   */
  progress: number;

  /**
   * Overall status.
   */
  status: 'completed' | 'in-progress';
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Content separated by translatability.
 */
export interface SeparatedContent {
  /**
   * Content to be translated (strings and string arrays).
   */
  translatable: Record<string, unknown>;

  /**
   * Content to be copied as-is (numbers, refs, etc.).
   */
  nonTranslatable: Record<string, unknown>;

  /**
   * Detected schema types for each field.
   */
  detectedTypes: Record<string, SchemaType>;
}

/**
 * Request to the translation facade.
 */
export interface TranslationRequest<TInput, TOutput> {
  /**
   * Zod schema for input validation.
   */
  inputSchema: unknown; // z.ZodSchema<TInput>

  /**
   * Zod schema for output validation.
   */
  outputSchema: unknown; // z.ZodSchema<TOutput>

  /**
   * Data to translate.
   */
  inputData: TInput;

  /**
   * Target language.
   */
  language: string;

  /**
   * Custom translation prompt.
   */
  prompt?: string;

  /**
   * Glossary of term translations.
   */
  glossary?: Record<string, string>;
}

// ============================================================================
// Config Helper
// ============================================================================

/**
 * Define a Melaka configuration with type checking.
 * 
 * @example
 * ```typescript
 * // melaka.config.ts
 * import { defineConfig } from 'melaka';
 * 
 * export default defineConfig({
 *   languages: ['ms-MY'],
 *   ai: { provider: 'gemini', model: 'gemini-2.5-flash' },
 *   collections: [
 *     { path: 'articles', fields: ['title', 'content'] },
 *   ],
 * });
 * ```
 */
export function defineConfig(config: MelakaConfig): MelakaConfig {
  return config;
}
