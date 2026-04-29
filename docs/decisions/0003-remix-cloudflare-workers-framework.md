---
id: 0003
aliases: ["DEC-FRAMEWORK-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [framework, ssr, cloudflare, remix, react-router]
---

# Full-stack framework: Remix (React Router 7) on Cloudflare Workers runtime

## Context

tadaify needs SSR for public creator/product/marketing pages (fast first paint + SEO)
and SPA feel for the authenticated dashboard. Options evaluated: Next.js on Vercel,
Remix on Cloudflare Workers, SvelteKit. Given the Cloudflare-first architecture (DEC-035),
the native Cloudflare Workers adapter for Remix is the cleanest fit.

## Decision

Full-stack framework is Remix (merged with React Router 7 as of 2024) on Cloudflare Workers
runtime. File-based routing covers all paths under the single domain (DEC-DOMAIN-01).

- SSR for public creator/product/marketing pages (fast first paint + SEO indexable)
- Client-side navigation for authenticated dashboard (SPA feel after first load)
- Native Cloudflare Workers adapter (`@remix-run/cloudflare`)

## Alternatives considered

- **Next.js on Vercel** — rejected; Vercel is not Cloudflare; adds a second CDN edge;
  doesn't support Cloudflare Workers runtime natively.
- **SvelteKit** — rejected; smaller ecosystem, unfamiliar to team, Stripe/Supabase SDK
  support less mature.

## Consequences

- All routes are Remix file-based: `routes/<handle>.tsx`, `routes/app.tsx`, etc.
- GitHub Actions `deploy-cloudflare-pages.yml` via Wrangler for CI/CD.
- Branch `main` → prod (`tadaify.com`); branch `develop` → dev (`dev.tadaify.com`).
- Team's first Workers-as-app; 2-week buffer on critical path.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L77, L1352
- Original ID: DEC-FRAMEWORK-01
- Locked: 2026-04-24
