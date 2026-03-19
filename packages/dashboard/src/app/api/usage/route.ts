import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';
import { getPlanLimits, getTranslationsRemaining, getOverageCount, calculateOverageCost } from '@/lib/plan-limits';
import type { PlanId } from '@/lib/plans';

/**
 * GET /api/usage - Get usage stats for the current user
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
    // Get subscription
    const subscription = await db.getSubscription(userId);
    const planId: PlanId = subscription?.planId || 'free';
    const limits = getPlanLimits(planId);
    
    // Get current period usage
    const usageStats = await db.getUserTotalUsage(userId);
    
    // Get projects
    const projects = await db.getProjectsByUser(userId);
    
    // Calculate limits and overage
    const translationsRemaining = getTranslationsRemaining(usageStats.translationsCount, planId);
    const overageCount = getOverageCount(usageStats.translationsCount, planId);
    const overageCost = calculateOverageCost(overageCount, planId);
    
    // Trial info
    const trialInfo = subscription?.status === 'trialing' ? {
      isTrialing: true,
      trialEnd: subscription.trialEnd?.toDate?.() || null,
      trialTranslationsUsed: subscription.trialTranslationsUsed || 0,
      trialTranslationsLimit: subscription.trialTranslationsLimit || 500,
    } : null;

    // Build byProject array (placeholder - jobs per project would need separate query)
    const byProject = projects.map((p) => ({
      projectId: p.id,
      projectName: p.name,
      totalJobs: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    }));

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return NextResponse.json({
      // Top-level plan info
      planId,
      status: subscription?.status || 'free',
      currentPeriod: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      limits: {
        translations: limits.translations,
        projects: limits.projects,
      },
      projects: {
        count: projects.length,
        limit: limits.projects,
        remaining: limits.projects === -1 ? Infinity : Math.max(0, limits.projects - projects.length),
      },
      translations: {
        used: usageStats.translationsCount,
        limit: limits.translations,
        remaining: translationsRemaining,
        isOverage: overageCount > 0,
        overageCount,
        overageCost,
        overageRate: limits.overage,
      },
      trial: trialInfo,
      
      // Nested usage object for settings page compatibility
      usage: {
        totalTranslations: usageStats.translationsCount,
        totalDocuments: usageStats.charactersCount,
        byProject,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to get usage:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get usage', details: message },
      { status: 500 }
    );
  }
}
