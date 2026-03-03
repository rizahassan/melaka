import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { MelakaFirestoreDatabase, type ProjectConfig } from '@melaka/cloud/dashboard';

// Initialize Firebase Admin (singleton)
let firebaseApp: App;
function getFirebaseApp(): App {
  if (getApps().length === 0) {
    // In production, use service account from env
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : undefined;

    firebaseApp = initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return firebaseApp || getApps()[0];
}

// Initialize database
function getDatabase(): MelakaFirestoreDatabase | null {
  if (!process.env.ENCRYPTION_KEY) return null;
  
  const app = getFirebaseApp();
  const firestore = getFirestore(app);
  
  return new MelakaFirestoreDatabase({
    firestore,
    encryptionKey: process.env.ENCRYPTION_KEY,
  });
}

/**
 * GET /api/projects - List projects for a user
 */
export async function GET(request: NextRequest) {
  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await db.getProjectsByUser(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to list projects:', error);
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
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
    const { firebaseProjectId, name, config } = body as {
      firebaseProjectId: string;
      name: string;
      config?: Partial<ProjectConfig>;
    };

    if (!firebaseProjectId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: firebaseProjectId, name' },
        { status: 400 }
      );
    }

    const defaultConfig: ProjectConfig = {
      collections: [],
      sourceLocale: 'en',
      targetLocales: [],
      ...config,
    };

    const project = await db.createProject({
      userId,
      firebaseProjectId,
      name,
      config: defaultConfig,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
