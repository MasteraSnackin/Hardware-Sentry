# BUGS.md — Issue Tracker

**Project:** Hardware Sentry
**QC Lead:** The Nerd
**Last Updated:** 2026-02-16

---

## 🚨 Open Issues (4)

### BUG-001: Analytics Redis Response Time Parsing
**Severity:** P1 (High) 🔴
**Status:** Fixed - Needs Test Coverage
**Reported:** 2026-02-16
**Component:** `lib/analytics.ts:174`
**Assigned:** The Nerd (test coverage)

**Description:**
Response times are stored in Redis as strings (lpush serializes numbers to strings), but type annotation expects `number[]`. Fixed by adding explicit parsing with `parseFloat()`, but needs test coverage to verify edge cases.

**Reproduction Steps:**
1. Record scan event with response time
2. Fetch analytics stats
3. Observe response time array contains strings, not numbers
4. Calculate average crashes if not parsed

**Expected Behavior:**
- Response times parsed from strings to numbers correctly
- Handles null/undefined/NaN gracefully
- Average calculation returns valid number

**Actual Behavior (Before Fix):**
- TypeScript error: `Operator '+' cannot be applied to types 'number' and 'number[]'`
- Runtime error when calculating average

**Fix Applied (Commit 7be4dd7):**
```typescript
const times: number[] = Array.isArray(responseTimes)
  ? responseTimes.map(t => typeof t === 'string' ? parseFloat(t) : t)
                 .filter((t): t is number => !isNaN(t))
  : [];
```

**Test Required:**
```typescript
describe('getAnalyticsStats', () => {
  it('should parse response times from Redis strings', async () => {
    // Mock Redis returning string array
    redis.lrange.mockResolvedValue(['123', '456', '789']);

    const stats = await getAnalyticsStats();

    expect(stats.averageResponseTime).toBe(456); // (123+456+789)/3
  });

  it('should handle non-numeric values in response times', async () => {
    redis.lrange.mockResolvedValue(['123', 'invalid', '789', null]);

    const stats = await getAnalyticsStats();

    expect(stats.averageResponseTime).toBe(456); // (123+789)/2, skips invalid
  });
});
```

**Priority:** High - Affects business metrics accuracy
**Blocking:** Production deployment

---

### BUG-002: Rate Limiter Memory Leak Risk
**Severity:** P2 (Medium) 🟡
**Status:** Open - Needs Investigation
**Reported:** 2026-02-16
**Component:** `lib/middleware.ts:22`
**Assigned:** Builder (fix), Nerd (verify)

**Description:**
`setInterval` is called in RateLimiter constructor to clean up old entries every 60 seconds. If RateLimiter is instantiated multiple times (e.g., during hot reload in development), multiple intervals accumulate without cleanup, causing memory leak.

**Reproduction Steps:**
1. Start dev server (`npm run dev`)
2. Make code change to trigger hot reload
3. Observe new RateLimiter instance created
4. Old interval continues running
5. Repeat 10 times
6. Check memory usage (increases)

**Expected Behavior:**
- Single cleanup interval runs
- Old intervals cleared on hot reload
- Memory usage stable

**Actual Behavior:**
- New interval created on each hot reload
- Old intervals never cleared
- Memory usage grows unbounded

**Code Smell:**
```typescript
class RateLimiter {
  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // 🚨 PROBLEM: No cleanup of previous interval
    setInterval(() => this.cleanup(), 60000);
  }
}
```

**Suggested Fix:**
```typescript
class RateLimiter {
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clear existing interval before creating new one
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
```

**Alternative Fix (Singleton Pattern):**
```typescript
// Create global instance, only instantiate once
export const scanRateLimiter = new RateLimiter(60000, 5);
```
*Note: Singleton already used (line 87), but constructor still has issue if called directly*

**Test Required:**
```typescript
describe('RateLimiter', () => {
  it('should not create multiple cleanup intervals', async () => {
    const limiter1 = new RateLimiter();
    const limiter2 = new RateLimiter();

    // Only 1 interval should exist
    // (Test implementation TBD - requires interval tracking)
  });

  it('should clean up old entries', async () => {
    const limiter = new RateLimiter(60000, 5);

    limiter.isAllowed('192.168.1.1'); // Record request

    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);

    // Entry should be cleaned up
    const requests = limiter['requests'].get('192.168.1.1');
    expect(requests).toEqual([]);
  });
});
```

**Priority:** Medium - Only affects development (hot reload), not production
**Blocking:** No - Production uses singleton instance

---

### BUG-003: Circuit Breaker State Race Condition
**Severity:** P1 (High) 🔴
**Status:** Open - Needs Test Coverage
**Reported:** 2026-02-16
**Component:** `lib/circuitBreaker.ts`
**Assigned:** The Nerd (test coverage), Builder (fix if needed)

**Description:**
Circuit breaker state transitions (HALF_OPEN → CLOSED or HALF_OPEN → OPEN) may have race conditions when multiple concurrent requests complete simultaneously. The state is not protected by mutex/lock, potentially causing inconsistent state.

**Reproduction Steps:**
1. Circuit breaker in HALF_OPEN state (after 30s timeout)
2. Send 5 concurrent requests to TinyFish API
3. All 5 succeed simultaneously
4. Multiple requests call `recordSuccess()` at same time
5. State may transition incorrectly or metrics may be inaccurate

**Expected Behavior:**
- State transitions are atomic
- Success threshold (2) respected exactly
- Metrics (successCount, failureCount) accurate

**Actual Behavior (Hypothetical - Needs Verification):**
- Race condition may cause state to flip multiple times
- Success counter may be incremented incorrectly
- Metrics may not match actual call count

**Vulnerable Code:**
```typescript
recordSuccess(): void {
  if (this.state === 'HALF_OPEN') {
    this.successCount++;

    // 🚨 RACE: Multiple concurrent calls may increment successCount
    //         before state changes, causing >2 successes before transition
    if (this.successCount >= this.successThreshold) {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
    }
  }
}
```

**Suggested Fix:**
```typescript
private stateLock = false;

recordSuccess(): void {
  if (this.state === 'HALF_OPEN') {
    this.successCount++;

    if (this.successCount >= this.successThreshold && !this.stateLock) {
      this.stateLock = true; // Acquire lock
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
      this.stateLock = false; // Release lock
    }
  }
}
```

*Note: JavaScript is single-threaded, so true race conditions are rare, but async operations can interleave*

**Test Required:**
```typescript
describe('CircuitBreaker', () => {
  it('should handle concurrent success calls in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker();

    // Force HALF_OPEN state
    breaker['state'] = 'HALF_OPEN';

    // Simulate 5 concurrent successes
    await Promise.all([
      breaker.execute(async () => 'success'),
      breaker.execute(async () => 'success'),
      breaker.execute(async () => 'success'),
      breaker.execute(async () => 'success'),
      breaker.execute(async () => 'success'),
    ]);

    // Should transition to CLOSED after threshold (2)
    expect(breaker.getMetrics().state).toBe('CLOSED');

    // Success count should be reset
    expect(breaker['successCount']).toBe(0);
  });
});
```

**Priority:** High - Affects reliability during API recovery
**Blocking:** Production deployment - Needs verification

---

### BUG-004: Scan Lock TTL vs Timeout Tight Margin
**Severity:** P1 (High) 🔴
**Status:** Open - Needs Verification
**Reported:** 2026-02-16
**Component:** `lib/redis.ts`
**Assigned:** The Nerd (verify try/finally works)

**Description:**
Scan lock TTL is 2 minutes (120s), but scan timeout is 90 seconds. This leaves only 30 seconds margin for processing. If scan takes exactly 90s + processing time, lock may auto-expire before `releaseScanLock` is called, causing duplicate scans.

**Reproduction Steps:**
1. Initiate scan for slow vendor
2. TinyFish takes exactly 90 seconds
3. Processing time (detectChanges, saveScanResult) takes 5 seconds
4. Total time: 95 seconds
5. Lock still valid (< 120s), released correctly
6. **Edge case:** If processing takes 25+ seconds, lock expires before release

**Expected Behavior:**
- Lock held for entire scan duration
- Lock released in `finally` block even on error
- No duplicate scans possible

**Actual Behavior:**
- Lock auto-expires after 120s if not released
- If scan + processing > 120s, duplicate scan can start
- `try/finally` ensures lock release on error, but not on timeout

**Mitigating Factors:**
- ✅ `try/finally` block exists (line 165-168 in scan/route.ts)
- ✅ Lock released even if scan throws error
- ✅ 30-second margin is reasonable for most cases
- ⚠️ Edge case: Very slow scans (>120s) not handled

**Code Analysis:**
```typescript
// POST /api/scan/route.ts

try {
  // Scan operation (max 90s timeout)
  const scanResult = await scanHardware(sku, skuConfig.vendors);

  // Processing (usually <5s)
  const scanWithChanges = detectChanges(scanResult, cachedResult);
  await saveScanResult(scanResult);

  // ... response
} catch (scanError) {
  // Error handling
} finally {
  // 🟢 GOOD: Always released, even on error
  await releaseScanLock(sku);
}
```

**Suggested Improvement:**
Increase lock TTL to 3 minutes (180s) for safer margin:
```typescript
// lib/redis.ts
export async function acquireScanLock(sku: string): Promise<boolean> {
  const lockKey = `scan:${sku}:lock`;
  const result = await redis.set(lockKey, '1', {
    ex: 180, // 3 minutes (was 120)
    nx: true,
  });
  return result === 'OK';
}
```

**Test Required:**
```typescript
describe('Scan Lock', () => {
  it('should release lock even if scan throws error', async () => {
    const sku = 'pi5-8gb';

    // Acquire lock
    const acquired = await acquireScanLock(sku);
    expect(acquired).toBe(true);

    // Simulate scan error
    try {
      throw new Error('Scan failed');
    } finally {
      await releaseScanLock(sku);
    }

    // Lock should be released
    const reacquired = await acquireScanLock(sku);
    expect(reacquired).toBe(true);
  });

  it('should auto-expire lock after TTL', async () => {
    const sku = 'pi5-8gb';

    await acquireScanLock(sku);

    // Advance time by 181 seconds (beyond TTL)
    vi.advanceTimersByTime(181000);

    // Lock should be auto-expired, allow reacquire
    const reacquired = await acquireScanLock(sku);
    expect(reacquired).toBe(true);
  });
});
```

**Priority:** High - Prevents duplicate scans, affects data consistency
**Blocking:** Production deployment - Needs verification

---

## 🟢 Closed Issues (0)

*No closed issues yet*

---

## 📊 Bug Statistics

| Severity | Open | Closed | Total |
|----------|------|--------|-------|
| P0 (Critical) | 0 | 0 | 0 |
| P1 (High) | 3 | 0 | 3 |
| P2 (Medium) | 1 | 0 | 1 |
| P3 (Low) | 0 | 0 | 0 |
| **TOTAL** | **4** | **0** | **4** |

---

## 🎯 Priority Definitions

**P0 (Critical):** Data loss, security vulnerability, complete system failure
- **Timeline:** Fix immediately (within 24 hours)
- **Examples:** Exposed API keys, cache corruption causing data loss

**P1 (High):** Core functionality broken, incorrect business logic, reliability issues
- **Timeline:** Fix before production deployment
- **Examples:** Analytics inaccurate, circuit breaker race condition

**P2 (Medium):** Degraded performance, edge case failures, memory leaks
- **Timeline:** Fix within 1 week
- **Examples:** Memory leak in dev mode, rare edge cases

**P3 (Low):** Cosmetic issues, minor UX problems, nice-to-have fixes
- **Timeline:** Backlog, fix when convenient
- **Examples:** Dark mode flash, animation stuttering

---

## 📝 Bug Reporting Template

```markdown
### BUG-XXX: [Short Description]
**Severity:** P1 (High) 🔴
**Status:** Open
**Reported:** YYYY-MM-DD
**Component:** `path/to/file.ts:lineNumber`
**Assigned:** [Name]

**Description:**
[Clear description of the issue]

**Reproduction Steps:**
1. Step one
2. Step two
3. Observe incorrect behavior

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Suggested Fix:**
```code
// Code snippet showing fix
```

**Test Required:**
```typescript
// Test case to verify fix
```

**Priority:** [High/Medium/Low] - [Impact description]
**Blocking:** [Yes/No] - [Deployment/Feature]
```

---

## 🔍 Edge Cases Documented

### Redis Connection Failure
**Component:** lib/redis.ts, lib/analytics.ts
**Behavior:** Graceful degradation - returns null/empty data, doesn't throw
**Test Coverage:** ⏳ Pending

### TinyFish API Timeout
**Component:** lib/tinyfish.ts
**Behavior:** Retries 3 times, then throws error with user-friendly message
**Test Coverage:** ⏳ Pending

### Rate Limit Boundary
**Component:** lib/middleware.ts
**Behavior:** 60-second sliding window, 5 requests allowed
**Edge Case:** Request at exactly 59.9s vs 60.1s - different window
**Test Coverage:** ⏳ Pending

### Circuit Breaker State Transitions
**Component:** lib/circuitBreaker.ts
**Behavior:** CLOSED → OPEN (3 failures) → HALF_OPEN (30s) → CLOSED (2 successes)
**Edge Case:** Concurrent requests during transition
**Test Coverage:** ⏳ Pending (see BUG-003)

---

**Last Updated:** 2026-02-16
**Next Review:** 2026-02-17 (after first tests written)
**Owner:** The Nerd (QC Lead)

---

**Remember:** Every bug is a test that should have been written.
