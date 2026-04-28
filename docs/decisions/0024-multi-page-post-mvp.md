---
id: 0024
aliases: ["DEC-MULTIPAGE-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [multi-page, mvp-scope, pages]
---

# Multi-page accounts confirmed for post-MVP (Q+1, Creator-tier unlock)

## Context

v1 spec had basic multi-page support. The question was whether to ship multi-page in
MVP or defer. Multi-page architecture requires forward-compatible schema (blocks need
`page_id` FK, URL routes use `/<handle>/<slug>`). Deferring the multi-page UI to Q+1
while building the schema now avoids costly migration later.

## Decision

Multi-page accounts confirmed for post-MVP (Q+1, Creator-tier unlock). Tier ladder:
Free 1 page / Creator 5 / Pro 20 / Business unlimited.

**MVP MUST be forward-compatible:**
- `pages` table created at MVP with 1 homepage row per user
- `blocks.page_id` FK NOT NULL (must be added in MVP F-FULLFLOW-001)
- URL routes `/<handle>/<slug>` pattern MUST be accepted at MVP (homepage hardcodes slug='')

MVP stories (F-LANDING-001, F-FULLFLOW-001) reference this architectural anchor.

## Consequences

- MVP has exactly 1 page per user but schema supports N pages.
- `pages.layout_mode` enum ships with both `'stack'` and `'grid'` from MVP per DEC-LAYOUT-01.
- No multi-page editor UI at MVP; comes in Q+1 via F-MULTIPAGE-001.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L128, L1094; `docs/decisions/INDEX.md`
- Original ID: DEC-MULTIPAGE-01
- Locked: 2026-04-25
