/**
 * Melaka Core - Zod Schemas
 *
 * Validation schemas for configuration and runtime data.
 */

import { z } from 'zod';

// ============================================================================
// AI Configuration Schema
// ============================================================================

export const AIProviderSchema = z.enum(['gemini', 'openai', 'claude']);

export const AIConfigSchema = z.object({
  provider: AIProviderSchema,
  model: z.string().min(1, 'Model name is required'),
  temperature: z.number().min(0).max(1).optional().default(0.3),
  apiKeySecret: z.string().optional(),
  apiKey: z.string().optional(),
});

// ============================================================================
// Field Mapping Schema
// ============================================================================

export const SchemaTypeSchema = z.enum([
  'string',
  'string[]',
  'number',
  'number[]',
  'boolean',
  'object',
  'object[]',
  'object|null',
  'DocumentReference',
  'DocumentReference[]',
]);

export const FieldMappingSchema = z.object({
  sourceField: z.string().min(1),
  targetField: z.string().optional(),
  schemaType: SchemaTypeSchema.optional(),
  required: z.boolean().optional(),
  description: z.string().optional(),
});

// ============================================================================
// Collection Configuration Schema
// ============================================================================

export const CollectionConfigSchema = z.object({
  path: z.string().min(1, 'Collection path is required'),
  isCollectionGroup: z.boolean().optional().default(false),
  fields: z.array(z.string()).optional(),
  fieldMappings: z.array(FieldMappingSchema).optional(),
  prompt: z.string().optional(),
  glossary: z.record(z.string(), z.string()).optional(),
  ai: AIConfigSchema.partial().optional(),
  batchSize: z.number().positive().optional(),
  maxConcurrency: z.number().positive().optional(),
  forceUpdate: z.boolean().optional(),
});

// ============================================================================
// Defaults Configuration Schema
// ============================================================================

export const DefaultsConfigSchema = z.object({
  batchSize: z.number().positive().optional().default(20),
  maxConcurrency: z.number().positive().optional().default(10),
  forceUpdate: z.boolean().optional().default(false),
});

// ============================================================================
// Root Configuration Schema
// ============================================================================

export const MelakaConfigSchema = z.object({
  languages: z
    .array(z.string().regex(/^[a-z]{2,3}(-[A-Z]{2,3})?$/, 'Invalid language code (use BCP 47 format, e.g., ms-MY)'))
    .min(1, 'At least one language is required'),
  ai: AIConfigSchema,
  region: z.string().optional().default('us-central1'),
  defaults: DefaultsConfigSchema.optional(),
  glossary: z.record(z.string(), z.string()).optional(),
  collections: z.array(CollectionConfigSchema).min(1, 'At least one collection is required'),
});

// ============================================================================
// Translation Task Payload Schema
// ============================================================================

export const TranslationTaskPayloadSchema = z.object({
  collectionPath: z.string().min(1),
  documentId: z.string().min(1),
  targetLanguage: z.string().min(1),
  config: CollectionConfigSchema,
  batchId: z.string().min(1),
});

// ============================================================================
// Melaka Metadata Schema
// ============================================================================

export const TranslationStatusSchema = z.enum(['completed', 'failed', 'pending']);

export const MelakaMetadataSchema = z.object({
  source_hash: z.string().min(1),
  translated_at: z.any(), // Firestore Timestamp
  model: z.string().min(1),
  status: TranslationStatusSchema,
  reviewed: z.boolean(),
  error: z.string().optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type AIConfigInput = z.input<typeof AIConfigSchema>;
export type AIConfigOutput = z.output<typeof AIConfigSchema>;
export type CollectionConfigInput = z.input<typeof CollectionConfigSchema>;
export type CollectionConfigOutput = z.output<typeof CollectionConfigSchema>;
export type MelakaConfigInput = z.input<typeof MelakaConfigSchema>;
export type MelakaConfigOutput = z.output<typeof MelakaConfigSchema>;
