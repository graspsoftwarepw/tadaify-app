# tadaify-app

Tadaify is a link-in-bio SaaS for creators — built EU-first on a Cloudflare-native stack. Creators get a customisable public page, multiple content blocks (links, videos, newsletters, contact forms, etc.), analytics, and AI-powered suggestions. Built with zero native video upload, no shop in MVP (external links only).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS v4 |
| Hosting | Cloudflare Pages (static SPA) |
| API/Workers | Cloudflare Workers (`wrangler.toml`) |
| AI | Cloudflare Workers AI — `llama-3.1-8b-instruct-fast` (placeholder, wired in AI Suggest story) |
| Auth + DB | Supabase (GoTrue auth, Postgres, Realtime, Storage) |
| Email (dev) | Inbucket — built into `supabase start` (port 54354) |

## Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values from `supabase status`
cp .env.example .env.local

# 3. Start Supabase local stack (port-band 5435X, needs Docker)
supabase start
# API:     http://localhost:54351
# Studio:  http://localhost:54353
# Inbucket (email): http://localhost:54354

# 4. Start Vite dev server
npm run dev
# App: http://localhost:5173

# 5. Build for production
npm run build

# 6. Preview production build locally
npm run preview

# 7. (Optional) Run via Wrangler for full CF Pages emulation
npx wrangler pages dev dist
```

## Design reference

- `mockups/tadaify-mvp/` — 60+ HTML mockups (source of truth for UI design)
- `docs/research/` — research docs (affiliate program, competitor analysis, etc.)
- `docs/decisions/` — architectural decision records

## Supabase local ports (5435X band)

| Service | Port |
|---------|------|
| API (PostgREST) | 54351 |
| Postgres DB | 54352 |
| Studio | 54353 |
| Inbucket (email) | 54354 |
| Analytics | 54357 |
| Pooler | 54359 |
