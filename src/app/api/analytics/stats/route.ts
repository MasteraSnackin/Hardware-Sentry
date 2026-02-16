/**
 * GET /api/analytics/stats - Layer 2 (Orchestration)
 *
 * Returns aggregated analytics statistics for the dashboard
 */

import { NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/analytics';
import { PerformanceMonitor, createMonitoredResponse } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const monitor = new PerformanceMonitor('GET /api/analytics/stats');

  try {
    // Fetch analytics stats from Layer 3
    const stats = await getAnalyticsStats();

    monitor.end(true, {
      totalScans: stats.totalScans,
      successRate: stats.successRate,
      cacheHitRate: stats.cacheHitRate,
    });

    const response = createMonitoredResponse(monitor, {
      ...stats,
      timestamp: new Date().toISOString(),
    });

    // Add cache headers
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');

    return response;
  } catch (error) {
    monitor.end(false);

    console.error('[API] Analytics stats error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
