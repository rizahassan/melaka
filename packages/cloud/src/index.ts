/**
 * @melaka/cloud
 *
 * Fully managed translation service for Melaka Cloud.
 * Uses Firebase/GCP services: Firestore + Cloud Tasks.
 */

// ==================== Main Service ====================

export {
  MelakaCloudGCP,
  type MelakaCloudGCPConfig,
} from './cloud-service-gcp.js';

// ==================== Database ====================

export {
  MelakaFirestoreDatabase,
  encrypt,
  decrypt,
  type FirestoreDatabaseConfig,
  type ProjectDoc,
  type ProjectConfig,
  type CollectionConfig,
  type OAuthTokenDoc,
  type UsageDoc,
  type TranslationJobDoc,
  type SubscriptionDoc,
} from './db/index.js';

// ==================== Cloud Tasks ====================

export {
  MelakaCloudTasks,
  type CloudTasksConfig,
  type TaskPayload,
} from './cloud-tasks.js';

// ==================== OAuth ====================

export {
  OAuthManager,
  type OAuthTokens,
  type OAuthConfig,
} from './oauth-manager.js';

// ==================== Listener ====================

export {
  FirestoreListener,
  type Project,
  type CollectionConfig as ListenerCollectionConfig,
  type ListenerOptions,
} from './firestore-listener.js';

// ==================== Project Manager ====================

export {
  ProjectManager,
  type Project as ProjectManagerProject,
  type ProjectConfig as ProjectManagerConfig,
} from './project-manager.js';

// ==================== Simple Translator ====================

export {
  translateFields,
  type SimpleTranslationConfig,
  type TranslateFieldsOptions,
  type TranslateFieldsResult,
} from './simple-translator.js';
