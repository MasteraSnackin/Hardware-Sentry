# Development Guide - Hardware Sentry

## Quick Start

### 1. Testing with Mock Data (No API Keys Needed)
```bash
# .env.local should have:
ENABLE_MOCK_DATA=true

# Start dev server
npm run dev

# Open http://localhost:3000
# Click "Start Scan" - uses realistic mock data
```

### 2. Testing with Real API Keys
```bash
# Get API keys:
# - TinyFish: https://tinyfish.ai
# - Upstash: https://upstash.com

# Update .env.local:
TINYFISH_API_KEY=your_actual_key
UPSTASH_REDIS_REST_URL=your_actual_url
UPSTASH_REDIS_REST_TOKEN=your_actual_token
ENABLE_MOCK_DATA=false

# Start dev server
npm run dev
```

### 3. Health Check
Visit: `http://localhost:3000/api/health`

Response when configured:
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T...",
  "service": "Hardware Sentry API",
  "version": "0.1.0",
  "checks": {
    "tinyfish": { "configured": true, "status": "ready" },
    "redis": { "configured": true, "status": "ready" }
  }
}
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # TypeScript validation
npm run lint         # ESLint check

make dev             # Alternative: start dev
make test-tinyfish   # Test TinyFish API (Python)
make deploy          # Deploy to Vercel
make clean           # Remove build artifacts
```

## Project Structure

```
src/
├── lib/                    # Layer 3: Execution (Deterministic)
│   ├── config.ts          # Vendor & SKU configuration
│   ├── tinyfish.ts        # TinyFish API client
│   ├── redis.ts           # Redis operations + change detection
│   └── mockData.ts        # Mock data for testing
│
├── app/                    # Layer 2: Orchestration (Decision making)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   ├── globals.css        # Styles
│   └── api/
│       ├── scan/route.ts  # Scan orchestration
│       ├── history/route.ts # History retrieval
│       └── health/route.ts  # Health check
│
└── components/             # Frontend
    ├── ScanForm.tsx       # SKU selector + scan button
    └── ResultsTable.tsx   # Results display + CSV export
```

## Key Features

### 1. Change Detection
Location: `src/lib/redis.ts`

Automatically detects:
- **Price changes**: >£1 or >2% (whichever larger)
- **Stock changes**: Boolean flips (in/out of stock)

Visual indicators:
- `↑ GBP 5.00 (+6.7%)` for price increases (red)
- `↓ GBP 3.00 (-4.2%)` for price decreases (green)
- `★ Back in stock!` for stock restoration (green)
- `★ Out of stock` for stock depletion (red)

### 2. Distributed Locking
Prevents concurrent scans for the same SKU:
- Lock TTL: 2 minutes
- Returns cached data if lock held
- Auto-releases on scan completion

### 3. Caching Strategy
- **Fresh threshold**: 5 minutes
- **Cache TTL**: 1 hour
- **History**: Last 10 scans per SKU
- **Fallback**: Stale data on errors

### 4. Mock Mode
For testing without API keys:
- Realistic mock data for Pi 5 8GB and Jetson Orin
- Simulated 2-second API delay
- Perfect for demos and development

### 5. Progress Indicators
- Animated progress bar (0-100%)
- Percentage display
- Simulated progress for better UX

### 6. CSV Export
- One-click download
- Timestamped filenames
- Proper CSV escaping

## Testing Workflow

### Manual Testing Checklist
- [ ] Visit `/api/health` - should show "ok" status
- [ ] Select Pi 5 8GB, click "Start Scan"
- [ ] Verify progress bar appears
- [ ] Wait for results (2s mock / 30-45s real)
- [ ] Check price display
- [ ] Verify stock badges (green/red)
- [ ] Click "Export CSV" - download should start
- [ ] Run second scan - check for change indicators
- [ ] Test Jetson Orin Nano SKU
- [ ] Test error handling (invalid API key)

### Automated Testing
```bash
# Type safety
npm run type-check  # Should pass with 0 errors

# Code quality
npm run lint        # Should pass with 0 warnings

# Build
npm run build       # Should succeed
```

## Debugging

### Enable Detailed Logs
Check browser console and terminal for:
- `[API]` - API route logs
- `[Redis]` - Redis operation logs
- `[TinyFish]` - TinyFish API logs

### Common Issues

**Mock data not appearing**:
- Check `ENABLE_MOCK_DATA=true` in `.env.local`
- Look for "Using mock data" in terminal logs
- Restart dev server

**Redis errors**:
- Verify Upstash credentials in `.env.local`
- Check `/api/health` response
- Redis may be optional if using mock mode

**TinyFish timeout**:
- Expected for real scans (30-45s)
- Check network connection
- Verify API key is valid

**Build warnings about dynamic routes**:
- Expected for `/api/history` (uses query params)
- Not an error, just informational

## Deployment

### Vercel (Recommended)
```bash
# One-time setup
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard:
# Settings > Environment Variables
# - TINYFISH_API_KEY
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
# - ENABLE_MOCK_DATA=false (for production)
```

### Environment Variables
Production should have:
- `TINYFISH_API_KEY` - Real API key
- `UPSTASH_REDIS_REST_URL` - Real Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Real Redis token
- `ENABLE_MOCK_DATA=false` - Disable mock mode

## Performance

### Benchmarks
- Cold start: <2 seconds
- Mock scan: ~2 seconds
- Real scan: 30-45 seconds (4 vendors)
- Cache hit: <100ms
- Build time: ~30 seconds
- Bundle size: 90.3 kB first load

### Optimization Tips
- Enable Redis caching in production
- Use Vercel Edge for faster cold starts
- Consider background scan refresh
- Implement request deduplication

## Architecture Notes

### Why 3 Layers?
From `AGENTS.md`:
- **Layer 1 (Directives)**: SOPs define "what to do"
- **Layer 2 (Orchestration)**: API routes decide "how to do it"
- **Layer 3 (Execution)**: Libraries do deterministic work

**Benefits**:
- LLM errors don't compound
- Business logic is testable
- Easy to swap implementations

### Why Redis Sorted Sets?
- Automatic timestamp ordering
- O(log N) insertions
- Easy trimming with ZPOPMIN
- Native score-based queries

### Why CustomEvents?
- Decouples ScanForm from ResultsTable
- Clean React pattern
- Easy to extend with more listeners

## Next Steps

### For Hackathon Submission
1. Get real API keys
2. Test full workflow
3. Deploy to Vercel
4. Record demo video
5. Submit before deadline

### For Production
1. Add user authentication
2. Implement rate limiting
3. Add email/Slack alerts
4. Create admin dashboard
5. Add analytics

## Resources

- [TinyFish Docs](https://tinyfish.ai/docs)
- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Vercel Deployment](https://vercel.com/docs)
- [AGENTS.md](./AGENTS.md) - Architecture philosophy
- [STATUS.md](./STATUS.md) - Current project status

---

**Last Updated**: 2026-02-15
**Ready for**: Hackathon submission + Production deployment
