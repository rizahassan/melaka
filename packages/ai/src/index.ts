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
} from './providers';

// Facade
export {
  TranslationFacade,
  createTranslationFacade,
} from './facade';

// Prompt utilities
export {
  buildTranslationPrompt,
  buildSystemPrompt,
  extractJsonFromResponse,
} from './prompt';
