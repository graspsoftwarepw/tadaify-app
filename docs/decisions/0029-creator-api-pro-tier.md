---
id: 0029
aliases: ["DEC-CREATOR-API-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [api, pro-tier, mcp, openapi]
---

# Creator API for Pro tier: OpenAPI 3.0 + `@tadaify/mcp` npm MCP server

## Context

After DEC-APIPAGES-01 rejected platform OAuth import, Pro tier needed a power feature
for technically savvy creators. Creator API positions tadaify as "AI-friendly" — the
first link-in-bio platform with a public API that ChatGPT agents can use. Positioning:
"Hire ChatGPT to manage your link-in-bio."

## Decision

Creator API for Pro tier (answer A):
- OpenAPI 3.0 spec, published at `tadaify.com/api/openapi.json` + `developers.tadaify.com`
- Per-user API key management UI at `/app/settings/api-keys`
- `@tadaify/mcp` npm package — Cloudflare Workers-based MCP server (standard MCP protocol)
- Custom GPT template: downloadable JSON instructions file for ChatGPT custom GPT
- Agent-recipe gallery: 3 starter recipes (Daily YT refresh / Pinned message from Notion /
  Reorder by click analytics)
- Rate limit: 1000 req/h Pro; Business: 5000 req/h (later revised — see F-PRO-004)

Endpoints: `GET /api/v1/me`, CRUD on `/api/v1/pages`, CRUD on `/api/v1/pages/{id}/blocks`,
block reorder, publish toggle.

## Consequences

- Primary marketing positioning parallel to DEC-075 (privacy-first): "first creator
  analytics API in link-in-bio space."
- Triggers: landing.html API flagship section, Insights tab API tile/CTA, audit catalog flag.
- Eng effort: L (2-3 weeks — API layer, key management, OpenAPI, MCP package, GPT template).
- Timeline: Y1 M+2 (F-PRO-CREATOR-API-001).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1127, L1520; `docs/decisions/INDEX.md`
- Original ID: DEC-CREATOR-API-01
- Locked: 2026-04-25
