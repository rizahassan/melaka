/**
 * Melaka Cloud Listener Service
 * 
 * Watches connected customer Firestore collections and queues translations.
 * Uses Firestore REST API for customer projects (OAuth tokens).
 */

import express from 'express';
import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { CloudTasksClient } from '@google-cloud/tasks';
import { decrypt, encrypt } from '@melaka/cloud';

const app = express();
app.use(express.json());

// Config from environment
const CONFIG = {
  melakaProjectId: process.env.FIREBASE_PROJECT_ID || 'melaka-cloud',
  serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  cloudTasksProject: process.env.CLOUD_TASKS_PROJECT_ID || 'melaka-cloud',
  cloudTasksLocation: process.env.CLOUD_TASKS_LOCATION || 'us-central1',
  cloudTasksQueue: process.env.CLOUD_TASKS_QUEUE_NAME || 'melaka-translations',
  workerUrl: process.env.CLOUD_TASKS_SERVICE_URL || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  port: process.env.PORT || '8080',
};

// Types
interface ProjectDoc {
  id: string;
  firebaseProjectId: string;
  status: string;
  config: {
    collections: { path: string; fields: string[]; enabled?: boolean }[];
    sourceLocale: string;
    targetLocales: string[];
  };
}

interface TokenDoc {
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string;
  expiresAt: FirebaseFirestore.Timestamp;
}

// Initialize Melaka's own Firestore (for reading project configs)
let melakaApp: App;
let melakaDb: Firestore;

function initMelakaFirestore(): Firestore {
  if (melakaDb) return melakaDb;
  
  const serviceAccount = CONFIG.serviceAccountJson 
    ? JSON.parse(CONFIG.serviceAccountJson) 
    : undefined;
  
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
  }
  
  melakaApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: CONFIG.melakaProjectId,
  }, 'melaka-admin');
  
  melakaDb = getFirestore(melakaApp);
  return melakaDb;
}

// Refresh OAuth token
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CONFIG.googleClientId,
      client_secret: CONFIG.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Cloud Tasks client
const tasksClient = new CloudTasksClient();

interface TranslationPayload {
  projectId: string;
  firebaseProjectId: string;
  documentPath: string;
  sourceLocale: string;
  targetLocale: string;
  fields: Record<string, string>;
  accessToken: string;
}

async function queueTranslation(payload: TranslationPayload): Promise<void> {
  const parent = tasksClient.queuePath(
    CONFIG.cloudTasksProject,
    CONFIG.cloudTasksLocation,
    CONFIG.cloudTasksQueue
  );

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url: `${CONFIG.workerUrl}/translate`,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
  };

  await tasksClient.createTask({ parent, task });
  console.log(`Queued translation for ${payload.documentPath} -> ${payload.targetLocale}`);
}

// Firestore REST API helpers
interface FirestoreDocument {
  name: string;
  fields?: Record<string, { stringValue?: string; integerValue?: string; booleanValue?: boolean }>;
}

async function firestoreRestList(
  projectId: string,
  accessToken: string,
  collectionPath: string
): Promise<FirestoreDocument[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore REST error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.documents || [];
}

// Parse Firestore REST document to plain object
function parseFirestoreDoc(doc: FirestoreDocument): { path: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  const pathParts = doc.name.split('/documents/')[1]; // collection/docId
  
  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      if (value.stringValue !== undefined) {
        fields[key] = value.stringValue;
      }
    }
  }
  
  return { path: pathParts, fields };
}

// Track processed documents to avoid re-translating
const processedDocs = new Map<string, string>(); // docPath -> hash of fields

function hashFields(fields: Record<string, string>): string {
  return JSON.stringify(fields);
}

// Poll a customer project for changes
async function pollProject(project: ProjectDoc, accessToken: string): Promise<number> {
  const config = project.config || { collections: [], targetLocales: [], sourceLocale: 'en' };
  const collections = config.collections || [];
  const targetLocales = config.targetLocales || [];
  const sourceLocale = config.sourceLocale || 'en';
  
  if (collections.length === 0 || targetLocales.length === 0) {
    return 0;
  }

  let queued = 0;

  for (const collectionConfig of collections) {
    if (collectionConfig.enabled === false) continue;
    
    const { path, fields } = collectionConfig;
    
    try {
      const documents = await firestoreRestList(project.firebaseProjectId, accessToken, path);
      
      for (const doc of documents) {
        const parsed = parseFirestoreDoc(doc);
        const docKey = `${project.id}:${parsed.path}`;
        const currentHash = hashFields(parsed.fields);
        
        // Check if we already processed this exact version
        if (processedDocs.get(docKey) === currentHash) {
          continue;
        }
        
        // Extract translatable fields
        const translatableData: Record<string, string> = {};
        for (const field of fields) {
          if (typeof parsed.fields[field] === 'string' && parsed.fields[field].trim()) {
            translatableData[field] = parsed.fields[field];
          }
        }
        
        if (Object.keys(translatableData).length === 0) {
          processedDocs.set(docKey, currentHash);
          continue;
        }
        
        // Queue translation for each target locale
        for (const targetLocale of targetLocales) {
          queueTranslation({
            projectId: project.id,
            firebaseProjectId: project.firebaseProjectId,
            documentPath: parsed.path,
            sourceLocale,
            targetLocale,
            fields: translatableData,
            accessToken,
          }).catch(err => {
            console.error(`Failed to queue translation:`, (err as Error).message);
          });
          queued++;
        }
        
        processedDocs.set(docKey, currentHash);
      }
    } catch (err) {
      console.error(`Error polling ${path} for ${project.id}:`, (err as Error).message);
    }
  }
  
  return queued;
}

// Main polling loop
async function pollAllProjects(): Promise<void> {
  console.log('Polling projects for changes...');
  
  try {
    const snapshot = await melakaDb
      .collection('melaka_projects')
      .where('status', '==', 'active')
      .get();

    let totalQueued = 0;

    for (const doc of snapshot.docs) {
      const project = { id: doc.id, ...doc.data() } as ProjectDoc;
      
      // Get OAuth tokens
      const tokenDoc = await melakaDb.collection('melaka_oauth_tokens').doc(project.id).get();
      if (!tokenDoc.exists) {
        console.log(`No tokens for project ${project.id}, skipping`);
        continue;
      }

      const tokenData = tokenDoc.data() as TokenDoc;
      
      // Check if token is expired or will expire soon (5 min buffer)
      const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(0);
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      let accessToken: string;
      
      if (expiresAt.getTime() - bufferTime < Date.now()) {
        // Token expired or expiring soon - refresh it
        console.log(`Refreshing token for project ${project.id}...`);
        
        if (!tokenData.refreshTokenEncrypted) {
          console.log(`No refresh token for project ${project.id}, skipping`);
          continue;
        }
        
        try {
          const refreshToken = decrypt(tokenData.refreshTokenEncrypted, CONFIG.encryptionKey);
          const newTokens = await refreshAccessToken(refreshToken);
          accessToken = newTokens.accessToken;
          
          // Update stored tokens
          const newExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
          await melakaDb.collection('melaka_oauth_tokens').doc(project.id).update({
            accessTokenEncrypted: encrypt(newTokens.accessToken, CONFIG.encryptionKey),
            expiresAt: Timestamp.fromDate(newExpiresAt),
          });
          
          console.log(`Token refreshed for project ${project.id}, expires ${newExpiresAt.toISOString()}`);
        } catch (err) {
          console.error(`Failed to refresh token for ${project.id}:`, (err as Error).message);
          continue;
        }
      } else {
        accessToken = decrypt(tokenData.accessTokenEncrypted, CONFIG.encryptionKey);
      }
      
      const queued = await pollProject(project, accessToken);
      totalQueued += queued;
    }

    console.log(`Polling complete. Queued ${totalQueued} translations.`);
  } catch (err) {
    console.error('Polling error:', err);
  }
}

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'melaka-listener',
    status: 'healthy',
    processedDocs: processedDocs.size,
  });
});

// Manual sync endpoint
app.post('/sync', async (_req, res) => {
  try {
    await pollAllProjects();
    res.json({ success: true });
  } catch (err) {
    console.error('Sync failed:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// Webhook endpoint for real-time triggers (future)
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({ received: true });
});

// Start server
const PORT = parseInt(CONFIG.port, 10);
app.listen(PORT, async () => {
  console.log(`Melaka Listener starting on port ${PORT}`);
  
  try {
    initMelakaFirestore();
    console.log('Connected to Melaka Firestore');
    
    // Initial poll
    await pollAllProjects();
    
    // Poll every 30 seconds
    setInterval(pollAllProjects, 30 * 1000);
    
    console.log('Listener service ready (polling mode)');
  } catch (err) {
    console.error('Failed to initialize:', err);
  }
});
