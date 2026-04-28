---
type: competitor-research
project: tadaify
competitor: lnk-bio
title: Lnk.Bio — UI audit notes + desk research summary
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: audited-landing-only-2026-04-24
---

# Lnk.Bio — UI Audit Notes

## Desk Research Summary

Lnk.Bio is the **anti-subscription** competitor in this research set.
Italian-built (Milan), operating since 2016, it positions itself as
"the most affordable link-in-bio tool". Headline pricing is a
**$24.99 one-time lifetime Unique plan** that unlocks all features
forever — a structurally-different economic model from every other
competitor.

**Pricing**: Free (unlimited links, Lnk.Bio branding), Mini $0.99/mo
or $9.99 lifetime (removes branding), **Unique $24.99 one-time
lifetime** (all features forever), Ultra ~$90/year (enterprise /
agency features). 5-year TCO vs Linktree Starter: $25 vs $480. Vs
Beacons Creator: $25 vs $500. This is the most creator-friendly
pricing in the category.

**Feature surface**: unlimited links on every plan (including free),
368+ themes, 44,000+ Google Fonts on paid, video wallpapers, custom
backgrounds, custom domain on Unique+, Mailchimp capture, basic
analytics on free + advanced on paid. Relatively thin on native
commerce / deep monetisation — Lnk.Bio is link-page-first, not
commerce-first.

**Integrations**: Mailchimp, embeddable widgets for Stripe/Gumroad/
Calendly etc., custom domain. No Shopify storefront embed, no
Instagram DM automation, no native payments, no public API.

**Reviews**: Generally positive for price + unlimited-links-on-free.
Complained-about for thin brand recognition, sparse integrations,
weak analytics on free. Review corpus smaller than Linktree / Beacons;
lower mindshare.

**Strategic read for tadaify**:

1. **The lifetime-deal pricing is a legitimate market signal** that
   creator-economy users are tired of SaaS-forever. Tadaify shipping
   a lifetime tier (even a limited one, e.g. $49 one-time for Pro,
   counted against an early cohort) would resonate.

2. **Unlimited links on free is table stakes, not a differentiator.**
   Most creators don't hit link-count limits anyway. Lnk.Bio's
   advertising emphasis on this is misleading.

3. **44,000+ Google Fonts is over-indexing on a feature that has
   diminishing returns.** Typography depth beyond ~20 carefully-
   chosen fonts is noise. Tadaify can under-deliver on font count
   and over-deliver on typography-system quality.

4. **Video wallpapers are copyable.** Tadaify shipping a mobile-
   video background option is table stakes at the modern design bar.

5. **Lnk.Bio's weakness is mindshare.** It has the features and the
   price but can't grow because no one's heard of it. Tadaify can
   copy the price-value approach without the Lnk.Bio branding
   problem.

6. **Lifetime pricing has LTV risks for the VENDOR.** Lnk.Bio's
   Italian team has sustained it for a decade, but a new entrant
   pricing at $24.99 lifetime needs a very sharp customer-acquisition
   cost story to survive. Consider lifetime as a LIMITED cohort
   (first 1000 customers) rather than permanent option.

Full sources and per-file detail in sibling files.

---

# UI audit

## 00. Landing Page — lnk.bio (quick audit)

### Screen LKB-LAND-001 — Landing page

- **URL:** `https://lnk.bio/`
- **Source:** BrowserMCP snapshot, 2026-04-24
- **Page title:** `Lnk.Bio - Supercharge your Link in Bio on Instagram, TikTok, YouTube ...`

#### Snapshot-scale findings

**Most fine-grained pricing in the category** — 4 tiers + 4 standalone add-ons:

| Tier | Price | Notable features |
|---|---|---|
| Free | $0 | Unlimited links, 147 embed services, **APIs + Developer access**, 19 integrations, **577 free templates**, QR code, 3 pages |
| **Mini** | **$0.99/month** | + scheduled links, lnk groups, password-protected links, advanced analytics, IG+TikTok sync, IG grid mirror, UTM presets, 5 pages |
| **Unique** | **$24.99 ONE-TIME** (no subscription!) | + free .bio domain/year, newsletter, contact form, shop, remove logo, custom colors, **44,813 fonts**, wallpaper, IG/TikTok scheduler, carousel, multi-links, video wallpaper, 10 pages |
| Ultra | $89.99/year | + verification badge, custom domain, booking calendar, AI translations |

**Add-ons sold separately (unique in category):**
- Blue Tick (verification) — $2/mo
- Booking Calendar — $4/mo
- Translations — $3/mo
- Custom domain — $39.99/yr

**Unique landing section: "Our cores"** — ESG / values signaling:
- Black Owned Business
- Woman Owned & Led
- LGBTQIA+
- 75% Diverse team
- Menstrual Leave
- Work-Life Balance
- Independent Business
- **No Data Sold**
- **No Corporate Greed**
- **Free Pro for equity Activists**

**This is the only landing in the category that leads with company values.**

**Social proof — 1.5M+ creators + heritage brand name-drop:**
Guggenheim · Royal Caribbean · Ms Jenna Fischer · Zumba · Popmart · Paolla Oliveira · Michelin Guide · Roblox · Ferrari · Thuy Music · UN Women · David Guetta

**Platform presence maximalism:**
- Mobile apps (iOS + Android)
- Shopify app
- Chrome extension
- Firefox add-on
- Network of sister sites: Lnk.at / Ln.ki / Clk.bio / Linkinbio.wiki / Flag.Red / Daily News

**Payment methods (widest in category):**
PayPal · Apple Pay · Google Pay · **Alipay** · Visa · Mastercard · **Venmo** · Amex

**Instagram OAuth login:** "We use the official Instagram API. We never ask for your password."

**3000+ social/music/contacts icons, 147 embed services, 577 templates, 44,813 fonts — numerical feature-flex** (potentially sad brand-confidence signal — "we have MORE" rather than "ours matter").

#### Strategic implications for tadaify

**ADOPT:**
- **"Our cores" values section** — ADAPT as PL-culture values (Polish independent business / No data resale / Work-life balance / Supports PL creators / Fair wages). Unique brand-trust wedge.
- **Instagram OAuth login** with "we never ask for your password" framing (tadaify SSO already planned §1.1)
- **Wide payment methods** — MVP Stripe + PayPal + Apple Pay + Google Pay; Y1+ Przelewy24, BLIK, SEPA for PL/EU; Alipay for Asia-Pacific creators deferred

**INTERESTING BUT DEFER:**
- **Lifetime one-time pricing** ($24.99 Unique) — unsustainable with Stripe fees + hosting costs at tadaify scale; revisit as "legacy account" marketing gimmick
- **Add-on à la carte pricing** — creator pays only for features they use (Blue Tick $2/mo, Booking $4/mo, Translations $3/mo). Elegant alternative to tiers; adds complexity to billing infrastructure. Defer Y1+.

**AVOID:**
- **$0.99/month tier** — below meaningful-revenue psychological threshold
- **Numerical flex** (44,813 fonts, 3000+ icons, 577 templates) — reads desperate; quality > quantity branding
- **Sister-site network** spam — Lnk.at / Ln.ki / Clk.bio etc. — feels SEO-farm-adjacent

#### Minor observations

- Cookie banner present (EU-compliant with Accept all / Reject non-necessary buttons — better than Taplink below)
- Footer references payment methods as SEO pages (`/payments/paypal`, `/payments/visa`, etc.) — SEO farming for payment-method-related queries
- "Pay your linkinbio with X" is a SEO long-tail strategy; Linktree doesn't do this

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
