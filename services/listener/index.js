/**
 * Melaka Cloud Listener Service
 * 
 * Watches connected customer Firestore collections and queues translations.
 * Runs on Cloud Run, polls melaka_projects for active projects.
 */

import express from 'express';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CloudTasksClient } from '@google-cloud/tasks';

const app = express();
app.use(express.json());

// Config from environment
const CONFIG = {
  melakaProjectId: process.env.FIREBASE_PROJECT_ID || 'melaka-cloud',
  serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  encryptionKey: process.env.ENCRYPTION_KEY,
  cloudTasksProject: process.env.CLOUD_TASKS_PROJECT_ID || 'melaka-cloud',
  cloudTasksLocation: process.env.CLOUD_TASKS_LOCATION || 'us-central1',
  cloudTasksQueue: process.env.CLOUD_TASKS_QUEUE_NAME || 'melaka-translations',
  workerUrl: process.env.CLOUD_TASKS_SERVICE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  port: process.env.PORT || 8080,
};

// Initialize Melaka's own Firestore
let melakaApp;
let melakaDb;

function initMelakaFirestore() {
  if (melakaApp) return melakaDb;
  
  const serviceAccount = CONFIG.serviceAccountJson 
    ? JSON.parse(CONFIG.serviceAccountJson) 
    : undefined;
  
  melakaApp = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: CONFIG.melakaProjectId,
  }, 'melaka-admin');
  
  melakaDb = getFirestore(melakaApp);
  return melakaDb;
}

// Encryption utilities (same as in cloud package)
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

function decrypt(ciphertext, encryptionKey) {
  const [saltB64, ivB64, tagB64, encryptedB64] = ciphertext.split(':');
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  const key = scryptSync(encryptionKey, salt, 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

// Cloud Tasks client
const tasksClient = new CloudTasksClient();

async function queueTranslation(payload) {
  const parent = tasksClient.queuePath(
    CONFIG.cloudTasksProject,
    CONFIG.cloudTasksLocation,
    CONFIG.cloudTasksQueue
  );

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `${CONFIG.workerUrl}/translate`,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
  };

  await tasksClient.createTask({ parent, task });
  console.log(`Queued translation for ${payload.documentPath} -> ${payload.targetLocale}`);
}

// Active project listeners
const activeListeners = new Map(); // projectId -> { unsubscribes: [], customerApp }

async function startListeningToProject(project) {
  const projectId = project.id;
  
  if (activeListeners.has(projectId)) {
    console.log(`Already listening to project ${projectId}`);
    return;
  }

  console.log(`Starting listener for project ${projectId} (${project.firebaseProjectId})`);

  // Get OAuth tokens
  const tokenDoc = await melakaDb.collection('melaka_oauth_tokens').doc(projectId).get();
  if (!tokenDoc.exists) {
    console.error(`No tokens for project ${projectId}`);
    return;
  }

  const tokenData = tokenDoc.data();
  const accessToken = decrypt(tokenData.accessTokenEncrypted, CONFIG.encryptionKey);

  // Initialize customer's Firestore
  const customerAppName = `customer-${projectId}`;
  let customerApp;
  
  try {
    customerApp = initializeApp({
      projectId: project.firebaseProjectId,
      credential: {
        getAccessToken: async () => ({
          access_token: accessToken,
          expires_in: 3600,
        }),
      },
    }, customerAppName);
  } catch (err) {
    if (err.code === 'app/duplicate-app') {
      customerApp = getApps().find(a => a.name === customerAppName);
    } else {
      throw err;
    }
  }

  const customerDb = getFirestore(customerApp);
  const unsubscribes = [];

  // Listen to each configured collection
  for (const collectionConfig of project.config.collections || []) {
    if (collectionConfig.enabled === false) continue;

    const { path, fields } = collectionConfig;
    console.log(`  Listening to ${path} for fields: ${fields.join(', ')}`);

    const unsubscribe = customerDb.collection(path).onSnapshot(
      (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added' || change.type === 'modified') {
            const doc = change.doc;
            const data = doc.data();

            // Skip i18n subcollection docs
            if (doc.ref.path.includes('/i18n/')) continue;

            // Extract translatable fields
            const translatableData = {};
            for (const field of fields) {
              if (typeof data[field] === 'string' && data[field].trim()) {
                translatableData[field] = data[field];
              }
            }

            if (Object.keys(translatableData).length === 0) continue;

            // Queue translation for each target locale
            for (const targetLocale of project.config.targetLocales || []) {
              queueTranslation({
                projectId,
                firebaseProjectId: project.firebaseProjectId,
                documentPath: doc.ref.path,
                sourceLocale: project.config.sourceLocale || 'en',
                targetLocale,
                fields: translatableData,
                accessToken, // Include for worker to use
              }).catch(err => {
                console.error(`Failed to queue translation:`, err);
              });
            }
          }
        }
      },
      (error) => {
        console.error(`Listener error for ${projectId}/${path}:`, error);
      }
    );

    unsubscribes.push(unsubscribe);
  }

  activeListeners.set(projectId, { unsubscribes, customerApp });
}

async function stopListeningToProject(projectId) {
  const listener = activeListeners.get(projectId);
  if (!listener) return;

  console.log(`Stopping listener for project ${projectId}`);
  
  for (const unsubscribe of listener.unsubscribes) {
    unsubscribe();
  }

  if (listener.customerApp) {
    await deleteApp(listener.customerApp);
  }

  activeListeners.delete(projectId);
}

// Poll for active projects and manage listeners
async function syncProjectListeners() {
  console.log('Syncing project listeners...');
  
  const snapshot = await melakaDb
    .collection('melaka_projects')
    .where('status', '==', 'active')
    .get();

  const activeProjectIds = new Set();

  for (const doc of snapshot.docs) {
    const project = { id: doc.id, ...doc.data() };
    activeProjectIds.add(project.id);

    if (!activeListeners.has(project.id)) {
      await startListeningToProject(project).catch(err => {
        console.error(`Failed to start listener for ${project.id}:`, err);
      });
    }
  }

  // Stop listeners for projects no longer active
  for (const projectId of activeListeners.keys()) {
    if (!activeProjectIds.has(projectId)) {
      await stopListeningToProject(projectId);
    }
  }

  console.log(`Active listeners: ${activeListeners.size}`);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'melaka-listener',
    status: 'healthy',
    activeListeners: activeListeners.size,
  });
});

// Manual sync endpoint
app.post('/sync', async (req, res) => {
  try {
    await syncProjectListeners();
    res.json({ success: true, activeListeners: activeListeners.size });
  } catch (err) {
    console.error('Sync failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(CONFIG.port, async () => {
  console.log(`Melaka Listener starting on port ${CONFIG.port}`);
  
  initMelakaFirestore();
  
  // Initial sync
  await syncProjectListeners();
  
  // Periodic sync every 5 minutes
  setInterval(syncProjectListeners, 5 * 60 * 1000);
  
  console.log('Listener service ready');
});
