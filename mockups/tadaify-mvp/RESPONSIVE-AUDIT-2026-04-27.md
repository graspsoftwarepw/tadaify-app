# Responsive audit 2026-04-27 — 3 viewports

Coverage: every `mockups/tadaify-mvp/*.html` (53 files) audited against
the tadaify 3-viewport contract:

| Viewport | Width  | Device target           |
|----------|--------|-------------------------|
| Desktop  | 1280px | laptops, monitors       |
| Tablet   | 820px  | iPad portrait           |
| Mobile   | 390px  | iPhone 14 Pro portrait  |

Source rule: `feedback_tadaify_three_viewport_support.md` (locked
2026-04-27).

## Tooling

- **Phase 1 — static analysis**: Python parser of inline `@media` rules
  per file. Identified missing tablet-tier breakpoints, fixed-width
  containers without responsive override, multi-col grids without
  intermediate stop, sidebars without responsive rule, modals without
  viewport clamp. Output: `/tmp/responsive-audit-static.json`.
- **Phase 2 — browser preview**: `Claude_Preview` MCP server pointed at
  a local Python static server rooted at `mockups/tadaify-mvp/` (port
  4488; entry `tadaify-mockups` in
  `~/git/claude-project-orchestrator/.claude/launch.json`). Used to
  validate the partial-sidebar fix (manual click-through on
  `app-page-blog.html` at 390/820/1280) and one creator-public page
  before-and-after.

## Phase 1 verdict

| Risk    | Files | Reason                                                            |
|---------|------:|-------------------------------------------------------------------|
| High    | 19    | No explicit tablet breakpoint AND multi-col grid OR fixed widths > 700px OR modal without viewport clamp |
| Medium  | 25    | Sidebar-using app pages — flagged because per-file CSS lacked sidebar mq, but the shared partial DID handle it (false positive on per-file scan; real issue: no mobile hamburger replacement) |
| Low     | 9     | All 3 viewport tiers covered                                       |

## Fixes applied

### 1. Shared sidebar partial — mobile hamburger + drawer

`shared/partials.js` updated. Affects 23 app pages that use
`<div data-partial="app-sidebar">`.

Before: at <720px the sidebar set `display: none` with no replacement
nav. Mobile users had no way to navigate.

After:

- A 65px sticky `.tdf-mobile-topbar` is auto-injected at the top of
  body when the sidebar partial is present. Visible only at <720px.
  Contains a 44×44 hamburger button + brand mark.
- When toggled open, `aside.tdf-side.is-open` becomes a full-screen
  centered modal sheet (per `feedback_no_right_side_drawers` — modal
  pattern, not slide-in panel).
- Backdrop overlay, body scroll-lock, ESC-to-close, link-click
  auto-close, ARIA expanded/controls wired.
- Touch-target floor 44px on mobile per WCAG / Apple HIG.

Verified at 390/820/1280 — drawer opens and closes correctly, sidebar
at 820 is the icon-only 72px rail (existing partial behaviour
preserved), sidebar at 1280 is the full 240px expanded form.

### 2. Tablet-tier (600–1023px) injection in 24 files

A single inline `<style data-source="responsive-tablet-tier">` block
injected before `</head>` of each high-risk file. Block targets common
class names: `.feed`, `.related-grid`, `.grid-3`, `.grid-4`,
`.features-grid`, `.three-col`, `.four-col`, `.cards-grid`,
`.links-grid`, `.blocks-grid`, `.shop-grid`, `.testimonial-grid`,
`.pricing-grid`.

- Tablet: 3+ col grids → 2 col; container padding 24px; hero scaled.
- Mobile: grids → 1 col with 16px gap; container padding 16px; 44px
  touch-target floor on `.btn` / `a.btn` / `.nav-links a`.
- All viewports: modal classes (`.modal`, `.modal-card`,
  `.modal-dialog`, `.tdf-modal`, `.modal-content`) clamped to
  `max-width: min(960px, calc(100vw - 32px))` and `max-height:
  min(92vh, 920px)` with `overflow-y: auto`. At <600px modals get
  tighter bounds + 14px border-radius.

Marker `data-source="responsive-tablet-tier"` makes the script
idempotent.

#### Files injected

- creator-public set (8): `creator-about-public.html`,
  `creator-blog-public.html`, `creator-contact-public.html`,
  `creator-custom-public.html`, `creator-faq-public.html`,
  `creator-newsletter-signup-public.html`, `creator-public.html`,
  `creator-schedule-public.html`
- modals (2): `app-ai-suggest-modal.html`, `app-tier-gate-modal.html`
- onboarding (4): `onboarding-complete.html`,
  `onboarding-social.html`, `onboarding-template.html`,
  `onboarding-tier.html`
- auth/landing (5): `login.html`, `pricing.html`, `try.html`,
  `error-pages.html`, `index.html`
- app pages with modals lacking viewport clamp (5):
  `app-dashboard.html`, `app-dashboard-variants.html`,
  `app-settings.html`, `app-settings-danger.html`,
  `app-settings-gdpr.html`

## Per-file × per-viewport summary

| File | Desktop | Tablet | Mobile |
|------|:-------:|:------:|:------:|
| admin-panel.html | ok | ok | ok |
| app-ai-suggest-modal.html | ok | fixed | fixed |
| app-block-editor.html | ok | ok | fixed (sidebar) |
| app-block-picker.html | ok | ok | fixed (sidebar) |
| app-dashboard.html | ok | ok | fixed (modal clamp) |
| app-dashboard-variants.html | ok | ok | fixed (modal clamp) |
| app-domain.html | ok | ok | fixed (sidebar) |
| app-insights.html | ok | ok | fixed (sidebar) |
| app-page-* (12) | ok | ok | fixed (sidebar) |
| app-settings*.html (8) | ok | ok | fixed (sidebar) |
| app-settings.html | ok | ok | fixed (sidebar + modal) |
| app-tier-gate-modal.html | ok | fixed | fixed |
| creator-about-public.html | ok | fixed | fixed |
| creator-blog-public.html | ok | fixed | fixed |
| creator-contact-public.html | ok | fixed | fixed |
| creator-custom-public.html | ok | fixed | fixed |
| creator-faq-public.html | ok | fixed | fixed |
| creator-legal-public.html | ok | ok | ok |
| creator-links-archive-public.html | ok | ok | ok |
| creator-newsletter-signup-public.html | ok | fixed | fixed |
| creator-portfolio-public.html | ok | ok | ok |
| creator-public.html | ok | fixed | fixed |
| creator-schedule-public.html | ok | fixed | fixed |
| error-pages.html | ok | fixed | fixed |
| index.html | ok | fixed | fixed |
| landing.html | ok | ok | ok |
| login.html | ok | fixed | fixed |
| onboarding-blocks.html | ok | ok | ok |
| onboarding-complete.html | ok | fixed | fixed |
| onboarding-social.html | ok | fixed | fixed |
| onboarding-template.html | ok | fixed | fixed |
| onboarding-tier.html | ok | fixed | fixed |
| onboarding-welcome.html | ok | ok | ok |
| pricing.html | ok | fixed | fixed |
| product-public.html | ok | ok | ok |
| register.html | ok | ok | ok |
| try.html | ok | fixed | fixed |

`fixed (sidebar)` = was broken at <720px (no nav), now mobile drawer
via shared partial fix.
`fixed` = added explicit tablet-tier breakpoint + grid clamp.
`fixed (modal clamp)` = modal would have overflowed; clamp added.

## Report-only / future work

Minor cosmetic items NOT auto-fixed (require designer judgment):

1. **`creator-portfolio-public.html`** — uses
   `repeat(auto-fit, minmax(...))` already; no fix needed but the
   minmax floor (currently 280px) could be raised to 320px on tablet
   to keep cards readable. **Not blocking.**
2. **`landing.html`** — hero `<h1>` font-size jumps from 56px desktop
   to 32px mobile via existing media queries. The intermediate at
   tablet width (820px) is 56px which is fine but tight. **Not
   blocking.**
3. **`app-dashboard.html` / `app-dashboard-variants.html`** — these
   files have their own bespoke `<aside>` (do NOT use the shared
   sidebar partial). The shared mobile drawer fix does NOT apply to
   them. The `<aside>` in `app-dashboard.html` has its own `@media
   (max-width: 1023px)` rules that hide it. **Recommend follow-up**:
   either migrate them to the shared partial, or replicate the mobile
   topbar pattern in their inline CSS.
4. **`shared/header.html`** — marketing nav (`.nav-links`) still wraps
   to a second line at 600-800px on landing/pricing/etc. Needs a
   hamburger pattern symmetrical to the app-sidebar fix. Out of scope
   for this audit. **Recommend follow-up issue.**

## Verification

- Browser preview server at port 4488 (rooted at this directory).
- Manually verified `app-page-blog.html` and `creator-blog-public.html`
  at 390×844, 820×1180, 1280×800 — drawer opens/closes, grids reflow
  correctly, no horizontal scroll, modals fit viewport.
- Static analysis re-run after fixes: 0 high-risk files remain (all
  19 either got the tablet-tier injection or are sidebar-only false
  positives now covered by the partial).

## Commits

1. `chore(responsive): mobile hamburger + drawer for shared sidebar partial`
   — `shared/partials.js`
2. `chore(responsive): inject tablet-tier (600-1023px) breakpoints +
   modal viewport clamp` — 24 mockup HTML files
3. `docs(audit): responsive audit report 2026-04-27` — this file
