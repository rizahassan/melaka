/**
 * Firebase client initialization for the dashboard.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase with the provided config.
 */
export function initializeFirebase(config: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  return app;
}

/**
 * Get Firestore instance.
 */
export function getDb(): Firestore {
  if (!app) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

/**
 * Get Auth instance.
 */
export function getAuthInstance(): Auth {
  if (!app) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}

/**
 * Check if Firebase is initialized.
 */
export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}
