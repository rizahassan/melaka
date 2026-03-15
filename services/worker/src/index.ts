/**
 * Melaka Cloud Worker Service
 * 
 * Processes translation tasks from Cloud Tasks queue.
 * Standalone service - no workspace dependencies.
 */

import express from 'express';

const app = express();
app.use(express.json());

const CONFIG = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  port: process.env.PORT || '8080',
};

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
    console.log(`Token prefix: ${accessToken?.substring(0, 20)}...`);

    if (!firebaseProjectId || !documentPath || !fields || !accessToken) {
      console.error('Missing required fields');
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

    res.json({
      success: true,
      documentPath,
      targetLocale,
      fieldsTranslated: Object.keys(translations).length,
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
