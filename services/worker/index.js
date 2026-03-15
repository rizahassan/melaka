/**
 * Melaka Cloud Worker Service
 * 
 * Processes translation tasks from Cloud Tasks queue.
 * Uses Gemini for translations, writes to customer Firestore via REST API.
 */

import express from 'express';

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${CONFIG.geminiApiKey}`,
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

// Write to Firestore via REST API
async function writeToFirestoreRest(projectId, documentPath, locale, fields, accessToken) {
  // documentPath is like "articles/abc123"
  // We need to write to "articles/abc123/i18n/ms"
  const i18nPath = `${documentPath}/i18n/${locale}`;
  
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${i18nPath}`;
  
  // Convert fields to Firestore format
  const firestoreFields = {};
  for (const [key, value] of Object.entries(fields)) {
    firestoreFields[key] = { stringValue: value };
  }
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: firestoreFields,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore write error: ${response.status} - ${error}`);
  }

  return await response.json();
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

    // Write to customer Firestore via REST API
    await writeToFirestoreRest(
      firebaseProjectId,
      documentPath,
      targetLocale,
      translatedFields,
      accessToken
    );

    const duration = Date.now() - startTime;
    console.log(`Completed translation in ${duration}ms: ${documentPath}/i18n/${targetLocale}`);

    res.json({
      success: true,
      documentPath,
      targetLocale,
      fieldsTranslated: Object.keys(translatedFields).length,
      durationMs: duration,
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(CONFIG.port, () => {
  console.log(`Melaka Worker running on port ${CONFIG.port}`);
});
