import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';

/**
 * GET /api/translations/status - Get real-time translation status summary.
 * Returns counts of pending, processing, completed, and failed jobs,
 * plus a list of active (pending/processing) jobs for live tracking.
 *
 * Query params:
 *   - projectId (optional): filter by project
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

  try {
    const projects = await db.getProjectsByUser(userId);

    if (projects.length === 0) {
      return NextResponse.json({
        status: { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 },
        activeJobs: [],
        recentCompleted: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const targetProjects = projectIdFilter
      ? projects.filter((p) => p.id === projectIdFilter || p.firebaseProjectId === projectIdFilter)
      : projects;

    if (targetProjects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch all jobs with different statuses in parallel
    const [pendingJobs, processingJobs, completedJobs, failedJobs] = await Promise.all(
      ['pending', 'processing', 'completed', 'failed'].map((status) =>
        Promise.all(
          targetProjects.map((project) =>
            db.getJobsByProject(project.id, {
              status: status as 'pending' | 'processing' | 'completed' | 'failed',
              limit: status === 'completed' ? 10 : 100,
            }).then((jobs) =>
              jobs.map((job) => ({
                ...job,
                projectName: project.name,
                projectId: project.id,
              }))
            )
          )
        ).then((results) => results.flat())
      )
    );

    // Active jobs are pending + processing (the ones users care about for live tracking)
    const activeJobs = [...pendingJobs, ...processingJobs].map((job) => ({
      id: job.id,
      documentPath: job.documentPath,
      targetLocale: job.targetLocale,
      status: job.status,
      projectName: job.projectName,
      projectId: job.projectId,
      attempts: job.attempts,
      error: job.error || null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));

    // Recent completed (last 10) for showing progress
    const recentCompleted = completedJobs
      .sort((a, b) => {
        const aTime = typeof a.updatedAt === 'object' && a.updatedAt && '_seconds' in a.updatedAt
          ? (a.updatedAt as { _seconds: number })._seconds
          : 0;
        const bTime = typeof b.updatedAt === 'object' && b.updatedAt && '_seconds' in b.updatedAt
          ? (b.updatedAt as { _seconds: number })._seconds
          : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((job) => ({
        id: job.id,
        documentPath: job.documentPath,
        targetLocale: job.targetLocale,
        projectName: job.projectName,
        updatedAt: job.updatedAt,
      }));

    return NextResponse.json({
      status: {
        pending: pendingJobs.length,
        processing: processingJobs.length,
        completed: completedJobs.length,
        failed: failedJobs.length,
        total: pendingJobs.length + processingJobs.length + completedJobs.length + failedJobs.length,
      },
      activeJobs,
      recentCompleted,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch translation status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
