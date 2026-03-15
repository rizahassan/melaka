import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Initialize Gemini
async function translateWithGemini(
  text: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text from ${sourceLocale} to ${targetLocale}. Return ONLY the translated text, no explanations or extra formatting.\n\nText to translate:\n${text}`,
              },
            ],
          },
        ],
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

/**
 * POST /api/translations/trigger - Manually trigger translation for a document
 * Body: { projectId, documentPath, fields, targetLocales }
 */
export async function POST(request: NextRequest) {
  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, documentPath, fields, targetLocales } = body;

    if (!projectId || !documentPath || !fields || !targetLocales) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, documentPath, fields, targetLocales' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await db.getProject(projectId);
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get OAuth tokens to access customer's Firestore
    const tokens = await db.getTokens(projectId);
    if (!tokens) {
      return NextResponse.json({ error: 'Project not connected' }, { status: 400 });
    }

    // Initialize customer's Firestore
    const customerAppName = `customer-${projectId}`;
    let customerApp: App;
    
    const existingApp = getApps().find((app) => app.name === customerAppName);
    if (existingApp) {
      customerApp = existingApp;
    } else {
      customerApp = initializeApp(
        {
          projectId: project.firebaseProjectId,
          credential: {
            getAccessToken: async () => ({
              access_token: tokens.accessToken,
              expires_in: Math.floor((tokens.expiresAt.getTime() - Date.now()) / 1000),
            }),
          },
        },
        customerAppName
      );
    }

    const customerDb = getAdminFirestore(customerApp);
    const sourceLocale = project.config.sourceLocale || 'en';
    const results: Record<string, Record<string, string>> = {};

    // Translate to each target locale
    for (const targetLocale of targetLocales) {
      const translatedFields: Record<string, string> = {};

      for (const [fieldName, fieldValue] of Object.entries(fields)) {
        if (typeof fieldValue === 'string' && fieldValue.trim()) {
          console.log(`Translating ${fieldName} from ${sourceLocale} to ${targetLocale}...`);
          const translated = await translateWithGemini(fieldValue, sourceLocale, targetLocale);
          translatedFields[fieldName] = translated;
        }
      }

      // Write to i18n subcollection
      const i18nDocRef = customerDb.doc(`${documentPath}/i18n/${targetLocale}`);
      await i18nDocRef.set(translatedFields, { merge: true });

      results[targetLocale] = translatedFields;
      console.log(`Wrote translations to ${documentPath}/i18n/${targetLocale}`);
    }

    return NextResponse.json({
      success: true,
      documentPath,
      translations: results,
    });
  } catch (error) {
    console.error('Translation trigger error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Translation failed', details: errorMessage },
      { status: 500 }
    );
  }
}
