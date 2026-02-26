/**
 * @melaka/core
 *
 * Core types, schemas, and utilities for Melaka - AI-powered Firestore localization.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Configuration
  MelakaConfig,
  AIConfig,
  DefaultsConfig,
  CollectionConfig,
  FieldMapping,
  SchemaType,
  // Translation
  MelakaMetadata,
  TranslationStatus,
  TranslationTaskPayload,
  TranslationResult,
  // Migration
  MigrationResult,
  ProgressResult,
  // Helpers
  SeparatedContent,
  TranslationRequest,
} from './types';

// Re-export defineConfig from types
export { defineConfig } from './types';

// ============================================================================
// Schemas (Zod)
// ============================================================================

export {
  // Config schemas
  MelakaConfigSchema,
  AIConfigSchema,
  AIProviderSchema,
  CollectionConfigSchema,
  DefaultsConfigSchema,
  FieldMappingSchema,
  SchemaTypeSchema,
  // Runtime schemas
  TranslationTaskPayloadSchema,
  MelakaMetadataSchema,
  TranslationStatusSchema,
  // Type inference
  type AIConfigInput,
  type AIConfigOutput,
  type CollectionConfigInput,
  type CollectionConfigOutput,
  type MelakaConfigInput,
  type MelakaConfigOutput,
} from './schemas';

// ============================================================================
// Config Loading
// ============================================================================

export {
  loadConfig,
  validateConfig,
  configExists,
  getEffectiveAIConfig,
  getEffectiveBatchSize,
  getEffectiveMaxConcurrency,
  getEffectiveForceUpdate,
  findCollectionConfig,
} from './config';

// ============================================================================
// Utilities
// ============================================================================

export {
  // Content hashing
  hashContent,
  // Field detection
  detectFieldType,
  isTranslatableType,
  // Content separation
  separateContent,
  // Glossary
  mergeGlossaries,
  formatGlossary,
  // Language
  getLanguageName,
  // ID generation
  generateBatchId,
} from './utils';

// ============================================================================
// Schema Generation
// ============================================================================

export {
  createFieldSchema,
  createTranslationSchema,
  createSchemaFromMappings,
  createTranslatableSchemaFromMappings,
  validateWithSchema,
  safeValidateWithSchema,
  schemaToJsonSchema,
} from './schema-generator';
