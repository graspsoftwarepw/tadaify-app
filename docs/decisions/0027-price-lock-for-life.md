---
id: 0027
aliases: ["DEC-PRICELOCK-01"]
status: accepted
date: 2026-04-25
supersedes: ["0022-price-lock-3yr-superseded.md"]
superseded_by: null
topics: [pricing, price-lock, trust]
---

# Price-lock-for-life — paid subscription price locked forever for uninterrupted subscriptions

## Context

DEC-SYN-06 set a 3-year windowed price lock. User feedback indicated that a time-limited
lock is a marketing gimmick — a true commitment should be perpetual. Creators fear: "if
I build here, will the price go up next year?" A lifetime lock removes that fear entirely
and is a genuine brand differentiator vs Linktree/Beacons (which have raised prices on
existing subscribers multiple times).

## Decision

Paid subscription price is locked **forever** (not 3 years) for uninterrupted subscriptions.
New prices apply only to new signups or re-subscribers after cancellation.

Implementation: Stripe `price_id` anchoring — each subscription tied to the price object
at signup. New public prices → new Stripe price objects. Existing subs keep their original
`price_id` forever.

DB change: `price_locked_until TIMESTAMPTZ` replaced by `lifetime_lock: true` flag.
`fee_locked_until` remains for the 0%-fee guarantee.

Copy (canonical): "Price locked for life" / "Your price is locked for life — we never
raise the price on active subscribers."

Universal domain add-on note (DEC-PRICELOCK-02): the $1.99/mo domain add-on is universal
across all tiers — never frame it as Free-tier-only.

## Consequences

- DEC-SYN-06 (3-year windowed lock) superseded.
- Competitive differentiator — unique among link-in-bio platforms.
- Operational constraint: any price increase only applies to new subscribers.
- Must appear on: pricing page, onboarding tier step, public marketing.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L124, L1489; `docs/decisions/INDEX.md`; `pricing/bandwidth-based-model-v2.md`
- Original ID: DEC-PRICELOCK-01
- Locked: 2026-04-25
