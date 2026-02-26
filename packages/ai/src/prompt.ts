/**
 * Melaka AI - Prompt Builder
 *
 * Constructs prompts for AI translation with context, glossaries, and instructions.
 */

import { formatGlossary, getLanguageName } from '@melaka/core';
import type { TranslationOptions } from './types';

/**
 * Build a translation prompt for the AI provider.
 *
 * @param content - Content to translate
 * @param options - Translation options
 * @returns Formatted prompt string
 */
export function buildTranslationPrompt(
  content: Record<string, unknown>,
  options: TranslationOptions
): string {
  const { targetLanguage, prompt, glossary } = options;
  const languageName = getLanguageName(targetLanguage);

  const sections: string[] = [];

  // Main instruction
  sections.push(`Translate the following content from English to ${languageName} (${targetLanguage}).`);

  // Preservation rules
  sections.push(`
Preserve exactly:
- JSON structure and field names
- Markdown formatting (headers, bold, italic, links, code blocks)
- Proper nouns (names, brands, places) unless glossary specifies otherwise
- Numbers, dates, and measurements
- URLs, email addresses, and code snippets
- Emoji and special characters`);

  // Custom context
  if (prompt) {
    sections.push(`
Context:
${prompt}`);
  }

  // Glossary
  sections.push(`
Glossary (use these translations consistently):
${formatGlossary(glossary)}`);

  // Content to translate
  sections.push(`
Content to translate:
${JSON.stringify(content, null, 2)}`);

  // Output instruction
  sections.push(`
Respond with ONLY the translated JSON object. Do not include any explanation or markdown code blocks.`);

  return sections.join('\n');
}

/**
 * Build a system prompt for translation tasks.
 *
 * @returns System prompt string
 */
export function buildSystemPrompt(): string {
  return `You are a professional translator specializing in software localization.

Your task is to translate content while:
1. Maintaining the exact JSON structure
2. Preserving technical terms, brand names, and proper nouns
3. Adapting idioms and cultural references appropriately
4. Ensuring natural, fluent translations in the target language
5. Following any glossary terms provided exactly

Always respond with valid JSON that matches the input structure.`;
}

/**
 * Extract JSON from AI response that may contain markdown or extra text.
 *
 * @param response - Raw AI response
 * @returns Parsed JSON object
 * @throws Error if no valid JSON found
 */
export function extractJsonFromResponse(response: string): Record<string, unknown> {
  // Try direct parse first
  try {
    return JSON.parse(response);
  } catch {
    // Continue to extraction
  }

  // Try to extract from markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to other methods
    }
  }

  // Try to find JSON object in the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fall through to error
    }
  }

  throw new Error('Failed to extract valid JSON from AI response');
}
