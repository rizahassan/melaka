/**
 * Melaka AI - Provider Interface
 *
 * Defines the common interface all AI providers must implement.
 */

import type { z } from 'zod';

/**
 * Configuration for an AI translation request.
 */
export interface TranslationOptions {
  /**
   * Target language code (BCP 47 format).
   * @example 'ms-MY', 'zh-CN'
   */
  targetLanguage: string;

  /**
   * Custom prompt/context for the translation.
   */
  prompt?: string;

  /**
   * Glossary of terms to preserve or translate consistently.
   */
  glossary?: Record<string, string>;

  /**
   * Temperature for generation (0-1).
   */
  temperature?: number;
}

/**
 * Result of an AI translation.
 */
export interface TranslationResponse<T = Record<string, unknown>> {
  /**
   * Whether the translation succeeded.
   */
  success: boolean;

  /**
   * Translated content (matches input schema structure).
   */
  output?: T;

  /**
   * Error message if failed.
   */
  error?: string;

  /**
   * Token usage statistics.
   */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };

  /**
   * Duration in milliseconds.
   */
  durationMs?: number;
}

/**
 * Common interface for all AI providers.
 *
 * Each provider (Gemini, OpenAI, Claude) implements this interface.
 */
export interface AIProvider {
  /**
   * Provider name for identification.
   */
  readonly name: string;

  /**
   * Translate content using the AI provider.
   *
   * @param content - Content to translate (translatable fields only)
   * @param schema - Zod schema defining the expected output structure
   * @param options - Translation options (language, prompt, glossary)
   * @returns Translation result
   *
   * @example
   * ```typescript
   * const result = await provider.translate(
   *   { title: 'Hello World', body: 'Welcome to our app' },
   *   z.object({ title: z.string(), body: z.string() }),
   *   { targetLanguage: 'ms-MY' }
   * );
   * ```
   */
  translate<T>(
    content: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    options: TranslationOptions
  ): Promise<TranslationResponse<T>>;

  /**
   * Check if the provider is properly configured.
   *
   * @returns Whether the provider has valid credentials
   */
  isConfigured(): boolean;

  /**
   * Get the model name being used.
   */
  getModel(): string;
}

/**
 * Configuration for creating an AI provider instance.
 */
export interface ProviderConfig {
  /**
   * API key for the provider.
   */
  apiKey?: string;

  /**
   * Model name to use.
   */
  model: string;

  /**
   * Default temperature for generation.
   */
  temperature?: number;
}
