---
id: fr-affiliate
title: Affiliate program
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/affiliate]
related_files:
  - src/proto/screens/affiliate/AffiliateScreen.tsx
  - src/proto/screens/affiliate/affiliateFixture.ts
  - src/proto/screens/affiliate/affiliate-proto.css
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Affiliate program

The creator-side Affiliate program view a creator opens from the sidebar Affiliate entry, ported from
`mockups/tadaify-mvp/app-affiliate.html`. It renders inside the creator dashboard chrome (appbar +
sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the Affiliate nav
entry marked as the current screen, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome (appbar + sidebar); the sidebar Affiliate
  entry shall be marked active.
- A page header shall show a "⚡ 30% recurring" badge, the title "Affiliate program", and a one-line
  description of the 30%-recurring, no-cap, no-expiry payout model.

## Referral link

- A hero card shall present the creator's auto-generated referral link
  (`https://tadaify.com/?ref=<handle>`, derived from the handle) as read-only text alongside a "Copy
  link" button.
- Pressing the button shall copy the link to the clipboard and flip the label to "Copied ✓" for a
  short moment before reverting; when the clipboard API is unavailable the copy shall degrade
  gracefully without a dead link.

## Earnings dashboard

- A three-card stats grid shall show Lifetime earnings, This month, and Pending payout — each with a
  currency-prefixed value and a sub-line (the Pending sub-line uses the muted, non-positive style).
- The grid shall collapse to a single column on narrow screens.

## Share kit

- A "Share kit" section shall present two pre-written copy cards (an X / Twitter post and an Instagram
  bio / story), each with the copy shown in a block, a "Copy" button (flips to "Copied ✓"), and a
  secondary action — "Post to X →" on the X card (primary styling), "Open in IG →" on the Instagram
  card. The secondary actions are mocked (no-op alert), never dead links.
- A "Downloadable graphics" row shall present three gradient graphic tiles (square, story, OG card)
  with a download glyph; clicking a tile fires a mocked download alert. The row reflows from three to
  two to one column as the viewport narrows.

## Recent referrals

- A table shall list the last eight sign-ups via the link, each row showing an anonymized email, a tier
  pill (Creator / Pro / Business), the join date, a status pill (Active / Trial / Cancelled), and the
  creator's monthly share (or "—" when none). The table scrolls horizontally rather than overflowing on
  phones.

## Payout & terms

- A payout notice shall describe Stripe Connect payouts (monthly, on the 1st) with a mocked "Connect
  Stripe →" action.
- A terms line shall link to the Affiliate Terms of Service (the settings screen in the prototype) and
  state the fair-use / no-spam / 90-day-attribution summary.

## Theming & responsiveness

- The screen shall render correctly in light and dark themes via the design tokens, and adapt across
  desktop, tablet, and phone widths without horizontal overflow at 390px (the stats, share copy, and
  graphics grids reflow; the referrals table scrolls within its card).
