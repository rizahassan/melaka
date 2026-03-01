/**
 * Melaka AI - OpenAI Provider
 *
 * AI provider adapter for OpenAI's GPT models.
 */

import type { z } from 'zod';
import type { AIProvider, ProviderConfig, TranslationOptions, TranslationResponse } from '../types';
import { buildTranslationPrompt, buildSystemPrompt, extractJsonFromResponse } from '../prompt';

/**
 * OpenAI API response structure.
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI API error response structure.
 */
interface OpenAIError {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * OpenAI AI provider.
 *
 * @example
 * ```typescript
 * const provider = new OpenAIProvider({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o-mini',
 * });
 *
 * const result = await provider.translate(
 *   { title: 'Hello' },
 *   z.object({ title: z.string() }),
 *   { targetLanguage: 'ms-MY' }
 * );
 * ```
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

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
          error: 'OpenAI API key not configured',
        };
      }

      // Build the prompt
      const userPrompt = buildTranslationPrompt(content, {
        ...options,
        temperature: options.temperature ?? this.config.temperature,
      });

      const systemPrompt = buildSystemPrompt();

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: options.temperature ?? this.config.temperature,
          response_format: { type: 'json_object' },
        }),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as OpenAIError;
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        return {
          success: false,
          error: `OpenAI API error: ${errorMessage}`,
          durationMs,
        };
      }

      const data = (await response.json()) as OpenAIResponse;

      // Extract text from response
      const textResponse = data.choices?.[0]?.message?.content;

      if (!textResponse) {
        return {
          success: false,
          error: 'No response from OpenAI',
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

      return {
        success: true,
        output: validated.data,
        usage: data.usage
          ? {
              inputTokens: data.usage.prompt_tokens,
              outputTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
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
 * Create an OpenAI provider instance.
 *
 * @param config - Provider configuration
 * @returns Configured OpenAI provider
 */
export function createOpenAIProvider(config: ProviderConfig): OpenAIProvider {
  return new OpenAIProvider(config);
}
