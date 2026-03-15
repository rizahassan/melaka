/**
 * Melaka Cloud Listener Service
 * 
 * Watches connected customer Firestore collections and queues translations.
 * Uses Firestore REST API for customer projects (OAuth tokens).
 */

import express from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CloudTasksClient } from '@google-cloud/tasks';
import { createDecipheriv, scryptSync } from 'crypto';

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
  port: process.env.PORT || 8080,
};

// Initialize Melaka's own Firestore (for reading project configs)
let melakaApp;
let melakaDb;

function initMelakaFirestore() {
  if (melakaApp) return melakaDb;
  
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

// Decryption utility
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

// Firestore REST API helpers
async function firestoreRestListen(projectId, accessToken, collectionPath, onDocument) {
  // Use Firestore REST API to list documents
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore REST error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (data.documents) {
    for (const doc of data.documents) {
      onDocument(doc);
    }
  }
  
  return data.documents?.length || 0;
}

// Parse Firestore REST document to plain object
function parseFirestoreDoc(doc) {
  const fields = {};
  const name = doc.name; // projects/{project}/databases/(default)/documents/{collection}/{docId}
  const pathParts = name.split('/documents/')[1]; // collection/docId
  
  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      if (value.stringValue !== undefined) {
        fields[key] = value.stringValue;
      } else if (value.integerValue !== undefined) {
        fields[key] = parseInt(value.integerValue);
      } else if (value.booleanValue !== undefined) {
        fields[key] = value.booleanValue;
      }
    }
  }
  
  return { path: pathParts, fields };
}

// Track processed documents to avoid re-translating
const processedDocs = new Map(); // docPath -> hash of fields

function hashFields(fields) {
  return JSON.stringify(fields);
}

// Poll a customer project for changes
async function pollProject(project, accessToken) {
  const projectId = project.id;
  const firebaseProjectId = project.firebaseProjectId;
  const config = project.config || {};
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
      await firestoreRestListen(firebaseProjectId, accessToken, path, (doc) => {
        const parsed = parseFirestoreDoc(doc);
        const docKey = `${projectId}:${parsed.path}`;
        const currentHash = hashFields(parsed.fields);
        
        // Check if we already processed this exact version
        if (processedDocs.get(docKey) === currentHash) {
          return;
        }
        
        // Extract translatable fields
        const translatableData = {};
        for (const field of fields) {
          if (typeof parsed.fields[field] === 'string' && parsed.fields[field].trim()) {
            translatableData[field] = parsed.fields[field];
          }
        }
        
        if (Object.keys(translatableData).length === 0) {
          processedDocs.set(docKey, currentHash);
          return;
        }
        
        // Queue translation for each target locale
        for (const targetLocale of targetLocales) {
          queueTranslation({
            projectId,
            firebaseProjectId,
            documentPath: parsed.path,
            sourceLocale,
            targetLocale,
            fields: translatableData,
            accessToken,
          }).catch(err => {
            console.error(`Failed to queue translation:`, err.message);
          });
          queued++;
        }
        
        processedDocs.set(docKey, currentHash);
      });
    } catch (err) {
      console.error(`Error polling ${path} for ${projectId}:`, err.message);
    }
  }
  
  return queued;
}

// Main polling loop
async function pollAllProjects() {
  console.log('Polling projects for changes...');
  
  try {
    const snapshot = await melakaDb
      .collection('melaka_projects')
      .where('status', '==', 'active')
      .get();

    let totalQueued = 0;

    for (const doc of snapshot.docs) {
      const project = { id: doc.id, ...doc.data() };
      
      // Get OAuth tokens
      const tokenDoc = await melakaDb.collection('melaka_oauth_tokens').doc(project.id).get();
      if (!tokenDoc.exists) {
        console.log(`No tokens for project ${project.id}, skipping`);
        continue;
      }

      const tokenData = tokenDoc.data();
      
      // Check if token is expired
      const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(0);
      if (expiresAt < new Date()) {
        console.log(`Token expired for project ${project.id}, skipping`);
        // TODO: Refresh token
        continue;
      }
      
      const accessToken = decrypt(tokenData.accessTokenEncrypted, CONFIG.encryptionKey);
      
      const queued = await pollProject(project, accessToken);
      totalQueued += queued;
    }

    console.log(`Polling complete. Queued ${totalQueued} translations.`);
  } catch (err) {
    console.error('Polling error:', err);
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'melaka-listener',
    status: 'healthy',
    processedDocs: processedDocs.size,
  });
});

// Manual sync endpoint
app.post('/sync', async (req, res) => {
  try {
    await pollAllProjects();
    res.json({ success: true });
  } catch (err) {
    console.error('Sync failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint for real-time triggers (future)
app.post('/webhook', async (req, res) => {
  // Can be used with Firebase Extensions or Cloud Functions to push changes
  console.log('Webhook received:', req.body);
  res.json({ received: true });
});

// Start server
const PORT = CONFIG.port;
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
