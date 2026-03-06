import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getOAuthManager } from '@/lib/firebase-admin';

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
    console.log('OAuth callback - userId:', userId, 'projectId:', projectId);

    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const tokens = await oauth.exchangeCode(code);
    console.log('Tokens received, scopes:', tokens.scope);

    // Get user info
    console.log('Verifying token...');
    const userInfo = await oauth.verifyToken(tokens.accessToken);
    console.log('User info:', userInfo.email);

    // Store encrypted tokens in Firestore
    console.log('Storing tokens in Firestore...');
    
    // Check if a project with this Firebase project ID already exists for this user
    const existingProjects = await db.getProjectsByFirebaseProjectId(projectId);
    let melakaProjectId: string;
    
    if (existingProjects.length === 0) {
      console.log('Project does not exist, creating...');
      const newProject = await db.createProject({
        userId,
        firebaseProjectId: projectId,
        name: projectId, // Use projectId as name for now
        config: {
          collections: [],
          sourceLocale: 'en',
          targetLocales: [],
        },
      });
      melakaProjectId = newProject.id;
      console.log('Project created with ID:', melakaProjectId);
    } else {
      melakaProjectId = existingProjects[0].id;
      console.log('Using existing project:', melakaProjectId);
    }
    
    await db.storeTokens({
      projectId: melakaProjectId,
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
    let errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    // Provide more helpful error messages for common Firestore issues
    if (errorMessage.includes('5 NOT_FOUND')) {
      errorMessage = 'Firestore database not found. Please create a Firestore database in Native mode in your Firebase Console.';
    } else if (errorMessage.includes('7 PERMISSION_DENIED')) {
      errorMessage = 'Firestore permission denied. Check your Firebase service account has the correct permissions.';
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connect?error=callback_failed&detail=${encodeURIComponent(errorMessage)}`
    );
  }
}
