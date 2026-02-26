/**
 * Melaka AI - Translation Facade
 *
 * High-level API for translating content using any configured AI provider.
 */

import type { z } from 'zod';
import type { AIConfig } from '@melaka/core';
import type { AIProvider, ProviderConfig, TranslationOptions, TranslationResponse } from './types';
import { GeminiProvider } from './providers/gemini';

/**
 * Translation facade for unified AI provider access.
 *
 * @example
 * ```typescript
 * const facade = createTranslationFacade({
 *   provider: 'gemini',
 *   model: 'gemini-2.5-flash',
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

  constructor(aiConfig: AIConfig) {
    this.provider = createProvider(aiConfig);
  }

  /**
   * Translate content using the configured AI provider.
   *
   * @param content - Content to translate (translatable fields only)
   * @param schema - Zod schema defining expected output structure
   * @param options - Translation options
   * @returns Translation result
   */
  async translate<T>(
    content: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    options: TranslationOptions
  ): Promise<TranslationResponse<T>> {
    return this.provider.translate(content, schema, options);
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
}

/**
 * Create an AI provider based on configuration.
 *
 * @param aiConfig - AI configuration from melaka.config.ts
 * @returns Configured AI provider
 */
function createProvider(aiConfig: AIConfig): AIProvider {
  const providerConfig: ProviderConfig = {
    apiKey: aiConfig.apiKey,
    model: aiConfig.model,
    temperature: aiConfig.temperature,
  };

  switch (aiConfig.provider) {
    case 'gemini':
      return new GeminiProvider(providerConfig);

    case 'openai':
      // TODO: Implement OpenAI provider in Phase 2
      throw new Error('OpenAI provider not yet implemented. Use Gemini for MVP.');

    case 'claude':
      // TODO: Implement Claude provider in Phase 2
      throw new Error('Claude provider not yet implemented. Use Gemini for MVP.');

    default:
      throw new Error(`Unknown AI provider: ${aiConfig.provider}`);
  }
}

/**
 * Create a translation facade instance.
 *
 * @param aiConfig - AI configuration
 * @returns Configured translation facade
 */
export function createTranslationFacade(aiConfig: AIConfig): TranslationFacade {
  return new TranslationFacade(aiConfig);
}
