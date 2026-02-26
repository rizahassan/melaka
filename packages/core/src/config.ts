/**
 * Melaka Core - Config Loader
 *
 * Loads and validates melaka.config.ts configuration files.
 */

import { pathToFileURL } from 'url';
import path from 'path';
import { MelakaConfigSchema } from './schemas';
import type { MelakaConfig, CollectionConfig, AIConfig } from './types';

// ============================================================================
// Config Loading
// ============================================================================

/**
 * Load and validate a Melaka configuration file.
 *
 * Supports both TypeScript (.ts) and JavaScript (.js) config files.
 * The config file must export a default configuration object.
 *
 * @param configPath - Path to config file (defaults to 'melaka.config.ts' in cwd)
 * @returns Validated configuration
 * @throws Error if config file not found or invalid
 *
 * @example
 * ```typescript
 * const config = await loadConfig();
 * // or
 * const config = await loadConfig('/path/to/melaka.config.ts');
 * ```
 */
export async function loadConfig(configPath?: string): Promise<MelakaConfig> {
  const resolvedPath = resolveConfigPath(configPath);

  // Check if file exists
  const fs = await import('fs/promises');
  try {
    await fs.access(resolvedPath);
  } catch {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  // Import the config file
  let configModule: unknown;
  try {
    // Use file URL for ESM compatibility
    const fileUrl = pathToFileURL(resolvedPath).href;
    configModule = await import(fileUrl);
  } catch (error) {
    throw new Error(
      `Failed to load config file: ${resolvedPath}\n${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Extract default export
  const rawConfig = (configModule as { default?: unknown }).default;
  if (!rawConfig) {
    throw new Error(`Config file must have a default export: ${resolvedPath}`);
  }

  // Validate with Zod
  const result = MelakaConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${errors}`);
  }

  return result.data as MelakaConfig;
}

/**
 * Resolve the config file path.
 *
 * @param configPath - Optional explicit path
 * @returns Resolved absolute path
 */
function resolveConfigPath(configPath?: string): string {
  if (configPath) {
    return path.resolve(configPath);
  }

  // Default: look for melaka.config.ts in current directory
  return path.resolve(process.cwd(), 'melaka.config.ts');
}

// ============================================================================
// Config Helpers
// ============================================================================

/**
 * Get the effective AI config for a collection.
 *
 * Merges collection-specific AI overrides with root AI config.
 *
 * @param rootConfig - Root Melaka configuration
 * @param collection - Collection configuration
 * @returns Effective AI config
 */
export function getEffectiveAIConfig(
  rootConfig: MelakaConfig,
  collection: CollectionConfig
): AIConfig {
  return {
    ...rootConfig.ai,
    ...(collection.ai || {}),
  };
}

/**
 * Get the effective batch size for a collection.
 *
 * @param rootConfig - Root Melaka configuration
 * @param collection - Collection configuration
 * @returns Effective batch size
 */
export function getEffectiveBatchSize(
  rootConfig: MelakaConfig,
  collection: CollectionConfig
): number {
  return (
    collection.batchSize ||
    rootConfig.defaults?.batchSize ||
    20
  );
}

/**
 * Get the effective max concurrency for a collection.
 *
 * @param rootConfig - Root Melaka configuration
 * @param collection - Collection configuration
 * @returns Effective max concurrency
 */
export function getEffectiveMaxConcurrency(
  rootConfig: MelakaConfig,
  collection: CollectionConfig
): number {
  return (
    collection.maxConcurrency ||
    rootConfig.defaults?.maxConcurrency ||
    10
  );
}

/**
 * Get the effective forceUpdate flag for a collection.
 *
 * @param rootConfig - Root Melaka configuration
 * @param collection - Collection configuration
 * @returns Effective forceUpdate value
 */
export function getEffectiveForceUpdate(
  rootConfig: MelakaConfig,
  collection: CollectionConfig
): boolean {
  return (
    collection.forceUpdate ??
    rootConfig.defaults?.forceUpdate ??
    false
  );
}

/**
 * Find a collection config by path.
 *
 * @param config - Root Melaka configuration
 * @param collectionPath - Collection path to find
 * @returns Collection config or undefined
 */
export function findCollectionConfig(
  config: MelakaConfig,
  collectionPath: string
): CollectionConfig | undefined {
  return config.collections.find((c) => c.path === collectionPath);
}

// ============================================================================
// Config Validation
// ============================================================================

/**
 * Validate a configuration without loading from file.
 *
 * Useful for programmatic config generation or testing.
 *
 * @param config - Configuration object to validate
 * @returns Validated configuration
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: unknown): MelakaConfig {
  const result = MelakaConfigSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${errors}`);
  }
  return result.data as MelakaConfig;
}

/**
 * Check if a config file exists at the given path.
 *
 * @param configPath - Path to check (defaults to 'melaka.config.ts' in cwd)
 * @returns Whether the config file exists
 */
export async function configExists(configPath?: string): Promise<boolean> {
  const resolvedPath = resolveConfigPath(configPath);
  const fs = await import('fs/promises');
  try {
    await fs.access(resolvedPath);
    return true;
  } catch {
    return false;
  }
}
