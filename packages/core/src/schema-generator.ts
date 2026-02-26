/**
 * Melaka Core - Dynamic Schema Generation
 *
 * Generates Zod schemas dynamically based on document content.
 */

import { z } from 'zod';
import type { SchemaType, FieldMapping, SeparatedContent } from './types';

// ============================================================================
// Schema Generation
// ============================================================================

/**
 * Create a Zod schema for a single field based on its schema type.
 *
 * @param schemaType - The detected or configured schema type
 * @param required - Whether the field is required
 * @returns Zod schema for the field
 */
export function createFieldSchema(
  schemaType: SchemaType,
  required = true
): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (schemaType) {
    case 'string':
      schema = z.string();
      break;
    case 'string[]':
      schema = z.array(z.string());
      break;
    case 'number':
      schema = z.number();
      break;
    case 'number[]':
      schema = z.array(z.number());
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'object':
      schema = z.record(z.unknown());
      break;
    case 'object[]':
      schema = z.array(z.record(z.unknown()));
      break;
    case 'object|null':
      schema = z.record(z.unknown()).nullable();
      break;
    case 'DocumentReference':
      // DocumentReferences are validated as objects with specific shape
      schema = z.object({
        path: z.string(),
        id: z.string(),
      }).passthrough();
      break;
    case 'DocumentReference[]':
      schema = z.array(
        z.object({
          path: z.string(),
          id: z.string(),
        }).passthrough()
      );
      break;
    default:
      schema = z.unknown();
  }

  return required ? schema : schema.optional();
}

/**
 * Create a Zod schema for translatable content.
 *
 * This schema is used to validate AI translation output.
 *
 * @param separatedContent - Content that has been separated into translatable/non-translatable
 * @returns Zod schema matching the translatable content structure
 *
 * @example
 * ```typescript
 * const { translatable, detectedTypes } = separateContent(doc);
 * const schema = createTranslationSchema({ translatable, detectedTypes });
 *
 * // Use with AI translation
 * const result = await ai.generate({
 *   output: { schema },
 *   // ...
 * });
 * ```
 */
export function createTranslationSchema(
  separatedContent: Pick<SeparatedContent, 'translatable' | 'detectedTypes'>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const { translatable, detectedTypes } = separatedContent;
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const field of Object.keys(translatable)) {
    const schemaType = detectedTypes[field] || 'string';
    schemaFields[field] = createFieldSchema(schemaType, true);
  }

  return z.object(schemaFields);
}

/**
 * Create a Zod schema from explicit field mappings.
 *
 * Used when the user provides `fieldMappings` in their config
 * instead of relying on auto-detection.
 *
 * @param fieldMappings - Array of field mapping configurations
 * @returns Zod schema matching the field mappings
 */
export function createSchemaFromMappings(
  fieldMappings: FieldMapping[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const mapping of fieldMappings) {
    const targetField = mapping.targetField || mapping.sourceField;
    const schemaType = mapping.schemaType || 'string';
    const required = mapping.required ?? true;

    schemaFields[targetField] = createFieldSchema(schemaType, required);
  }

  return z.object(schemaFields);
}

/**
 * Create a schema that only includes translatable fields from field mappings.
 *
 * Filters out non-translatable types (numbers, booleans, refs, etc.)
 *
 * @param fieldMappings - Array of field mapping configurations
 * @returns Zod schema for translatable fields only
 */
export function createTranslatableSchemaFromMappings(
  fieldMappings: FieldMapping[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const translatableTypes: SchemaType[] = ['string', 'string[]'];
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const mapping of fieldMappings) {
    const schemaType = mapping.schemaType || 'string';

    // Skip non-translatable types
    if (!translatableTypes.includes(schemaType)) {
      continue;
    }

    const targetField = mapping.targetField || mapping.sourceField;
    const required = mapping.required ?? true;

    schemaFields[targetField] = createFieldSchema(schemaType, required);
  }

  return z.object(schemaFields);
}

// ============================================================================
// Schema Utilities
// ============================================================================

/**
 * Validate data against a schema and return typed result.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws Error if validation fails
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Schema validation failed:\n${errors}`);
  }
  return result.data;
}

/**
 * Safely validate data against a schema.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result object with success flag and data or error
 */
export function safeValidateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Get a JSON-serializable representation of a Zod schema.
 *
 * Useful for sending schema information to AI providers.
 *
 * @param schema - Zod schema to convert
 * @returns JSON Schema representation
 */
export function schemaToJsonSchema(schema: z.ZodTypeAny): unknown {
  // Use zod-to-json-schema if available, otherwise return basic info
  // For now, return a simplified representation
  const shape = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape;

  if (!shape) {
    return { type: 'unknown' };
  }

  const properties: Record<string, { type: string }> = {};
  for (const [key, fieldSchema] of Object.entries(shape)) {
    properties[key] = {
      type: getJsonSchemaType(fieldSchema),
    };
  }

  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
  };
}

/**
 * Get JSON Schema type string for a Zod schema.
 */
function getJsonSchemaType(schema: z.ZodTypeAny): string {
  const typeName = schema._def.typeName;

  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodArray':
      return 'array';
    case 'ZodObject':
      return 'object';
    case 'ZodOptional':
      return getJsonSchemaType((schema._def as { innerType: z.ZodTypeAny }).innerType);
    case 'ZodNullable':
      return getJsonSchemaType((schema._def as { innerType: z.ZodTypeAny }).innerType);
    default:
      return 'unknown';
  }
}
