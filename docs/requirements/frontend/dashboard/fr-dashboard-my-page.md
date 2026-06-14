---
id: fr-dashboard-my-page
title: Creator dashboard — My page
area: DASHBOARD
status: accepted
modules: [DASHBOARD]
routes: [/__proto/dashboard]
related_files:
  - src/proto/screens/dashboard/DashboardScreen.tsx
  - src/proto/screens/dashboard/dashboard-proto.css
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Creator dashboard — My page

The default authenticated dashboard view, ported from `mockups/tadaify-mvp/app-dashboard.html`. It renders
inside the global app shell ([fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) and uses the
global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Composition

Page head:

- The view shall render the title "My page".
- The view shall render a sub-line: block count, a separator dot, and "Live · updated 2 min ago".
- The view shall render a ghost "Copy link" button and a primary "Add block" button.

Welcome banner:

- The view shall render a 🎉 banner: "Your page is live." with a link to the creator's public URL and a
  "{n} visits this week" summary, plus a dismiss control.

Pinned message:

- The view shall render a pinned-message row: an on/off toggle, the label "Pinned message", a text input
  (max 80 chars) with a remaining-character count, and a "Dismissible by visitor" note.

Profile card:

- The view shall render an avatar with a camera overlay, the display name, a "✓ verified" chip, the bio,
  the public handle URL, a row of social icon buttons with an "add" button, and an "Edit" button.

Quick chips:

- The view shall render an "Organise…" chip and a "Share page" chip.

Blocks:

- The view shall render a "Blocks" section label and a list of block rows; each row renders a drag grip,
  a platform icon, the block title and URL, a "{n} clicks · 7d" stat, a live toggle, and edit/more buttons.
- The view shall render an "Add a block" affordance at the end of the list.

## Layout

- **Desktop / tablet:** the view renders in the shell content column to the right of the sidebar; page-head
  actions sit to the right of the title; the profile card and block rows are full-width within the column.
- **Phone:** the shell sidebar collapses to bottom navigation; page-head actions wrap below the title; the
  profile card and block rows stack full-width.

## Related requirements

- [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
