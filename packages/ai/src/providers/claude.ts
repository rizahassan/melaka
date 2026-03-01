/**
 * Melaka AI - Claude Provider
 *
 * AI provider adapter for Anthropic's Claude models.
 */

import type { z } from 'zod';
import type { AIProvider, ProviderConfig, TranslationOptions, TranslationResponse } from '../types';
import { buildTranslationPrompt, buildSystemPrompt, extractJsonFromResponse } from '../prompt';

/**
 * Claude API response structure.
 */
interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude API error response structure.
 */
interface ClaudeError {
  type?: string;
  error?: {
    type: string;
    message: string;
  };
}

/**
 * Claude AI provider.
 *
 * @example
 * ```typescript
 * const provider = new ClaudeProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-sonnet-4-20250514',
 * });
 *
 * const result = await provider.translate(
 *   { title: 'Hello' },
 *   z.object({ title: z.string() }),
 *   { targetLanguage: 'ms-MY' }
 * );
 * ```
 */
export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';

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
          error: 'Anthropic API key not configured',
        };
      }

      // Build the prompt
      const userPrompt = buildTranslationPrompt(content, {
        ...options,
        temperature: options.temperature ?? this.config.temperature,
      });

      const systemPrompt = buildSystemPrompt();

      // Wrap prompt with JSON instruction for Claude
      const jsonPrompt = `${userPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the raw JSON object.`;

      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: jsonPrompt },
          ],
          temperature: options.temperature ?? this.config.temperature,
        }),
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ClaudeError;
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        return {
          success: false,
          error: `Claude API error: ${errorMessage}`,
          durationMs,
        };
      }

      const data = (await response.json()) as ClaudeResponse;

      // Extract text from response
      const textContent = data.content?.find((c) => c.type === 'text');
      const textResponse = textContent?.text;

      if (!textResponse) {
        return {
          success: false,
          error: 'No response from Claude',
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
              inputTokens: data.usage.input_tokens,
              outputTokens: data.usage.output_tokens,
              totalTokens: data.usage.input_tokens + data.usage.output_tokens,
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
 * Create a Claude provider instance.
 *
 * @param config - Provider configuration
 * @returns Configured Claude provider
 */
export function createClaudeProvider(config: ProviderConfig): ClaudeProvider {
  return new ClaudeProvider(config);
}
