<!-- Domain knowledge for realistic, rule-valid data + design. Hand-authored (not generated). -->

# tadaify — domain

> The always-on domain model every other skill reads before designing a screen, writing a
> requirement, seeding data, or asserting a test. It captures *what the app is*, *who it serves*, and
> *the rules reality and the business impose on any record*. Grounded in the live code, the
> requirement records (`docs/requirements/`), and the Owner — not in any external decision log.

## What the app is

tadaify is a **creator link-in-bio platform**: each creator gets one public page at
`tadaify.com/<handle>` that aggregates their links, content, and commerce, plus an authenticated
dashboard at `/app` to build and measure it. It is a direct competitor to Linktree and Beacons, and is
**signup-first** — there is no guest editor; you register before you build.

Everything lives under one domain: the marketing site, the public creator pages, and the dashboard
share `tadaify.com`, with the handle namespace (`tadaify.com/<handle>`) reserved for creator pages.

## Who the customers are

The **paying customer is the creator** — an individual or small team with an audience who needs a
single shareable hub. Four creator archetypes double as the canonical "souls" for realistic fixtures:

- **Solo content creator** (musician, artist, streamer, writer) — links, music/video embeds, a
  newsletter, maybe a paid article or merch link. The default persona.
- **Coach / educator** (fitness, courses) — booking/schedule, FAQ, products, lead-capture newsletter.
- **Small business / shop** — product blocks, external store links, contact form.
- **Agency** — manages multiple creator pages; the audience for the top Business tier.

The **served-but-not-paying audience** is the creator's own visitors/fans, who never hold a tadaify
account — they consume the public page (click links, subscribe, buy via external links, book).
Prospective creators are anonymous visitors on the marketing site who claim a handle and register.

## Domain narrative

A creator **registers** by claiming a unique `@handle` on the landing page, verifies via 6-digit
email-OTP, and the handle is then **permanently bound** to the account
(`BR-AUTH-001/002/003`, `app/lib/handle-validator.ts`). A **5-step onboarding wizard** (platform
picker → social-handle entry → profile → template → read-only plan overview), followed by a separate
success/complete screen, seeds the first page from handle-based social-import (no platform OAuth).

The creator then works in the **dashboard** (`/app`): a page is an ordered list of **blocks**
(link button, image, embed, heading, divider, social row, newsletter signup, product, video,
FAQ/accordion, custom HTML, countdown — 12 types at MVP; livestream is a commented v2 candidate).
Blocks are edited in a **centered modal** (never a right-side slide-in drawer), each with a
type-specific form, a live preview, and tier-gated extras (schedule visibility, A/B testing). The
creator customizes theme/layout (stack or grid), publishes, and watches **Insights** (every
interaction is tracked at every tier; cookieless unique visitors via a daily salt —
`app/lib/insights/`).

The public page at `tadaify.com/<handle>` is what the audience sees: profile card, optional pinned
message, the published blocks, and sub-pages (about, blog, portfolio, contact, FAQ, schedule,
products, newsletter, paid articles, legal). Renaming a handle keeps the old URL redirecting for a
grace period.

Money flows two ways: **subscription** (the creator pays tadaify; Stripe) and **the creator's own
commerce** (product blocks link out to the creator's external store; tadaify does not process the
creator's sales at MVP).

## Tiers & gating

Four flat tiers, USD, with **honest gating** — no fake limits: the premium UI stays visible and
editable, and the gate asserts at save (`app/lib/tier-gate.ts`, `feedback_no_blur_premium_features`):

| Tier | Headline unlocks |
|---|---|
| **Free** | Page + blocks + basic insights; small monthly AI-credit allowance |
| **Creator** | Custom domain (1), schedule-visibility, larger AI allowance |
| **Pro** | Creator API + MCP, deeper insights, larger AI allowance |
| **Business** | A/B testing, team members, agency capabilities, unlimited AI |

> Exact prices, AI-credit numbers, API rate limits, and team/handle caps are owned by the live billing
> code and pricing page, not this doc — **confirm current values with the Owner / `SettingsBilling`
> before quoting them.** Price is locked for the life of an uninterrupted subscription.

## Invariants (rules any record / design must obey)

- **One account ↔ one permanently-bound handle.** A handle is claimed at register, OTP-verified, then
  immutable; it cannot be transferred or reused while held. A short reservation prevents the
  landing→register race (`BR-AUTH-003/007`). At MVP a single creator account drives a single page.
  Business-tier agency / multi-handle capability is **not assumed by MVP design or data — confirm
  scope with the Owner** before modelling cross-account behaviour.
- **Signup-first.** No page, block, or dashboard state exists without a verified account; there is no
  anonymous-authored content.
- **A page is an ordered list of blocks.** Block order is creator-defined; a block has exactly one of
  the 12 MVP types; visibility can be scheduled (Creator+) and is otherwise "always visible".
- **Tier gating is honest and asserted at save, never faked in the UI.** A below-tier creator may open
  and fill a premium control (A/B variant B, schedule dates); the gate fires only on save with an
  upgrade prompt — the UI is never blurred or disabled (`app/lib/tier-gate.ts`).
- **Every interaction is tracked at every tier; analytics are cookieless.** Click/visit events exist
  for Free too; what differs by tier is the *query window / refresh cadence*, not the collection
  (`app/lib/insights/`).
- **AI credits are one shared monthly bucket** spent by all AI features (text-only at MVP: theme
  matcher, bio rewrite, copy suggest).
- **Trust commitments are binding:** no "Powered by tadaify" watermark (self-referral is opt-in);
  price-lock honoured; **Creator Safeguard** before any account-level moderation (advance notice +
  human appeal + prorated refund for prepaid annual).
- **Marketing previews are admin-only and never public.** No `tadaify.com/preview/<handle>`; previews
  live on `preview.tadaify.com/<slug>` with a mandatory "not live" disclosure the admin cannot disable.
- **Auth providers at MVP: Google + X + Email-OTP only.**

## Out of scope at MVP (so data/design don't assume them)

Multi-**page** accounts (a single creator running several distinct pages) are post-MVP. tadaify does
not process the creator's own product sales (product blocks link out); marketing is EN-only at launch.
Business agency / multi-**handle** scope is unconfirmed here — treat as not-yet-built and confirm with
the Owner.

## See also

- Who-can-do-what-where: [`audiences.md`](./audiences.md).
