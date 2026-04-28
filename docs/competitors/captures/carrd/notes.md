---
type: competitor-research
project: tadaify
competitor: carrd
title: Carrd — UI audit notes + desk research summary
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: audited-landing-only-2026-04-24
---

# Carrd — UI Audit Notes

## Desk Research Summary

Carrd is the **outlier** in this research set. It's not a link-in-bio
tool in the narrow sense — it's a general-purpose one-page website
builder that creators use for bio-link pages when they want design
control. Founded ~2016, still independent (no acquisition), priced
insanely cheaply at $9-$49/year (ANNUAL pricing, not monthly), it
occupies the "designer / indie hacker / HN crowd" niche.

**Pricing**: Free (3 sites, .carrd.co subdomain, "Made with Carrd"
badge), Pro Lite $9/yr, Pro Standard $19/yr (**adds custom domains
with Let's Encrypt SSL + forms + analytics + third-party widgets**,
10 sites), Pro Plus $49/yr (**adds custom code, 25 sites, downloadable
source HTML/CSS/JS**). No platform/transaction fees. 7-day free trial
of Pro features with **no credit card required**.

**Positioning**: "Simple, free, fully responsive one-page sites for
pretty much anything." No testimonials on homepage. No customer
count. Growth is organic via "Made with Carrd" badge on free sites.

**Design**: 264 templates — the biggest library in this research set.
Multi-section long-scroll layouts. Block-based editor with container
nesting. Custom CSS + JS injection on Pro Plus.

**Integrations**: embed-first rather than connector-first. Native
form integrations with Mailchimp, ConvertKit, Zapier, Google Sheets.
Unrestricted iframe embeds let creators plug in Gumroad, Stripe Links,
Shopify Buy Button, Calendly, Substack, Beehiiv, Notion, YouTube,
Spotify, TikTok/IG embeds. No native commerce. No native Instagram
auto-feed.

**API**: none public. But **Pro Plus source download** gives creators
their unminified HTML/CSS/JS — effectively zero lock-in, the
strongest data-portability story in the category.

**Reviews**: Loved by designers / developers. Hated by non-technical
creators who find the learning curve steep. Praised for price,
design flexibility, and ownership. Complained-about for lack of
native analytics, lack of pre-built integrations, no commerce out of
the box, annual-only billing. Key stat to remember (citable):
"bounce rates dropping by over 30% when switching from Linktree to a
well-designed Carrd page" [source: Mobilo's Linktree-vs-Carrd post].

**Strategic read for tadaify**:

1. **Carrd is not a direct competitor — it's a reference point for
   what design-control users want.** A tadaify that combines Carrd-
   level design flexibility with Linktree-level simplicity wins.

2. **Carrd's $/year pricing is a psychological moat.** Creators feel
   they've "bought" rather than "subscribed". Tadaify could match
   this with an annual-first headline price (while still offering
   monthly for inelastic converters).

3. **Source download is a genuinely differentiated feature.** Tadaify
   shipping a "download my page as static HTML" export on day 1 is
   a dev-friendly moat vs every competitor EXCEPT Carrd. Combined
   with Pro Plus features at a Carrd price point, this would own the
   "developer-friendly link-in-bio" niche uncontested.

4. **"Made with Carrd" → "Made with Tadaify"** — reverse-viral
   badge on free-tier pages is proven category mechanics.

5. **Carrd's complaint list (no native commerce, weak analytics,
   steep learning curve) is exactly a tadaify feature roadmap.** Ship
   a design-rich page + native commerce + decent analytics + friendly
   onboarding, and you capture the Carrd-adjacent audience that wants
   simpler.

Full sources and per-file detail in sibling files in this directory.

---

# UI audit

## 00. Landing Page — carrd.co (public marketing site)

### Screen CRD-LAND-001 — Full landing page (carrd.co root)

- **Flow:** unauthenticated visitor → `https://carrd.co/`
- **Source:** BrowserMCP accessibility snapshot, 2026-04-24
- **URL:** `https://carrd.co/`
- **Page title:** `Carrd - Simple, free, fully responsive one-page sites for pretty much anything`

#### What Carrd ships on the landing — radical minimalism

Carrd's landing is the **shortest, simplest, most focused** of any audited competitor. Where Linktree, Stan, and Beacons ship 10-15 sections, Carrd ships ~6 clearly-separated blocks.

1. **Top: minimal nav** — hamburger icon (`#menu`) in top-left. That's it. No pricing link, no products dropdown, no blog, no company. Carrd doesn't want you clicking nav items; it wants you clicking `Choose a Starting Point`.

2. **Hero**
   - Logo icon + H1 `Carrd` (just the name, huge)
   - Subtitle: `Simple, free, fully responsive one-page sites for pretty much anything.`
   - 2 CTAs in a list: `Choose a Starting Point` → `/build` + `Log In` → `/login`
   - `What is Carrd?` secondary link → `#about`
   - **NO handle-claim in hero** (different model — Carrd doesn't have handles, it has site-names)
   - Radical restraint: 1 primary CTA, 1 secondary CTA, 1 "learn more" link. Nothing else.

3. **What is Carrd?** section (`#about`)
   - H2: `Build one-page sites for pretty much anything`
   - Copy: "Whether it's a personal profile, a landing page to capture emails, or something a bit more elaborate, Carrd has you covered."
   - **5 live demo sites** — linked to real sub-domains (auditable externally):
     - `johnsmith-demo.carrd.co` — personal profile
     - `caycepollard-demo.carrd.co` — portfolio (Cayce Pollard is a Gibson novel character — deep-cut reference signals brand tone: designer / indie-hacker)
     - `janeanderson-demo.carrd.co` — personal profile
     - `randomapp-demo.carrd.co` — landing page for an app
     - `showcase-demo.carrd.co` — portfolio grid
   - Each thumbnail is a live screenshot, clickable to see the real site. Max trust, max honesty, zero mockup.

4. **3-column value props** — each just 1 word + 1 paragraph
   - **Simple** — "Start with one of dozens of templates (or a blank page) and make it your own."
   - **Responsive** — "Look great at every screen size right out of the box, from phones to tablets to desktops."
   - **Free** — "Build up to three sites per account and use all of Carrd's core features – for free!"

5. **Optional: Go Pro!** — pricing callout inline
   - Lead: `Upgrade your Carrd experience! Go Pro from just $19 / year (yup, per year)`
   - **Triple-emphasis on "per year"** — italic, bolded — Carrd knows the SaaS-per-month-anchoring expectation and breaks it explicitly.
   - 6 Pro features listed:
     - **Custom Domains** (Let's Encrypt SSL)
     - **More Sites** (beyond 3)
     - **Forms** (contact, signup via Mailchimp/Kit/ActiveCampaign/EmailOctopus, custom, payment-enabled)
     - **Widgets + Embeds** (Stripe, PayPal, Gumroad, Typeform)
     - **Site Analytics** (Google Analytics, Plausible, Matomo)
     - **No Branding** (remove "Made with Carrd" footer)
   - `Try it free for 7 days. PayPal and all major credit and debit cards accepted.`
   - `Learn More` → `/pro`

6. **Final CTA** — "Sound good?"
   - H2: `Sound good?`
   - `Click below to get started. No signup required.`
   - `Choose a Starting Point` → `/build`
   - **"No signup required"** is the second killer UX move (first was "per year" pricing). Carrd lets you BUILD before creating an account. Account only needed to publish.

7. **Footer — 4 items**
   - Home · Terms · Privacy · Contact
   - `© Carrd Inc. All rights reserved.`
   - **No social media icons, no mobile apps, no press links, no creator directory, no trust center, no transparency report, no cookie preferences, no Indigenous land acknowledgement.** Absolute minimalism.

#### Strategic reading — radical minimalism as positioning

Carrd is the ANTI-Linktree/Stan/Beacons:

| Dimension | Linktree / Stan / Beacons | Carrd |
|---|---|---|
| Landing length | 10-15 sections | 6 sections |
| Nav items | 5-8 | 1 (hamburger only) |
| Trust-signal maximalism | Ship SLA, Trust Center, 70M users | Nothing beyond "3 Pro trial days, no CC required" |
| Pricing | $15-35/month | **$19/YEAR** ($1.58/month equivalent) |
| Social proof | Celebrities + mid-creators + testimonials | 5 demo sites, that's it |
| Signup friction | Email + password + handle | **None to START; account only at publish** |
| AI features | 7 (Beacons) / 1 (Linktree) / 0 (Stan) | 0 |
| Mobile apps | Yes (Linktree, Beacons) | No |
| Footer breadth | 30+ links | 4 links |
| Brand vibe | Corporate SaaS | Indie hacker / designer aesthetic |
| Target audience | Creators monetizing | Designers, indie hackers, portfolios, personal sites, dev landing pages |

**Carrd is not tadaify's direct competitor.** It's a general-purpose one-page website builder; tadaify is a link-in-bio + commerce platform. The overlap is narrow: creators who want a clean page + links + maybe one Stripe button.

**But Carrd's UX patterns are the best-in-class minimalism lessons** for anyone working in adjacent categories.

#### Patterns to steal from Carrd

1. **"No signup required to build"** — visitor clicks `Choose a Starting Point`, lands in the editor without any auth step. Account creation deferred until publish. **MASSIVE friction reduction**. Tadaify candidate: let visitor build their public page in a guest-mode editor, prompt for account only at "Publish to tadaify.com/yourhandle" click.

2. **Live demo sites as social proof** — not mockups, not carousels, not celebrity handles. Real sub-domain links that the visitor can actually audit. Already adopted from Stan (PAT-002), Carrd confirms the pattern.

3. **Annual pricing as marketing** — Carrd advertises `$19/year` not `$1.58/month`. Psychological anchoring: creator pays once a year, doesn't think about it. Contrast with Linktree/Stan/Beacons which lead with monthly price. **Not applicable to tadaify** (our infra + Stripe fees don't allow $19/year economics) but interesting positioning.

4. **Absence of things** as a positioning statement — no AI, no social proof ticker, no FAQ, no mobile app, no marketplace. Carrd's lack-of-feature signals "we do one thing well". Tadaify: we WON'T do this, but if we ever launch a "tadaify lite" (simple link list only), Carrd's minimalism is the playbook.

5. **Clear feature + integration partner list** — Carrd names Stripe, PayPal, Gumroad, Typeform, Mailchimp, Kit, ActiveCampaign, EmailOctopus, Let's Encrypt, Google Analytics, Plausible, Matomo as explicit third-party tools. **Honesty + outsourcing posture**: Carrd doesn't pretend to be a commerce platform; it's a host + editor, commerce is done by partners. Tadaify: do the opposite — we own commerce, but still explicitly list which integrations we ship with so creators trust we'll work with their existing stack.

6. **"dozens of templates"** — no count, no gallery size flex. Linktree says 46 named templates; Carrd says "dozens" and lets you discover on `/build`. Different brand strategy: Linktree wants you to evaluate scale; Carrd wants you to just start building.

7. **"Made with Carrd" footer badge as monetization driver** — Free tier ships a branded footer; removing it is a Pro feature. Linktree does the same. Tadaify: identical pattern — Free tier has "Powered by tadaify" with creator's referral link (PAT-008 self-referral loop), Pro tier removes.

#### Irritation risk for Carrd visitors

- **"dozens of templates" is vague** — uncertainty friction for creators comparing to "46 templates" Linktree shows. Carrd loses on spec-shopping.
- **No pricing nav item** — creator has to scroll to find $19/year. Vertical scroll friction on mobile.
- **No creator testimonials** — professional creators looking for "who uses this" find nothing. Carrd loses that persona.
- **Absolute silence on features** — creator can't find feature comparison without signing up. If they want Linktree-like spec grid, Carrd isn't for them.

#### What tadaify should copy

**ADOPT:**
- **Guest-mode editor** (no signup to START building) — feature-mix NEW candidate
- Live demo sites as social proof (already in feature-mix §5.3.4)
- "Made with tadaify" footer badge on Free tier with creator's referral link (already in §4.1 / PAT-008)

**ORIGINATE against Carrd:**
- We ship AI features (Carrd has none; we ship 3 MVP)
- We ship commerce (Carrd outsources to Gumroad/Stripe; we own the full flow)
- We ship pricing in nav (Carrd hides it)
- We ship social proof (creators + testimonials; Carrd has demos only)

**AVOID:**
- $19/year pricing (unsustainable at our infra cost)
- Removing all trust signals (Carrd can afford it because they've been around 10 years with reputation; we cannot)
- Hiding pricing in-scroll

#### Open questions

- What does `/build` actually look like when visited without an account? Guest editor with "Publish → Sign Up" gate at the end? (Test by clicking — quick audit.)
- Does Carrd have any concept of handles / public profile URLs, or is every site a random-ID sub-domain (`<random>.carrd.co`)? (Desk research implies sub-domain per site, not handles.)
- Carrd's $19/year economics: do they have transaction fees hidden anywhere? (Desk research says no platform fees — Stripe/PayPal passthrough via embeds.)
- How big is the Carrd-vs-Linktree overlap segment (creators who considered both)? (Market research — deferred.)

---

## 01. Onboarding & Auth

No screens documented yet.

## 02. Dashboard & Navigation

No screens documented yet.

## 03. Page Editor

No screens documented yet.

## 04. Public Page / Profile

No screens documented yet.

## 05. Analytics

No screens documented yet.

## 06. Monetization / Billing

No screens documented yet.

## 07. Audience / CRM / Email

No screens documented yet.

## 08. Growth / Integrations / Embeds

No screens documented yet.

## 09. Admin / Team / Agency

No screens documented yet.

## 10. Design System / UX Patterns

No screens documented yet.

## 11. Paywalls / Plan Gating

No screens documented yet.

## 12. Open Questions

No open questions yet.
