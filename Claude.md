# CLAUDE.md

## Project Context

Hardware Sentry: Real-time multi-vendor availability and pricing tracker for developer boards (Raspberry Pi 5, Jetson Orin) using TinyFish Web Agents API. Built for Web Agents Hackathon Feb 2026.

## Problem Statement

**User Pain**: Engineers and makers waste 15-30 minutes per day manually checking 4-6 retailer sites during chip shortages. Stock changes hourly, prices fluctuate, and there's no unified comparison view.

**Current Alternatives**:
- rpilocator.com: Raspberry Pi only, no pricing, just stock alerts
- Manual checking: Time-consuming, error-prone, can't track price trends
- Google Shopping: Inaccurate stock data, no real-time verification

**Our Solution**: Single-click scan of 4+ major retailers using TinyFish Web Agents, extracting real-time pricing and availability with intelligent change detection. Results in <30 seconds with historical tracking.

**Market**: 200k+ r/raspberry_pi community members, 50k+ r/NVIDIA users, hardware labs, integrator companies, resellers.

## Success Criteria (Hackathon - 12 hours remaining)

Priority 1 (Must Have):
- [ ] Scan 4 vendors for Pi 5 8GB in <45 seconds
- [ ] Display clean comparison table with price + stock status
- [ ] Store results in Redis with basic caching
- [ ] Deploy working demo to Vercel
- [ ] README with judge pitch + architecture diagram

Priority 2 (Should Have):
- [ ] Real-time SSE streaming with progress indicators
- [ ] Historical scan tracking (last 10 scans per SKU)
- [ ] Price change highlighting (vs previous scan)
- [ ] Error recovery with partial results

Priority 3 (Nice to Have):
- [ ] Jetson Orin Nano support
- [ ] Export to CSV
- [ ] Mobile responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router with React Server Components)
- **Language**: TypeScript (strict mode)
- **API**: TinyFish Web Agents (https://agent.tinyfish.ai)
- **Cache/DB**: Redis via Upstash (free tier: 10k commands/day)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing**: Vitest (if time permits)

## Key Directories

```
hardware-sentry/
├── src/
│   ├── lib/
│   │   ├── tinyfish.ts       — TinyFish API client with SSE handling
│   │   ├── redis.ts           — Upstash Redis client wrapper
│   │   └── config.ts          — Vendor URLs and SKU configurations
│   ├── app/
│   │   ├── page.tsx           — Main dashboard
│   │   ├── layout.tsx         — Root layout with metadata
│   │   ├── globals.css        — Global styles
│   │   └── api/
│   │       ├── scan/route.ts  — POST /api/scan - trigger new scan
│   │       └── history/route.ts — GET /api/history?sku={id}
│   └── components/
│       ├── ScanForm.tsx       — SKU selector + scan button
│       └── ResultsTable.tsx   — Vendor comparison table
├── directives/
│   ├── scan_hardware.md       — SOP for hardware scanning workflow
│   └── deploy_vercel.md       — Deployment checklist
├── execution/
│   └── test_tinyfish.py       — Standalone script to test TinyFish API
├── .env.example
├── .env.local (gitignored)
├── Makefile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

## Commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Build for production (runs type check + build)
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run type-check` — TypeScript validation only
- `make dev` — Alternative: start dev via Makefile
- `make test-tinyfish` — Run Python test script for TinyFish API
- `make deploy` — Deploy to Vercel (requires vercel CLI)

---

## Architecture: 3-Layer System (from Agents.md)

### Layer 1: Directives (What to do)
- `directives/scan_hardware.md`: Defines goals, inputs, TinyFish goal string, expected outputs, edge cases
- `directives/deploy_vercel.md`: Deployment checklist and environment variable setup

### Layer 2: Orchestration (Decision making - YOU)
- API routes in `src/app/api/*` make intelligent decisions:
  - Read vendor configs from `src/lib/config.ts`
  - Call TinyFish via `src/lib/tinyfish.ts`
  - Handle errors, cache results via `src/lib/redis.ts`
  - Return formatted responses to frontend

### Layer 3: Execution (Deterministic work)
- `src/lib/tinyfish.ts`: Deterministic TinyFish HTTP client
- `src/lib/redis.ts`: Deterministic Redis operations
- `execution/test_tinyfish.py`: Standalone validation script

**Why this works**: Frontend is probabilistic (user interaction), but API logic and data fetching must be deterministic and reliable.

---

## How I Want You to Work

### Before Coding

1. **Check directives first**: Read `directives/scan_hardware.md` before implementing scan logic
2. **Ask clarifying questions** if requirements are ambiguous
3. **Draft a plan** for complex work (e.g., SSE streaming) and confirm before coding
4. **If unsure, ask** — don't assume vendor URL formats or TinyFish response schemas

### While Coding

- **Write complete, working code** — no placeholders, no `// TODO: implement this`
- **Keep it simple and readable** over clever abstractions
- **Follow existing patterns** in the codebase (check other files first)
- **One change at a time**, verify as you go
- **Use TypeScript strictly**: No `any` types, proper interface definitions
- **Error handling is mandatory**: Every API call must have try/catch and user-friendly errors

### After Coding

1. **Run type check**: `npm run type-check`
2. **Run linter**: `npm run lint`
3. **Test manually**: Open browser, trigger scan, verify results
4. **Summarize changes**: What you changed, why, and what still needs work

---

## Code Style

- **ES modules**: Always use `import/export`, never `require()`
- **Functional components**: Use React hooks (useState, useEffect, etc.)
- **Type hints on all functions**: No implicit `any` returns
- **Descriptive variable names**: `vendorResults` not `res`, `scanTimestamp` not `ts`
- **No commented-out code**: Delete it or put it in git history
- **Async/await over promises**: Easier to read and debug
- **Early returns**: Reduce nesting, fail fast

## Do Not

- ❌ Edit files in `node_modules/` or `.next/`
- ❌ Commit `.env.local` to git (use `.env.example` only)
- ❌ Leave placeholder code or TODOs in production code
- ❌ Make changes outside the scope of the task
- ❌ Assume TinyFish response format — always validate/parse
- ❌ Skip error handling "to save time"
- ❌ Hardcode API keys (always use env variables)

---

## Verification Loop

After completing a task, verify:

1. ✅ Code compiles: `npm run build` succeeds
2. ✅ Types validate: `npm run type-check` passes
3. ✅ No linting warnings: `npm run lint` clean
4. ✅ Manual test: Feature works in browser
5. ✅ Changes match the original request

If any fail, **fix before marking complete**. Don't skip verification due to time pressure.

---

## Quick Commands

When I type these shortcuts, do the following:

**"plan"** — Analyze the task, draft an approach, ask clarifying questions, DON'T write code yet

**"build"** — Implement the plan, write complete code, run verification loop

**"check"** — Review your changes like a skeptical senior dev. Check for:
  - Security issues (API key exposure, injection vulnerabilities)
  - Performance problems (unnecessary re-renders, N+1 queries)
  - Edge cases (empty results, API errors, network timeouts)
  - TypeScript strictness (no `any` escapes)

**"verify"** — Run all tests, type check, linting, and summarize results

**"done"** — Summarize what changed, what was tested, known issues, and next steps

**"anneal"** — Self-improvement cycle when something breaks:
  1. Read error message and stack trace
  2. Fix the code
  3. Test the fix
  4. Update relevant directive with learnings
  5. Verify system is now stronger

---

## Self-Annealing Loop (from Agents.md)

Errors are learning opportunities. When something breaks:

1. **Fix it**: Debug the immediate issue
2. **Update the tool**: Improve the script/function to handle this case
3. **Test the tool**: Verify the fix works and doesn't break other cases
4. **Update directive**: Document the edge case in `directives/*.md`
5. **System is now stronger**: Next time, this error won't happen

### Example Scenario:
```
Error: TinyFish rate limit (429 Too Many Requests)

Anneal process:
1. Fix: Add exponential backoff retry logic
2. Update: lib/tinyfish.ts now retries with backoff
3. Test: Trigger multiple rapid scans, verify retry works
4. Update directive: directives/scan_hardware.md now documents rate limits
5. Stronger: System handles rate limits gracefully
```

---

## Success Criteria

A task is complete when:

- ✅ **Code works as requested** (manual verification)
- ✅ **Types are valid** (`npm run type-check` passes)
- ✅ **No linting errors** (`npm run lint` clean)
- ✅ **Changes are minimal and focused** (no scope creep)
- ✅ **Code is self-documenting** (I can understand without explanation)
- ✅ **Error handling exists** (no unhandled promise rejections)
- ✅ **Directive updated** (if applicable)

---

## Project-Specific Constraints

### TinyFish Integration

**Endpoint**: `https://agent.tinyfish.ai/v1/automation/run-sse`

**Timeout Policy**:
- Single vendor scan: 30 second timeout
- Full 4-vendor scan: 90 second total timeout
- Show partial results if some vendors complete

**Error Recovery**:
- If 1 vendor fails: Show other 3 + error message
- If 2+ vendors fail: Show partial + prominent retry button
- If all fail: Show cached results (if available) + error banner

### Redis Configuration

**Schema**:
```
scan:{sku}:latest → JSON string of latest scan result
scan:{sku}:history → Sorted set (score=timestamp, value=JSON string)
scan:{sku}:lock → Simple lock to prevent concurrent scans
```

**TTL Policy**:
- `scan:{sku}:latest`: 1 hour (3600s)
- `scan:{sku}:history`: Keep last 10 scans, auto-trim
- `scan:{sku}:lock`: 2 minutes (120s)

**Change Detection**:
- Price change: >£1 or >2% (whichever is larger)
- Stock change: Any boolean flip (true↔false)
- Highlight changes in UI with color coding

---

## Timeline (12 hours remaining)

**Hour 0-2: Setup & Foundation**
- Project scaffolding
- TinyFish test script
- Basic API routes

**Hour 2-5: Core Features**
- TinyFish integration with SSE
- Redis caching layer
- Vendor configuration

**Hour 5-8: Frontend**
- Dashboard UI
- Results table
- Progress/loading states

**Hour 8-10: Polish & Testing**
- Error handling refinement
- Manual testing
- Bug fixes

**Hour 10-11: Deployment & Docs**
- Deploy to Vercel
- README for judges
- Demo video (optional)

**Hour 11-12: Buffer**
- Final testing
- Submission
- Social media

---

**Last Updated**: 2026-02-15 18:53 GMT
**Hackathon Deadline**: 2026-02-15 21:00 GMT
**Submission**: https://forms.gle/VdDDP1fADVLiWE5MA
