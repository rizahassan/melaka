import { NextRequest, NextResponse } from 'next/server';
import { type ProjectConfig } from '@melaka/cloud/dashboard';
import { getDatabase } from '@/lib/firebase-admin';
import { canCreateProject } from '@/lib/plan-limits';
import type { PlanId } from '@/lib/stripe';

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful messages for common Firestore issues
    if (errorMessage.includes('5 NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Firestore database not found. Please create a Firestore database in Native mode in your Firebase Console.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('9 FAILED_PRECONDITION') || errorMessage.includes('requires an index')) {
      return NextResponse.json(
        { error: 'Firestore index required. Check console logs for the index creation link.', details: errorMessage },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to list projects', details: errorMessage },
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
    // Check project limit based on subscription
    const subscription = await db.getSubscription(userId);
    const planId: PlanId = subscription?.planId || 'free';
    
    // Only check limits for active/trialing subscriptions or free tier
    const isActive = !subscription || subscription.status === 'active' || subscription.status === 'trialing';
    
    if (isActive) {
      const existingProjects = await db.getProjectsByUser(userId);
      
      if (!canCreateProject(existingProjects.length, planId)) {
        const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
        return NextResponse.json(
          { 
            error: `Project limit reached for ${planName} plan. Please upgrade to create more projects.`,
            code: 'PROJECT_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('5 NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Firestore database not found. Please create a Firestore database in Native mode in your Firebase Console.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
