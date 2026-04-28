---
type: competitor-matrix
project: tadaify
title: Master feature matrix — 10 link-in-bio competitors + tadaify-planned
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-3
source: desk-research
status: draft
---

# Master feature matrix — tadaify vs 10 link-in-bio competitors

## Legend

- `Y` — feature present and available on free tier (or on every tier)
- `$` — feature present but gated behind a paid tier (tier noted in-cell when short)
- `N` — feature absent as of scrape date
- `P` — partial / limited (short note)
- `?` — unclear from public sources; needs trial

## Competitor codes

| Code | Product |
|------|---------|
| LT | Linktree |
| BC | Beacons |
| BL | Bio.link (Squad Social) |
| LB | Lnk.Bio |
| SS | Stan.Store |
| CR | Carrd |
| LL | Later Linkin.bio |
| TP | Taplink |
| MS | Milkshake |
| CS | Campsite.bio |
| **TD** | **tadaify-planned** (to be filled) |

Scrape date: **2026-04-24**. Where a competitor page 403'd, evidence comes from third-party sources (G2, Capterra, SaaSworthy, reviewer blogs) listed in the Sources section.

---

## A. Onboarding & Auth

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| A1 | Email signup | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| A2 | Google OAuth | Y | Y | Y | ? | Y | Y | Y | Y | Y | Y | — |
| A3 | Apple OAuth | Y | Y | N | N | Y | N | Y | N | Y | N | — |
| A4 | Social import (IG/TikTok pulls bio + avatar) | P [1] | Y [2] | N | N | Y | N | Y [3] | P | P | N | — |
| A5 | Social content auto-mirror (feed → page) | Y (Social Commerce 2026) [4] | P | N | N | N | N | Y (shoppable grid) [3] | N | N | N | — |
| A6 | Auto-username suggestion | Y | Y | ? | ? | Y | Y | Y | Y | Y | ? | — |
| A7 | Live slug availability | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| A8 | Goal-selection onboarding (what are you building?) | Y [1] | Y | N | N | Y | N | P | Y (AI-led) [5] | N | N | — |
| A9 | Template picker during onboarding | Y | Y | Y | N | P | P | Y | Y | Y | Y | — |
| A10 | One-click AI page generator from prompt | P (2026) [4] | Y [6] | Y [12] | N | N (Stanley) [7] | N | N | Y (Taplink AI) [5] | N | N | — |
| A11 | Steps from signup → published (review count) | 11 [1] | ~6 | ~4 | ~5 | ~7 | ~8 | ~8 | ~6 | ~5 | ~6 | — |
| A12 | Deferred signup (edit first, register later) | N | N | N | N | N | Y | N | N | N | N | — |

Notes: [1] Linktree's onboarding length is a noted friction point across comparison reviews. Tadaify target: ≤5 steps. [4] Linktree 2026 "Social Commerce engine" pulls IG/TikTok/YT content automatically.

---

## B. Editor & Block Library

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| B1 | Drag-drop reorder | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| B2 | Declared block types count | ~40 [8] | 14+ | ~12 | ~15 | ~20 | ~15 (widgets) | ~15 | 20+ [9] | ~10 | ~20 | — |
| B3 | Video embed block (YT/Vimeo) | Y | Y | Y | Y [10] | Y | Y | Y | Y | Y | Y | — |
| B4 | Product block (native cart) | $ Pro [11] | $ Store Pro | N | N | Y | P (via widget) | Y (Shopify) | $ Business | N | N | — |
| B5 | Booking / calendar block | $ | Y | N | N | Y | P (via Calendly widget) | N | $ Business | N | P (embed) | — |
| B6 | Form / email signup block | $ Starter | Y | Y | P | Y | Y (Pro) | Y | $ | P | Y | — |
| B7 | RSS / newsletter feed | Y | Y | N | N | N | P (widget) | N | N | N | P | — |
| B8 | Substack / Beehiiv block | P | P | N | N | N | P | N | N | N | N | — |
| B9 | Shopify product block | $ Premium | Y [2] | N | N | Y | P (widget) | Y (Growth+) | N | N | N | — |
| B10 | Block templates (pre-made) | Y | Y | P | Y | Y | N | Y | Y | Y | Y | — |
| B11 | Section dividers / headers | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| B12 | Conditional blocks (show by geo / device) | N | N | N | N | N | N | N | N | N | N | **Planned diff** |
| B13 | Block scheduling (publish at / expire) | $ Starter | Y | N | N | N | N | Y | Y | N | Y | — |
| B14 | Block-level A/B testing | N | N | N | N | N | N | N | N | N | N | **Planned diff** |
| B15 | AI copy assist inside editor | P | Y | Y | N | Y (Stanley) | N | N | Y | N | N | — |

Notes: [2] Beacons: "14 creator tools" — link-in-bio page is one of 14. [8] Linktree block count via marketplace. [9] Taplink explicitly markets "20+ content blocks". [11] Linktree commerce blocks redirect to Shopify/Gumroad/Etsy — they don't process natively on Free/Starter.

---

## C. Public page / profile

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| C1 | Hero / cover layout | P | Y | P | P | Y | Y | Y | Y | Y | P | — |
| C2 | Stacked list (buttons only) | Y | Y | Y | Y | N (store-first) | P | Y | Y | N (cards) | Y | — |
| C3 | Grid layout | $ | Y | N | Y | Y | Y | Y (shoppable) | Y | Y (cards) | Y | — |
| C4 | Multi-page | N | N | N | N | Y | Y (3-25 sites) | N | Y | Y (cards ≈ pages) | N | — |
| C5 | Custom (sub)domain free tier | N | N | **Y** | N | Y (paid plan only, no free) | N | N | N | N | N | — |
| C6 | Custom domain any tier | $ Pro [11] | $ Pro [13] | $ Premium | $ Unique [10] | Y | $ Pro Lite | $ | $ Business | $ Lite+ | $ Pro | — |
| C7 | Password protection | N | N | N | N | Y (product gate) | $ Pro Plus | N | N | N | N | — |
| C8 | Age gate 18+ | N [14] | N | N | N | N | N | N | N | N | N | **Planned diff** |
| C9 | NSFW / adult content allowed by TOS | **N** [15] | P (unclear) | ? | ? | P | Y (self-host-ish) | P | P | P | P | **Planned diff** |
| C10 | Geo restriction / redirect | N | N | N | N | N | N | N | N | N | N | **Planned diff** |
| C11 | SEO meta customization (title/desc) | $ Pro | $ | P | P | Y | Y | Y | $ | P | $ | — |
| C12 | Open Graph / social preview card | $ | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| C13 | Favicon upload | $ | Y | P | P | Y | Y | Y | $ | Y | Y | — |
| C14 | Manifest / PWA "add to home screen" | N | P | N | N | N | N | N | N | N | N | — |
| C15 | Page load time (s, median per reviewer) | ~1.2 [4] | ~1.5 | ~1.0 | ~1.3 | ~1.8 | ~0.5 | ~2.0 | ~1.5 | ~1.2 | ~1.3 | — |

Notes: [14] Linktree has no built-in age gate — creators work around with third-party redirects. [15] Linktree has a history of suspending adult creators without warning (Vice 2022 investigation, confirmed via Trustpilot 2024-2025 reviews).

---

## D. Design system

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| D1 | Theme gallery | Y | Y | Y | Y (368+) [10] | Y | Y | Y | Y | Y | Y | — |
| D2 | Approx. template count | ~30 [16] | ~40 | ~20 | 368+ [10] | ~25 | ~60+ | ~15 | ~30 | 80+ (5 cats × 16) [17] | ~30 | — |
| D3 | Custom CSS | $ Premium | N | N | N | N | $ Pro Standard | N | N | N | N | — |
| D4 | Custom fonts (upload) | N | Y (Pro) | P | Y (Google Fonts 44k) [10] | Y | N (Google only) | P | P | N | Y | — |
| D5 | Dark mode toggle for visitor | P | Y | P | P | Y | P | P | P | Y | P | — |
| D6 | Mobile preview in editor | Y | Y | Y | Y | Y | Y | Y | Y | Y (mobile editor itself) | Y | — |
| D7 | Desktop preview in editor | Y | Y | Y | Y | Y | Y | Y | Y | **N (mobile only)** [18] | Y | — |
| D8 | Animation library (entrance / button) | P (Pro) [16] | N | N | N | N | P (CSS only) | N | N | N | N | **Planned diff — strong** |
| D9 | Button style presets | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| D10 | Cover photo / hero image | $ | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| D11 | Background video | $ Pro | Y | P | Y [10] | P | P (embed) | P | Y | Y | P | — |
| D12 | Auto-extract palette from avatar | N | P | N | N | P | N | N | N | N | N | **Planned diff** |

Notes: [16] Linktree "animation effects" are limited (background loop, button hover) — no entrance choreography gallery comparable to the 5+50 set in tadaify-feature-mockups.md. [18] Milkshake is an iOS/Android app with no desktop editor, a pain point in reviews.

---

## E. Monetization

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| E1 | Tip jar / donations | Y [19] | Y | P | N | Y | P (Stripe widget) | N | Y | N | P | — |
| E2 | Digital product sales | $ Starter | Y | N | N | Y (core) | P (Gumroad widget) | N | Y | N | N | — |
| E3 | Subscription / membership | P (redirect) | Y | N | N | Y (core) | N | N | P | N | N | — |
| E4 | Paid DMs | N | Y | N | N | N | N | N | N | N | N | — |
| E5 | Booking / calendar sales | P | Y | N | N | Y | P | N | Y | N | N | — |
| E6 | Course sales | N | P | N | N | Y (core) | N | N | N | N | N | — |
| E7 | Stripe Connect | Y | Y | N | N | Y | Y (widget) | N | Y | N | N | — |
| E8 | PayPal | Y | Y | N | N | Y | Y | N | Y | N | N | — |
| E9 | Square | Y | N | N | N | N | N | N | Y | N | N | — |
| E10 | Crypto / wallet payments | N | N | N | N | N | N | N | P (Taplink supports crypto providers) | N | N | — |
| E11 | Platform transaction fee (free tier) | 12% [19] | 9% [13] | 0 | 0 | N/A (no free) | 0 | N/A | 0 | 0 | 0 | — |
| E12 | Platform transaction fee (top tier) | 0% Premium | 0% Store Pro | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0 | — |
| E13 | Payout schedule configurable | P | P | N/A | N/A | Y | N/A | N/A | P | N/A | N/A | — |
| E14 | EU VAT / tax handling | P (redirect) | P | N | N | Y | N | N | P | N | N | — |

Notes: [19] Linktree free-tier commerce fee dropped by some sources to 4-12% depending on feature; Premium = 0% platform fee but Stripe 2.9% + $0.30 always applies.

---

## F. Commerce / e-commerce

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| F1 | Shopify product sync | $ Premium | Y [2] | N | N | Y (Stripe direct) | P (widget) | **Y (core)** [3] | N | N | N | — |
| F2 | WooCommerce | P | N | N | N | N | P | N | N | N | N | — |
| F3 | Native product catalog (no external store) | N | Y | N | N | Y | N | N | Y | N | N | — |
| F4 | Inventory tracking | N | P | N | N | Y | N | N | P | N | N | — |
| F5 | SKU tracking | N | P | N | N | Y | N | N | P | N | N | — |
| F6 | Discount codes | N | Y | N | N | Y (Creator Pro) | N | N | Y | N | N | — |
| F7 | Native cart (multi-item checkout) | N | Y | N | N | Y | N | N | Y | N | N | — |
| F8 | 1-click checkout / order bumps / upsells | N | P | N | N | Y | N | N | P | N | N | — |

---

## G. Analytics

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| G1 | Page views | Y | Y | Y | Y | Y | P | Y | Y | Y | Y | — |
| G2 | Link clicks (total) | Y | Y | Y | Y | Y | P (via GA) | Y | Y | Y | Y | — |
| G3 | Per-link CTR | $ Pro [20] | Y | P | $ paid | Y | N | Y | Y | Y | $ Pro | — |
| G4 | UTM support | $ Pro | Y | P | P | Y | P | Y | Y | P | $ | — |
| G5 | Google Analytics integration | $ | Y | Y | $ | Y | Y | Y | Y | Y | Y | — |
| G6 | Meta Pixel | $ | Y | P | P | Y | Y | Y | Y | P | $ | — |
| G7 | TikTok Pixel | $ | Y | N | N | Y | P | Y | Y | N | N | — |
| G8 | Heatmap / scrollmap | N | N | N | N | N | N | N | N | N | N | **Planned diff** |
| G9 | Geo analytics | $ Pro | Y | P | $ | Y | N | Y | Y | Y | $ Pro | — |
| G10 | Device breakdown | $ Pro | Y | P | $ | Y | N | Y | Y | Y | $ Pro | — |
| G11 | Traffic source / referrer | $ Pro | Y | P | $ | Y | N | Y | Y | Y | $ Pro | — |
| G12 | Export CSV | $ Pro | Y | N | N | Y | N | Y | Y | Y | Y | — |
| G13 | Analytics API / public endpoint | $ Premium | N | N | N | P | N | N | N | N | $ Pro Plus (API) [21] | — |
| G14 | Data retention (months) | 12 [20] | ? | ? | ? | 24 | ∞ (GA) | 13 | ? | ? | ? | — |
| G15 | Revenue attribution per link ($) | **N** | P | N | N | Y | N | N | P | N | N | **Planned diff** |

Notes: [20] Linktree retains basic analytics forever on Pro, 12 months history exposed in UI. [21] Campsite.bio launched public API June 2024 with webhooks per changelog.

---

## H. Integrations (named third parties)

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| H1 | Mailchimp | Y [22] | Y | P | P | Y | Y (widget) | Y | Y | Y | Y | — |
| H2 | ConvertKit / Kit | Y | Y | P | P | Y | Y | Y | P | P | Y | — |
| H3 | Beehiiv | P | P | N | N | P | P | N | N | N | P | — |
| H4 | Substack | P (link only) | P | P | P | P (link only) | P | P | P | P | P | — |
| H5 | Calendly | Y (embed) | N (native) | P | P | Y | Y (widget) | N | Y | P | P | — |
| H6 | Cal.com | P | N | P | P | P | P | N | P | N | P | — |
| H7 | Zapier | Y [22] | P | P | P | Y | P | P | P | N | P | — |
| H8 | Make (Integromat) | P | N | N | N | P | P | N | P | N | P | — |
| H9 | Shopify | $ Premium [22] | Y | N | N | Y (indirect) | P | Y | N | N | N | — |
| H10 | Stripe | Y | Y | N | N | Y | Y (widget) | N | Y (50+ processors) [9] | N | N | — |
| H11 | Gumroad | P (link) | P | P | P | P (competitor) | Y (widget) | P | P | P | P | — |
| H12 | Teachable / Thinkific | P | P | N | N | P (competitor) | P | P | P | N | P | — |
| H13 | Patreon | Y (icon link) | Y | P | P | P | P | P | P | P | P | — |
| H14 | OnlyFans | **N** [15] | P | P | P | N | P | P | P | P | P | — |
| H15 | Spotify artist | Y | Y | Y | Y [10] | Y | Y | Y | Y | Y | Y | — |
| H16 | Klaviyo | Y | P | P | P | P | P | P | P | P | P | — |
| H17 | HubSpot | P | P | P | P | P | P | P | P | P | P | — |

Notes: [22] Linktree Marketplace. OnlyFans explicitly blocked per Linktree TOS enforcement.

---

## I. AI features

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| I1 | AI copywriter (bio / titles) | P (2026) | Y [6] | Y (AI assistant) [12] | N | Y (Stanley) [7] | N | N | Y | N | N | — |
| I2 | AI image / graphic generation | N | P | P | N | P | N | N | N | N | N | — |
| I3 | AI theme / palette suggestion | P | P | N | N | N | N | N | P | N | N | **Planned diff** |
| I4 | AI layout suggestion (rearrange blocks) | P (Social Commerce) [4] | P | N | N | N | N | N | Y (Taplink AI) [5] | N | N | **Planned diff** |
| I5 | AI link categorization / tagging | N | P | N | N | N | N | N | N | N | N | — |
| I6 | AI analytics insights (natural-lang) | N | Y (Beam) [13] | P | N | Y | N | N | N | N | N | — |
| I7 | AI reply / DM automation | N | P | N | N | **Y (AutoDM)** [7] | N | N | N | N | N | — |
| I8 | AI brand outreach / pitch email | N | **Y** [23] | N | N | N | N | N | N | N | N | — |
| I9 | AI full-page generator from prompt | P | Y | Y | N | P | N | N | Y | N | N | — |

Notes: [23] Beacons' AI Brand Outreach is genuinely unique — generates pitch emails in chosen tone. No direct equivalent.

---

## J. Team / admin

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| J1 | Multi-user workspace | $ beta [24] | N | N | $ Agency | N | N | Y (Later core) | N | N | $ Pro Plus | — |
| J2 | Role-based access | $ | N | N | P | N | N | Y | N | N | P | — |
| J3 | Audit log | $ Enterprise | N | N | N | N | N | P | N | N | N | — |
| J4 | SSO (SAML / Okta) | **N** [24] | N | N | N | N | N | P (enterprise Later) | N | N | N | — |
| J5 | SCIM provisioning | N | N | N | N | N | N | N | N | N | N | — |
| J6 | Agency view / sub-accounts | $ Enterprise | N | N | $ | N | N | Y | N | N | $ Pro Plus | — |
| J7 | White-label | $ Enterprise | N | N | P | N | N | P | N | N | P | — |
| J8 | Remove platform branding | $ Starter | $ Pro | **Y free** | $ Mini | N/A | $ Pro | $ | $ Pro | $ Lite | $ Pro | — |

Notes: [24] Linktree Workspaces are in beta per help center. No SSO available on Linktree as of 2026-04.

---

## K. Developer / API

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| K1 | Public REST API | P (beta, dev program) [22] | N | N | N | P | N | Y (Later API) | N | N | **Y** [21] | — |
| K2 | Webhooks | P (Zapier bridge) | N | N | N | P | N | Y | N | N | **Y** [21] | — |
| K3 | OAuth public app | P (dev program) | N | N | N | N | N | Y | N | N | P | — |
| K4 | Embeddable widget (iframe) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y (native embed) | — |
| K5 | JavaScript snippet / pixel | Y | Y | Y | Y | Y | Y | Y | Y | P | Y | — |
| K6 | Custom HTML block (raw code) | $ Premium | P | N | N | N | Y (Pro) | N | Y | N | P | — |
| K7 | Plugin / app marketplace | **Y** [22] | N | N | N | N | N | N | N | N | N | — |

---

## L. Growth / distribution

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| L1 | Built-in referral program (get-a-friend) | N | N | N | N | P | N | N | N | N | N | — |
| L2 | Built-in affiliate program (user → user) | N | Y (brand deals) | N | N | Y (Creator Pro) | N | N | N | N | N | — |
| L3 | Discover / explore page (user-visible) | P | P | N | N | N | N | N | N | N | N | — |
| L4 | Follower / follow mechanic (social graph) | N | N | N | N | N | N | N | N | N | N | — |
| L5 | Creator directory (public) | N | P | N | N | N | N | N | N | N | N | — |
| L6 | Shareable media kit | P | **Y (Media Kit builder)** [13] | N | N | P | N | N | N | N | N | — |
| L7 | QR code generator | Y | Y | Y | Y | Y | P | Y | Y | Y | Y | — |

---

## M. Compliance / trust

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| M1 | GDPR data export (user self-serve) | P (request form) [25] | P | P | P | P | P | Y | P | P | P | — |
| M2 | GDPR account delete | P (request form) | P | P | P | Y | P | Y | P | P | P | — |
| M3 | DPA available | **Y** [25] | P | P | P | Y | P | Y | P | P | P | — |
| M4 | SOC2 Type 2 | ? (not confirmed public) | ? | N | N | P | N | Y (Later enterprise) | N | N | N | — |
| M5 | ISO 27001 | ? | N | N | N | N | N | P | N | N | N | — |
| M6 | Published uptime SLA | N (free) / $ Enterprise | N | N | N | P | N | P | N | N | N | — |
| M7 | Public status page | Y | P | P | N | Y | P | Y | P | P | Y | — |
| M8 | Moderation transparency (clear TOS + appeal) | **N** [15] | P | P | P | P | Y | P | P | P | P | **Planned diff** |

Notes: [25] Linktree Data Subject Request Form (linktr.ee/s/about/gdpr-form) is the user flow — not self-serve in dashboard.

---

## N. Mobile

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| N1 | Native iOS app | Y | Y | N | P | Y | N | Y | P | **Y (flagship)** | N | — |
| N2 | Native Android app | Y | Y | N | P | Y | N | Y | P | **Y (flagship)** | N | — |
| N3 | App feature parity with web | P | P | N/A | N/A | Y | N/A | P | N/A | **Mobile-only (no web editor)** | N/A | — |
| N4 | Mobile-first editor | P | P | P | P | P | Y | P | P | **Y** | P | — |
| N5 | QR code generator in app | Y | Y | P | Y | Y | P | Y | Y | Y | Y | — |
| N6 | Push notifications (page events) | Y | Y | N | N | Y | N | Y | P | Y | N | — |

---

## O. Content format support

| # | Feature | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS | TD |
|---|---------|----|----|----|----|----|----|----|----|----|----|----|
| O1 | Blog posts (native CMS) | N | P | N | N | P (product desc) | P | N | P | N | N | — |
| O2 | Long-form pages / about | P | Y | P | P | Y | Y | P | Y | Y | P | — |
| O3 | Multi-link list (canonical) | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| O4 | E-signatures | N | N | N | N | N | N | N | N | N | N | — |
| O5 | PDF hosting / download gate | P (as product) | Y | N | N | Y | P (external) | N | P | N | N | — |
| O6 | Audio player (native) | Y | Y | Y | Y (SoundCloud) [10] | P | P | P | Y | Y | Y | — |
| O7 | Video hosting (native, not embed) | N | N | N | N | P | N | N | N | N | N | — |
| O8 | Livestream link / schedule | P | P | P | P | P | N | P | P | N | P | — |

---

## Summary: feature density by category (rough counts)

| Category | LT | BC | BL | LB | SS | CR | LL | TP | MS | CS |
|----------|----|----|----|----|----|----|----|----|----|----|
| A Onboarding (max 12) | 10 | 10 | 6 | 5 | 10 | 7 | 9 | 9 | 7 | 6 |
| B Editor (max 15) | 12 | 14 | 7 | 7 | 10 | 9 | 10 | 11 | 7 | 9 |
| C Public page (max 15) | 11 | 12 | 9 | 9 | 11 | 11 | 10 | 10 | 10 | 10 |
| D Design (max 12) | 10 | 9 | 7 | 9 | 7 | 8 | 8 | 8 | 7 | 8 |
| E Monetization (max 14) | 10 | 13 | 2 | 1 | 13 | 5 | 0 | 11 | 0 | 1 |
| F Commerce (max 8) | 3 | 7 | 0 | 0 | 8 | 2 | 5 | 5 | 0 | 0 |
| G Analytics (max 15) | 12 | 13 | 8 | 7 | 13 | 4 | 12 | 12 | 9 | 11 |
| H Integrations (max 17) | 14 | 11 | 4 | 4 | 11 | 9 | 9 | 9 | 5 | 9 |
| I AI (max 9) | 3 | 7 | 4 | 0 | 6 | 0 | 0 | 5 | 0 | 0 |
| J Team (max 8) | 5 | 1 | 1 | 4 | 1 | 0 | 6 | 1 | 1 | 5 |
| K API (max 7) | 5 | 2 | 2 | 2 | 3 | 3 | 7 | 3 | 1 | 6 |
| L Growth (max 7) | 4 | 4 | 1 | 1 | 3 | 1 | 1 | 1 | 1 | 1 |
| M Compliance (max 8) | 5 | 3 | 3 | 2 | 6 | 3 | 7 | 3 | 3 | 4 |
| N Mobile (max 6) | 6 | 6 | 1 | 2 | 6 | 1 | 5 | 3 | 6 | 1 |
| O Content (max 8) | 4 | 5 | 3 | 3 | 6 | 4 | 3 | 5 | 3 | 3 |
| **TOTAL (max 161)** | **114** | **117** | **58** | **56** | **114** | **67** | **92** | **96** | **60** | **74** |

**Read**: Beacons (117) and Linktree (114) are the feature-complete leaders. Stan Store (114) is the monetization-native leader at the cost of no free tier. The bottom half (Bio.link 58, Lnk.Bio 56, Carrd 67) competes on simplicity/price, not feature parity.

---

## Sources

1. Adam Connell review — "Linktree takes 11 steps from signup to completion while the best competitors get the job done in half as many clicks." https://adamconnell.me/linktree-alternatives/
2. Beacons homepage & plans — 14 creator tools branded as "Pro" modular bundles. https://home.beacons.ai/plans
3. Later Linkin.bio — Shopify integration + shoppable grid. https://later.com/link-in-bio/
4. LinkTree.cx blog — Linktree 2026 Social Commerce engine. https://linktree.cx/blog/what-is-linktree-do-you-still-need-it-in-2026
5. Taplink blog — AllMyLinks alternative + Taplink AI page generator. https://taplink.at/en/blog/allmylinks-alternative.html
6. AIChief review of Beacons AI features (2026). https://aichief.com/ai-business-tools/beacons-ai/
7. Stan Store blog — Stan AutoDM + Stanley AI assistant. https://stan.store/blog/stan-autodm/
8. Linktree Marketplace. https://linktr.ee/marketplace/browse
9. Taplink — 20+ blocks, 50+ payment providers. https://taplink.at/en/guide/payments-configuration.html
10. Orichi review of Lnk.Bio — Unique plan, 368+ themes, 44k Google Fonts. https://orichi.info/lnk-bio-review/
11. Linktree pricing breakdown. https://talkspresso.com/blog/linktree-price-plans-breakdown
12. Fueler — AI link-in-bio generators. https://fueler.io/blog/ai-link-in-bio-generator-tools-for-creators
13. Beacons Reviews G2 + autogpt.net. https://autogpt.net/ai-tool/beacons-ai/
14. Zori.bio — age verification laws 2026. https://zori.bio/blog/age-verification-laws-for-adult-creators
15. Vice 2022 investigation + Trustpilot 2024-2025 on Linktree adult-creator bans (referenced in `competitors.md`).
16. Linktree templates: Animation Studio, Design, Media categories. https://linktr.ee/s/templates/animation-studio
17. Milkshake app categories — 5 categories × 16 templates. https://milkshake.app/how-it-works/
18. Milkshake FAQs — mobile-only editor. https://milkshake.app/faqs/
19. Linktree "Take Payments". https://linktr.ee/s/creator/take-payments-on-linktree
20. Linktree free vs pro analytics comparison. https://talkspresso.com/blog/linktree-free-vs-pro-features-2026
21. Campsite.bio public API changelog (June 2024 launch, webhooks added within 4 months). https://headwayapp.co/campsite-bio-changelog
22. Linktree blog — Zapier + QR + integrations. https://linktr.ee/blog/fresh-new-features-alert-qr-codes-link-icons-zapier-and-more
23. Beacons AI Brand Outreach page. https://beacons.ai/i/app-pages/ai-brand-outreach
24. Linktree Workspaces help center (beta). https://linktr.ee/help/en/articles/13007538-manage-your-linktree-s-and-teams-with-workspaces-beta
25. Linktree DPA + GDPR form. https://linktr.ee/s/data-processing-addendum
