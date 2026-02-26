/**
 * Melaka Core - Utilities
 *
 * Shared utility functions for content processing, hashing, and field detection.
 */

import { createHash } from 'crypto';
import type { SchemaType, SeparatedContent } from './types';

// ============================================================================
// Content Hashing
// ============================================================================

/**
 * Generate SHA256 hash of content for change detection.
 *
 * @param content - Object to hash
 * @returns Hex-encoded SHA256 hash
 *
 * @example
 * ```typescript
 * const hash = hashContent({ title: 'Hello', body: 'World' });
 * // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
 * ```
 */
export function hashContent(content: Record<string, unknown>): string {
  const normalized = JSON.stringify(content, Object.keys(content).sort());
  return createHash('sha256').update(normalized).digest('hex');
}

// ============================================================================
// Field Type Detection
// ============================================================================

/**
 * Check if a value is a Firestore DocumentReference.
 */
function isDocumentReference(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'path' in value &&
    typeof (value as { path: unknown }).path === 'string' &&
    'id' in value
  );
}

/**
 * Check if a value is a Firestore Timestamp.
 */
function isTimestamp(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_seconds' in value &&
    '_nanoseconds' in value
  );
}

/**
 * Check if a value is a Firestore GeoPoint.
 */
function isGeoPoint(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'latitude' in value &&
    'longitude' in value
  );
}

/**
 * Detect the schema type of a value.
 *
 * @param value - Value to detect type of
 * @returns Detected schema type
 *
 * @example
 * ```typescript
 * detectFieldType('hello') // 'string'
 * detectFieldType(['a', 'b']) // 'string[]'
 * detectFieldType(123) // 'number'
 * detectFieldType({ foo: 'bar' }) // 'object'
 * ```
 */
export function detectFieldType(value: unknown): SchemaType {
  // Null values
  if (value === null) {
    return 'object|null';
  }

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      // Empty arrays default to string[] (most common case)
      return 'string[]';
    }

    const firstItem = value[0];

    // Check for DocumentReference array
    if (isDocumentReference(firstItem)) {
      return 'DocumentReference[]';
    }

    // Check for string array
    if (typeof firstItem === 'string') {
      return 'string[]';
    }

    // Check for number array
    if (typeof firstItem === 'number') {
      return 'number[]';
    }

    // Object array
    if (typeof firstItem === 'object' && firstItem !== null) {
      return 'object[]';
    }

    // Default to string[] for other arrays
    return 'string[]';
  }

  // DocumentReference
  if (isDocumentReference(value)) {
    return 'DocumentReference';
  }

  // Timestamp
  if (isTimestamp(value)) {
    return 'object'; // Timestamps are copied, not translated
  }

  // GeoPoint
  if (isGeoPoint(value)) {
    return 'object'; // GeoPoints are copied, not translated
  }

  // Primitives
  if (typeof value === 'string') {
    return 'string';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  // Objects
  if (typeof value === 'object') {
    return 'object';
  }

  // Default fallback
  return 'object';
}

/**
 * Check if a schema type represents translatable content.
 *
 * Only strings and string arrays are sent to AI for translation.
 * Everything else is copied as-is.
 *
 * @param schemaType - Schema type to check
 * @returns Whether the type is translatable
 */
export function isTranslatableType(schemaType: SchemaType): boolean {
  return schemaType === 'string' || schemaType === 'string[]';
}

// ============================================================================
// Content Separation
// ============================================================================

/**
 * Separate document content into translatable and non-translatable parts.
 *
 * @param doc - Document data
 * @param fields - Optional list of fields to consider (if omitted, all fields are considered)
 * @returns Separated content with detected types
 *
 * @example
 * ```typescript
 * const result = separateContent({
 *   title: 'Hello',
 *   price: 99,
 *   tags: ['sale', 'new'],
 *   author_ref: docRef,
 * });
 *
 * // result.translatable = { title: 'Hello', tags: ['sale', 'new'] }
 * // result.nonTranslatable = { price: 99, author_ref: docRef }
 * // result.detectedTypes = { title: 'string', price: 'number', ... }
 * ```
 */
export function separateContent(
  doc: Record<string, unknown>,
  fields?: string[]
): SeparatedContent {
  const translatable: Record<string, unknown> = {};
  const nonTranslatable: Record<string, unknown> = {};
  const detectedTypes: Record<string, SchemaType> = {};

  for (const [field, value] of Object.entries(doc)) {
    // Skip internal Melaka metadata
    if (field === '_melaka') {
      continue;
    }

    // If fields list is provided, only process those fields
    if (fields && !fields.includes(field)) {
      nonTranslatable[field] = value;
      continue;
    }

    const schemaType = detectFieldType(value);
    detectedTypes[field] = schemaType;

    if (isTranslatableType(schemaType)) {
      translatable[field] = value;
    } else {
      nonTranslatable[field] = value;
    }
  }

  return { translatable, nonTranslatable, detectedTypes };
}

// ============================================================================
// Glossary Utilities
// ============================================================================

/**
 * Merge shared and collection-specific glossaries.
 *
 * Collection glossary takes precedence over shared glossary.
 *
 * @param shared - Shared glossary (applies to all collections)
 * @param collection - Collection-specific glossary
 * @returns Merged glossary
 */
export function mergeGlossaries(
  shared?: Record<string, string>,
  collection?: Record<string, string>
): Record<string, string> {
  return {
    ...(shared || {}),
    ...(collection || {}),
  };
}

/**
 * Format glossary for inclusion in AI prompt.
 *
 * @param glossary - Glossary to format
 * @returns Formatted string for prompt
 *
 * @example
 * ```typescript
 * formatGlossary({ 'checkout': 'checkout', 'cart': 'troli' })
 * // 'checkout → checkout\ncart → troli'
 * ```
 */
export function formatGlossary(glossary?: Record<string, string>): string {
  if (!glossary || Object.keys(glossary).length === 0) {
    return 'No specific glossary terms.';
  }

  return Object.entries(glossary)
    .map(([term, translation]) => `${term} → ${translation}`)
    .join('\n');
}

// ============================================================================
// Language Utilities
// ============================================================================

/**
 * Get display name for a language code.
 *
 * @param code - BCP 47 language code
 * @returns Human-readable language name
 *
 * @example
 * ```typescript
 * getLanguageName('ms-MY') // 'Malay (Malaysia)'
 * getLanguageName('zh-CN') // 'Chinese (Simplified)'
 * ```
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'ms-MY': 'Malay (Malaysia)',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ta-IN': 'Tamil (India)',
    'hi-IN': 'Hindi (India)',
    'id-ID': 'Indonesian',
    'th-TH': 'Thai',
    'vi-VN': 'Vietnamese',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'fr-FR': 'French (France)',
    'de-DE': 'German',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    'ar-SA': 'Arabic (Saudi Arabia)',
    'ru-RU': 'Russian',
    'it-IT': 'Italian',
    'nl-NL': 'Dutch',
    'pl-PL': 'Polish',
    'tr-TR': 'Turkish',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
  };

  return names[code] || code;
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique batch ID for translation operations.
 *
 * @returns Unique batch ID
 *
 * @example
 * ```typescript
 * generateBatchId() // 'batch_1708972800000_a1b2c3'
 * ```
 */
export function generateBatchId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `batch_${timestamp}_${random}`;
}
