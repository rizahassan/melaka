import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * GET /api/debug/sentry - Trigger a test error for Sentry
 * Only works in development or when explicitly enabled
 */
export async function GET() {
  // Capture a test exception
  Sentry.captureException(new Error('Sentry test error - triggered manually'));
  
  // Also throw to test error boundary
  throw new Error('Sentry test error - this should appear in your Sentry dashboard');
}
