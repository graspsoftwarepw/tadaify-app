# tadaify-app

Tadaify — link-in-bio + creator commerce SaaS (React Router 7 / Remix on Cloudflare Workers + Supabase)

## Development

### Quickstart

```bash
# 1. Install
npm install

# 2. Configure local env — required because the before_user_created Auth Hook
#    (DEC-294) needs an HMAC secret in your local .env before `supabase start`
#    will succeed.
cp .env.example .env
SECRET="$(printf "v1,whsec_%s" "$(openssl rand -base64 32)")" \
  && sed -i.bak "s|^BEFORE_USER_CREATED_HOOK_SECRET=.*$|BEFORE_USER_CREATED_HOOK_SECRET=$SECRET|" .env \
  && rm .env.bak

# 3. Configure Workers runtime env bindings (server-side routes read from .dev.vars)
#    Workers does NOT read .env — it reads .dev.vars (Cloudflare wrangler convention).
#    Both files are required for local dev. See .dev.vars.example for full comments.
cp .dev.vars.example .dev.vars
#    Fill in SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY after
#    `supabase start` (next step): run `supabase status -o env` to get values.
#    HANDLE_RESERVATION_TTL_SECONDS defaults to 600 (10 min); override for tests.

# 4. Start Supabase local (port-band 5435X)
supabase start
# Inbucket UI: http://localhost:54354
# Then: supabase status -o env  → copy values into .dev.vars

# 5. Start dev server
npm run dev
# App: http://localhost:5173

# 6. Build
npm run build

# 7. Local preview of built artifact (Workers via Wrangler)
npm run preview
# (or: wrangler dev ./build/server/index.js)
```

### Stack

- React Router 7 (Remix-merged) on Cloudflare Workers — SSR for public creator pages, CSR after first load on the dashboard
- Tailwind CSS v4
- Supabase local (Docker) for Auth + Postgres + Inbucket
- TypeScript everywhere

See [docs/INDEX.md](docs/INDEX.md) for the full documentation map and [docs/decisions/INDEX.md](docs/decisions/INDEX.md) for all locked architectural decisions.

## Local testing

Unit tests (run in CI on every deploy):

```bash
npm test
# → vitest run, 210 tests, ~300ms
```

E2E tests (LOCAL ONLY — never in GitHub Actions CI per `feedback_no_ci_tests.md`):

```bash
# One-time on a fresh checkout (downloads Chromium ~150MB to ~/Library/Caches/ms-playwright):
npm run test:e2e:install

# Prerequisites for each run: supabase start + .env + .dev.vars configured (see Quickstart above)

npm run test:e2e          # headless chromium, list reporter
npm run test:e2e:headed   # visible browser
npm run test:e2e:ui       # Playwright UI mode (interactive)
npm run test:e2e:debug    # PWDEBUG=1 step-through
```

The `webServer` block in `playwright.config.ts` auto-starts `npm run dev` (Vite + the
`@cloudflare/vite-plugin` SSR adapter that serves Workers routes) when no server is already
running. The previous "wrangler dev required" diagnosis was wrong — Vite dev DOES serve
`/api/*` Workers routes via SSR, verified manually 2026-05-02.

S1-S6 in `register-cascade.spec.ts` are currently `test.fixme()` (known-broken pending follow-up
issue #163: debounce-aware selectors + per-test handle isolation + S6 env passthrough). Once
#163 lands, they un-fixme and the full register flow is covered.
