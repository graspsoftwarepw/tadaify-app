---
id: 0021
aliases: ["DEC-SYN-05"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [moderation, trust, anti-patterns]
---

# Creator Safeguard: 48h warning + human appeal + prepaid refund contract

## Context

AP-005 (account suspension without warning) and AP-027 (banning a prepaid creator without
refunding unused time) are critical anti-patterns. DEC-SYN-05 codifies a formal Creator
Safeguard policy as a brand commitment to protect creators from arbitrary moderation.

## Decision

For any moderation action beyond a single-block hide, tadaify MUST:
1. Give 48h notice in creator's inbox + email BEFORE any account-level action
2. Provide human-reviewed appeal via dedicated `admin_appeals` queue
3. If appeal fails AND creator prepaid annually: automatic refund of unused months
   (`(months_remaining / total_months) × annual_price`, processed within 14 days)
4. If appeal succeeds: account restored to pre-action state within 4h

Codified as F-191b. Published on Trust Center.

## Consequences

- AP-005, AP-027, AP-028 all GREEN.
- `admin_appeals` table + queue (ported from linkofme).
- Stripe refund API for prepaid annual refunds.
- 48h notice delay makes spontaneous account suspension impossible.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L840, L1487
- Original ID: DEC-SYN-05
- Locked: 2026-04-24
