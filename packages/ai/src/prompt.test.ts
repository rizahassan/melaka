/**
 * Melaka AI - Prompt Tests
 */

import { describe, it, expect } from 'vitest';
import { buildTranslationPrompt, buildSystemPrompt, extractJsonFromResponse } from './prompt';

describe('buildTranslationPrompt', () => {
  it('should include target language name and code', () => {
    const prompt = buildTranslationPrompt(
      { title: 'Hello' },
      { targetLanguage: 'ms-MY' }
    );

    expect(prompt).toContain('Malay (Malaysia)');
    expect(prompt).toContain('ms-MY');
  });

  it('should include content as JSON', () => {
    const content = { title: 'Hello', body: 'World' };
    const prompt = buildTranslationPrompt(content, { targetLanguage: 'ms-MY' });

    expect(prompt).toContain('"title": "Hello"');
    expect(prompt).toContain('"body": "World"');
  });

  it('should include custom context when provided', () => {
    const prompt = buildTranslationPrompt(
      { title: 'Hello' },
      {
        targetLanguage: 'ms-MY',
        prompt: 'This is a cooking recipe.',
      }
    );

    expect(prompt).toContain('Context:');
    expect(prompt).toContain('This is a cooking recipe.');
  });

  it('should include glossary when provided', () => {
    const prompt = buildTranslationPrompt(
      { title: 'Hello' },
      {
        targetLanguage: 'ms-MY',
        glossary: { checkout: 'checkout', cart: 'troli' },
      }
    );

    expect(prompt).toContain('Glossary');
    expect(prompt).toContain('checkout → checkout');
    expect(prompt).toContain('cart → troli');
  });

  it('should include preservation rules', () => {
    const prompt = buildTranslationPrompt(
      { title: 'Hello' },
      { targetLanguage: 'ms-MY' }
    );

    expect(prompt).toContain('Preserve exactly');
    expect(prompt).toContain('Markdown formatting');
    expect(prompt).toContain('Proper nouns');
  });

  it('should include JSON output instruction', () => {
    const prompt = buildTranslationPrompt(
      { title: 'Hello' },
      { targetLanguage: 'ms-MY' }
    );

    expect(prompt).toContain('Respond with ONLY the translated JSON');
  });
});

describe('buildSystemPrompt', () => {
  it('should describe translator role', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('professional translator');
    expect(prompt).toContain('software localization');
  });

  it('should include translation guidelines', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('JSON structure');
    expect(prompt).toContain('technical terms');
    expect(prompt).toContain('brand names');
    expect(prompt).toContain('glossary');
  });

  it('should instruct to respond with valid JSON', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('valid JSON');
  });
});

describe('extractJsonFromResponse', () => {
  it('should parse clean JSON directly', () => {
    const response = '{"title": "Halo", "body": "Dunia"}';
    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ title: 'Halo', body: 'Dunia' });
  });

  it('should extract JSON from markdown code block', () => {
    const response = `Here is the translation:

\`\`\`json
{"title": "Halo", "body": "Dunia"}
\`\`\`

Let me know if you need anything else.`;

    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ title: 'Halo', body: 'Dunia' });
  });

  it('should extract JSON from code block without language', () => {
    const response = `\`\`\`
{"title": "Halo"}
\`\`\``;

    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ title: 'Halo' });
  });

  it('should extract JSON embedded in text', () => {
    const response = `The translation is: {"title": "Halo", "body": "Dunia"}. Hope this helps!`;

    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ title: 'Halo', body: 'Dunia' });
  });

  it('should handle nested JSON objects', () => {
    const response = '{"meta": {"author": "John"}, "content": "Halo"}';
    const result = extractJsonFromResponse(response);

    expect(result).toEqual({
      meta: { author: 'John' },
      content: 'Halo',
    });
  });

  it('should throw error for invalid response', () => {
    expect(() => extractJsonFromResponse('Not valid JSON at all'))
      .toThrow('Failed to extract valid JSON');
  });

  it('should handle pretty-printed JSON', () => {
    const response = `{
  "title": "Halo",
  "body": "Dunia"
}`;

    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ title: 'Halo', body: 'Dunia' });
  });

  it('should handle JSON with arrays', () => {
    const response = '{"tags": ["satu", "dua", "tiga"]}';
    const result = extractJsonFromResponse(response);

    expect(result).toEqual({ tags: ['satu', 'dua', 'tiga'] });
  });
});
