---
id: fr-insights
title: Insights
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/insights]
related_files:
  - src/proto/screens/insights/InsightsScreen.tsx
  - src/proto/screens/insights/insightsFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Insights

The creator-facing analytics view a creator opens at **Insights** in the dashboard
sidebar, ported from `mockups/tadaify-mvp/app-insights.html`. It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
with the Insights nav item marked active, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)) so light and
dark are both supported. Scope is single-handle (one page); a cross-page combined view is
flagged as upcoming and disabled.

All charts and sparklines are hand-rolled inline SVG or CSS bars driven by the typed
`insightsFixture`; there is no charting dependency. Charts and tables wrap or scroll and never
overflow at 390px wide.

## Shell

- The screen shall render inside the shared dashboard chrome and shall mark the **Insights**
  sidebar entry as the active navigation item.
- Content shall be presentational with local UI state only (active time range, open page
  selector, compare-to-previous toggle, active traffic source, the "show cities" toggle, the
  cross-tab row/column dimensions, and the methodology modal).

## Page header

- The header shall show the title "Insights", a "·" separator, and the current page name
  ("Home"), plus a one-line subtitle describing the view.
- A **page selector** dropdown shall list the creator's pages (currently "Home" with its public
  URL) and an always-disabled "All pages combined" entry labelled "soon" for the upcoming
  cross-page view. The menu shall open on click, close on outside click and on Escape.
- A **last-updated** chip shall show a live dot and the refresh status ("Live · refreshed 23s ago").
- A **time-range** segmented control shall offer 7d / 30d / 90d / 1y, with the active range
  highlighted; selecting a range updates local state.
- A **compare-to-previous** toggle shall switch a dashed previous-period overlay on the activity
  chart and add a matching legend entry.
- A tier-aware **CSV export** button ("Export CSV (daily)") shall be a no-op mock.
- An **API tile** shall show the current usage against the hourly cap ("API · 47 / 100 req/h"),
  collapsing to a short form ("🔌 47/100") on narrow screens.

## Hero KPIs

- A four-up KPI row (two-up on narrow screens) shall show Pageviews, Unique visitors today,
  Total clicks, and Conversion rate.
- Each tile shall show the metric label with an info "i" tooltip explaining the metric, the
  value (with an optional unit such as "%"), a coloured period-over-period delta pill, an inline
  sparkline rendered from normalised fixture points, and a previous-period comparison footnote.
- The Unique visitors tooltip shall explain the cookieless, privacy-first counting method and its
  trade-off (the same person on two days counts as two visitors).

## Activity over time

- A panel shall render a 7-day time-series chart with a filled pageviews area + line and a clicks
  line, with Y-grid lines, Y-axis value labels, and X-axis day labels, all from fixture data.
- A legend shall label Pageviews and Clicks, adding "Previous 7 days" when compare mode is on.
- An annotation pin ("🎵 TikTok went viral") shall mark the Tuesday spike.
- A Daily / Hourly granularity toggle shall be shown; "Hourly" is a no-op mock.

## Traffic sources

- A panel shall explain, inline, how the source is detected (the HTTP Referer header, no cookies,
  why some traffic shows as Direct, and the utm_source tip) and shall link to the full methodology
  modal.
- A left source list (TikTok, Instagram, Direct, YouTube, Twitter / X) shall show each source's
  icon, share bar, percentage, and visit count; selecting a source updates the right drill-down
  panel.
- The right drill-down panel shall show the selected source's header, conversion meta line, and its
  ranked top blocks with click counts.

## Top blocks

- A panel shall list every block on the page, ranked by clicks, in a horizontally scrollable table
  with columns Block, On page, Clicks, CTR, and a Last-7-days sparkline.
- The "On page" and sparkline columns shall hide on narrow screens.
- A sort-by dropdown and the row click-through (to a block detail view) shall be no-op mocks.
- A footer shall state the visible-block count and offer an "Open block detail view" action.

## Audience breakdown

- A three-up card group (stacked on narrow screens) shall show Top countries (with a Show/Hide
  cities toggle), Devices (mobile / desktop / tablet bars plus a browsers line), and Top referrers.

## Cross-tab analysis

- A panel shall render a source × block matrix where cell intensity scales with click volume and
  near-zero cells are dimmed; each cell shows a tooltip with its click count and share of total.
- A help block shall explain how to read the matrix.
- Rows and Columns dimension selectors shall be offered; a "Reset to default" action shall restore
  rows = Source, columns = Block. Re-rendering for other dimensions is mocked.

## Power features

- A grid of feature cards shall present Saved views (Pro+), A/B testing (Business), Scheduled email
  digest (Business), Replay (Business), Identity stitching (Business), and Parquet R2 archive
  (Business).
- Each card shall show a tier badge and a fully visible (never blurred) live preview of the
  feature. Tier-locked cards shall additionally show an upgrade call-to-action footer; the upgrade
  action is a no-op mock.

## Privacy footer

- A footer banner shall restate the cookieless promise (no cookie banner, fewer interruptions) and
  link to the full methodology modal.

## Methodology modal

- A modal, opened from the methodology links, shall explain the cookieless design, the unique-visitor
  counting method, and the traffic-source detection.
- The modal shall be centred, and shall close on Escape, on the Cancel/Close button, and on a
  backdrop click.

## Links and actions

- The screen shall contain no dead links: every action is a `type="button"` control wired to a
  mock alert or a local state change; none use `href="#"`.
