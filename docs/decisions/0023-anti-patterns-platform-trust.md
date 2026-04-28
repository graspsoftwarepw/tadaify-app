---
id: 0023
aliases: ["DEC-ANTI-001", "DEC-ANTI-002", "DEC-ANTI-003", "DEC-ANTI-004", "DEC-ANTI-005", "DEC-ANTI-006", "DEC-ANTI-007", "DEC-ANTI-008", "DEC-ANTI-009", "DEC-ANTI-010", "DEC-ANTI-011", "DEC-ANTI-012", "DEC-ANTI-013", "DEC-ANTI-014", "DEC-ANTI-015"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [anti-patterns, trust, branding, pricing, ux]
---

# Anti-pattern commitments (DEC-ANTI-001 through DEC-ANTI-015)

## Context

The anti-patterns audit (`anti-patterns-audit.md` 2026-04-24) identified 51 anti-patterns
across competitors. The DEC-ANTI-* series locks specific commitments that must survive
any future spec evolution or business pressure. These are brand-level commitments, not
implementation details.

## Decision

All 15 commitments locked simultaneously on 2026-04-24:

| Alias | Commitment |
|---|---|
| DEC-ANTI-001 | No "Powered by tadaify" footer on ANY tier. Not a paid unlock. Hard-locked. (AP-001) |
| DEC-ANTI-002 | 0% platform fees contractually locked. Published on Trust Center. Cannot be raised mid-subscription. (AP-018/046) |
| DEC-ANTI-003 | F-UPSELL-004 DOES NOT pre-select paid radio. Default stays Free. Badge-only recommendation. (AP-047) |
| DEC-ANTI-004 | F-191a Plain-Language Content Policy + F-191b Creator Safeguard = both MVP. (AP-005/026/027) |
| DEC-ANTI-005 | F-180a one-click cancel. No multi-step survey. No retention modal cascade. (AP-010) |
| DEC-ANTI-006 | Trial revert NEVER deletes data. Trial mechanism removed entirely per DEC-TRIAL-01. (AP-017) |
| DEC-ANTI-007 | T+14 days max payout SLA. Published on tadaify.com/trust/payouts. (AP-019) |
| DEC-ANTI-008 | Creator page stays live during dunning. No public shame overlay. Ever. (AP-029) |
| DEC-ANTI-009 | Feature-preservation: tier gates only move cheaper for existing users. Grandparent via `user_features`. (AP-042) |
| DEC-ANTI-010 | "We never sell creator or visitor data; never share with LLMs for training." Published on Trust Center. (AP-038) |
| DEC-ANTI-011 | F-PREVIEW-004 disclosure strip is TOP of preview page; mandatory; one-click remove form; admin cannot disable. (AP-029-preview) |
| DEC-ANTI-012 | F-058a EU visitor cookie consent banner. Granular (not bare "Got it"). MVP. (AP-036/037) |
| DEC-ANTI-013 | Editor progressive disclosure: 6-block "Getting Started" default. F-020 §4a. (AP-045) |
| DEC-ANTI-014 | Double-opt-in email mandatory. Inherited from linkofme subscribe/confirm stack. (AP-025) |
| DEC-ANTI-015 | No persistent upgrade banner in editor chrome. F-UPSELL-003 chips = 1/session hard cap, dismissible, informational only. (AP-031) |

## Consequences

All 15 commitments are brand-level hard locks. Violating any of them in a PR or story
requires explicit DEC supersession — they cannot be silently overridden by implementation
choices.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1491-L1505; §27 anti-patterns appendix; `docs/decisions/INDEX.md`
- Original IDs: DEC-ANTI-001 through DEC-ANTI-015
- Locked: 2026-04-24
