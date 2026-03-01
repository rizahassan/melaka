/**
 * @melaka/ai
 *
 * AI provider adapters for Melaka - AI-powered Firestore localization.
 *
 * @packageDocumentation
 */

// Types
export type {
  AIProvider,
  ProviderConfig,
  TranslationOptions,
  TranslationResponse,
} from './types';

// Providers
export {
  GeminiProvider,
  createGeminiProvider,
  OpenAIProvider,
  createOpenAIProvider,
  ClaudeProvider,
  createClaudeProvider,
} from './providers';

// Facade
export {
  TranslationFacade,
  createTranslationFacade,
  createProvider,
} from './facade';

export type {
  RetryConfig,
  TranslationResponseWithRetry,
} from './facade';

// Prompt utilities
export {
  buildTranslationPrompt,
  buildSystemPrompt,
  extractJsonFromResponse,
} from './prompt';
