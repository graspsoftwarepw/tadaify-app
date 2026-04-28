# tadaify-app

Tadaify — link-in-bio + creator commerce SaaS (React Router 7 / Remix on Cloudflare Workers + Supabase)

## Development

### Quickstart

```bash
# 1. Install
npm install

# 2. Start Supabase local (port-band 5435X)
supabase start
# Inbucket UI: http://localhost:54354

# 3. Start dev server
npm run dev
# App: http://localhost:5173

# 4. Build
npm run build

# 5. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map and [docs/decisions/INDEX.md](docs/decisions/INDEX.md) for all locked architectural decisions.
