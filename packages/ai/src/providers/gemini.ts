/**
 * Melaka AI - Gemini Provider
 *
 * AI provider adapter for Google's Gemini models.
 * Uses direct Gemini API for MVP (Genkit integration in Phase 2).
 */

import type { z } from 'zod';
import type { AIProvider, ProviderConfig, TranslationOptions, TranslationResponse } from '../types';
import { buildTranslationPrompt, buildSystemPrompt, extractJsonFromResponse } from '../prompt';

/**
 * Gemini API response structure.
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * Gemini AI provider.
 *
 * @example
 * ```typescript
 * const provider = new GeminiProvider({
 *   apiKey: process.env.GEMINI_API_KEY,
 *   model: 'gemini-2.5-flash',
 * });
 *
 * const result = await provider.translate(
 *   { title: 'Hello' },
 *   z.object({ title: z.string() }),
 *   { targetLanguage: 'ms-MY' }
 * );
 * ```
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';

  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = {
      temperature: 0.3,
      ...config,
    };
  }

  async translate<T>(
    content: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    options: TranslationOptions
  ): Promise<TranslationResponse<T>> {
    const startTime = Date.now();

    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Gemini API key not configured',
        };
      }

      // Build the prompt
      const userPrompt = buildTranslationPrompt(content, {
        ...options,
        temperature: options.temperature ?? this.config.temperature,
      });

      const systemPrompt = buildSystemPrompt();

      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: userPrompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              temperature: options.temperature ?? this.config.temperature,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `Gemini API error: ${response.status} ${JSON.stringify(errorData)}`,
          durationMs,
        };
      }

      const data = await response.json() as GeminiResponse;

      // Extract text from response
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        return {
          success: false,
          error: 'No response from Gemini',
          durationMs,
        };
      }

      // Parse and validate
      const parsed = extractJsonFromResponse(textResponse);
      const validated = schema.safeParse(parsed);

      if (!validated.success) {
        return {
          success: false,
          error: `Schema validation failed: ${validated.error.message}`,
          durationMs,
        };
      }

      // Extract usage metadata
      const usageMetadata = data.usageMetadata;

      return {
        success: true,
        output: validated.data,
        usage: usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount || 0,
              outputTokens: usageMetadata.candidatesTokenCount || 0,
              totalTokens: usageMetadata.totalTokenCount || 0,
            }
          : undefined,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        durationMs,
      };
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  getModel(): string {
    return this.config.model;
  }
}

/**
 * Create a Gemini provider instance.
 *
 * @param config - Provider configuration
 * @returns Configured Gemini provider
 */
export function createGeminiProvider(config: ProviderConfig): GeminiProvider {
  return new GeminiProvider(config);
}
