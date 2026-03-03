import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { MelakaFirestoreDatabase, OAuthManager } from '@melaka/cloud/dashboard';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`;

// Initialize Firebase Admin
let firebaseApp: App;
function getFirebaseApp(): App {
  if (getApps().length === 0) {
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

function getDatabase(): MelakaFirestoreDatabase | null {
  if (!process.env.ENCRYPTION_KEY) return null;
  
  const app = getFirebaseApp();
  const firestore = getFirestore(app);
  
  return new MelakaFirestoreDatabase({
    firestore,
    encryptionKey: process.env.ENCRYPTION_KEY,
  });
}

function getOAuthManager(): OAuthManager | null {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;
  
  return new OAuthManager({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect?error=missing_params`
    );
  }

  const oauth = getOAuthManager();
  const db = getDatabase();

  if (!oauth || !db) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect?error=not_configured`
    );
  }

  try {
    // Decode state
    const { userId, projectId } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );

    // Exchange code for tokens
    const tokens = await oauth.exchangeCode(code);

    // Get user info
    const userInfo = await oauth.verifyToken(tokens.accessToken);

    // Store encrypted tokens in Firestore
    await db.storeTokens({
      projectId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(tokens.expiresAt),
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      googleEmail: userInfo.email,
    });

    console.log('OAuth successful for:', userInfo.email, 'Project:', projectId);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect/success?projectId=${encodeURIComponent(projectId)}`
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect?error=callback_failed`
    );
  }
}
