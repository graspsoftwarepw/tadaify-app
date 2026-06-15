# tadaify-app

Tadaify — link-in-bio + creator commerce SaaS (React Router 7 / Remix on Cloudflare Workers + Supabase)

## Development

### Quickstart

```bash
# 1. Install
npm install

# 2. Start Supabase local (port-band 44210-44219) and generate local env files
npm run test:local:prepare
# Inbucket UI: http://127.0.0.1:44214

# 3. Start dev server
npm run dev
# App: http://127.0.0.1:44200

# 4. Run local Playwright
npm run test:e2e:local -- e2e/register-cascade.spec.ts

# 5. Build
npm run build

# 6. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

> `npm run test:local:prepare` handles the local E2E path end-to-end: it creates
> the hook secret when needed, starts Supabase Local, resets the DB, and writes
> `.env.local` plus `.dev.vars`. For manual setup reference, see `.env.example`
> and `.dev.vars.example`.
>
> For the full local Supabase port map and Playwright flow, see
> [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map.
