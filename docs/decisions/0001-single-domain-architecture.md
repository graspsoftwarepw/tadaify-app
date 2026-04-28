---
id: 0001
aliases: ["DEC-DOMAIN-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [architecture, url, domain, routing]
---

# Single-domain architecture: everything under `tadaify.com/`

## Context

Early tadaify design considered subdomain-based creator URLs (e.g. `<handle>.tadaify.com`)
or separate subdomains for dashboard (`app.tadaify.com`). Competitors like Linktree use
`linktr.ee/<handle>` — keeping the root domain clean. Single-domain also avoids cookie-scoping
issues, simplifies Remix routing, and strengthens the brand anchor.

## Decision

Single-domain architecture: every creator page, marketing page, and authenticated dashboard
route lives under one root: `tadaify.com` (prod) / `dev.tadaify.com` (dev).

- Creator URL: `tadaify.com/<handle>` (primary brand asset)
- Authenticated dashboard: `tadaify.com/app`
- Admin panel: `tadaify.com/admin`
- Landing: `tadaify.com/`
- Guest editor: `tadaify.com/try`
- Template previews: `tadaify.com/t/<name>`

No subdomain variants for creator URLs. Subdomains reserved for separate concerns:
`preview.tadaify.com` (preview generator output), `developers.tadaify.com` (API docs),
`status.tadaify.com` (uptime), `mail.tadaify.com` (email sender).

## Consequences

- Cloudflare for SaaS handles creator custom domains (e.g. `mycoach.com → tadaify page`) —
  separate from tadaify's own DNS.
- Remix file-based routing covers all paths under single domain — no multi-tenant subdomain
  routing complexity.
- Simplified SSL management (one certificate vs wildcard + per-tenant provisioning).
- `preview.tadaify.com` necessarily on subdomain to avoid handle-namespace collision.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L75, L1350
- Original ID: DEC-DOMAIN-01
- Locked: 2026-04-24
