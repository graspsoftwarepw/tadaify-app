# tadaify-app

Tadaify — link-in-bio + creator commerce SaaS (React Router 7 / Remix on Cloudflare Workers + Supabase)

## Development

### Quickstart

```bash
# 1. Install
npm install

# 2. Bootstrap env files (.env + .dev.vars) — safe to run before Supabase
#    Generates the HMAC hook secret needed by supabase start.
./bin/worktree-env-init.sh

# 3. Start Supabase local (port-band 5435X)
npm run test:local:prepare
# Inbucket UI: http://localhost:54354

# 4. Start dev server
npm run dev
# App: http://localhost:5173

# 5. Run local Playwright
npm run test:e2e:local -- e2e/register-cascade.spec.ts

# 6. Build
npm run build

# 7. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

> **worktree-env-init.sh** is idempotent — running it again is always safe.
> `npm run test:local:prepare` now handles the same local E2E path end-to-end:
> it creates the hook secret when needed, starts Supabase Local, resets the DB,
> and writes `.env.local` plus `.dev.vars`. For manual setup reference, see
> `.env.example` and `.dev.vars.example`.
>
> For the full local Supabase port map and Playwright flow, see
> [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map and [docs/decisions/INDEX.md](docs/decisions/INDEX.md) for all locked architectural decisions.
