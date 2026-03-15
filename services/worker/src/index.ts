/**
 * Melaka Cloud Worker Service
 * 
 * Processes translation tasks from Cloud Tasks queue.
 * Uses shared translation utilities from @melaka/cloud.
 */

import express from 'express';
import { translateFields } from '@melaka/cloud';

const app = express();
app.use(express.json());

const CONFIG = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-04-17',
  port: process.env.PORT || '8080',
};

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
  
  // Convert fields to Firestore format
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
  
  try {
    const {
      firebaseProjectId,
      documentPath,
      sourceLocale,
      targetLocale,
      fields,
      accessToken,
    } = req.body;

    console.log(`Processing translation: ${documentPath} -> ${targetLocale}`);

    if (!firebaseProjectId || !documentPath || !fields || !accessToken) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Translate using shared utility
    const result = await translateFields(
      fields,
      { sourceLocale, targetLocale },
      { apiKey: CONFIG.geminiApiKey, model: CONFIG.geminiModel }
    );

    if (!result.success || !result.translations) {
      throw new Error(result.error || 'Translation failed');
    }

    // Write to customer Firestore via REST API
    await writeToFirestoreRest(
      firebaseProjectId,
      documentPath,
      targetLocale,
      result.translations,
      accessToken
    );

    const duration = Date.now() - startTime;
    console.log(`Completed translation in ${duration}ms: ${documentPath}/i18n/${targetLocale}`);

    res.json({
      success: true,
      documentPath,
      targetLocale,
      fieldsTranslated: Object.keys(result.translations).length,
      durationMs: duration,
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// Start server
const PORT = parseInt(CONFIG.port, 10);
app.listen(PORT, () => {
  console.log(`Melaka Worker running on port ${PORT}`);
});
