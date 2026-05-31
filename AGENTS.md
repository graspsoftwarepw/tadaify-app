# tadaify-app

A creator link-in-bio platform: public creator pages at `/<handle>` and an
authenticated creator dashboard at `/app`. React Router 7 (SSR on Cloudflare
Workers), Supabase (auth + Postgres), Cloudflare D1 / KV / R2.

## Local environment

- `npm run setup` — bootstrap the local stack (Supabase CLI + local Supabase +
  Playwright browser).
- `npm run dev` — run the app.

## Tests

- `npm run test` — Vitest unit / integration.
- `npm run test:e2e:local` — reset the local DB and run the Playwright e2e suite.

## Deeper docs

- `docs/agent-context/claude-full-context.md` — architecture, conventions, product.
- `docs/decisions/` — locked decisions (DECs).
