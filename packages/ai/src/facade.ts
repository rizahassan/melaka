/**
 * Melaka AI - Translation Facade
 *
 * High-level API for translating content using any configured AI provider.
 * Supports retry logic with exponential backoff and provider fallback.
 */

import type { z } from 'zod';
import type { AIConfig } from '@melaka/core';
import type { AIProvider, ProviderConfig, TranslationOptions, TranslationResponse } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';

/**
 * Retry configuration options.
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry.
   * @default 1000
   */
  initialDelayMs?: number;

  /**
   * Maximum delay in milliseconds between retries.
   * @default 30000
   */
  maxDelayMs?: number;

  /**
   * Multiplier for exponential backoff.
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Whether to add jitter to retry delays.
   * @default true
   */
  jitter?: boolean;
}

/**
 * Extended translation response with retry metadata.
 */
export interface TranslationResponseWithRetry<T> extends TranslationResponse<T> {
  /**
   * Number of retry attempts made.
   */
  retryCount?: number;

  /**
   * Total time including retries in milliseconds.
   */
  totalDurationMs?: number;

  /**
   * Provider that succeeded (if fallback was used).
   */
  usedProvider?: string;
}

/**
 * Errors that are retryable (transient failures).
 */
const RETRYABLE_ERROR_PATTERNS = [
  /rate limit/i,
  /too many requests/i,
  /429/,
  /500/,
  /502/,
  /503/,
  /504/,
  /timeout/i,
  /ECONNRESET/,
  /ETIMEDOUT/,
  /network/i,
  /temporarily unavailable/i,
  /overloaded/i,
];

/**
 * Check if an error is retryable.
 */
function isRetryableError(error: string): boolean {
  return RETRYABLE_ERROR_PATTERNS.some((pattern) => pattern.test(error));
}

/**
 * Calculate delay for retry with exponential backoff and optional jitter.
 */
function calculateRetryDelay(
  attempt: number,
  config: Required<RetryConfig>
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  if (config.jitter) {
    // Add random jitter between 0% and 25% of the delay
    const jitterAmount = cappedDelay * 0.25 * Math.random();
    return Math.floor(cappedDelay + jitterAmount);
  }

  return cappedDelay;
}

/**
 * Sleep for a specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Translation facade for unified AI provider access.
 *
 * @example
 * ```typescript
 * const facade = createTranslationFacade({
 *   provider: 'gemini',
 *   model: 'gemini-3-flash-preview',
 *   apiKey: process.env.GEMINI_API_KEY,
 * });
 *
 * const result = await facade.translate(
 *   { title: 'Hello', body: 'Welcome' },
 *   z.object({ title: z.string(), body: z.string() }),
 *   { targetLanguage: 'ms-MY' }
 * );
 * ```
 */
export class TranslationFacade {
  private provider: AIProvider;
  private retryConfig: Required<RetryConfig>;

  constructor(aiConfig: AIConfig, retryConfig?: RetryConfig) {
    this.provider = createProvider(aiConfig);
    this.retryConfig = {
      maxRetries: retryConfig?.maxRetries ?? 3,
      initialDelayMs: retryConfig?.initialDelayMs ?? 1000,
      maxDelayMs: retryConfig?.maxDelayMs ?? 30000,
      backoffMultiplier: retryConfig?.backoffMultiplier ?? 2,
      jitter: retryConfig?.jitter ?? true,
    };
  }

  /**
   * Translate content using the configured AI provider.
   * Automatically retries on transient failures with exponential backoff.
   *
   * @param content - Content to translate (translatable fields only)
   * @param schema - Zod schema defining expected output structure
   * @param options - Translation options
   * @returns Translation result with retry metadata
   */
  async translate<T>(
    content: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    options: TranslationOptions
  ): Promise<TranslationResponseWithRetry<T>> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let retryCount = 0;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      const result = await this.provider.translate(content, schema, options);

      if (result.success) {
        return {
          ...result,
          retryCount,
          totalDurationMs: Date.now() - startTime,
          usedProvider: this.provider.name,
        };
      }

      lastError = result.error;

      // Check if error is retryable
      if (!isRetryableError(result.error || '')) {
        // Non-retryable error, fail immediately
        return {
          ...result,
          retryCount,
          totalDurationMs: Date.now() - startTime,
        };
      }

      // Don't retry on last attempt
      if (attempt < this.retryConfig.maxRetries) {
        const delay = calculateRetryDelay(attempt, this.retryConfig);
        await sleep(delay);
        retryCount++;
      }
    }

    // All retries exhausted
    return {
      success: false,
      error: `Translation failed after ${retryCount + 1} attempts. Last error: ${lastError}`,
      retryCount,
      totalDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Translate with fallback to alternative providers.
   *
   * @param content - Content to translate
   * @param schema - Zod schema for output validation
   * @param options - Translation options
   * @param fallbackConfigs - Alternative AI configs to try on failure
   * @returns Translation result
   */
  async translateWithFallback<T>(
    content: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    options: TranslationOptions,
    fallbackConfigs: AIConfig[]
  ): Promise<TranslationResponseWithRetry<T>> {
    const startTime = Date.now();

    // Try primary provider first
    const primaryResult = await this.translate(content, schema, options);
    if (primaryResult.success) {
      return primaryResult;
    }

    // Try fallback providers
    for (const fallbackConfig of fallbackConfigs) {
      const fallbackProvider = createProvider(fallbackConfig);

      if (!fallbackProvider.isConfigured()) {
        continue; // Skip unconfigured providers
      }

      const fallbackResult = await fallbackProvider.translate(content, schema, options);

      if (fallbackResult.success) {
        return {
          ...fallbackResult,
          totalDurationMs: Date.now() - startTime,
          usedProvider: fallbackProvider.name,
        };
      }
    }

    // All providers failed
    return {
      success: false,
      error: `All providers failed. Primary: ${primaryResult.error}`,
      totalDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Get the underlying AI provider.
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Get the provider name.
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Get the model being used.
   */
  getModel(): string {
    return this.provider.getModel();
  }

  /**
   * Check if the facade is properly configured.
   */
  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Get the current retry configuration.
   */
  getRetryConfig(): Required<RetryConfig> {
    return { ...this.retryConfig };
  }
}

/**
 * Create an AI provider based on configuration.
 *
 * @param aiConfig - AI configuration from melaka.config.ts
 * @returns Configured AI provider
 */
export function createProvider(aiConfig: AIConfig): AIProvider {
  const providerConfig: ProviderConfig = {
    apiKey: aiConfig.apiKey,
    model: aiConfig.model,
    temperature: aiConfig.temperature,
  };

  switch (aiConfig.provider) {
    case 'gemini':
      return new GeminiProvider(providerConfig);

    case 'openai':
      return new OpenAIProvider(providerConfig);

    case 'claude':
      return new ClaudeProvider(providerConfig);

    default:
      throw new Error(`Unknown AI provider: ${aiConfig.provider}`);
  }
}

/**
 * Create a translation facade instance.
 *
 * @param aiConfig - AI configuration
 * @param retryConfig - Optional retry configuration
 * @returns Configured translation facade
 */
export function createTranslationFacade(
  aiConfig: AIConfig,
  retryConfig?: RetryConfig
): TranslationFacade {
  return new TranslationFacade(aiConfig, retryConfig);
}
