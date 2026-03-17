/**
 * Melaka Cloud Worker Service
 * 
 * Processes translation tasks from Cloud Tasks queue.
 * Standalone service - no workspace dependencies.
 */

import express from 'express';
import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, type Firestore } from 'firebase-admin/firestore';

const app = express();
app.use(express.json());

const CONFIG = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  melakaProjectId: process.env.FIREBASE_PROJECT_ID || 'melaka-cloud',
  serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  port: process.env.PORT || '8080',
};

// Initialize Melaka Firestore for job status updates
let melakaApp: App;
let melakaDb: Firestore;

function initMelakaFirestore(): Firestore {
  if (melakaDb) return melakaDb;
  
  const serviceAccount = CONFIG.serviceAccountJson 
    ? JSON.parse(CONFIG.serviceAccountJson) 
    : undefined;
  
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not configured - job status updates disabled');
    return null as unknown as Firestore;
  }
  
  melakaApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: CONFIG.melakaProjectId,
  }, 'melaka-worker');
  
  melakaDb = getFirestore(melakaApp);
  return melakaDb;
}

// Update job status in Melaka Firestore
async function updateJobStatus(
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  extra?: { error?: string; translatedFields?: Record<string, string>; durationMs?: number }
): Promise<void> {
  if (!melakaDb || !jobId) return;
  
  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
      if (extra?.translatedFields) {
        updateData.translatedFields = extra.translatedFields;
      }
      if (extra?.durationMs) {
        updateData.durationMs = extra.durationMs;
      }
    }
    
    if (status === 'failed' && extra?.error) {
      updateData.error = extra.error;
    }
    
    await melakaDb.collection('melaka_jobs').doc(jobId).update(updateData);
    console.log(`Updated job ${jobId} status to ${status}`);
  } catch (err) {
    console.error(`Failed to update job ${jobId} status:`, err);
  }
}

// Record usage for billing
async function recordUsage(projectId: string, userId: string, charactersCount: number): Promise<void> {
  if (!melakaDb) return;
  
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const usageId = `${projectId}_${periodStart.toISOString().slice(0, 7)}`;
    const usageRef = melakaDb.collection('melaka_usage').doc(usageId);

    await melakaDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(usageRef);

      if (doc.exists) {
        transaction.update(usageRef, {
          translationsCount: FieldValue.increment(1),
          charactersCount: FieldValue.increment(charactersCount),
          apiCallsCount: FieldValue.increment(1),
        });
      } else {
        transaction.set(usageRef, {
          projectId,
          userId,
          periodStart: Timestamp.fromDate(periodStart),
          periodEnd: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
          translationsCount: 1,
          charactersCount,
          apiCallsCount: 1,
          createdAt: Timestamp.now(),
        });
      }
    });
    
    console.log(`Recorded usage for project ${projectId}`);
  } catch (err) {
    console.error('Failed to record usage:', err);
  }
}

// Translate fields using Gemini
async function translateFields(
  fields: Record<string, string>,
  sourceLocale: string,
  targetLocale: string
): Promise<Record<string, string>> {
  const fieldList = Object.entries(fields)
    .map(([key, value]) => `"${key}": "${escapeForJson(value)}"`)
    .join(',\n  ');

  const prompt = `Translate the following JSON fields from ${sourceLocale} to ${targetLocale}.
Return ONLY a valid JSON object with the same keys and translated values.

Input:
{
  ${fieldList}
}

Output (translated JSON):`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(textResponse);
}

function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Write to Firestore via REST API
async function writeToFirestoreRest(
  projectId: string,
  documentPath: string,
  locale: string,
  fields: Record<string, string>,
  accessToken: string
): Promise<void> {
  const i18nPath = `${documentPath}/i18n/${locale}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${i18nPath}`;
  
  const firestoreFields: Record<string, { stringValue: string }> = {};
  for (const [key, value] of Object.entries(fields)) {
    firestoreFields[key] = { stringValue: value };
  }
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: firestoreFields }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore write error: ${response.status} - ${error}`);
  }
}

// Health check
app.get('/', (_req, res) => {
  res.json({ service: 'melaka-worker', status: 'healthy' });
});

// Translation endpoint (called by Cloud Tasks)
app.post('/translate', async (req, res) => {
  const startTime = Date.now();
  
  const {
    projectId, // Melaka project ID
    userId,    // User who owns the project
    firebaseProjectId,
    documentPath,
    sourceLocale,
    targetLocale,
    fields,
    accessToken,
    jobId,
  } = req.body;

  console.log(`Processing translation: ${documentPath} -> ${targetLocale} (job: ${jobId || 'none'})`);

  // Mark job as processing
  if (jobId) {
    await updateJobStatus(jobId, 'processing');
  }

  try {
    if (!firebaseProjectId || !documentPath || !fields || !accessToken) {
      console.error('Missing required fields');
      if (jobId) {
        await updateJobStatus(jobId, 'failed', { error: 'Missing required fields' });
      }
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Translate using Gemini
    const translations = await translateFields(fields, sourceLocale, targetLocale);

    // Write to customer Firestore via REST API
    await writeToFirestoreRest(
      firebaseProjectId,
      documentPath,
      targetLocale,
      translations,
      accessToken
    );

    const duration = Date.now() - startTime;
    console.log(`Completed translation in ${duration}ms: ${documentPath}/i18n/${targetLocale}`);

    // Mark job as completed
    if (jobId) {
      await updateJobStatus(jobId, 'completed', {
        translatedFields: translations,
        durationMs: duration,
      });
    }

    // Record usage for billing (if we have project/user info)
    if (projectId && userId) {
      const totalChars = Object.values(fields).join('').length;
      await recordUsage(projectId, userId, totalChars);
    }

    res.json({
      success: true,
      documentPath,
      targetLocale,
      fieldsTranslated: Object.keys(translations).length,
      durationMs: duration,
    });
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.error('Translation error:', err);
    
    // Mark job as failed
    if (jobId) {
      await updateJobStatus(jobId, 'failed', { error: errorMsg });
    }
    
    res.status(500).json({ error: errorMsg });
  }
});

// Start server
const PORT = parseInt(CONFIG.port, 10);
app.listen(PORT, () => {
  console.log(`Melaka Worker starting on port ${PORT}`);
  
  try {
    initMelakaFirestore();
    console.log('Connected to Melaka Firestore for job updates');
  } catch (err) {
    console.warn('Failed to init Melaka Firestore:', err);
  }
  
  console.log('Worker service ready');
});
