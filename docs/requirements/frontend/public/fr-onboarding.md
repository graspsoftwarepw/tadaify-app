---
id: fr-onboarding
title: Creator onboarding wizard
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes:
  - /__proto/onboarding-welcome
  - /__proto/onboarding-social
  - /__proto/onboarding-profile
  - /__proto/onboarding-template
  - /__proto/onboarding-tier
  - /__proto/onboarding-complete
related_files:
  - src/proto/screens/onboarding/WelcomeScreen.tsx
  - src/proto/screens/onboarding/welcomeFixture.ts
  - src/proto/screens/onboarding/SocialScreen.tsx
  - src/proto/screens/onboarding/socialFixture.ts
  - src/proto/screens/onboarding/ProfileScreen.tsx
  - src/proto/screens/onboarding/profileFixture.ts
  - src/proto/screens/onboarding/TemplateScreen.tsx
  - src/proto/screens/onboarding/templateFixture.ts
  - src/proto/screens/onboarding/TierScreen.tsx
  - src/proto/screens/onboarding/tierFixture.ts
  - src/proto/screens/onboarding/CompleteScreen.tsx
  - src/proto/screens/onboarding/completeFixture.ts
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Creator onboarding wizard

The first-run wizard a new creator walks through after signing up. Ported from
`mockups/tadaify-mvp/onboarding-{welcome,social,profile,template,tier,complete}.html`. Five numbered
steps ("Step N of 5") followed by a post-wizard success page. Handle-based throughout — there is no
OAuth, account connection, or social scraping at any step. Colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md), so every step re-themes in
light and dark.

## Shared wizard shell

All steps render inside a shared `OnboardingShell` (shared infrastructure — not itself a listed file).
The shell provides:

- A mockup-only hub strip (wordmark, a back-to-prototype-map link, a URL pill, and the theme toggle).
- A progress region that, except on the success page, shall render the step's own "Step N of 5" label
  plus a track and a gradient fill whose width matches the step (20 / 40 / 60 / 80 / 100%).
- An optional sticky action bar with Back / Continue, a hint line, and a microcopy line. Steps that need
  more than two actions (or a single centred CTA) render their actions in the step body instead.

The wizard order is welcome → social → profile → template → tier → complete. Back and Continue/Skip are
real `/__proto/onboarding-*` links; the success page's Dashboard CTA leaves the wizard for
`/__proto/dashboard`.

## Step 1/5 — Welcome (`/__proto/onboarding-welcome`, fill 20%)

- The page shall render a hero greeting the creator by `@handle` and explain that selected platforms become
  "Follow me" link blocks (just an @handle — no account connection).
- The page shall render a multi-select grid of social platforms; tapping a card toggles its selection.
- When one or more platforms are selected, the page shall reflect the count on the Continue label, update
  the hint, and show a preview list of the "Follow me on …" blocks that will be added.
- Continue links to the social step; Back links to the prototype map.

## Step 2/5 — Your socials (`/__proto/onboarding-social`, fill 40%)

- The page shall render one handle-entry row per default platform, each with the platform icon, a URL
  prefix, a handle input, and a per-row "Skip this platform" control.
- Typing a handle shall update a live "This will appear as: Follow me on <Platform> → <url>" preview line;
  skipping a row shall dim it and replace the preview with a skipped note.
- The page shall render Back (to welcome), Skip socials (to profile) and Continue (to profile), plus a
  trust strip noting it is handle-based with no OAuth.

## Step 3/5 — Make it yours (`/__proto/onboarding-profile`, fill 60%)

- The page shall render a required display-name field, an avatar picker offering Upload or Use initials,
  and a "Write your own" bio with a 160-character counter (manual-only — no scraped pre-fill).
- Selecting Use initials shall preview the initials derived from the display name; selecting Upload shall
  trigger a mock upload action. Selecting the bio row shall reveal the textarea.
- The page shall render Back (to social), Continue (to template), a "Skip for now" link (to template), and
  a GDPR trust strip.

## Step 4/5 — Template (`/__proto/onboarding-template`, fill 80%)

- The page shall render a grid of starter templates (Chopin default, Neon, Minimal, Nightfall, Sunrise,
  Custom), each with a self-contained style preview card and a name + tagline.
- Selecting a card shall mark it and update the Continue label to "Continue with <Template>".
- The page shall render Back (to profile) and Continue (to tier).

## Step 5/5 — Compare plans (`/__proto/onboarding-tier`, fill 100%)

- The page shall render a read-only comparison of Free, Creator, Pro and Business, with Free marked as the
  creator's starting plan; no tier is selectable and there is no checkout in onboarding.
- The page shall render the price-lock-for-life guarantee, a universal $1.99/mo extra-domain add-on note,
  and fine print pointing upgrades to Settings → Billing.
- The page shall render a single "Take me to my page" CTA (to complete) and a Back link (to template).

## Complete — You're live! (`/__proto/onboarding-complete`, no progress bar)

- As the post-wizard success page, this page shall omit the progress bar.
- The page shall render the live `tadaify.com/<handle>` URL with a Copy button, a prominent "Go to
  Dashboard" CTA (to `/__proto/dashboard`), two next-step cards (Preview page, Add custom domain), a share
  row, and a dismissible affiliate tip.
- Copy, Tweet, Instagram Story and the affiliate dismiss are local state or mock actions; the next-step
  cards and affiliate set-up link are real `/__proto/*` links.

## Layout

- **Desktop / tablet:** the social, profile and template steps show a two-column layout (form left, a
  labelled live-preview placeholder right); the tier comparison shows up to four columns.
- **Phone (≤599px):** all grids and the two-column steps collapse to a single column with no horizontal
  overflow.

## Related requirements

- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
