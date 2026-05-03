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
supabase start
# Inbucket UI: http://localhost:54354

# 4. Re-run to fill in Supabase keys (idempotent — re-run is always safe)
./bin/worktree-env-init.sh

# 5. Start dev server
npm run dev
# App: http://localhost:5173

# 6. Build
npm run build

# 7. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

> **worktree-env-init.sh** is idempotent — running it again is always safe.
> Run it **before** `supabase start` to generate `.env` (the Auth Hook secret must exist
> before Supabase boots). Re-run **after** `supabase start` to populate the Supabase keys
> in `.dev.vars`. For manual setup reference, see `.env.example` and `.dev.vars.example`.

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map and [docs/decisions/INDEX.md](docs/decisions/INDEX.md) for all locked architectural decisions.
