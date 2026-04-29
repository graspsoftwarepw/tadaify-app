---
id: 0038
aliases: ["DEC-075"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, privacy, insights]
---

# Cookieless unique visitor methodology: daily salt (Plausible-style)

## Context

Unique visitor tracking options: cookieless daily-salt (Plausible-style), first-party
visitor cookie (per-creator, 30-day TTL), hybrid, or no uniques metric at all. Cookie-based
tracking requires consent banners on creator pages — a bad user experience.

## Decision

Option 1 — cookieless daily salt (Plausible-style). Additionally elevated to PRIMARY
marketing positioning: "privacy-first, no cookies, no tracking" is a flagship message
that must land on landing page + every relevant surface.

Insights UI shows approximate unique visitors with prominent inline explanation of the
trade-off (same person visiting Monday and Tuesday counted as 2 visitors), framed as
a feature not a limitation.

Tooltip verbatim (must use exactly this in the Insights tab implementation):
> "About this number: This is an approximate count. We don't track you across visits —
> no cookies, no fingerprinting. We use a privacy-first method that counts unique visitors
> per day. Trade-off: if the same person visits Monday and Tuesday, we count them as 2
> visitors (not 1). Why we do this: cookie banners annoy your visitors and hurt your
> conversion..."

## Consequences

- No cookie banner needed on creator pages for analytics (EU/GDPR compliant baseline).
- Unique visitors per day shown; aggregate (week/month) shows pageviews/sessions only.
- Footer banner: "Cookieless analytics. No cookie banner shown to your visitors."
- Triggers: landing.html privacy-first flagship section (Issue #41), Insights tab DEC-079 tooltip.

Cross-references: Issue #41 (Privacy flagship landing), Issue #45 (Insights tab), DEC-079
(uniques display), marketing pillar #1.

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-075
- Original ID: DEC-075
- Locked: 2026-04-26T05:35:46Z
