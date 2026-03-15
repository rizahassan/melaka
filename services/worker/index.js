/**
 * Melaka Cloud Worker Service
 * 
 * Processes translation tasks from Cloud Tasks queue.
 * Uses Gemini for translations, writes to customer Firestore.
 */

import express from 'express';
import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();
app.use(express.json());

const CONFIG = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  port: process.env.PORT || 8080,
};

// Translate with Gemini
async function translateWithGemini(text, sourceLocale, targetLocale) {
  if (!CONFIG.geminiApiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following text from ${sourceLocale} to ${targetLocale}. Return ONLY the translated text, no explanations.\n\n${text}`,
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// Health check
app.get('/', (req, res) => {
  res.json({ service: 'melaka-worker', status: 'healthy' });
});

// Translation endpoint (called by Cloud Tasks)
app.post('/translate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const {
      projectId,
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

    // Initialize customer's Firestore
    const customerAppName = `worker-${projectId}-${Date.now()}`;
    let customerApp;
    
    try {
      customerApp = initializeApp({
        projectId: firebaseProjectId,
        credential: {
          getAccessToken: async () => ({
            access_token: accessToken,
            expires_in: 3600,
          }),
        },
      }, customerAppName);
    } catch (err) {
      console.error('Failed to initialize customer app:', err);
      return res.status(500).json({ error: 'Failed to initialize customer Firestore' });
    }

    const customerDb = getFirestore(customerApp);

    try {
      // Translate each field
      const translatedFields = {};
      
      for (const [fieldName, fieldValue] of Object.entries(fields)) {
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
          console.log(`  Translating ${fieldName}...`);
          translatedFields[fieldName] = await translateWithGemini(
            fieldValue,
            sourceLocale,
            targetLocale
          );
        }
      }

      // Write to i18n subcollection
      const i18nDocRef = customerDb.doc(`${documentPath}/i18n/${targetLocale}`);
      await i18nDocRef.set(translatedFields, { merge: true });

      const duration = Date.now() - startTime;
      console.log(`Completed translation in ${duration}ms: ${documentPath}/i18n/${targetLocale}`);

      res.json({
        success: true,
        documentPath,
        targetLocale,
        fieldsTranslated: Object.keys(translatedFields).length,
        durationMs: duration,
      });
    } finally {
      // Cleanup customer app
      await deleteApp(customerApp);
    }
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(CONFIG.port, () => {
  console.log(`Melaka Worker running on port ${CONFIG.port}`);
});
