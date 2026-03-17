import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/firebase-admin';
import { getPlanLimits, getTranslationsRemaining, getOverageCount, calculateOverageCost } from '@/lib/plan-limits';
import type { PlanId } from '@/lib/stripe';

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
    const usage = await db.getUserTotalUsage(userId);
    
    // Get project count
    const projects = await db.getProjectsByUser(userId);
    
    // Calculate limits and overage
    const translationsRemaining = getTranslationsRemaining(usage.translationsCount, planId);
    const overageCount = getOverageCount(usage.translationsCount, planId);
    const overageCost = calculateOverageCost(overageCount, planId);
    
    // Trial info
    const trialInfo = subscription?.status === 'trialing' ? {
      isTrialing: true,
      trialEnd: subscription.trialEnd?.toDate?.() || null,
      trialTranslationsUsed: subscription.trialTranslationsUsed || 0,
      trialTranslationsLimit: subscription.trialTranslationsLimit || 500,
    } : null;

    return NextResponse.json({
      planId,
      status: subscription?.status || 'free',
      currentPeriod: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      },
      usage: {
        translations: usage.translationsCount,
        characters: usage.charactersCount,
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
        used: usage.translationsCount,
        limit: limits.translations,
        remaining: translationsRemaining,
        isOverage: overageCount > 0,
        overageCount,
        overageCost,
        overageRate: limits.overage,
      },
      trial: trialInfo,
    });
  } catch (error) {
    console.error('Failed to get usage:', error);
    return NextResponse.json(
      { error: 'Failed to get usage' },
      { status: 500 }
    );
  }
}
