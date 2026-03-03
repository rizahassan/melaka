/**
 * @melaka/cloud
 *
 * Fully managed translation service for Melaka Cloud.
 * Watches customer Firestore collections and translates automatically.
 */

// Main service
export {
  MelakaCloudService,
  type CloudServiceConfig,
} from './cloud-service.js';

// Components
export {
  ProjectManager,
  type Project,
  type ProjectConfig,
} from './project-manager.js';

export { FirestoreListener } from './firestore-listener.js';

export {
  TranslationQueue,
  type TranslationJob,
  type QueueConfig,
} from './translation-queue.js';

export {
  TranslationWorker,
  type WorkerConfig,
} from './translation-worker.js';

export {
  OAuthManager,
  type OAuthTokens,
  type OAuthConfig,
} from './oauth-manager.js';
