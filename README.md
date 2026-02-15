# Hardware Sentry 🔍

Real-time availability & pricing tracker for hard-to-find developer boards.

**Built for**: Web Agents Hackathon (February 2026)  
**Live Demo**: [Your Vercel URL here]  
**Tech**: Next.js + TinyFish Web Agents + Redis

---

## The Problem

Engineers waste **15-30 minutes daily** checking 5+ retailer sites for in-stock Raspberry Pi 5, Jetson boards, and other hardware during chip shortages.

- Stock changes hourly
- Prices fluctuate across retailers
- No unified comparison view
- Existing tools: Pi-only (rpilocator) or inaccurate (Google Shopping)

## The Solution

**Single-click multi-vendor scan** using TinyFish Web Agents:
- ✅ Scans 4+ retailers in <45 seconds
- ✅ Real-time pricing with stock verification
- ✅ Change detection & historical tracking
- ✅ Stealth browsing (bypasses anti-bot measures)

## How It Works

1. **Select hardware** (Raspberry Pi 5, Jetson Orin Nano)
2. **TinyFish agents** browse 4 retailer sites simultaneously
3. **Extract** pricing, stock status, shipping notes
4. **Compare** results in clean table
5. **Cache** in Redis for fast repeat queries

### Why TinyFish?

Traditional scrapers break when sites change. TinyFish uses **natural language goals** instead of brittle CSS selectors:

```typescript
goal: "Extract price, stock status, and shipping notes"
// No selectors, no XPath, no breakage
```

## Tech Stack

- **Next.js 14**: TypeScript, App Router, Server Components
- **TinyFish Web Agents**: Natural-language web automation
- **Upstash Redis**: Caching & change detection
- **Tailwind CSS**: Responsive UI
- **Vercel**: Deployment

## Quick Start

```bash
git clone [your-repo-url]
cd hardware-sentry

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Test TinyFish connection (optional)
python3 execution/test_tinyfish.py

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Get your API keys:
- **TinyFish**: Sign up at [tinyfish.ai](https://tinyfish.ai)
- **Upstash Redis**: Free tier at [upstash.com](https://upstash.com)

```bash
TINYFISH_API_KEY=your_key_here
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

## Architecture: 3-Layer System

This project follows the 3-layer architecture from `AGENTS.md`:

### Layer 1: Directives (What to do)
- `directives/scan_hardware.md`: Hardware scanning SOP
- `directives/deploy_vercel.md`: Deployment checklist

### Layer 2: Orchestration (Decision making)
- API routes (`src/app/api/*`) handle routing and error recovery
- Read configs, call TinyFish, cache in Redis

### Layer 3: Execution (Doing the work)
- `src/lib/tinyfish.ts`: Deterministic TinyFish client
- `src/lib/redis.ts`: Deterministic Redis operations
- `execution/test_tinyfish.py`: Validation script

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # Validate TypeScript
npm run lint         # Run ESLint

make dev             # Alternative: start via Makefile
make test-tinyfish   # Test TinyFish API
make deploy          # Deploy to Vercel
```

## Business Model

**Free**: 3 scans/day  
**Pro ($9/mo)**: Unlimited scans + alerts  
**Team ($49/mo)**: API access + custom SKUs

**Target Market**:
- 200k+ r/raspberry_pi community
- Hardware labs & universities
- System integrators
- Resellers & distributors

## Testing Without API Keys

For development and testing, you can use mock data:

1. Set `ENABLE_MOCK_DATA=true` in `.env.local`
2. Start the dev server: `npm run dev`
3. The app will use realistic mock data instead of calling TinyFish

**Health Check**: Visit `http://localhost:3000/api/health` to verify configuration

## Troubleshooting

### "Missing API keys" error
- Check `.env.local` exists and has valid keys
- Restart dev server after adding keys
- Visit `/api/health` to check configuration

### "Scan already in progress"
- Wait 2 minutes for lock to expire, OR
- Redis lock prevents concurrent scans
- Check Redis connection if persistent

### Build errors
```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check ESLint warnings
rm -rf .next        # Clear build cache
npm run build       # Rebuild
```

### Mock data not working
- Verify `ENABLE_MOCK_DATA=true` in `.env.local`
- Check server logs for "Using mock data" message
- Restart dev server after changing env vars

## Deployment to Vercel

```bash
# Install Vercel CLI (first time only)
npm i -g vercel

# Deploy
make deploy
# OR: vercel --prod

# Add environment variables in Vercel dashboard:
# - TINYFISH_API_KEY
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
```

## Roadmap

- [x] Multi-vendor scanning
- [x] Price change detection
- [x] Historical tracking
- [x] CSV export
- [ ] Email/Slack alerts on stock changes
- [ ] Price drop notifications
- [ ] GPU & SSD tracking
- [ ] Mobile app

## Contributing

Built with the self-annealing loop from `AGENTS.md`:

1. **Fix it**: Debug the issue
2. **Update tool**: Improve the code
3. **Test**: Verify the fix
4. **Update directive**: Document learnings
5. **Stronger system**: Error won't repeat

## License

MIT

---

**Hackathon Submission** | [GitHub](#) | [Demo Video](#) | [TinyFish Cookbook](https://github.com/tinyfish-io/tinyfish-cookbook)
