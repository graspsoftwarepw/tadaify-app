---
id: fr-admin-paid-articles
title: Administration — Paid articles
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-paid-articles]
related_files:
  - src/proto/screens/admin-paid-articles/AdminPaidArticlesScreen.tsx
  - src/proto/screens/admin-paid-articles/adminPaidArticlesFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Administration — Paid articles

The day-to-day publishing surface a creator opens at Administration → Paid articles, ported from
`mockups/tadaify-mvp/app-admin-paid-articles.html`. It is where the creator publishes and manages
individual monetized articles (Substack/Medium-style single posts sold without a subscription). It
pairs with the Paid-articles page editor (Pages → Paid articles), which configures the
visitor-facing list page. It renders inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the Administration → Paid
articles nav item marked active, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome with the sidebar Administration → Paid
  articles entry marked as the current screen.
- It shall show a breadcrumb (Dashboard / Administration · Paid articles), a page header with the
  emoji "💰", the title "Paid articles", and a one-line description that links to the Paid-articles
  page editor (Pages → Paid articles).
- In the filled state the header shall carry a "Sales report" ghost action and a primary
  "＋ New article" action that opens the composer modal. In the empty (no page) state the header
  actions are hidden.

## Stripe Connect banner

- A Stripe Connect status banner shall sit below the header. When connected it states
  "Stripe Connect — Connected" with payout details and a "Manage" action. When not connected it
  shows the warning variant "Connect Stripe to start selling" with a "Connect Stripe →" action.
- The Stripe requirement is a functional gate, not a visual one: paid features are never blurred.

## States

- **Filled** — sales analytics cards (Revenue this month with a spark mini-chart, Top article,
  Lifetime revenue), an "Articles" section card with a count subtitle, a filter tab row
  (All / Published / Drafts with counts), an article search input, and the article list.
- **No page** — an empty-state prompt ("You don't have a Paid articles page yet") with an
  "＋ Add Paid articles page now" action and a "Skip — what is Paid articles?" action.
- A prototype-only demo control switches between the filled / no-page state and the Stripe
  connected / not-connected banner.

## Article list

- Each article row shall show a tinted emoji thumbnail, the title, a state chip (● Published /
  ○ Draft) with a meta line (read time · date · extras), the price, sales count, revenue, and an
  Edit + more-actions icon pair. Draft rows show "—" for sales and revenue.
- The sales and revenue columns collapse on narrow (phone) widths; the row reflows to thumbnail +
  meta + price without horizontal overflow.

## Composer modal

- The "＋ New article" action shall open a centred composer modal — never a side drawer — titled
  "New paid article" with a Draft chip.
- The body shall contain a cover-image uploader, Title, URL slug + Tags, a Markdown Body textarea,
  Price (USD) + Schedule, a paywall preview-cutoff slider showing the current word count, and a
  Stripe Connect status line that reflects the connected / not-connected demo state.
- The footer shall offer "Delete draft", "Save draft", "Schedule", and "Publish now".
- The modal shall close on Escape, on the Cancel/close control, and on a backdrop click, and shall
  stay centred at every width.

## Theming & responsiveness

- The screen shall render correctly in light and dark themes (every value derives from the design
  tokens) and adapt across desktop, tablet, and phone widths without horizontal overflow at 390px.
