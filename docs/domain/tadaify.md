<!-- Domain knowledge for realistic, rule-valid data + design. Hand-authored (not generated). -->

# tadaify — domain

> The always-on domain model every other skill reads before designing a screen, writing a
> requirement, seeding data, or asserting a test. It captures *what the app is*, *who it serves*, and
> *the rules any record must obey*. Grounded in the Owner's product concept and the live code
> (`app/`, `docs/requirements/`) — not in any external decision log.

## What the app is

**tadaify** turns the "**ta-da!**" moment into a product — the *"look at me, here I am, let me show you
who I am"* reveal. It is the page where a person introduces themselves and shows off what they do. Think
Linktree, but **broader and all-in-one**: not just a list of links, but a single hosted page that can
carry whatever the creator wants to show.

The defining choice is **template-first, not a freeform builder**. tadaify is *not* a generic
drag-a-component website builder. The creator picks a beautiful predefined template and clicks together
their page in a few steps. It must be fast and genuinely useful for creators and influencers who want to
put themselves out there *right now*, without design work.

Everything lives under one domain: the marketing site, the hosted public creator pages, and the
dashboard share `tadaify.com`, with the handle namespace (`tadaify.com/<handle>`) reserved for the
creator pages our engine hosts.

## Modular content — "anything we can think of"

A creator's page is assembled from **modules / block types**, and the set is deliberately extensible —
we can keep adding new kinds. Today's kinds and the direction:

- **Links** — plain redirects to the creator's existing presence (a YouTube channel or episode, a
  social profile, an external store, anything with a URL).
- **Blog** — posts the creator writes and clicks together on tadaify itself.
- **Paid articles** — gated long-form content.
- **Shop / Store** — the creator builds their own storefront surface.
- **Profiles / specialised modules** — e.g. a trader profile, and whatever future module a creator
  type needs.

The point is the *modular system*: tadaify can host many surface types (about, blog, portfolio,
contact, FAQ, schedule, products, newsletter, paid articles, …) and grow new ones, all under one page.

## Who the customers are

The **paying customer is the creator / influencer** — someone who wants their page up fast and to show
themselves. A second, important slice of the market: people **tired of being annoyed** by Linktree or
similar products (cookie nags, paywalled basics, forced branding) who come to tadaify for relief. The
**served-but-not-paying audience** is each creator's own followers / subscribers / visitors, who never
hold a tadaify account — they just visit the hosted page.

## What sets tadaify apart (positioning)

- **Privacy-first.** No cookies, no annoying cookie-consent nag. Analytics are counted a different,
  cookieless way (`app/lib/insights/` — daily-salt visitor hashing), so creators still get their
  numbers without tracking visitors.
- **Mostly free.** Anything that costs tadaify nothing to provide is **not** artificially paywalled.
  Free is genuinely generous; this is a deliberate wedge against competitors that charge for basics.
- **Competitively priced**, and **cheap to remove the brand.** Unlike rivals that lock "Powered by …"
  removal behind expensive tiers, tadaify lets a creator drop the "Powered by tadaify" mark very
  cheaply.
- **Community-first.** Product direction is driven by users. In parallel we build a companion,
  **"ask before ship"** — an embeddable feedback **board / widget** where users post and **vote** on
  what they need; the team ships the winners on a short cadence. The same community-first ethos is a
  tadaify principle, not just a side app.

## How a creator uses it

A creator claims a unique `@handle`, verifies via email-OTP, and the handle is then bound to their
account (`app/lib/handle-validator.ts`, `BR-AUTH-*`). A short, template-driven onboarding seeds their
first page. From the **dashboard** (`/app`) they add and arrange modules, customise the look from the
template, publish, and watch their **(cookieless) insights**. The public page at `tadaify.com/<handle>`
is what their audience sees: profile, the published modules, and any sub-pages.

Money flows two ways: the creator's **subscription** to tadaify (paid features / cheap branding
removal), and the creator's **own commerce** (shop / product / paid-article modules — external sales
links are the creator's; tadaify hosts the surface).

## Tiers & gating (principle, not price list)

A free-heavy model with paid unlocks. The gating principle is **honest**: free is generous, paid
features are the ones that genuinely cost tadaify to run, and the premium UI is never faked — a
below-tier creator can see and try a premium control; the gate asserts at **save** with an upgrade
prompt, never a blur or a disabled button (`app/lib/tier-gate.ts`).

> Exact tier names, prices, AI-credit allowances, and limits are owned by the live billing code and the
> pricing page — **confirm current values with the Owner / `SettingsBilling` before quoting them.**

## Invariants (rules any record / design must obey)

- **One account ↔ one bound handle.** A handle is claimed at register, OTP-verified, then bound to the
  account; a short reservation prevents the landing→register race (`BR-AUTH-*`). One creator account
  drives one hosted page.
- **The build model is template-first.** A page is a template plus an ordered set of modules; design is
  picked, not hand-coded. Don't model a freeform component builder.
- **Modules are an open, extensible set.** Treat the block/module catalogue as growing; never hard-code
  an assumption that the list is closed.
- **Privacy-first analytics.** Visitor measurement is cookieless and consent-nag-free; every
  interaction can be counted at every tier, with tier affecting the *view/retention window*, not the
  collection (`app/lib/insights/`).
- **Honest gating, asserted at save.** Premium UI stays visible and editable; the gate fires at save.
- **Branding removal is a cheap, first-class unlock**, not an expensive top-tier gate.
- **Community-first delivery** via the "ask before ship" board: user-voted features on a short cadence.

## Companion product

**ask before ship** — an embeddable feedback board/widget (post + vote) that any product, including
tadaify, can attach to collect and prioritise user requests. It encodes tadaify's community-first
principle; treat it as a sibling in the same ecosystem.

## See also

- Who-can-do-what-where: [`audiences.md`](./audiences.md).
