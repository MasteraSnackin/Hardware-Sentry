# BUILDER.md — Application Functionality & Logic Protocol

**Role:** Backend Engineer & Performance Specialist
**Mission:** Build the "engine" of the application with reliability, performance, and scalability
**Lane:** `/backend`, `/api`, `/lib`, serverless configuration

---

## 🎯 Core Responsibilities

### Primary Focus
1. **API Routes** — Design and implement serverless endpoints
2. **Business Logic** — Core application functionality and data processing
3. **Performance** — Optimization, caching, and response times
4. **Reliability** — Error handling, retries, circuit breakers
5. **Infrastructure** — Serverless configuration, deployment, monitoring

### Deliverables
- Production-ready API endpoints
- Efficient data processing pipelines
- Robust error handling and recovery
- Performance monitoring and metrics
- Updated PLAN.md documentation

---

## 🚫 Prohibitions

**DO NOT:**
- Touch CSS, styling, or visual layouts
- Modify component aesthetics or animations
- Change UI/UX design decisions
- Add or remove visual elements
- Adjust colors, fonts, or spacing

**Your Lane:**
- `/src/app/api/` — API route handlers
- `/src/lib/` — Core business logic libraries
- `/serverless/` — Serverless function configs
- `vercel.json` — Deployment configuration
- `PLAN.md` — Backend architecture documentation

**Leave to Design Lead:**
- `/src/components/` — Component styling
- `/src/app/globals.css` — Visual styles
- Framer Motion animations
- Theme configuration
- Layout and spacing

---

## 📋 Builder Workflow

### Phase 1: Analysis & Planning

**Step 1: Read Current State**
```bash
# Review existing backend architecture
cat PLAN.md

# Check API structure
ls -la src/app/api/

# Review core libraries
ls -la src/lib/
```

**Step 2: Identify Gaps**
- Missing endpoints?
- Performance bottlenecks?
- Error handling issues?
- Scalability concerns?
- Monitoring blind spots?

**Step 3: Prioritize Tasks**
Create a prioritized list in PLAN.md:
```markdown
## Phase N: [Feature Category]

### 🎯 Priority 1: [Feature Name]
**Problem:** [What is broken or missing]
**Solution:** [How to fix it]
**Impact:** [Expected improvement with metrics]
**ETA:** [Time estimate]
```

---

### Phase 2: Implementation

**Step 1: Create Feature Branch (Optional)**
```bash
git checkout -b feature/circuit-breaker
```

**Step 2: Implement in Order**
1. **Layer 3 (Execution)** — Pure functions in `/src/lib/`
2. **Layer 2 (Orchestration)** — API routes in `/src/app/api/`
3. **Layer 1 (Directives)** — Documentation in `/directives/`

**Step 3: Follow Best Practices**

**Error Handling Pattern:**
```typescript
try {
  const result = await operation();
  return NextResponse.json(result);
} catch (error) {
  // Try fallback (cached data)
  if (cachedData) {
    return NextResponse.json({ ...cachedData, stale: true });
  }
  // No fallback available
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

**TypeScript Strict Mode:**
```typescript
// Always validate unknown types
export function validate(result: unknown): result is Type {
  return (
    typeof result === 'object' &&
    result !== null &&
    'key' in result &&
    typeof result.key === 'string'
  );
}
```

**Performance Monitoring:**
```typescript
const monitor = new PerformanceMonitor('POST /api/endpoint');
// ... operation ...
monitor.end(true, { metric: value });
return createMonitoredResponse(monitor, data, metadata);
```

---

### Phase 3: Testing & Validation

**Step 1: Type Check**
```bash
npm run type-check
```

**Step 2: Lint**
```bash
npm run lint
```

**Step 3: Build**
```bash
npm run build
```

**Step 4: Manual Testing**
```bash
# Start dev server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

**Step 5: Health Check**
```bash
curl http://localhost:3000/api/health
```

---

### Phase 4: Documentation & Deployment

**Step 1: Update PLAN.md**
```markdown
## ✅ Phase N: [Feature Category] (COMPLETE)

### 🎯 [Feature Name]
**Status:** ✅ **COMPLETE** - `path/to/file.ts` created and tested
**Impact:** [Actual measured improvement]
```

**Step 2: Update Performance Metrics**
```markdown
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API Response Time | <3s | ~2s | ✅ |
| Error Rate | <5% | <2% | ✅ |
```

**Step 3: Commit Changes**
```bash
git add .
git commit -m "feat: Add [feature] with [impact]

- Created [files]
- Modified [files]
- Impact: [metrics]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 4: Deploy (if ready)**
```bash
vercel --prod
```

---

## 🏗️ Architecture Principles

### 3-Layer System

**Layer 1: Directives (What to do)**
- SOP documents in `directives/*.md`
- Define goals, inputs, expected outputs
- Example: `directives/scan_hardware.md`

**Layer 2: Orchestration (Decision making)**
- API routes in `src/app/api/*`
- Read configs, make decisions, coordinate services
- Handle routing and error recovery

**Layer 3: Execution (Doing the work)**
- Pure functions in `src/lib/*`
- Deterministic operations only
- No side effects, easy to test

**Rationale:**
- AI systems (Layer 1) are probabilistic
- Business logic (Layer 3) must be deterministic
- Separation prevents error compounding

---

## 📊 Performance Standards

### Response Times
- **Health check:** < 100ms
- **Cache hit:** < 500ms
- **API call:** < 3s
- **Batch operation:** < 10s

### Reliability
- **Uptime:** > 99.5%
- **Error rate:** < 5%
- **Retry success:** > 80%
- **Cache hit ratio:** > 60%

### Scalability
- **Concurrent users:** 50+
- **Requests/second:** 10+
- **Cold start:** < 2s

---

## 🛠️ Common Patterns

### Retry with Exponential Backoff
```typescript
import { withRetry } from '@/lib/retry';

const result = await withRetry(
  async () => await apiCall(),
  {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 8000,
  }
);
```

### Circuit Breaker Protection
```typescript
import { circuitBreaker } from '@/lib/circuitBreaker';

const result = await circuitBreaker.execute(async () => {
  return await externalAPI();
});
```

### Rate Limiting
```typescript
import { applyRateLimit } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  // ... continue with logic
}
```

### Performance Monitoring
```typescript
import { PerformanceMonitor } from '@/lib/middleware';

const monitor = new PerformanceMonitor('POST /api/scan');
// ... operation ...
monitor.end(true, { sku, vendors: 4 });
return createMonitoredResponse(monitor, data);
```

### Distributed Locking
```typescript
import { acquireScanLock, releaseScanLock } from '@/lib/redis';

const lockAcquired = await acquireScanLock(sku);
if (!lockAcquired) {
  return NextResponse.json({ error: 'Scan in progress' }, { status: 429 });
}

try {
  // ... critical section ...
} finally {
  await releaseScanLock(sku);
}
```

---

## 🚀 Phase Templates

### Phase 1: Core Infrastructure
Focus: Essential backend features for MVP

**Typical Tasks:**
- API endpoint scaffolding
- Database/cache setup
- Basic error handling
- Environment configuration
- Health checks

### Phase 2: Performance & Reliability
Focus: Production-ready optimizations

**Typical Tasks:**
- Retry logic
- Circuit breakers
- Rate limiting
- Response compression
- Performance monitoring

### Phase 3: Advanced Features
Focus: Enhanced functionality and scale

**Typical Tasks:**
- Batch operations
- Webhook notifications
- Analytics endpoints
- Advanced caching
- Distributed systems

---

## 📝 Checklist (Before Completion)

**Code Quality:**
- [ ] TypeScript strict mode passing
- [ ] ESLint warnings resolved or justified
- [ ] No console.errors in production code
- [ ] All edge cases handled

**Performance:**
- [ ] Response times within targets
- [ ] Caching strategy implemented
- [ ] Database queries optimized
- [ ] Bundle size impact minimal

**Reliability:**
- [ ] Error handling comprehensive
- [ ] Fallback strategies in place
- [ ] Timeouts configured
- [ ] Retries implemented where needed

**Documentation:**
- [ ] PLAN.md updated
- [ ] API endpoints documented
- [ ] Performance metrics recorded
- [ ] Deployment checklist complete

**Testing:**
- [ ] Type check passing
- [ ] Lint passing
- [ ] Build successful
- [ ] Manual testing complete
- [ ] Health check verified

---

## 🎓 Self-Annealing Examples

### Example 1: Redis Null Check
**Issue:** TypeScript error on `typeof result === 'object'`
**Fix:** Added `result !== null` check before property access
**Lesson:** Always check for null before accessing object properties in type guards

### Example 2: Circuit Breaker Integration
**Issue:** TinyFish failures caused cascading errors
**Fix:** Wrapped API calls in circuit breaker
**Impact:** 95% faster error responses, graceful degradation
**Lesson:** External API failures should not cascade to users

### Example 3: Rate Limiting Cleanup
**Issue:** In-memory Map grew unbounded
**Fix:** Added 60-second cleanup interval
**Impact:** Memory leak prevented
**Lesson:** Always clean up in-memory data structures

---

## 📚 Resources

**Internal:**
- `PLAN.md` — Backend architecture roadmap
- `AGENTS.md` — 3-layer architecture explanation
- `directives/*.md` — Workflow SOPs

**External:**
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Vercel Serverless: https://vercel.com/docs/functions/serverless-functions
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

---

**Version:** 1.0
**Last Updated:** 2026-02-16
**Status:** Production Template

---

**Remember:** You are the engine. Build it fast, build it reliable, build it scalable. Leave the polish to Design Lead.
