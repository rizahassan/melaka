/**
 * Melaka Integration Tests - AI Provider Facade
 *
 * Tests the translation facade with mocked AI responses.
 * These tests don't require actual AI API keys.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock fetch for AI providers
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TranslationFacade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should translate content via Gemini provider', async () => {
    // Mock successful Gemini response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '{"title": "Halo Dunia", "body": "Ini adalah ujian."}',
                },
              ],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
        },
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKey: 'test-api-key',
    });

    const schema = z.object({
      title: z.string(),
      body: z.string(),
    });

    const result = await facade.translate(
      { title: 'Hello World', body: 'This is a test.' },
      schema,
      { targetLanguage: 'ms-MY' }
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual({
      title: 'Halo Dunia',
      body: 'Ini adalah ujian.',
    });
    expect(result.usage?.totalTokens).toBe(150);
  });

  it('should translate content via OpenAI provider', async () => {
    // Mock successful OpenAI response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'chatcmpl-123',
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '{"title": "你好世界"}',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 80,
          completion_tokens: 20,
          total_tokens: 100,
        },
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'test-api-key',
    });

    const schema = z.object({ title: z.string() });

    const result = await facade.translate(
      { title: 'Hello World' },
      schema,
      { targetLanguage: 'zh-CN' }
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ title: '你好世界' });
    expect(result.usage?.totalTokens).toBe(100);
  });

  it('should translate content via Claude provider', async () => {
    // Mock successful Claude response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: '{"title": "வணக்கம் உலகம்"}',
          },
        ],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 90,
          output_tokens: 25,
        },
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      apiKey: 'test-api-key',
    });

    const schema = z.object({ title: z.string() });

    const result = await facade.translate(
      { title: 'Hello World' },
      schema,
      { targetLanguage: 'ta-IN' }
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ title: 'வணக்கம் உலகம்' });
    expect(result.usage?.totalTokens).toBe(115);
  });

  it('should retry on transient errors', async () => {
    // First call: rate limit error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: 'Rate limit exceeded' },
      }),
    });

    // Second call: success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '{"title": "Retry Success"}' }],
            },
          },
        ],
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade(
      {
        provider: 'gemini',
        model: 'gemini-3-flash-preview',
        apiKey: 'test-api-key',
      },
      {
        maxRetries: 3,
        initialDelayMs: 10, // Fast for testing
      }
    );

    const schema = z.object({ title: z.string() });

    const result = await facade.translate(
      { title: 'Hello' },
      schema,
      { targetLanguage: 'ms-MY' }
    );

    expect(result.success).toBe(true);
    expect(result.retryCount).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    // Invalid API key error (non-retryable)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Invalid API key' },
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKey: 'invalid-key',
    });

    const schema = z.object({ title: z.string() });

    const result = await facade.translate(
      { title: 'Hello' },
      schema,
      { targetLanguage: 'ms-MY' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid API key');
    expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
  });

  it('should validate output against schema', async () => {
    // Mock response with wrong structure
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '{"wrong_field": "value"}' }],
            },
          },
        ],
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKey: 'test-api-key',
    });

    const schema = z.object({
      title: z.string(),
      body: z.string(),
    });

    const result = await facade.translate(
      { title: 'Hello', body: 'World' },
      schema,
      { targetLanguage: 'ms-MY' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Schema validation failed');
  });

  it('should handle arrays in translation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '{"tags": ["satu", "dua", "tiga"]}',
                },
              ],
            },
          },
        ],
      }),
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKey: 'test-api-key',
    });

    const schema = z.object({
      tags: z.array(z.string()),
    });

    const result = await facade.translate(
      { tags: ['one', 'two', 'three'] },
      schema,
      { targetLanguage: 'ms-MY' }
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ tags: ['satu', 'dua', 'tiga'] });
  });

  it('should include glossary in translation request', async () => {
    mockFetch.mockImplementationOnce(async (url, options) => {
      const body = JSON.parse(options.body);
      const prompt = body.contents[0].parts[0].text;

      // Verify glossary is in prompt
      expect(prompt).toContain('checkout → checkout');
      expect(prompt).toContain('cart → troli');

      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '{"button": "checkout"}' }],
              },
            },
          ],
        }),
      };
    });

    const { createTranslationFacade } = await import('@melaka/ai');

    const facade = createTranslationFacade({
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKey: 'test-api-key',
    });

    const schema = z.object({ button: z.string() });

    await facade.translate(
      { button: 'Checkout' },
      schema,
      {
        targetLanguage: 'ms-MY',
        glossary: { checkout: 'checkout', cart: 'troli' },
      }
    );
  });
});
