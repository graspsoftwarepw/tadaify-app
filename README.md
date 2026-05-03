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

# 3. Bootstrap env files for this worktree (idempotent — re-run is always safe)
#    Creates .env + .dev.vars, generates the HMAC hook secret, and fills in
#    Supabase keys from `supabase status` automatically.
./bin/worktree-env-init.sh

# 4. Start dev server
npm run dev
# App: http://localhost:5173

# 5. Build
npm run build

# 6. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

> **worktree-env-init.sh** is idempotent — running it again in an already-bootstrapped
> worktree is a no-op. It requires Supabase to be running (step 2 above) to fill in
> the Supabase keys. For manual setup reference, see `.env.example` and `.dev.vars.example`.

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map and [docs/decisions/INDEX.md](docs/decisions/INDEX.md) for all locked architectural decisions.
