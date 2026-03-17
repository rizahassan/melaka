/**
 * Plan limits and enforcement utilities.
 */

import { PLANS, type PlanId } from './stripe';

export interface PlanLimits {
  translations: number; // -1 = unlimited
  projects: number; // -1 = unlimited
  overage: number; // cost per translation over limit
}

export function getPlanLimits(planId: PlanId): PlanLimits {
  const plan = PLANS[planId];
  return {
    translations: plan.limits.translations,
    projects: plan.limits.projects,
    overage: 'overage' in plan ? (plan.overage as number) : 0,
  };
}

export function canCreateProject(currentCount: number, planId: PlanId): boolean {
  const limits = getPlanLimits(planId);
  if (limits.projects === -1) return true; // unlimited
  return currentCount < limits.projects;
}

export function canTranslate(currentCount: number, planId: PlanId): { allowed: boolean; isOverage: boolean } {
  const limits = getPlanLimits(planId);
  if (limits.translations === -1) return { allowed: true, isOverage: false }; // unlimited (free tier)
  
  // Always allow, but track if it's overage
  return {
    allowed: true,
    isOverage: currentCount >= limits.translations,
  };
}

export function getTranslationsRemaining(currentCount: number, planId: PlanId): number {
  const limits = getPlanLimits(planId);
  if (limits.translations === -1) return Infinity;
  return Math.max(0, limits.translations - currentCount);
}

export function getOverageCount(currentCount: number, planId: PlanId): number {
  const limits = getPlanLimits(planId);
  if (limits.translations === -1) return 0;
  return Math.max(0, currentCount - limits.translations);
}

export function calculateOverageCost(overageCount: number, planId: PlanId): number {
  const limits = getPlanLimits(planId);
  return overageCount * limits.overage;
}
