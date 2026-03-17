/**
 * Melaka Cloud Listener Service
 * 
 * Watches connected customer Firestore collections and queues translations.
 * Standalone service - no workspace dependencies.
 */

import express from 'express';
import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { CloudTasksClient } from '@google-cloud/tasks';
import { createDecipheriv, createCipheriv, randomBytes, scryptSync } from 'crypto';

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

// Encryption helpers (AES-256-GCM with scrypt key derivation)
const ALGORITHM = 'aes-256-gcm';

function decrypt(ciphertext: string, encryptionKey: string): string {
  const [saltB64, ivB64, tagB64, encryptedB64] = ciphertext.split(':');

  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');

  const key = scryptSync(encryptionKey, salt, 32);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

function encrypt(plaintext: string, encryptionKey: string): string {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(encryptionKey, salt, 32);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    salt.toString('base64'),
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

// Types
interface ProjectDoc {
  id: string;
  userId: string;
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

// Initialize Melaka's own Firestore
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

  const data = await response.json() as { access_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Cloud Tasks client
const tasksClient = new CloudTasksClient();

interface TranslationPayload {
  projectId: string;
  userId: string;
  firebaseProjectId: string;
  documentPath: string;
  sourceLocale: string;
  targetLocale: string;
  fields: Record<string, string>;
  accessToken: string;
  jobId?: string;
}

async function queueTranslation(payload: TranslationPayload): Promise<string> {
  // Create job record in Melaka Firestore
  const jobRef = melakaDb.collection('melaka_jobs').doc();
  const jobId = jobRef.id;
  
  await jobRef.set({
    projectId: payload.projectId,
    firebaseProjectId: payload.firebaseProjectId,
    documentPath: payload.documentPath,
    sourceLocale: payload.sourceLocale,
    targetLocale: payload.targetLocale,
    fields: payload.fields,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Queue the task with job ID
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
      body: Buffer.from(JSON.stringify({ ...payload, jobId })).toString('base64'),
    },
  };

  await tasksClient.createTask({ parent, task });
  console.log(`Queued translation for ${payload.documentPath} -> ${payload.targetLocale} (job: ${jobId})`);
  
  return jobId;
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

  const data = await response.json() as { documents?: FirestoreDocument[] };
  return data.documents || [];
}

// Parse Firestore REST document to plain object
function parseFirestoreDoc(doc: FirestoreDocument): { path: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  const pathParts = doc.name.split('/documents/')[1];
  
  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      if (value.stringValue !== undefined) {
        fields[key] = value.stringValue;
      }
    }
  }
  
  return { path: pathParts, fields };
}

// Track processed documents
const processedDocs = new Map<string, string>();

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
        
        if (processedDocs.get(docKey) === currentHash) {
          continue;
        }
        
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
        
        for (const targetLocale of targetLocales) {
          queueTranslation({
            projectId: project.id,
            userId: project.userId,
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
      
      const tokenDoc = await melakaDb.collection('melaka_oauth_tokens').doc(project.id).get();
      if (!tokenDoc.exists) {
        console.log(`No tokens for project ${project.id}, skipping`);
        continue;
      }

      const tokenData = tokenDoc.data() as TokenDoc;
      
      const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(0);
      const bufferTime = 5 * 60 * 1000;
      let accessToken: string;
      
      if (expiresAt.getTime() - bufferTime < Date.now()) {
        console.log(`Refreshing token for project ${project.id}...`);
        
        if (!tokenData.refreshTokenEncrypted) {
          console.log(`No refresh token for project ${project.id}, skipping`);
          continue;
        }
        
        try {
          const refreshToken = decrypt(tokenData.refreshTokenEncrypted, CONFIG.encryptionKey);
          const newTokens = await refreshAccessToken(refreshToken);
          accessToken = newTokens.accessToken;
          
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

// Webhook endpoint
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
    
    await pollAllProjects();
    
    setInterval(pollAllProjects, 30 * 1000);
    
    console.log('Listener service ready (polling mode)');
  } catch (err) {
    console.error('Failed to initialize:', err);
  }
});
