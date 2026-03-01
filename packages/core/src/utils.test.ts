/**
 * Melaka Core - Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  hashContent,
  detectFieldType,
  isTranslatableType,
  separateContent,
  mergeGlossaries,
  formatGlossary,
  getLanguageName,
  generateBatchId,
} from './utils';

describe('hashContent', () => {
  it('should return consistent hash for same content', () => {
    const content = { title: 'Hello', body: 'World' };
    const hash1 = hashContent(content);
    const hash2 = hashContent(content);
    expect(hash1).toBe(hash2);
  });

  it('should return same hash regardless of key order', () => {
    const content1 = { title: 'Hello', body: 'World' };
    const content2 = { body: 'World', title: 'Hello' };
    expect(hashContent(content1)).toBe(hashContent(content2));
  });

  it('should return different hash for different content', () => {
    const content1 = { title: 'Hello' };
    const content2 = { title: 'Goodbye' };
    expect(hashContent(content1)).not.toBe(hashContent(content2));
  });

  it('should handle empty objects', () => {
    const hash = hashContent({});
    expect(hash).toBe(hashContent({}));
    expect(hash.length).toBe(64); // SHA256 hex length
  });
});

describe('detectFieldType', () => {
  it('should detect string type', () => {
    expect(detectFieldType('hello')).toBe('string');
    expect(detectFieldType('')).toBe('string');
  });

  it('should detect number type', () => {
    expect(detectFieldType(123)).toBe('number');
    expect(detectFieldType(0)).toBe('number');
    expect(detectFieldType(-5.5)).toBe('number');
  });

  it('should detect boolean type', () => {
    expect(detectFieldType(true)).toBe('boolean');
    expect(detectFieldType(false)).toBe('boolean');
  });

  it('should detect string array type', () => {
    expect(detectFieldType(['a', 'b', 'c'])).toBe('string[]');
    expect(detectFieldType([])).toBe('string[]'); // Empty arrays default to string[]
  });

  it('should detect number array type', () => {
    expect(detectFieldType([1, 2, 3])).toBe('number[]');
  });

  it('should detect object type', () => {
    expect(detectFieldType({ foo: 'bar' })).toBe('object');
  });

  it('should detect object array type', () => {
    expect(detectFieldType([{ name: 'test' }])).toBe('object[]');
  });

  it('should detect null as object|null', () => {
    expect(detectFieldType(null)).toBe('object|null');
  });

  it('should detect DocumentReference type', () => {
    const docRef = { path: 'users/123', id: '123' };
    expect(detectFieldType(docRef)).toBe('DocumentReference');
  });

  it('should detect DocumentReference array type', () => {
    const docRefs = [{ path: 'users/123', id: '123' }];
    expect(detectFieldType(docRefs)).toBe('DocumentReference[]');
  });
});

describe('isTranslatableType', () => {
  it('should return true for string', () => {
    expect(isTranslatableType('string')).toBe(true);
  });

  it('should return true for string array', () => {
    expect(isTranslatableType('string[]')).toBe(true);
  });

  it('should return false for other types', () => {
    expect(isTranslatableType('number')).toBe(false);
    expect(isTranslatableType('boolean')).toBe(false);
    expect(isTranslatableType('object')).toBe(false);
    expect(isTranslatableType('DocumentReference')).toBe(false);
  });
});

describe('separateContent', () => {
  it('should separate translatable and non-translatable fields', () => {
    const doc = {
      title: 'Hello',
      price: 99,
      tags: ['sale', 'new'],
      active: true,
    };

    const result = separateContent(doc);

    expect(result.translatable).toEqual({
      title: 'Hello',
      tags: ['sale', 'new'],
    });

    expect(result.nonTranslatable).toEqual({
      price: 99,
      active: true,
    });
  });

  it('should skip _melaka metadata field', () => {
    const doc = {
      title: 'Hello',
      _melaka: { status: 'translated' },
    };

    const result = separateContent(doc);

    expect(result.translatable).toEqual({ title: 'Hello' });
    expect(result.nonTranslatable).toEqual({});
    expect(result.detectedTypes._melaka).toBeUndefined();
  });

  it('should only process specified fields when provided', () => {
    const doc = {
      title: 'Hello',
      body: 'World',
      summary: 'Short',
    };

    const result = separateContent(doc, ['title', 'body']);

    expect(result.translatable).toEqual({
      title: 'Hello',
      body: 'World',
    });

    expect(result.nonTranslatable).toEqual({
      summary: 'Short',
    });
  });

  it('should return detected types for all processed fields', () => {
    const doc = {
      title: 'Hello',
      count: 10,
    };

    const result = separateContent(doc);

    expect(result.detectedTypes).toEqual({
      title: 'string',
      count: 'number',
    });
  });
});

describe('mergeGlossaries', () => {
  it('should merge shared and collection glossaries', () => {
    const shared = { checkout: 'checkout', cart: 'troli' };
    const collection = { price: 'harga' };

    const result = mergeGlossaries(shared, collection);

    expect(result).toEqual({
      checkout: 'checkout',
      cart: 'troli',
      price: 'harga',
    });
  });

  it('should allow collection glossary to override shared', () => {
    const shared = { cart: 'kereta' };
    const collection = { cart: 'troli' };

    const result = mergeGlossaries(shared, collection);

    expect(result.cart).toBe('troli');
  });

  it('should handle undefined glossaries', () => {
    expect(mergeGlossaries(undefined, undefined)).toEqual({});
    expect(mergeGlossaries({ a: 'b' }, undefined)).toEqual({ a: 'b' });
    expect(mergeGlossaries(undefined, { a: 'b' })).toEqual({ a: 'b' });
  });
});

describe('formatGlossary', () => {
  it('should format glossary for prompt', () => {
    const glossary = { checkout: 'checkout', cart: 'troli' };
    const result = formatGlossary(glossary);

    expect(result).toContain('checkout → checkout');
    expect(result).toContain('cart → troli');
  });

  it('should return default message for empty glossary', () => {
    expect(formatGlossary({})).toBe('No specific glossary terms.');
    expect(formatGlossary(undefined)).toBe('No specific glossary terms.');
  });
});

describe('getLanguageName', () => {
  it('should return full name for known codes', () => {
    expect(getLanguageName('ms-MY')).toBe('Malay (Malaysia)');
    expect(getLanguageName('zh-CN')).toBe('Chinese (Simplified)');
    expect(getLanguageName('en-US')).toBe('English (US)');
  });

  it('should return code itself for unknown codes', () => {
    expect(getLanguageName('xx-XX')).toBe('xx-XX');
  });
});

describe('generateBatchId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateBatchId();
    const id2 = generateBatchId();

    expect(id1).not.toBe(id2);
  });

  it('should start with batch_ prefix', () => {
    const id = generateBatchId();
    expect(id.startsWith('batch_')).toBe(true);
  });

  it('should contain timestamp', () => {
    const before = Date.now();
    const id = generateBatchId();
    const after = Date.now();

    const parts = id.split('_');
    const timestamp = parseInt(parts[1], 10);

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
