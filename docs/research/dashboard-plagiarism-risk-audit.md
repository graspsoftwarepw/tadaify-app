---
type: research
project: tadaify
title: Dashboard plagiarism-risk audit vs Linktree
created_at: 2026-04-25
author: orchestrator-opus-4.7
status: draft-for-review
---

# Dashboard plagiarism-risk audit vs Linktree

## Executive summary

**Verdict: MEDIUM plagiarism risk.** Three components mirror Linktree's information architecture closely enough that a hostile observer could credibly say "they copied the IA": (1) the **Design sub-nav** uses 7 of Linktree's 7 sub-tab labels in the same order with our Animations slotted in as #6; (2) the **Wallpaper picker** uses Linktree's exact 6-tile vocabulary (Fill / Gradient / Blur / Pattern / Image / Video); (3) the **Add Block modal** matches Linktree's category names and ordering. Outside those three, our visual styling, brand language, motion vocabulary, and several novel features (Animations sub-tab, AI theme matcher, three-way device toggle, light/dark mode, price-lock-for-life messaging, Motion v10 logo) differentiate clearly. Six recommended changes below would drop the verdict to Low.

## Methodology

I opened each Linktree dashboard screenshot in `/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/linktree/screens/` (lt-011 / lt-014 / lt-015 / lt-016 / lt-017 / lt-018 / lt-020 / lt-021 / lt-026 / lt-038 / lt-041) plus the prose notes. Then I read the active tadaify mockup at `mockups/tadaify-mvp/app-dashboard.html` (3,355 lines). Component-by-component comparison below. Similarity scale: 1=different, 2=same approach, 3=same primitives + twist, 4=very close (risky), 5=copy.

## Comparison table

| # | Component | Linktree | tadaify | Sim | Notes |
|---|-----------|----------|---------|-----|-------|
| 1 | Topbar | Avatar dropdown + bell + share-URL pill + "Enhance" + settings | Brand wordmark + handle pill + bell + theme toggle | **2** | Same general region, different content. We swapped avatar→theme toggle |
| 2 | Sidebar nav structure | Nested groups: My Linktree (Links/Shop/Design) + Earn + Audience + Insights + Tools (Social planner/IG auto-reply/Link shortener/Post ideas) | Flat 5 items: Page / Design / Insights / Shop / Settings | **2** | Different IA — we collapsed nesting, no Tools group, no Earn |
| 3 | Page / Links tab IA | Profile header (avatar+name+bio+social row+pencil) → "+Add" big button → "Add collection" / "View archive" chips → block cards | Profile card (avatar+name+bio+handle+socials+pencil) → "+ Add block" button → "Add collection" / "View archive" chips → block list | **4** | Same primitives, same chip names, same order. Risky |
| 4 | Block row anatomy | Platform name + URL + edit pencil + actions row + toggle + delete | Drag handle + brand-icon + name + URL + toggle + ⋯ menu | **3** | Similar elements, our drag handle and ⋯ menu are different from LT's inline actions |
| 5 | Add Block modal | "Add" header + close X + "Paste or search a link" + left rail (Suggested/Commerce/Social/Media/Contact/Events/Text/View all) + 4 featured tiles + integration list | "Add a block" header + close X + "Paste a URL or search…" + left rail (Suggested/Link/Social/Media/Commerce/Contact/Events/Text/Layout) + featured tiles per category + integration list | **4** | Same overall shape; we added Link + Layout categories + URL auto-detect chip. Category names + order largely overlap |
| 6 | Design sub-nav | Theme / Header / Wallpaper / Text / Buttons / Colors / Footer | Theme / Header / Wallpaper / Text / Buttons / Animations / Colors / Footer | **5** | **Critical**: 7 of 7 LT items in identical order; we inserted Animations as #6. Same sub-tab labels |
| 7 | Theme presets | Several preset thumbnails | 8 preset tiles + AI theme matcher card | **2** | We added AI matcher with token meter; novel |
| 8 | Header sub-tab | Profile image + Layout (Classic/Hero) + Title field + Title style (Text/Logo) + Size (Small/Large) + Alt-font toggle + Title font color | Same set of fields | **5** | **Critical**: same field names + same ordering + same toggles |
| 9 | Wallpaper picker | 6 tiles: Fill / Gradient / Blur / Pattern / Image (Pro) / Video (Pro) + Background color hex | Same 6 tiles + same Pro flags + Background color hex | **5** | **Critical**: identical vocabulary, identical Pro gating, identical color picker placement |
| 10 | Buttons sub-tab | Style / corner radius / shadow / button color | Style / corner / shadow / color | **4** | Same conceptual axes |
| 11 | Text sub-tab | Font picker + page text color + alt-title-font toggle + title size | Font picker + colors + sizes | **3** | Similar; we use a different font shortlist |
| 12 | Colors sub-tab | Background / Buttons / Text — 3 token model | Primary / Text / Background — 3 token model | **3** | Same count + concept; renamed first |
| 13 | Footer sub-tab | "Hide Linktree footer" toggle (paid feature) | "Custom text / Social handles / Empty" 3-radio + AP-001 explainer | **1** | **Different by design** — we explicitly do NOT have a "Powered by" toggle (AP-001). This is a differentiation receipt |
| 14 | Live preview placement | Right side, fixed phone mockup | Right side, phone mockup | **3** | Same general placement; we have a 3-way device toggle (Mobile/Tablet/Desktop) — LT has none |
| 15 | First-time / welcome | "Create your Linktree" coachmark + setup-checklist widget | Dismissible "Your page is live" banner + "Copy link" CTA + 142-visits-this-week stat | **1** | Different framing entirely |
| 16 | Setup checklist gamification | "Your setup checklist 4/6" with Finish setup CTA, scratch-out completed items | None — explicitly avoided | **1** | We deliberately rejected this pattern |
| 17 | Premium gating presentation | Big modal "Try it for free" + paywall-style cards mid-content | Inline `💡 Creator/Pro` pill + soft confirm "Add as placeholder?" | **1** | Different: AP-028 inline vs blocking |
| 18 | Insights surface | 3 stat cards (Views/Clicks/New contacts) + activity chart + "Unlock powerful insights" Pro upsell + Social-follower-growth + Most-engaging-posts cards | Placeholder ("Coming in next iteration") | **N/A** | Not yet built — won't audit |
| 19 | Settings IA | Subscribe / SEO / Affiliate / Billing / Support / Sensitive / Integrations / Account / Workspaces / Delete | Placeholder | **N/A** | Not yet built |
| 20 | Mobile responsive | Sidebar collapses to top hamburger; preview hidden on mobile | Bottom tab bar (5 icons) + sidebar hidden + preview stacks below | **2** | Different mobile pattern |
| 21 | Branding (typography) | Geist sans + neutral grays | Crimson Pro serif (display) + Inter sans + Indigo Serif palette + warm amber accent | **1** | Clearly distinct |
| 22 | Motion language | None — static dashboard | Motion v10 logo (orbit + 4-edge spotlight) + Animations sub-tab + ta-da-reveal preset | **1** | Distinct, ours is a brand pillar |
| 23 | AI features | None visible in dashboard chrome (Linktree's AI chat is a separate panel) | AI theme matcher in Design > Theme + token meter (10/40/200 per tier) | **1** | Different concept entirely |

## Detailed findings on high-similarity components

### #6 — Design sub-nav (Sim 5)

**Most damaging finding.** Linktree's Design left-rail order: `Theme · Header · Wallpaper · Text · Buttons · Colors · Footer`. Our order: `Theme · Header · Wallpaper · Text · Buttons · Animations · Colors · Footer`. Seven of seven items match by name and ordinal position; we only inserted one new item between Buttons (#5) and Colors (#7).

This is the cleanest IA-copy argument a hostile reviewer could make. Standard SaaS tabs vary on label and order; we matched both.

### #8 — Header sub-tab (Sim 5)

Linktree's Header sub-tab fields, top-to-bottom: Profile image (with Edit) → Profile image layout (Classic / Hero toggle) → Title text input → Title style (Text / Logo toggle) → Size (Small / Large toggle) → Alternative title font (toggle) → Title font color (hex). Our Header sub-tab has the identical six fields in the identical order with the identical toggle vocabulary (Classic/Hero, Text/Logo, Small/Large).

### #9 — Wallpaper picker (Sim 5)

Linktree's six wallpaper tiles, in order: Fill / Gradient / Blur / Pattern / Image / Video. Image and Video are Pro-gated with a small lightning badge. Our six tiles are exactly the same: Fill / Gradient / Blur / Pattern / Image / Video, with Image and Video flagged 💡 Creator. Same 6, same order, same Pro gating.

### #5 — Add Block modal (Sim 4)

Linktree's left-rail categories: Suggested / Commerce / Social / Media / Contact / Events / Text / View all. Ours: Suggested / Link / Social / Media / Commerce / Contact / Events / Text / Layout / View all. We added Link and Layout, and reshuffled Commerce slightly. Modal shape (header / search / left rail / featured tiles / list) is the standard "Notion add menu" pattern but the category vocabulary overlap is high.

### #3 — Page tab IA (Sim 4)

Profile card (avatar + name + bio + socials + pencil) above an "+Add" button above "Add collection" / "View archive" chips above a block list. Linktree uses precisely this hierarchy with these chip labels. We use the same hierarchy with the same chip labels.

## Final verdict

**MEDIUM risk.** Approximately 60% of the dashboard surface is meaningfully differentiated (typography, palette, motion, AI features, animations sub-tab, three-way device toggle, light/dark, footer no-brand-toggle, sticky no-upsell modals, no setup-checklist widget). 30% is industry-standard pattern (sidebar + main + preview) which is not plagiarism. The remaining 10% — Design sub-nav order, Header field order, Wallpaper vocabulary, Add Block category names — could be cited as IA copy. None alone is fatal; together they form a pattern.

A hostile blog post in Polish dev Twitter would lead with "look at the Wallpaper tile vocabulary" because it screenshots well. A measured product-strategy reviewer would say "they're a Linktree alternative built differently, but they didn't reinvent the IA." A copyright lawyer would say "no claim — nothing in here is protectable beyond the visual rendering, and the visual rendering is clearly different."

The risk is **reputational, not legal**. Reputational risk hurts launch goodwill in creator Twitter, Polish indie-hacker community, and dev-tools-ProductHunt. Worth fixing before public launch.

## Change recommendations (ranked by impact)

1. **Reorder + rename Design sub-nav** to break the 1:1 mapping. Suggested order with renames: `Theme · Profile · Background · Type · Buttons · Animations · Tokens · Foot­note`. Or restructure into three groups: *Identity* (Theme + Profile) / *Surface* (Background + Type + Buttons + Animations) / *Page* (Tokens + Footnote). Either approach drops Sim from 5 to 2. **High impact, low effort.**

2. **Rename Wallpaper tiles** to a fresh vocabulary. Suggested: `Solid · Gradient · Soft glow · Pattern · Photo · Motion`. Same options, distinct names. Drops Sim from 5 to 2. **High impact, trivial effort.**

3. **Reorder Header fields + fold the toggles into a single layout picker.** Replace the six discrete fields with: a "Profile layout" tile-grid (Classic Card / Hero Cover / Sidebar Compact) + a single "Title styling" inline editor (font + size + color in one row). Drops Sim from 5 to 2. **Medium impact, medium effort.**

4. **Reorder Add Block categories.** Lead with `Link · Social · Media · Smart picks · Commerce · Inbox · Calendar · Words · Layout`. Different first three, different anchor names ("Inbox" not "Contact", "Calendar" not "Events", "Words" not "Text"). Drops Sim from 4 to 2. **Medium impact, low effort.**

5. **Replace "Add collection" / "View archive" chips** with a dropdown trigger labelled "Organise…" that contains Group, Archive, Reorder, Export. Different metaphor (organise verb vs collection noun). Drops Sim on #3 from 4 to 2. **Low impact, low effort.**

6. **Add a non-Linktree primitive to the Page tab.** Suggestion: a "Pinned message" section above the profile card — a single fading line ("📣 New course drops Friday — set a reminder?") that the creator can write once and toggle. No competitor has this; it adds a tadaify-only surface. **Low impact, low effort, high differentiation.**

Implementing recommendations 1, 2, 4 alone drops the audit verdict to Low without removing any user-facing capability.

## Related research

- `multi-page-grid-and-templates.md` — three pending DECs on multi-page accounts, grid layouts, and API-driven page templates. Touches dashboard IA decisions (a Pages section in the sidebar would further differentiate from Linktree's single-page-only tool).
