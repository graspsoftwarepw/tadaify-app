# tadaify-app

Tadaify — link-in-bio + creator commerce SaaS (React Router 7 / Remix on Cloudflare Workers + Supabase)

## Development

### Quickstart

```bash
# 1. Install
npm install

# 2. Start the foreground-owned Supabase stack and dev server
npm run dev:local
# Inbucket UI: http://127.0.0.1:44214
# App: http://127.0.0.1:44200

# 3. Run local Playwright (its own isolated bounded stack)
npm run test:e2e:local -- e2e/register-cascade.spec.ts

# 4. Build
npm run build

# 5. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

> `npm run dev:local` owns Supabase Local and the dev server for one foreground process. Exiting it,
> signalling it, or killing it with `SIGKILL` removes only its exact stack. `npm run setup` and
> `npm run test:local:prepare` may create the same stack while preparing files, but always remove it
> before returning. For manual configuration reference, see `.env.example` and `.dev.vars.example`.
>
> For the full local Supabase port map and Playwright flow, see
> [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map.
