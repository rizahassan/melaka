import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';

/**
 * GET /api/translations - List translation jobs for the user's projects
 * Query params:
 *   - projectId (optional): filter by project
 *   - status (optional): filter by status (pending | processing | completed | failed)
 *   - limit (optional): max results (default 200)
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

  const searchParams = request.nextUrl.searchParams;
  const projectIdFilter = searchParams.get('projectId');
  const statusFilter = searchParams.get('status') as
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | null;
  const limit = parseInt(searchParams.get('limit') || '200', 10);

  try {
    // Get user's projects first
    const projects = await db.getProjectsByUser(userId);

    if (projects.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    // If a specific project is requested, verify the user owns it
    const targetProjects = projectIdFilter
      ? projects.filter((p) => p.id === projectIdFilter || p.firebaseProjectId === projectIdFilter)
      : projects;

    if (targetProjects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch jobs for each project
    const allJobs = await Promise.all(
      targetProjects.map((project) =>
        db.getJobsByProject(project.id, {
          status: statusFilter || undefined,
          limit,
        }).then((jobs) =>
          jobs.map((job) => ({
            ...job,
            projectName: project.name,
            firebaseProjectId: project.firebaseProjectId,
          }))
        )
      )
    );

    const translations = allJobs.flat();

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Failed to list translations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('5 NOT_FOUND')) {
      return NextResponse.json(
        {
          error:
            'Firestore database not found. Please create a Firestore database in Native mode in your Firebase Console.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list translations', details: errorMessage },
      { status: 500 }
    );
  }
}
