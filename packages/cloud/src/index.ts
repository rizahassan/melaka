/**
 * @melaka/cloud
 *
 * Fully managed translation service for Melaka Cloud.
 * Supports two deployment options:
 * - GCP: Firestore + Cloud Tasks (recommended for Firebase projects)
 * - Standalone: Supabase + Redis (for non-GCP deployments)
 */

// ==================== GCP Edition (Firestore + Cloud Tasks) ====================

export {
  MelakaCloudGCP,
  type MelakaCloudGCPConfig,
} from './cloud-service-gcp.js';

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
} from './db/firestore-database.js';

export {
  MelakaCloudTasks,
  type CloudTasksConfig,
  type TaskPayload,
} from './cloud-tasks.js';

// ==================== Standalone Edition (Supabase + Redis) ====================

export {
  MelakaCloudService,
  type CloudServiceConfig,
} from './cloud-service.js';

export {
  MelakaDatabase,
  type DatabaseConfig,
  type ProjectRow,
  type ProjectConfig as DbProjectConfig,
  type CollectionConfig as DbCollectionConfig,
  type OAuthTokenRow,
  type TranslationJobRow,
  type UsageRecordRow,
} from './db/index.js';

export {
  TranslationQueue,
  type TranslationJob,
  type QueueConfig,
} from './translation-queue.js';

export {
  TranslationWorker,
  type WorkerConfig,
} from './translation-worker.js';

// ==================== Shared Components ====================

export {
  OAuthManager,
  type OAuthTokens,
  type OAuthConfig,
} from './oauth-manager.js';

export {
  ProjectManager,
  type Project,
} from './project-manager.js';

export { FirestoreListener } from './firestore-listener.js';
