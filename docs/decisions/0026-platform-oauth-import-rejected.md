---
id: 0026
aliases: ["DEC-APIPAGES-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [api, oauth, integrations, mvp-scope]
---

# Platform OAuth import permanently rejected — Creator API is the better investment

## Context

F-PRO-OAUTH-IMPORT was a planned Pro feature: connect IG/TikTok/Spotify/YouTube via OAuth,
auto-import recent posts and refresh them daily. Evaluation: Facebook app review 2-8 weeks;
IG Basic Display API deprecated Dec 2024; Graph API requires Business accounts (most
nano-creators lack these). High maintenance burden. Evaluated as answer C (reject entirely).

## Decision

Platform OAuth import (IG/TikTok/Spotify/YouTube) is **permanently removed from the
roadmap** (answer C). F-PRO-OAUTH-IMPORT permanently removed.

The Creator API (F-PRO-CREATOR-API-001) is the better investment — it lets power users
(and ChatGPT agents) manage their page programmatically, without platform-level
dependencies. Anyone wanting social feed automation can do it via Creator API + MCP.

## Consequences

- AP-034 (manual-only social handle entry) resolved via F-004 handle-based link generation
  — this is acceptable friction vs. maintaining OAuth integrations.
- AP-043 (identity-matching without consent) fully resolved — no API scraping at any tier.
- F-PRO-CREATOR-API-001 is the Pro-tier power feature that replaces OAuth import.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1519; `docs/decisions/INDEX.md`
- Original ID: DEC-APIPAGES-01
- Locked: 2026-04-25
