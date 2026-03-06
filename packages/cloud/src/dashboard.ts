/**
 * @melaka/cloud/db
 * 
 * Database-only exports for use in Next.js dashboard.
 * Avoids importing Cloud Tasks which has bundling issues.
 */

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
} from './db/firestore-database.js';

export {
  OAuthManager,
  type OAuthTokens,
  type OAuthConfig,
} from './oauth-manager.js';
