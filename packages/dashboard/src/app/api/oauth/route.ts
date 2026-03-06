import { NextRequest, NextResponse } from 'next/server';
import { getOAuthManager } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const oauth = getOAuthManager();
  if (!oauth) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');

  if (!userId || !projectId) {
    return NextResponse.json(
      { error: 'Missing userId or projectId' },
      { status: 400 }
    );
  }

  // Encode state with user + project info
  const state = Buffer.from(JSON.stringify({ userId, projectId })).toString('base64');

  // Use OAuthManager which includes Firestore scopes
  const authUrl = oauth.getAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
