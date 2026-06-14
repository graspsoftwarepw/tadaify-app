<!-- Domain knowledge for realistic, rule-valid data + design. Hand-authored (not generated). -->

# tadaify — domain

> The always-on domain model every other skill reads before designing a screen, writing a
> requirement, seeding data, or asserting a test. It captures *what the app is*, *who it serves*, and
> *the rules reality and the business impose on any record*. Authority for each rule is named where one
> exists (DEC = decision record under `docs/decisions/`, BR = `docs/requirements/business/`,
> FR = `docs/requirements/frontend/`).

## What the app is

tadaify is a **creator link-in-bio platform**: each creator gets one public page at
`tadaify.com/<handle>` that aggregates their links, content, and commerce, plus an authenticated
dashboard at `/app` to build and measure it. It is a direct competitor to Linktree and Beacons, and is
**signup-first** — there is no guest editor; you register before you build ([DEC-355](../decisions/0049-drop-f001-guest-mode-signup-first.md)).

Everything lives under one domain ([DEC-DOMAIN-01](../decisions/0001-single-domain-architecture.md)):
the marketing site, the public creator pages, and the dashboard share `tadaify.com`, with the handle
namespace (`tadaify.com/<handle>`) reserved for creator pages.

## Who the customers are

The **paying customer is the creator** — an individual or small team with an audience who needs a
single shareable hub. The platform's own positioning targets four creator archetypes, which double as
the canonical "souls" for realistic fixtures:

- **Solo content creator** (musician, artist, streamer, writer) — links, music/video embeds, a
  newsletter, maybe a paid article or merch link. The default persona.
- **Coach / educator** (fitness, courses) — booking/schedule, FAQ, products, lead-capture newsletter.
- **Small business / shop** — product blocks, external store links, contact form.
- **Agency** — manages multiple creator pages; the audience for the Business tier. The accepted
  decision ships the **full** Business tier at MVP, explicitly including agency sub-accounts (one
  master account managing N creator pages — [DEC-Q5-A](../decisions/0014-full-business-tier-at-mvp.md),
  F-BIZ-001). This is in tension with an engineering note that flags multi-handle as SPIKE-gated; the
  conflict is unresolved — see [*Open reconciliation*](#open-reconciliation). It is treated as
  accepted-but-not-yet-built, not out of scope.

The **served-but-not-paying audience** is the creator's own visitors/fans, who never hold an account on
tadaify — they consume the public page (click links, subscribe, buy via external links, book).
Prospective creators are anonymous visitors on the marketing site who claim a handle and register.

## Domain narrative

A creator **registers** by claiming a unique `@handle` on the landing page, verifies via 6-digit
email-OTP, and the handle is then **permanently bound** to the account
([BR-AUTH-001/002/003](../requirements/business/INDEX.md)). A **5-step onboarding wizard** (platform
picker → social-handle entry → profile → template → read-only plan overview —
[BR-ONBOARDING-001…005](../requirements/business/INDEX.md)), followed by a separate success/complete
screen ([BR-ONBOARDING-006](../requirements/business/INDEX.md)), seeds the first
page from handle-based social-import (no platform OAuth — [DEC-SOCIAL-01](../decisions/0011-social-import-handle-based.md),
[DEC-026](../decisions/0026-platform-oauth-import-rejected.md)).

The creator then works in the **dashboard** (`/app`): a page is an ordered list of **blocks**
(link button, image, embed, heading, divider, social row, newsletter signup, product, video,
FAQ/accordion, custom HTML, countdown — 12 types at MVP; livestream is a commented v2 candidate).
Blocks are edited in a **centered modal** (never a right-side drawer — locked edit-view rule), each
with a type-specific form, a live preview, and tier-gated extras (schedule visibility, A/B testing).
The creator customizes theme/layout (stack or grid — [DEC-LAYOUT-01](../decisions/0025-grid-layout-ships-mvp.md);
hero layouts — [DEC-SYN-04](../decisions/0020-hero-layouts-five-defaults.md)), publishes, and watches
**Insights** (every interaction is tracked at every tier — [DEC-077](../decisions/0040-click-event-coverage-all-tiers.md);
cookieless unique visitors via daily salt — [DEC-075](../decisions/0038-cookieless-unique-visitor-daily-salt.md)).

The public page at `tadaify.com/<handle>` is what the audience sees: profile card, optional pinned
message, the published blocks, and sub-pages (about, blog, portfolio, contact, FAQ, schedule, products,
newsletter, paid articles, legal). Renaming a handle keeps the old URL redirecting for a 30-day grace
period ([DEC-074](../decisions/0037-handle-redirect-30day-grace.md)).

Money flows two ways: **subscription** (the creator pays tadaify; Stripe — [DEC-073](../decisions/0036-billing-hybrid-stripe-portal.md))
and **the creator's own commerce** (product blocks link out to the creator's external store; tadaify
does not process the creator's sales at MVP).

## Tiers & gating

Four flat tiers, USD ([DEC-036](../decisions/0005-usd-currency.md)), "everything-free" honest gating —
no fake limits, premium UI stays visible and editable, gating asserts at save
([DEC-043](../decisions/0007-everything-free-gating.md), `feedback_no_blur_premium_features`):

| Tier | Price | Headline unlocks |
|---|---|---|
| **Free** | $0 | Page + blocks + basic insights; AI 5 credits/mo |
| **Creator** | $7.99/mo | Custom domain (1), schedule-visibility, AI 20/mo |
| **Pro** | $19.99/mo | Creator API + MCP (100 req/h), deeper insights, AI 100/mo |
| **Business** | $49.99/mo | A/B testing, team (10 members), 5 handles*, AI unlimited |

Authority: [DEC-279](../decisions/0009-pricing-final-7.99-19.99.md), [DEC-287](../decisions/0047-business-pricing-49.99.md),
[DEC-AI-QUOTA-LADDER-01](../decisions/0030-ai-credits-unified-ladder.md),
[DEC-CREATOR-API-01](../decisions/0029-creator-api-pro-tier.md). Price is **locked for life** for an
uninterrupted subscription ([DEC-PRICELOCK-01](../decisions/0027-price-lock-for-life.md)). Extra custom
domain is a universal $1.99/mo add-on ([DEC-PRICELOCK-02](../decisions/0028-domain-addon-pricing.md)).
*Agency sub-accounts / multi-handle (Business) are accepted for MVP per
[DEC-Q5-A](../decisions/0014-full-business-tier-at-mvp.md) but engineering-flagged as SPIKE-gated —
see [*Open reconciliation*](#open-reconciliation).

## Invariants (rules any record / design must obey)

- **One account ↔ one permanently-bound handle.** A handle is claimed at register, OTP-verified, then
  immutable; it cannot be transferred or reused while held. Reservation (15 min) prevents the
  landing→register race ([BR-AUTH-003/007](../requirements/business/INDEX.md)). For Free / Creator /
  Pro, one account = exactly one handle/page. Business is the exception: the accepted decision
  ([DEC-Q5-A](../decisions/0014-full-business-tier-at-mvp.md)) ships agency sub-accounts (one master
  managing N pages) at MVP, though this is engineering-flagged SPIKE-gated — see
  [*Open reconciliation*](#open-reconciliation). This invariant is therefore **not** unconditional.
- **Signup-first.** No page, block, or dashboard state exists without a verified account; there is no
  anonymous-authored content ([DEC-355](../decisions/0049-drop-f001-guest-mode-signup-first.md)).
- **A page is an ordered list of blocks.** Block order is creator-defined; a block has exactly one of
  the 12 MVP types; visibility can be scheduled (Creator+) and is otherwise "always visible".
- **Tier gating is honest and asserted at save, never faked in the UI.** A below-tier creator may open
  and fill a premium control (A/B variant B, schedule dates); the gate fires only on save with an
  upgrade prompt — the UI is never blurred or disabled ([DEC-043](../decisions/0007-everything-free-gating.md)).
- **Every interaction is tracked at every tier; analytics are cookieless.** Click/visit events exist
  for Free too; what differs by tier is the *query window/refresh cadence*, not the collection
  ([DEC-077](../decisions/0040-click-event-coverage-all-tiers.md), [DEC-076](../decisions/0039-insights-gating-honest-cat-abc.md),
  [DEC-075](../decisions/0038-cookieless-unique-visitor-daily-salt.md)).
- **AI credits are one shared monthly bucket** (Free 5 / Creator 20 / Pro 100 / Business unlimited),
  spent by all AI features (text-only at MVP: theme matcher, bio rewrite, copy suggest —
  [DEC-AI-FEATURES-ROADMAP-01](../decisions/0031-ai-text-only-scope.md)).
- **Trust/anti-pattern commitments are binding** ([DEC-ANTI-001…015](../decisions/0023-anti-patterns-platform-trust.md)):
  no "Powered by tadaify" watermark (self-referral is opt-in — [DEC-033](../decisions/0016-self-referral-block-not-watermark.md));
  price-lock honoured; **Creator Safeguard** before any account-level moderation (48h notice + human
  appeal via `admin_appeals` + prorated refund for prepaid annual — [DEC-SYN-05](../decisions/0021-creator-safeguard-48h-warning.md)).
- **The marketing preview generator is admin-only and never public.** No `tadaify.com/preview/<handle>`;
  previews live on `preview.tadaify.com/<slug>` with a mandatory "not live" disclosure strip the admin
  cannot disable ([DEC-MKT-B-v2](../decisions/0012-preview-generator-admin-only.md)).
- **Auth providers at MVP: Google + X + Email-OTP only** (Apple SSO dropped —
  [DEC-346](../decisions/0048-apple-sso-dropped-entirely-dec346.md)).

## Out of scope at MVP (so data/design don't assume them)

Multi-**page** accounts — a single creator running several distinct pages —
([DEC-024](../decisions/0024-multi-page-post-mvp.md)) are post-MVP. tadaify does not process the
creator's own product sales (product blocks link out); marketing is EN-only at launch
([DEC-013](../decisions/0013-en-only-marketing-at-launch.md)). Note: agency multi-**handle**
sub-accounts are a *separate* matter — accepted for MVP per DEC-Q5-A but SPIKE-flagged
(see [*Open reconciliation*](#open-reconciliation)), **not** an item on this out-of-scope list.

## Open reconciliation

One unresolved source conflict the next domain pass (or the Owner) must settle:

- **Business multi-handle / agency sub-accounts at MVP.** The accepted decision record
  [DEC-Q5-A](../decisions/0014-full-business-tier-at-mvp.md) ships the full Business tier at MVP,
  including F-BIZ-001 *agency sub-accounts* (one master account managing N creator pages) and 5 F-BIZ
  units. No accepted decision supersedes it. However, engineering context
  (`docs/agent-context/claude-full-context.md`) flags agency multi-handle as Phase-B / SPIKE-gated
  ("do NOT implement until SPIKE + sub-decisions are locked"). Until a decision record resolves this,
  this doc treats agency sub-accounts as **accepted-but-not-yet-built**: design and data may assume the
  capability exists per DEC-Q5-A, but must not assume it is implemented. The audiences matrix in
  [`audiences.md`](./audiences.md) currently models only the single-account case; the agency-master
  persona and cross-account authority rows are deferred to that reconciliation.

## See also

- Who-can-do-what-where: [`audiences.md`](./audiences.md).
- Full decision corpus: [`docs/decisions/INDEX.md`](../decisions/INDEX.md).
