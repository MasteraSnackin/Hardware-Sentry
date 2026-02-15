/**
 * GET /api/health
 * Health check endpoint to verify API and dependencies
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Hardware Sentry API',
    version: '0.1.0',
    checks: {
      tinyfish: {
        configured: !!process.env.TINYFISH_API_KEY,
        status: process.env.TINYFISH_API_KEY ? 'ready' : 'not_configured',
      },
      redis: {
        configured:
          !!process.env.UPSTASH_REDIS_REST_URL &&
          !!process.env.UPSTASH_REDIS_REST_TOKEN,
        status:
          process.env.UPSTASH_REDIS_REST_URL &&
          process.env.UPSTASH_REDIS_REST_TOKEN
            ? 'ready'
            : 'not_configured',
      },
    },
  };

  // Overall health status
  const allConfigured =
    health.checks.tinyfish.configured && health.checks.redis.configured;

  if (!allConfigured) {
    health.status = 'degraded';
  }

  const statusCode = allConfigured ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
