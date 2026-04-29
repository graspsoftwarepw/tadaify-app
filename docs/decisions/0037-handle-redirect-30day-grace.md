---
id: 0037
aliases: ["DEC-074"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [url-routing, handles, ux]
---

# Handle redirect on rename: redirect to new handle URL for 30-day grace period

## Context

When a creator changes their handle (e.g. @alex → @alexandra), the old URL
(`tadaify.com/alex`) needs to remain functional for some period to avoid breaking
links shared by the creator's audience. Options: immediate 404, temporary redirect,
or a "creator moved" page.

## Decision

Old handle URL redirects to new primary handle URL for 30 days. After 30 days, the old
handle is released for re-registration.

This is an implementation detail (not marketing-visible) relevant to the URL routing
design in Phase B multi-handle architecture.

## Consequences

- `handle_redirects` table or similar mechanism needed to track old→new handle mappings.
- 301 redirect from old handle for 30 days.
- After 30 days: old handle becomes available again; SEO juice transfers to new URL.

Cross-references: Phase B — multi-handle architecture routing decisions.

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-074
- Original ID: DEC-074
- Locked: 2026-04-26
