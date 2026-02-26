/**
 * @melaka/firestore
 *
 * Firestore adapter and triggers for Melaka - AI-powered Firestore localization.
 *
 * @packageDocumentation
 */

// i18n operations
export {
  getI18nPath,
  getI18nRef,
  readTranslation,
  readMelakaMetadata,
  writeTranslation,
  updateMelakaMetadata,
  markTranslationFailed,
  deleteTranslation,
  deleteAllTranslations,
  listTranslationLocales,
  isTranslationCurrent,
  getTranslationStatus,
} from './i18n';

// Translation processor
export {
  processTranslation,
  processAllLanguages,
  type ProcessOptions,
  type ProcessResult,
} from './processor';

// Task handling
export {
  handleTranslationTask,
  createTaskPayload,
  type TaskHandlerContext,
} from './task-handler';

// Task queue
export {
  enqueueDocumentTranslation,
  enqueueCollectionTranslation,
  type TaskQueue,
  type EnqueueOptions,
  type EnqueueResult,
} from './queue';

// Code generator
export {
  generateTriggers,
  type GeneratorOptions,
  type GeneratedFile,
} from './generator';
