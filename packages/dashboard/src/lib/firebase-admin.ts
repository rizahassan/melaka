/**
 * Shared Firebase Admin SDK initialization for API routes.
 * Avoids duplicating init logic across multiple route files.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { MelakaFirestoreDatabase, OAuthManager } from '@melaka/cloud/dashboard';

let firebaseApp: App;

export function getFirebaseApp(): App {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : undefined;

    firebaseApp = initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return firebaseApp || getApps()[0];
}

export function getFirestoreInstance(): Firestore {
  const app = getFirebaseApp();
  return getFirestore(app);
}

export function getDatabase(): MelakaFirestoreDatabase | null {
  if (!process.env.ENCRYPTION_KEY) return null;

  const firestore = getFirestoreInstance();

  return new MelakaFirestoreDatabase({
    firestore,
    encryptionKey: process.env.ENCRYPTION_KEY,
  });
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`;

export function getOAuthManager(): OAuthManager | null {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;

  return new OAuthManager({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  });
}
