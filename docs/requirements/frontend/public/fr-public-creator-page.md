---
id: fr-public-creator-page
title: Public creator page
area: PUBLIC
status: accepted
modules: [PUBLIC]
routes: [/__proto/creator-public]
related_files:
  - src/proto/screens/creator-public/CreatorPublicScreen.tsx
  - src/proto/screens/creator-public/creator-public-proto.css
  - src/proto/screens/creator-public/creatorPublicFixture.ts
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Public creator page

What a visitor sees at `tadaify.com/<handle>` — the creator's identity beside a stack of content blocks.
Ported from `mockups/tadaify-mvp/creator-public.html`. Visitors see the creator's own theme; the colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md).

## Composition

Identity column:

- The page shall render a large circular avatar (creator initials), the display name, and a multi-line bio.
- The page shall render a row of circular social links.
- The page shall render a "✓ verified creator" success pill when the creator is verified.

Block stack:

- **Hero product block** — a discount pill, title, sub-line, a struck-through original price plus the
  current price, and a "Get it now →" call-to-action; rendered in the accent colour.
- **Standard product / link blocks** — title, sub-line, and a price or a "FREE" pill.
- **Instagram preview block** — title, sub-line, and an "Open →" soft call-to-action.
- **Countdown block** — a label, sub-line, an icon, a four-cell days/hours/mins/secs grid, a
  "Learn more →" link, and an auto-hide note.
- **Affiliate section** — an italic "Things I use (affiliate)" heading followed by affiliate rows, each a
  thumbnail, title, description with an "ad" badge, and a chevron.
- **Podcast block** — a dark-surface card with title, sub-line, and a "Listen →" call-to-action.
- **Powered-by footer** — "Powered by tada!ify — get yours free →" (free tier only).

## Layout

- **Desktop / tablet (≥880px):** two columns — a sticky identity column on the left and the block stack
  on the right.
- **Phone (<880px):** a single column — the identity stacks centered above the block stack.

## Related requirements

- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
