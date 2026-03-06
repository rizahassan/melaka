import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get user's projects first
    const projects = await db.getProjectsByUser(userId);
    if (projects.length === 0) {
      return NextResponse.json({
        usage: {
          totalTranslations: 0,
          totalDocuments: 0,
          byProject: [],
          period: { start: new Date().toISOString(), end: new Date().toISOString() },
        },
      });
    }

    // Aggregate usage across all projects
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

    const byProject = await Promise.all(
      projects.map(async (project) => {
        const jobs = await db.getJobsByProject(project.id);

        // Count jobs in current period
        const periodJobs = jobs.filter((j) => {
          const createdAt = j.createdAt?.toDate?.() || new Date(0);
          return createdAt >= periodStart;
        });

        const completedJobs = periodJobs.filter((j) => j.status === 'completed');
        const failedJobs = periodJobs.filter((j) => j.status === 'failed');
        const pendingJobs = periodJobs.filter((j) => j.status === 'pending' || j.status === 'processing');

        return {
          projectId: project.id,
          projectName: project.name,
          totalJobs: periodJobs.length,
          completed: completedJobs.length,
          failed: failedJobs.length,
          pending: pendingJobs.length,
        };
      })
    );

    const totalTranslations = byProject.reduce((sum, p) => sum + p.completed, 0);
    const totalDocuments = byProject.reduce((sum, p) => sum + p.totalJobs, 0);

    return NextResponse.json({
      usage: {
        totalTranslations,
        totalDocuments,
        byProject,
        period: {
          start: periodStart.toISOString(),
          end: now.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error('Usage fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
