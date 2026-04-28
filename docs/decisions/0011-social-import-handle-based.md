---
id: 0011
aliases: ["DEC-SOCIAL-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [onboarding, social, oauth, anti-patterns]
---

# Social-import on onboarding: handle-based link generation (not OAuth)

## Context

v1 spec used OAuth auto-import (F-004 + F-005): connect IG/TikTok via OAuth, auto-import
bio, avatar, and recent posts. Evaluation revealed: Facebook app review 2–8 weeks; Instagram
Basic Display API deprecated Dec 2024; Instagram Graph requires Business accounts (most
nano-creators lack these); minimal MVP value vs. 30 seconds of manual entry.

## Decision

Social-import on onboarding switched from OAuth auto-import to **handle-based link
generation**. F-004 rewritten: user selects platforms (multi-select: IG/TikTok/YouTube/X/
Twitch/Spotify/LinkedIn/Pinterest/Threads) and types their @handle for each. tadaify
generates "Follow me on X" link blocks pointing to canonical URLs. No OAuth, no API calls,
no account connection at MVP.

F-005 (TikTok handle entry) merged into F-004 — no separate TikTok OAuth step.

OAuth-based auto-import deferred to F-PRO-OAUTH-IMPORT (Pro tier) — later permanently
removed per DEC-APIPAGES-01 (2026-04-25).

## Consequences

- Onboarding: simple form, fast, no OAuth approval delays.
- F-UPSELL-001 follower count collected via direct question ("How big is your audience?")
  not API scrape.
- AP-043 (identity-matching across the web without consent) eliminated.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L330, L1358
- Original ID: DEC-SOCIAL-01
- Locked: 2026-04-24
