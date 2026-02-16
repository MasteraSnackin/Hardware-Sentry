# TEST_PLAN.md — Quality Assurance & Testing Strategy

**Project:** Hardware Sentry
**QC Lead:** The Nerd
**Last Updated:** 2026-02-16
**Test Coverage Status:** 🚨 **0% (CRITICAL)**

---

## 🚨 Current State Assessment

### Critical Findings
- ❌ **ZERO test coverage** - No testing framework installed
- ❌ **No unit tests** - Critical business logic untested
- ❌ **No integration tests** - API endpoints untested
- ❌ **No E2E tests** - User workflows unverified
- ⚠️ **960 lines of untested code** added in last 3 commits

### Recent Changes Requiring Tests (High Priority)

#### Phase 3: Analytics Dashboard (Builder Mode - Commit 7be4dd7)
**Files Added:**
- `src/lib/analytics.ts` (260 lines) - **UNTESTED**
- `src/app/api/analytics/stats/route.ts` (45 lines) - **UNTESTED**

**Files Modified:**
- `src/app/api/scan/route.ts` - Analytics integration - **UNTESTED**
- `src/lib/middleware.ts` - getDuration() method - **UNTESTED**

**Risk Level:** 🔴 **HIGH**
**Reason:** Analytics directly impacts business metrics, Redis operations can fail silently

#### Phase 2: Visual Components (Design Lead - Commit d0c508c)
**Files Added:**
- `src/components/GradientText.tsx` (60 lines) - **UNTESTED**
- `src/components/Confetti.tsx` (75 lines) - **UNTESTED**
- `src/components/PriceBar.tsx` (55 lines) - **UNTESTED**

**Risk Level:** 🟡 **MEDIUM**
**Reason:** UI components, visual bugs impact UX but not data integrity

#### Existing Critical Code (Never Tested)
**Files Requiring Tests:**
- `src/lib/tinyfish.ts` - TinyFish API client - **UNTESTED** 🔴
- `src/lib/redis.ts` - Cache operations - **UNTESTED** 🔴
- `src/lib/circuitBreaker.ts` - Circuit breaker logic - **UNTESTED** 🔴
- `src/lib/retry.ts` - Retry with exponential backoff - **UNTESTED** 🔴
- `src/lib/middleware.ts` - Rate limiting - **UNTESTED** 🔴
- `src/app/api/scan/route.ts` - Main scan endpoint - **UNTESTED** 🔴
- `src/app/api/scan/batch/route.ts` - Batch scanning - **UNTESTED** 🔴
- `src/app/api/health/route.ts` - Health checks - **UNTESTED** 🔴

---

## 📋 Test Coverage Goals

### Phase 1: Critical Unit Tests (Target: 80% coverage)

#### P0 - Critical (Must Have Before Production)
- [ ] **lib/retry.ts** - Exponential backoff logic
  - Succeeds on first attempt
  - Retries on network errors (timeout, 5xx)
  - Does NOT retry on client errors (4xx)
  - Max attempts respected
  - Backoff delay increases exponentially
  - Edge case: max delay cap enforced

- [ ] **lib/circuitBreaker.ts** - State machine logic
  - Starts in CLOSED state
  - CLOSED → OPEN after failure threshold (3)
  - OPEN → HALF_OPEN after timeout (30s)
  - HALF_OPEN → CLOSED after success threshold (2)
  - HALF_OPEN → OPEN on failure
  - Metrics tracked correctly
  - Edge case: concurrent calls during state transition

- [ ] **lib/redis.ts** - Cache operations
  - getCachedScan returns null if not found
  - saveScanResult stores data correctly
  - isCacheFresh respects 1-hour TTL
  - acquireScanLock prevents concurrent scans
  - releaseScanLock cleans up properly
  - detectChanges identifies price/stock changes
  - Edge case: Redis connection failure (graceful degradation)
  - Edge case: Lock timeout auto-release (2 minutes)

- [ ] **lib/middleware.ts** - Rate limiting
  - Allows requests under limit (5 req/60s)
  - Blocks requests over limit
  - Sliding window resets correctly
  - Cleanup removes old entries
  - PerformanceMonitor tracks duration
  - Edge case: Same IP rapid-fire requests
  - Edge case: Window boundary conditions

#### P1 - High Priority (Before Feature Complete)
- [ ] **lib/analytics.ts** - Analytics tracking
  - recordScanEvent increments counters
  - recordScanEvent handles Redis failure gracefully
  - getAnalyticsStats returns correct aggregates
  - getAnalyticsStats handles missing keys (null values)
  - Response time array parsing (string → number)
  - SKU popularity sorting (descending by count)
  - Edge case: Empty Redis (returns zeros)
  - Edge case: Malformed data in Redis

- [ ] **lib/tinyfish.ts** - TinyFish client
  - Parses SSE stream correctly
  - Validates vendor result schema
  - Handles 90-second timeout
  - Integrates with retry logic
  - Integrates with circuit breaker
  - Edge case: Incomplete SSE stream
  - Edge case: Malformed JSON in stream
  - Edge case: Network abort mid-stream

- [ ] **lib/config.ts** - SKU configuration
  - getSKUConfig returns valid config
  - getSKUConfig returns null for unknown SKU
  - getAllSKUs returns all configurations
  - Vendor URLs are valid

#### P2 - Medium Priority (Nice to Have)
- [ ] **components/GradientText.tsx** - Gradient text component
  - Renders children correctly
  - Applies gradient class based on variant
  - Animation works when animate=true
  - No animation when animate=false

- [ ] **components/Confetti.tsx** - Confetti animation
  - Listens to triggerConfetti event
  - Generates 30 confetti pieces
  - Pieces animate and disappear after 3s
  - Cleanup removes pieces from DOM

- [ ] **components/PriceBar.tsx** - Price visualization
  - Calculates percentage correctly
  - Shows "Best" badge for minimum price
  - Handles zero range (single price)
  - Handles edge case: maxPrice === minPrice

---

### Phase 2: Integration Tests (All API Endpoints)

#### P0 - Critical API Routes
- [ ] **POST /api/scan** - Main scan endpoint
  - Returns 200 with valid SKU
  - Returns vendors array with expected structure
  - Returns 400 for missing SKU
  - Returns 404 for unknown SKU
  - Returns cached data on second request (within 1 hour)
  - Returns stale cache on scan failure
  - Returns 429 after rate limit (6th request in 60s)
  - Circuit breaker triggers after 3 failures
  - Analytics recorded for all outcomes
  - Edge case: Concurrent requests (lock prevents duplicates)
  - Edge case: Redis unavailable (degrades gracefully)
  - Edge case: TinyFish timeout (retries, then fails gracefully)

- [ ] **POST /api/scan/batch** - Batch scanning
  - Scans multiple SKUs in parallel
  - Returns aggregate results
  - Handles partial failures (Promise.allSettled)
  - Respects 5 SKU limit
  - Returns 400 for invalid request
  - Edge case: All SKUs fail
  - Edge case: Mixed success/failure

- [ ] **GET /api/analytics/stats** - Analytics dashboard
  - Returns aggregate metrics
  - Calculates success rate correctly
  - Calculates cache hit rate correctly
  - Returns popular SKUs sorted by count
  - Returns recent activity (last 50)
  - Handles empty Redis (returns zeros)
  - Cache-Control header set to 60s
  - Edge case: Redis unavailable

- [ ] **GET /api/health** - Health check
  - Returns 200 when all services healthy
  - Returns 503 when Redis unavailable
  - Circuit breaker metrics included
  - Redis ping validated
  - Edge case: Circuit breaker OPEN

#### P1 - High Priority API Routes
- [ ] **GET /api/history?sku={id}** - Historical data
  - Returns last 10 scans for valid SKU
  - Returns 400 for missing SKU parameter
  - Returns empty array for SKU with no history
  - Edge case: Redis unavailable

---

### Phase 3: End-to-End Tests (Critical User Paths)

#### P0 - Critical User Flows
- [ ] **Happy Path: Complete Scan Workflow**
  - User lands on homepage
  - User selects SKU from dropdown
  - User clicks "Start Scan"
  - Loading skeleton displays
  - Results table appears with vendors
  - Price bars show relative pricing
  - "Best" badge on lowest price
  - CSV export button works
  - Downloaded CSV contains correct data

- [ ] **Error Recovery: TinyFish Timeout**
  - User initiates scan
  - TinyFish times out (simulated)
  - Error message displays (user-friendly)
  - Stale cache shown (if available)
  - User can retry scan

- [ ] **Rate Limiting Flow**
  - User makes 5 scans rapidly
  - 6th scan shows rate limit error
  - Error message shows retry time
  - After 60s, scan works again

#### P1 - High Priority Flows
- [ ] **Dark Mode Toggle**
  - User toggles dark mode
  - Theme switches immediately
  - Preference persists on reload
  - No flash of wrong theme

- [ ] **Mobile Responsive**
  - Scan form works on mobile (375px)
  - Results table scrolls horizontally
  - CSV export works on mobile
  - Touch interactions smooth

#### P2 - Medium Priority Flows
- [ ] **Confetti Celebration**
  - Scan completes successfully
  - Confetti animation triggers
  - Confetti disappears after 3s
  - No memory leak from repeated scans

---

## 🎯 Priority Matrix

### P0 (Critical - Blocking Production)
**Timeline:** Implement ASAP
**Criteria:** Data loss, security, core functionality

**Tests:**
1. lib/retry.ts - Prevents infinite API calls
2. lib/circuitBreaker.ts - Prevents cascading failures
3. lib/redis.ts - Prevents cache corruption
4. POST /api/scan - Core user workflow
5. Rate limiting - Prevents API abuse

**Estimated Effort:** 8 hours

---

### P1 (High - Blocking Feature Complete)
**Timeline:** Within 1 week
**Criteria:** Business logic, analytics, error handling

**Tests:**
1. lib/analytics.ts - Business metrics accuracy
2. lib/tinyfish.ts - External API reliability
3. POST /api/scan/batch - Efficiency feature
4. GET /api/analytics/stats - Dashboard accuracy
5. E2E happy path - User experience validation

**Estimated Effort:** 6 hours

---

### P2 (Medium - Nice to Have)
**Timeline:** Within 2 weeks
**Criteria:** UI components, edge cases, polish

**Tests:**
1. React components (GradientText, Confetti, PriceBar)
2. GET /api/health - Monitoring reliability
3. GET /api/history - Historical data accuracy
4. E2E dark mode - Theme consistency
5. E2E mobile responsive - Multi-device support

**Estimated Effort:** 4 hours

---

### P3 (Low - Future Iteration)
**Timeline:** Backlog
**Criteria:** Visual polish, accessibility, performance

**Tests:**
1. Accessibility audit (screen readers, keyboard nav)
2. Performance benchmarks (Lighthouse scores)
3. Cross-browser testing (Safari, Firefox, Edge)
4. Visual regression testing (Percy, Chromatic)

**Estimated Effort:** 6 hours

---

## 🛠️ Test Implementation Plan

### Step 1: Install Testing Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react happy-dom
```

### Step 2: Create Test Configuration
**File:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**File:** `tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
```

### Step 3: Add Test Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### Step 4: Create Test Directory Structure
```
__tests__/
  lib/
    retry.test.ts
    circuitBreaker.test.ts
    redis.test.ts
    middleware.test.ts
    analytics.test.ts
    tinyfish.test.ts
    config.test.ts
  api/
    scan.test.ts
    batch.test.ts
    analytics-stats.test.ts
    health.test.ts
    history.test.ts
  components/
    GradientText.test.tsx
    Confetti.test.tsx
    PriceBar.test.tsx
    ResultsTable.test.tsx
    ScanForm.test.tsx
  e2e/ (future - Playwright)
    scan-flow.spec.ts
    rate-limit.spec.ts
    dark-mode.spec.ts
```

---

## 📊 Success Metrics

### Test Coverage Targets
- **Overall:** > 80% line coverage
- **lib/** (business logic): > 95% coverage
- **api/** (endpoints): > 90% coverage
- **components/** (UI): > 70% coverage

### Quality Gates (Must Pass Before Deployment)
- ✅ All tests passing (zero failures)
- ✅ TypeScript compilation clean
- ✅ ESLint warnings < 5
- ✅ No P0/P1 bugs open
- ✅ Test coverage > 80%
- ✅ E2E critical paths pass
- ✅ Performance: Test suite < 30s

---

## 🐛 Known Issues & Edge Cases

### Issue #1: Analytics Redis Parsing
**Component:** lib/analytics.ts line 174
**Severity:** P1 (High)
**Description:** Response times stored as strings in Redis, requires parsing to number
**Test Required:** Verify parseFloat handles null/undefined/NaN gracefully
**Status:** Fixed in commit 7be4dd7, needs test coverage

### Issue #2: Rate Limiter Cleanup
**Component:** lib/middleware.ts
**Severity:** P2 (Medium)
**Description:** setInterval cleanup on every constructor call may cause memory leak
**Test Required:** Verify cleanup function removes old entries correctly
**Status:** Open - needs investigation

### Issue #3: Circuit Breaker State Race
**Component:** lib/circuitBreaker.ts
**Severity:** P1 (High)
**Description:** Concurrent requests during HALF_OPEN → CLOSED transition may conflict
**Test Required:** Simulate concurrent calls, verify state consistency
**Status:** Open - needs test coverage

### Issue #4: Dark Mode Flash (FOUC)
**Component:** components/ThemeProvider.tsx
**Severity:** P3 (Low - cosmetic)
**Description:** White flash visible on page load in dark mode
**Test Required:** E2E test verifies no flash
**Status:** Open - Design Lead to fix

### Issue #5: Lock Auto-Release
**Component:** lib/redis.ts
**Severity:** P1 (High)
**Description:** Lock TTL is 2 minutes, but scan timeout is 90 seconds - tight margin
**Test Required:** Verify lock released even if scan throws exception
**Status:** Open - needs test coverage (try/finally exists, needs verification)

---

## 📝 Test Implementation Checklist

### Phase 1: Setup (0% → 10%)
- [ ] Install Vitest and testing libraries
- [ ] Create vitest.config.ts
- [ ] Create tests/setup.ts
- [ ] Add test scripts to package.json
- [ ] Create __tests__ directory structure
- [ ] Verify basic test runs

### Phase 2: P0 Critical Tests (10% → 60%)
- [ ] lib/retry.test.ts
- [ ] lib/circuitBreaker.test.ts
- [ ] lib/redis.test.ts
- [ ] lib/middleware.test.ts
- [ ] api/scan.test.ts

### Phase 3: P1 High Priority Tests (60% → 85%)
- [ ] lib/analytics.test.ts
- [ ] lib/tinyfish.test.ts
- [ ] api/batch.test.ts
- [ ] api/analytics-stats.test.ts
- [ ] E2E scan workflow

### Phase 4: P2 Medium Priority Tests (85% → 95%)
- [ ] components/GradientText.test.tsx
- [ ] components/Confetti.test.tsx
- [ ] components/PriceBar.test.tsx
- [ ] api/health.test.ts
- [ ] api/history.test.ts

### Phase 5: Documentation & Reporting (95% → 100%)
- [ ] Generate coverage report
- [ ] Document edge cases
- [ ] Create BUGS.md
- [ ] Update PLAN.md with test status
- [ ] Create CI/CD workflow (GitHub Actions)

---

## 🔍 Manual QA Checklist

### Functionality Testing
- [ ] All API endpoints return expected responses
- [ ] Error messages are user-friendly (no stack traces)
- [ ] Loading states display correctly
- [ ] Empty states show helpful messages
- [ ] Form validation works (invalid SKU rejected)
- [ ] Rate limiting works (6th request blocked)
- [ ] Cache returns fresh data (< 1 hour old)
- [ ] Stale cache returned on failure

### User Experience Testing
- [ ] Buttons have hover/active states
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Animations smooth (60fps)
- [ ] No layout shift during load
- [ ] Dark mode works correctly
- [ ] Theme persists on reload
- [ ] CSV export filename includes date

### Cross-Browser Testing
- [ ] Chrome (latest) - Windows
- [ ] Firefox (latest) - Windows
- [ ] Edge (latest) - Windows
- [ ] Safari (latest) - macOS
- [ ] Mobile Safari (iOS 16+)
- [ ] Chrome Mobile (Android 12+)

### Responsive Testing
- [ ] Mobile (375px) - iPhone SE
- [ ] Tablet (768px) - iPad
- [ ] Desktop (1024px) - Laptop
- [ ] Large Desktop (1920px) - Monitor

### Accessibility Testing
- [ ] Screen reader compatibility (NVDA, JAWS)
- [ ] Keyboard-only navigation works
- [ ] Focus indicators visible
- [ ] Color contrast ratio > 4.5:1
- [ ] Alt text on images (if any)
- [ ] ARIA labels on interactive elements

---

## 🚀 Next Steps (Immediate Actions)

### Today (Feb 16, 2026)
1. ✅ Create TEST_PLAN.md (this document)
2. ⏳ Install Vitest and testing dependencies
3. ⏳ Create vitest.config.ts and tests/setup.ts
4. ⏳ Write first P0 test: lib/retry.test.ts
5. ⏳ Document findings in PLAN.md

### This Week
1. Complete all P0 tests (5 test files)
2. Complete all P1 tests (5 test files)
3. Achieve 80% code coverage
4. Create BUGS.md with known issues
5. Update PLAN.md with test status

### Next Week
1. Complete P2 tests (component tests)
2. Set up Playwright for E2E tests
3. Write E2E happy path test
4. Create GitHub Actions CI/CD workflow
5. Generate coverage badges for README

---

**Status:** 🚨 CRITICAL - Zero test coverage
**Next Action:** Install Vitest and create first test
**Owner:** The Nerd (QC Lead)
**Target:** 80% coverage by Feb 23, 2026

---

**Remember:** No code ships without tests. Quality is not negotiable.
