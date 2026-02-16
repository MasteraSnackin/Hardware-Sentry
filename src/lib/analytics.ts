/**
 * Analytics Library - Layer 3 (Execution)
 *
 * Deterministic functions for tracking and retrieving analytics data
 * Stores metrics in Redis with time-series data structures
 */

import { Redis } from '@upstash/redis';

// Redis keys for analytics
const ANALYTICS_KEYS = {
  scanCount: 'analytics:scans:count',
  scanSuccess: 'analytics:scans:success',
  scanFailure: 'analytics:scans:failure',
  responseTimes: 'analytics:response_times',
  cacheHits: 'analytics:cache:hits',
  cacheMisses: 'analytics:cache:misses',
  skuPopularity: 'analytics:sku:popularity',
  recentScans: 'analytics:scans:recent',
} as const;

export interface ScanEvent {
  sku: string;
  success: boolean;
  cached: boolean;
  responseTime: number;
  timestamp: number;
  vendorCount?: number;
  errorMessage?: string;
}

export interface AnalyticsStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  successRate: number;
  cacheHitRate: number;
  averageResponseTime: number;
  popularSkus: Array<{ sku: string; count: number }>;
  recentActivity: ScanEvent[];
  period: string;
}

/**
 * Get Redis client (same as lib/redis.ts for consistency)
 */
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[Analytics] Redis not configured - analytics disabled');
    return null;
  }

  return new Redis({ url, token });
}

/**
 * Record a scan event for analytics
 */
export async function recordScanEvent(event: ScanEvent): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return; // Gracefully degrade if Redis unavailable

  try {
    const pipeline = redis.pipeline();

    // Increment counters
    pipeline.incr(ANALYTICS_KEYS.scanCount);
    if (event.success) {
      pipeline.incr(ANALYTICS_KEYS.scanSuccess);
    } else {
      pipeline.incr(ANALYTICS_KEYS.scanFailure);
    }

    // Track cache performance
    if (event.cached) {
      pipeline.incr(ANALYTICS_KEYS.cacheHits);
    } else {
      pipeline.incr(ANALYTICS_KEYS.cacheMisses);
    }

    // Track SKU popularity (sorted set by score)
    pipeline.zincrby(ANALYTICS_KEYS.skuPopularity, 1, event.sku);

    // Record response time (list with recent N values)
    pipeline.lpush(ANALYTICS_KEYS.responseTimes, event.responseTime);
    pipeline.ltrim(ANALYTICS_KEYS.responseTimes, 0, 99); // Keep last 100

    // Store recent scan events (sorted set by timestamp)
    pipeline.zadd(ANALYTICS_KEYS.recentScans, {
      score: event.timestamp,
      member: JSON.stringify({
        sku: event.sku,
        success: event.success,
        cached: event.cached,
        responseTime: event.responseTime,
        timestamp: event.timestamp,
        vendorCount: event.vendorCount,
        errorMessage: event.errorMessage,
      }),
    });

    // Keep only last 50 recent scans
    pipeline.zremrangebyrank(ANALYTICS_KEYS.recentScans, 0, -51);

    await pipeline.exec();
  } catch (error) {
    // Don't throw - analytics should never break the main flow
    console.error('[Analytics] Failed to record event:', error);
  }
}

/**
 * Get analytics statistics
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const redis = getRedisClient();

  if (!redis) {
    // Return empty stats if Redis unavailable
    return {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      successRate: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      popularSkus: [],
      recentActivity: [],
      period: 'all-time',
    };
  }

  try {
    // Fetch all analytics data in parallel
    const [
      totalScans,
      successfulScans,
      failedScans,
      cacheHits,
      cacheMisses,
      responseTimes,
      popularSkus,
      recentScans,
    ] = await Promise.all([
      redis.get<number>(ANALYTICS_KEYS.scanCount),
      redis.get<number>(ANALYTICS_KEYS.scanSuccess),
      redis.get<number>(ANALYTICS_KEYS.scanFailure),
      redis.get<number>(ANALYTICS_KEYS.cacheHits),
      redis.get<number>(ANALYTICS_KEYS.cacheMisses),
      redis.lrange(ANALYTICS_KEYS.responseTimes, 0, 99),
      redis.zrange<string[]>(ANALYTICS_KEYS.skuPopularity, 0, 9, {
        rev: true,
        withScores: true,
      }),
      redis.zrange<string[]>(ANALYTICS_KEYS.recentScans, 0, 49, {
        rev: true,
      }),
    ]);

    // Calculate rates
    const total = totalScans || 0;
    const successful = successfulScans || 0;
    const failed = failedScans || 0;
    const hits = cacheHits || 0;
    const misses = cacheMisses || 0;

    const successRate = total > 0 ? (successful / total) * 100 : 0;
    const cacheHitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

    // Calculate average response time
    const times: number[] = Array.isArray(responseTimes)
      ? responseTimes.map(t => typeof t === 'string' ? parseFloat(t) : t).filter((t): t is number => !isNaN(t))
      : [];
    const averageResponseTime =
      times.length > 0
        ? times.reduce((sum, time) => sum + time, 0) / times.length
        : 0;

    // Parse popular SKUs (Redis returns [sku1, score1, sku2, score2, ...])
    const popularSkusArray: Array<{ sku: string; count: number }> = [];
    if (Array.isArray(popularSkus)) {
      for (let i = 0; i < popularSkus.length; i += 2) {
        if (popularSkus[i] && popularSkus[i + 1] !== undefined) {
          popularSkusArray.push({
            sku: popularSkus[i],
            count: parseInt(popularSkus[i + 1] || '0', 10),
          });
        }
      }
    }

    // Parse recent activity
    const recentActivity: ScanEvent[] = [];
    if (Array.isArray(recentScans)) {
      for (const scan of recentScans) {
        try {
          const parsed = JSON.parse(scan);
          recentActivity.push(parsed);
        } catch {
          // Skip invalid entries
        }
      }
    }

    return {
      totalScans: total,
      successfulScans: successful,
      failedScans: failed,
      successRate: Math.round(successRate * 10) / 10,
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      averageResponseTime: Math.round(averageResponseTime),
      popularSkus: popularSkusArray,
      recentActivity,
      period: 'all-time',
    };
  } catch (error) {
    console.error('[Analytics] Failed to fetch stats:', error);

    // Return empty stats on error
    return {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      successRate: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      popularSkus: [],
      recentActivity: [],
      period: 'all-time',
    };
  }
}

/**
 * Reset all analytics data (useful for testing)
 */
export async function resetAnalytics(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(
      ANALYTICS_KEYS.scanCount,
      ANALYTICS_KEYS.scanSuccess,
      ANALYTICS_KEYS.scanFailure,
      ANALYTICS_KEYS.responseTimes,
      ANALYTICS_KEYS.cacheHits,
      ANALYTICS_KEYS.cacheMisses,
      ANALYTICS_KEYS.skuPopularity,
      ANALYTICS_KEYS.recentScans
    );
  } catch (error) {
    console.error('[Analytics] Failed to reset:', error);
  }
}
