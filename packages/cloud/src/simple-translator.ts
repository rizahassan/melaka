/**
 * Simple translation utilities for Melaka Cloud services.
 * Uses Gemini API directly for field-level translations.
 */

export interface SimpleTranslationConfig {
  apiKey: string;
  model?: string;
}

export interface TranslateFieldsOptions {
  sourceLocale: string;
  targetLocale: string;
}

export interface TranslateFieldsResult {
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
  durationMs?: number;
}

const DEFAULT_MODEL = 'gemini-2.5-flash-preview-04-17';

/**
 * Translate a set of fields from source to target locale.
 * Simple batch translation without schema validation.
 */
export async function translateFields(
  fields: Record<string, string>,
  options: TranslateFieldsOptions,
  config: SimpleTranslationConfig
): Promise<TranslateFieldsResult> {
  const startTime = Date.now();
  const model = config.model || DEFAULT_MODEL;

  try {
    if (!config.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const fieldEntries = Object.entries(fields);
    if (fieldEntries.length === 0) {
      return { success: true, translations: {}, durationMs: 0 };
    }

    // Build prompt for batch translation
    const prompt = buildBatchTranslationPrompt(fields, options);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Gemini API error: ${error}`, durationMs };
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return { success: false, error: 'No response from Gemini', durationMs };
    }

    // Parse JSON response
    const translations = JSON.parse(textResponse);
    
    return { success: true, translations, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    };
  }
}

/**
 * Build a batch translation prompt for multiple fields.
 */
function buildBatchTranslationPrompt(
  fields: Record<string, string>,
  options: TranslateFieldsOptions
): string {
  const fieldList = Object.entries(fields)
    .map(([key, value]) => `"${key}": "${escapeForJson(value)}"`)
    .join(',\n  ');

  return `Translate the following JSON fields from ${options.sourceLocale} to ${options.targetLocale}.
Return ONLY a valid JSON object with the same keys and translated values.

Input:
{
  ${fieldList}
}

Output (translated JSON):`;
}

/**
 * Escape string for JSON embedding.
 */
function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}
