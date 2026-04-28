---
id: 0042
aliases: ["DEC-079"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, insights, ux, privacy]
---

# Unique visitors: show per-day unique with tooltip; aggregates show pageviews/sessions

## Context

Given cookieless methodology (DEC-075), showing aggregate "unique visitors" for a week
or month is misleading (Mon visitor + Tue visitor = 2 — but it may be same person).
Options: show per-day unique with tooltip; show all aggregations with disclaimer; hide
entirely; or Pro-only with cookie opt-in.

## Decision

Option 1 — show "unique visitors per day" with prominent ⓘ tooltip. Aggregate views
(week/month) show pageviews/sessions only — honest framing.

Footer banner (always visible on Insights tab): "Cookieless analytics. No cookie banner
shown to your visitors."

Tooltip verbatim (use exactly this in Insights tab implementation):
> **About this number**
> This is an approximate count. We don't track you across visits — no cookies, no
> fingerprinting. We use a privacy-first method that counts unique visitors per day.
>
> **Trade-off:** if the same person visits Monday and Tuesday, we count them as 2
> visitors (not 1).
>
> **Why we do this:** cookie banners annoy your visitors and hurt your conversion. We
> chose a slightly fuzzy number over an annoying experience for your audience.
>
> [Learn more →]

Zero cost differential across tiers.

## Consequences

- Insights UI: unique visitors tile shows per-day with ⓘ tooltip.
- Week/month aggregate tiles: pageviews + sessions, no unique visitors total.
- Honest framing builds creator trust; avoids inflated metrics.

Cross-references: Issue #45 (Insights tab), DEC-075 (cookieless methodology), marketing pillar #1.

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-079
- Original ID: DEC-079
- Locked: 2026-04-26T05:53:42Z
