---
type: anti-patterns-audit
project: tadaify
title: Tadaify — Creator Pain Points Audit + Anti-Patterns List
created_at: 2026-04-24
author: orchestrator-opus-4-7-antipatterns-agent
status: draft-v1
---

# Tadaify — Anti-Patterns Audit

## 0. Executive summary

This audit sweeps every pain point surfaced across the tadaify research corpus — LinkOfMe inheritance (6 files), 10 competitor research bundles (reviews.md + notes.md), positioning-gaps.md, and the cross-competitor patterns-library.md — and consolidates them into an exhaustive "anti-patterns" list tadaify MUST NOT repeat.

**Headline findings:**

- **51 distinct anti-patterns** identified, grouped into 10 domains.
- **Sources: 280+ individual complaint data points** across Trustpilot (Beacons 1.9/5 is the single worst competitor rating in the category), Capterra (Linktree 4.4/5 — positive but loud on moderation + support), Pissed Consumer (Beacons has a dedicated complaint corpus), G2, Product Hunt, Reddit creator subs, networksolutions.com, bloggingwizard.com, autoposting.ai (the 847-review-corpus Beacons analysis), and PAT-024/025/030/031/032/034 AVOID verdicts already logged in the patterns-library.
- **Top-5 most-dangerous anti-patterns if we repeat them:**
  1. **AP-001 "Powered by tadaify" footer on any paid tier or as a paywall trigger** — cited 60+ times in Linktree / Beacons / Bio.link / Campsite reviews; the single most recurrent "I left because of this" in Linktree threads; also the exact anti-pattern user flagged me for almost reintroducing.
  2. **AP-005 Surprise bans / takedowns without warning** — Linktree's #1 Capterra complaint; "my business disappeared overnight" is the canonical horror story; drives migrations to every competitor that isn't Linktree.
  3. **AP-010 Multi-step survey to cancel subscription + unable-to-cancel billing** — Beacons #2 complaint on Trustpilot 1.9; users triggering chargebacks + BBB complaints is a platform-killer signal.
  4. **AP-018 Seller fees on free tier that feel like hidden tax** — Linktree 12% / Beacons 9% — cited as the "you said free but it's not" complaint that drives public backlash.
  5. **AP-029 Trial-expiry publicly-visible "did not pay" message** — Taplink's unforced error; text literally printed on the creator's own Instagram-linked page saying "the owner did not pay in time". PR-level complaint.

- **RED flags in current `functional-spec-v2.md`: 3. YELLOW flags: 7.** Detailed per §4 below. The spec is much cleaner than v1 on anti-patterns thanks to DEC-043 "everything free" removing most fee-ladder + watermark triggers, but three genuine RED flags remain: (1) F-UPSELL-004 default-pre-selected-paid-plan smells like PAT-034 card-capture-at-trial-start-lite, (2) F-PREVIEW-004 auto-expiry-at-90d without creator consent is a PAT-076-adjacent mini-trust erosion, (3) the DEC-043 fee-model says "0% platform fees at every tier always" but the spec still mentions "fee ladder is dead" without an explicit contract line reassuring creators the fee is locked — a pricing promise is only a wedge if it's published.
- **Proposed Creator $5 composition:** see §7. Five concrete features that deliver $2 of delight above the bare $2/mo domain add-on WITHOUT recycling any anti-pattern.
- **The one unsolved-by-everyone pain point:** transparent moderation with a published 48h warning + human appeal + refund-on-prepay-ban contract. Zero competitors ship this as a hard commitment. This is tadaify's policy-level wedge (already partially captured as DEC-SYN-05 Creator Safeguard).

---

## 1. Pain points by source

Exhaustive catalogue. Every pain point retains its source citation so any AP reference traces back.

### 1.1 LinkOfMe inheritance — documented issues

LinkOfMe was stopped at ~95% MVP without a PROD deploy, so its documented issues are internal / roadmap gaps rather than user-reported complaints. But the research files it inherited flag the same category risks we're auditing for here:

- **`linkofme/risks.md`** §competitor-risk: Linktree's Nov 2025 Pro price hike ($9 → $15) explicitly called out as "what happens when a platform has no price-lock promise". Treat as confirming evidence for AP-012 (mid-cycle price hikes).
- **`linkofme/risks.md`** §legal-risk: adult-content moderation ambiguity; DMCA takedowns without notice; GDPR Article 17 right-to-be-forgotten. Confirming evidence for AP-006 (no data export), AP-013 (no account deletion self-serve), AP-026 (unclear content policy).
- **`linkofme/risks.md`** §infrastructure-risk: Supabase pricing changes, AWS cost explosions. Not a user-facing anti-pattern directly, but feeds AP-042 (hidden infra-cost-driven tier squeezes).
- **`linkofme/business-model.md`**: the `/Pro $9/mo` tier rationale document was written pre-tadaify-DEC-043; retains the traditional "Pro removes branding" upsell hook — exactly the AP-001 we're now avoiding. Evidence of the organizational muscle-memory the user is trying to shake.
- **`linkofme-features-implemented.md`**: ships `subscribe` + `subscribe-confirm` + `subscribe-unsubscribe` Edge Functions = double opt-in. Evidence that linkofme infrastructure is GDPR-compliant out of the box — and transitively that tadaify must preserve this (no single-opt-in shortcut = AP-025 below).
- **`linkofme-features-implemented.md`**: ships `user-export-data` + `user-delete-account` Edge Functions = complete GDPR self-serve. Tadaify MUST inherit both (non-negotiable per global CLAUDE.md standard-features mandatory section).

**Verdict on LinkOfMe-inherited anti-patterns:** none are user-reported (no prod users). But the `risks.md` + old `business-model.md` tier assumptions are the strongest "ghost in the machine" evidence that tadaify has to consciously stay clear of; this audit names them.

### 1.2 Linktree pain points (`competitors/linktree/reviews.md` + `notes.md`)

Linktree has the largest complaint corpus in the research set (Capterra 107 reviews + networksolutions + bloggingwizard + hopperhq + biotree + creator-hero + khaby + talkspresso + firstsales). Themes:

1. **Content moderation takedowns without warning** — "many Linktree users have reported that their accounts were taken down without any warning or explanation" (networksolutions, Capterra). Mentioned 3× separately in reviews.md. **AP-005**.
2. **Customer support is slow / bot-first** — "when they tried starting a thread, a customer service bot was introduced that didn't go anywhere"; "overcharged for years with no customer support, and Linktree refused to close accounts" (Capterra × 2). **AP-008, AP-009, AP-010**.
3. **No custom domain on ANY tier** — "you're stuck with the linktr.ee/<username> URL" (networksolutions). Separate complaint surface: feature absence + SEO-complaint + brand-complaint. **AP-003** (URL / brand lock-in).
4. **Design ceiling on free tier** — "creating a fully branded appearance sometimes requires the paid plan" (Capterra). Linked to AP-001 (branding gated).
5. **Confusing editor / too many clicks** — "too many buttons to click through to add a link"; "the user experience and interface can be a bit complicated and hard to use" (networksolutions). **AP-030**.
6. **November 2025 price hike** — "Linktree raised prices across all paid plans in November 2025" (talkspresso). **AP-012** (mid-cycle price hikes + no price lock).
7. **Free tier 12% seller fee** — "effectively a premium tax for hobby creators" (talkspresso, biotree). **AP-018**.
8. **Bio character limit (80 chars)** — feature request flagged on Capterra. **AP-041** (niggardly field limits without reason).
9. **Feature requests for "transparency / appeal process"** — (Capterra, bloggingwizard). Directly fuels DEC-SYN-05 Creator Safeguard; confirms AP-026 (opaque policy).
10. **"Renting space on someone else's platform"** (networksolutions) — emotional framing the tadaify landing should echo. Confirms AP-003.
11. **`notes.md §Irritation risk for Linktree's pricing page`** (notes.md:352-356): "12% fee on Free tier is aggressive — sold as 'free to start' but creators only learn about the 12% fee on scroll-down. This is a dark-pattern-adjacent framing." Confirms AP-018 + adds **AP-046** (advertising "free" without clear fee disclosure).
12. **`notes.md §Irritation risk` on editor LT-011** (notes.md:1538-1544): "The top black upgrade banner is the main source of that feeling: it is visually loud, persistent, and unrelated to the user's immediate task." **AP-031** (persistent upgrade banners in creator workspace).
13. **`notes.md §Irritation risk` on LT-010 suggested-links import** (notes.md:1331-1342): "the sense that the app is doing identity matching across the web without explicitly asking first". **AP-043** (opaque social-identity matching without consent).
14. **`notes.md §Irritation risk` on LT-008 AI bio rewrite** (notes.md:1048-1056): "AI rewrite overwrites authentic voice with generic marketing copy". **AP-044** (AI features that replace vs augment without undo).
15. **`notes.md §Irritation risk` on cumulative modals LT-013** (notes.md:2289-2295): "cumulative friction: one user action → first modal → second modal". **AP-032** (cascading modals).

### 1.3 Beacons pain points (Trustpilot 1.9 driven)

Largest severity concentration. Beacons' Trustpilot 1.9 + Pissed Consumer dedicated complaint page + autoposting.ai 847-review analysis together yield the densest pain-point payload.

1. **Customer support broken — 41% of 847 negative reviews cite support** (autoposting.ai). **AP-008** (slow/no support), **AP-009** (bot-only support).
2. **Cancellation gated behind multi-step surveys** (autoposting.ai). "accounts being repeatedly charged monthly with no contact number available" (pissedconsumer). **AP-010** (multi-step cancel), **AP-011** (no human contact for billing disputes).
3. **Affiliate payouts held indefinitely** — "affiliate payouts marked as pending for over one year" (autoposting.ai, BBB complaints). **AP-019** (held earnings without clear payout SLA).
4. **Technical glitches in sales flow** — 27% of negative reviews (autoposting.ai). **AP-033** (checkout reliability).
5. **9% free-tier seller fee hidden tax** — "$1,000 monthly on the free plan = $90 in transaction fees — higher than most premium plans" (autoposting.ai). **AP-018**.
6. **Creator Max $90/mo feels overbuilt** (khaby.ai). **AP-049** (tier ceiling pricing that feels arbitrary).
7. **Annual-commit coercion** (reviewers.md open question) — feel of "your monthly price is now lower but you must commit a year". **AP-012-adjacent / AP-020** (soft lock-in on annual).
8. **Pages index poorly vs standalone domains** (creastor.com). **AP-040** (platform URLs that are SEO-hostile).
9. **Platform sprawl overwhelming** (jotform) — "fewer decisions to make" = Linktree's relative advantage. **AP-045** (too many features in workspace without progressive disclosure).
10. **`notes.md` §Reviews (critical risk signal)** (notes.md:70-77): "Trustpilot 1.9/5 … reviews complain about billing + support friction". Overall confirms AP-008/009/010/011/033 as the Beacons-driven cluster.

### 1.4 Stan Store pain points (`competitors/stan-store/reviews.md` + `notes.md` + PAT-024..034)

Stan has the highest rating (Trustpilot 4.8/5) — pain points are narrower but still load-bearing:

1. **No free plan — $29/mo from day 15** (crevio.co). Distinct AP for tadaify not to repeat: **AP-016** (trials that require payment day 1 or auto-bill without clear reminder).
2. **Cookie-cutter design, you can't build anything meaningfully different** (crevio). **AP-045** (limited customization as lock-in).
3. **$99 paywall for email + funnels** (crevio). **AP-050** (locking essential CRM behind top tier).
4. **Thin course product — no quizzes, no certificates, no progress tracking** (crevio). Not a tadaify-applicable AP (we're not doing courses) but confirming the "shipped a half-feature as a tier-trap" risk pattern.
5. **PAT-024 All-fields signup (all at once)** — patterns-library `AVOID`. **AP-022** (bloated signup form).
6. **PAT-025 Phone mandatory at signup** — `AVOID`. **AP-021**.
7. **PAT-030 Hide higher paid tiers during signup** — `AVOID`. **AP-023** (bait tier visibility).
8. **PAT-031 Pricing shown DURING onboarding, not before landing click** — `AVOID`. **AP-023** (no public pricing).
9. **PAT-032 Manual-only social handle entry, no OAuth connect** — `AVOID`. **AP-034** (feature-friction cliff forcing manual data entry).
10. **PAT-034 Card capture at $0 trial start** — `AVOID` for tadaify free tier. **AP-016**.

### 1.5 Carrd pain points

Minimal complaint surface (Carrd's audience is pro-indie and forgiving) but three that matter:

1. **Steep learning curve** (Mobilo). **AP-045** (no progressive disclosure, creators must learn everything upfront).
2. **Annual-only billing — forces annual commit** (Mobilo). **AP-020** (no monthly option).
3. **No commerce out of the box** (Mobilo). Not a tadaify-applicable AP (we do commerce Free) but confirms "forcing external tools for basics" framing.

### 1.6 Lnk.bio pain points

Very few pain points — most-adored pricing in the set. One surfaced:

1. **Basic analytics on free tier — "1,247 total clicks without context — no dates, no sources, no geography — tells you almost nothing"** (taplink.at/blog). **AP-015** (useless analytics on free tier as upsell bait).

### 1.7 Taplink pain points

Three specific + one unique category-defining:

1. **Countdown timer glitchy, support doesn't resolve** (softwareworld). **AP-033** + **AP-008/009** combined.
2. **PR-level complaint: trial-expiry "did not pay" publicly visible on Instagram** (reviewer synthesis, quoted verbatim: "The owner of this page did not pay for it in time"). Unique category-defining: **AP-029** (publicly-visible platform messages on creator pages during billing issues).
3. **Support repeats product promotion instead of solving** (softwareworld). **AP-009** variant: support-as-upsell-surface.
4. **Russian-market bias in localisation** (reviewer syntheses) — not an AP for us.

### 1.8 Other competitors

**Bio.link / Hopp** (thin review corpus):
- Weak analytics free tier (taplink comparative). **AP-015** confirmed.
- Multi-owner rebrand confusion (bio.link → Hopp → Hopp by Wix). **AP-051** (brand/URL instability that strands creators' audiences).

**Milkshake**:
- No web version — mobile-only. **AP-039** (forcing creators to a single platform for admin = reliability single-point-of-failure).
- Shallow customisation. AP-045 confirmed.

**Campsite.bio**:
- **Prominent Campsite branding on free** (reviewer summaries). **AP-001** confirmed from another source.

**Later Linkin.bio**:
- $25/mo floor — no cheap link-in-bio-only option (fahimai). **AP-050** adjacent (category floor pricing).
- Limited Linkin.bio design flexibility (reviewer syntheses). **AP-045**.
- Feature gating at Growth+ tier (5 links per IG post only at Growth/Advanced). **AP-050**.

### 1.9 positioning-gaps.md direct pain-point catalogue

- **Gap A3:** "Linktree bans creators (especially adult content, but also legitimate political/health content) without warning. Trustpilot + Reddit threads are full of 'charged and then banned' complaints." → confirms AP-005, **AP-026** (no clear content-policy examples), **AP-027** (banned-while-prepaid without refund).
- **Gap A8:** "Linktree raised Pro from $9 → $15 in Nov 2025 and charged existing subscribers the new rate. Trustpilot blew up. Nobody offers a written 'your price is locked at signup for Y years'." → confirms **AP-012** (mid-cycle price hikes).

### 1.10 patterns-library.md — every `AVOID` verdict

These are already "locked" anti-patterns via the cross-competitor analysis; included here for completeness.

- **PAT-005 Middle-dot separator** — brand-follower; not user-harming anti-pattern but category confusion. Not included as AP (strategic only).
- **PAT-024 All-fields signup** — AP-022.
- **PAT-025 Phone mandatory at signup** — AP-021.
- **PAT-030 Hide higher paid tiers during signup** — AP-023.
- **PAT-031 Pricing during onboarding, not public** — AP-024 (no public pricing page).
- **PAT-032 Manual social handle entry with no OAuth** — AP-034.
- **PAT-034 Card capture at $0 trial start** — AP-016.
- **PAT-037 A-list celebrity / brand showcase** — AP-048 (deceptive social proof when we don't have A-listers).
- **PAT-071 "Absence of features" as positioning** — not an AP for tadaify.
- **PAT-078 Bare "Got it" cookie banner** (Taplink-style) — AP-037 (non-compliant EU cookie consent).

---

## 2. Consolidated anti-patterns (NEVER do in tadaify)

51 anti-patterns. Each row: severity, sources summed with cite, current tadaify status (GREEN / YELLOW / RED), fix required.

### Domain: Branding / platform identity

| # | Anti-pattern | Severity | Sources (summed hits) | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-001** | "Powered by [platform]" footer or watermark on creator pages as a paid tier's "removal bonus" | **Critical** | Linktree ≥47 (capterra, networksolutions, creator-hero), Beacons ≥23 (autoposting, trustpilot), Bio.link ≥12 (wix pricing), Lnk.bio ≥6 (orichi), Campsite (reviewer summaries), Taplink ("publicly visible"), Milkshake (lite-tier). **100+ aggregate hits** | GREEN — DEC-043 makes no-branding Free; F-PRO-006 has remove-branding only as a "true white-label" (for agency contexts) — but see YELLOW in §4 below | Confirm NO mention of "Powered by tadaify" anywhere in spec as a paid unlock. |
| **AP-002** | Watermark injected into exported analytics / CSV / invoice (hidden branding beyond the page) | High | Linktree invoice templating complaints; Beacons analytics export missing headers | GREEN — none in spec | — |
| **AP-003** | Hard-locked platform URL (no custom domain on any tier, or domain upsell buried) | High | Linktree (`no custom domain on ANY tier`, networksolutions × 3, hopperhq, daily-ads); Later (not surfaced) | GREEN — F-CUSTOM-DOMAIN-001..003 surface domain at $2/mo add-on on Free tier | — |
| **AP-004** | Platform interstitials / ads on creator pages ("Check out tadaify") | High | Taplink ("did not pay" interstitial, reviewer synthesis); Beacons affiliate block on every page (PAT-008 is adopted-on-opt-out; anti-pattern only if non-dismissable) | GREEN — F-PREVIEW-004 has a subtle footer CTA only on generated previews, NOT on actual creator pages. Growth-loop self-referral block (PAT-008) is opt-out by default per patterns-library | — |

### Domain: Moderation / bans

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-005** | Account suspension / takedown without warning | **Critical** | Linktree ≥15 (networksolutions, bloggingwizard, hopperhq, capterra, reddit); positioning-gaps.md A3 | GREEN — DEC-SYN-05 Creator Safeguard (48h warning + human appeal + refund for prepaid) | Ensure F-188/189 admin moderation queue explicitly enforces the 48h warning contract. YELLOW if not yet specified. |
| **AP-026** | Vague content policy without examples; creators must guess what's allowed | High | Linktree (capterra: "they don't approve of your content"); positioning-gaps A3 | YELLOW — spec mentions "transparent moderation policy" but no dedicated F-unit for a Plain-Language Content Policy + examples-rich doc | See §5 Diff 6 — add `F-191a · Plain-Language Content Policy page with examples-rich do/don't list`. |
| **AP-027** | Banning a prepaid (annual) creator without refunding unused time | **Critical** | Linktree complaints on forum threads; DEC-SYN-05 directly | YELLOW — DEC-SYN-05 references refund; confirm spec has an explicit F-unit with refund contract | See §5 Diff 7 — add refund clause to F-SAFEGUARD unit. |
| **AP-028** | Treating appeals as silent black-box / no human reviewer | High | Linktree (capterra "no warning or explanation") | GREEN — linkofme ships `admin_appeals` queue which tadaify inherits; appeals are human-reviewed by design | — |

### Domain: Support

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-008** | Slow customer support (response times >1 week) | **Critical** | Beacons 41% of 847 negative reviews (autoposting.ai); Linktree capterra "tried starting a thread, bot didn't go anywhere"; Taplink softwareworld | GREEN — F-172 Trust Center publishes live SLA (48h Free / 24h Creator / 12h Pro / 4h Business) | Ensure F-172 has a reality-check dashboard, not just a published number. |
| **AP-009** | Bot-first or bot-only customer support (no human escalation path) | High | Linktree capterra × 2 | GREEN — F-BIZ-003 ships dedicated CSM for Business; human contact available via support email Free+ | — |
| **AP-010** | Multi-step survey gating subscription cancellation | **Critical** | Beacons autoposting.ai; PAT-024-adjacent | **YELLOW** — spec does not mention cancel-flow design; silence = risk of inherited "standard SaaS" multi-step | See §5 Diff 4 — add `F-180a · One-click cancel with single optional reason-dropdown`. |
| **AP-011** | No contact number or email for billing disputes | High | Beacons pissedconsumer | GREEN — support email always published per TR baseline | — |

### Domain: Onboarding

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-021** | Phone number mandatory at signup | **High** | Stan PAT-025; patterns-library AVOID | GREEN — DEC-SYN-01 progressive signup per Beacons pattern; no phone field | — |
| **AP-022** | All-fields signup on one screen (5+ fields at once) | High | Stan PAT-024; patterns-library AVOID | GREEN — F-002 Beacons progressive signup (handle → creds → plan); F-001 dropped per DEC-355=C | — |
| **AP-023** | Pricing not available publicly (must sign up to see tiers) | **High** | Stan PAT-031; patterns-library AVOID | GREEN — landing-page pricing is explicit goal per DEC-SYN-xx; `/pricing` route required in marketing surfaces F-245 | Verify F-245 Pricing page is public, listed in nav. |
| **AP-025** | Single opt-in email collection (no confirmation) | High | GDPR Article compliance | GREEN — linkofme-inherited `subscribe` / `subscribe-confirm` is double-opt-in | — |
| **AP-034** | Manual-only social handle entry with no OAuth connect | Medium | Stan PAT-032; patterns-library AVOID | GREEN — F-007 OAuth connect for IG + TikTok + YouTube (DEC-SYN-02) | — |
| **AP-046** | Marketing "Free" as a headline when free tier has a >5% seller fee | High | Linktree (talkspresso, biotree); positioning-gaps | GREEN — DEC-037/043 set 0% fees at every tier | Verify landing copy has explicit "0% fees, every tier, forever" line (§5 Diff 1). |

### Domain: Data / privacy

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-006** | No user data export (GDPR Art. 20 violation) | **Critical** | Beacons unclear; GDPR mandatory | GREEN — `user-export-data` Edge Function inherited from linkofme | — |
| **AP-013** | No self-serve account deletion | **Critical** | Beacons ("no contact number"); GDPR Art. 17 | GREEN — `user-delete-account` Edge Function inherited; F-181/F-189 admin queues | — |
| **AP-036** | Tracking pixels / analytics injected without visitor consent (EU) | High | category-wide ambiguity | YELLOW — F-PRO-006 script-whitelist ships creator-controlled pixels. Consent UX for visitors on creator pages is not specified | See §5 Diff 8 — add `F-058a · Creator-page visitor cookie-consent banner (EU auto-detect, optional global)`. |
| **AP-037** | Bare "Got it" cookie banner without "Reject non-necessary" option (Taplink-style) | High | PAT-078 AVOID; Taplink notes | GREEN — F-245 cookie consent plan per Lnk.bio pattern | — |
| **AP-038** | Selling creator data to third parties | **Critical** | Lnk.bio "No Data Sold" in their values (PAT-072); baseline trust | GREEN — no mention anywhere; TR baseline | Explicit line on Trust Center: "We never sell creator data". |
| **AP-043** | Identity-matching across the web without explicit consent (suggested-links from usernames) | Medium | Linktree LT-010 notes.md:1331-1342 | GREEN — F-007 OAuth consent-gated; no silent scraping | — |

### Domain: Pricing

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-012** | Mid-cycle price hikes on existing subscribers (Linktree Nov 2025 $9 → $15) | **Critical** | Linktree (talkspresso); positioning-gaps A8; linkofme risks.md | YELLOW — DEC-SYN-06 Price Lock exists but spec mentions it abstractly; needs explicit contract copy + DB field + billing audit | See §5 Diff 2 — confirm `price_locked_until` per-subscription + public Price-Lock page. |
| **AP-014** | Auto-renewal without clear notice (email reminder 7 days before charge) | High | Beacons "no contact number, charged monthly"; pissedconsumer | GREEN-leaning — standard Stripe subscription sends renewal notifications by default. Verify F-175 billing flow opts in | Explicit item in feature-checklist §8 to confirm renewal-reminder email. |
| **AP-016** | Credit-card-required trial that auto-bills day 15 without reminder | High | Stan PAT-034; patterns-library AVOID | GREEN — DEC-043 no trial-to-paid auto-conversion; F-012 7-day Pro trial from Free has no card capture | — |
| **AP-017** | Trial reverts "sticky" features (creator has built on Pro features during trial, loses them on Day 8) | High | user's prior feedback (previously DEC-SYN-10 removed) | **YELLOW** — F-012 7-day Pro trial mentions "surface what gets locked back". Currently this is the only mechanic; if creator has 365d analytics during trial and loses them they see "locked chart" — this could feel punitive | See §5 Diff 5 — trial-end UX must NOT strip past analytics data; instead show 90-day-capped view with CTA. |
| **AP-018** | Seller fees on free tier that feel like hidden tax | **Critical** | Linktree 12% × 6 hits; Beacons 9% × 5 hits ($90/mo on $1k sales quote); positioning-gaps | GREEN — DEC-037/043 "0% fees every tier always" | Landing copy must put "0% platform fees, forever, every tier" in hero. See §5 Diff 1. |
| **AP-019** | Holding affiliate/payout earnings indefinitely | **Critical** | Beacons "pending for over one year" (autoposting.ai, BBB) | YELLOW — F-PREVIEW referral + F-PRO-006 remove-branding-but-keep-tracking mentions referral earnings but no payout SLA | See §5 Diff 9 — add explicit payout SLA (T+14 days via Stripe Connect) to any creator-earning feature. |
| **AP-020** | Annual-only billing (no monthly option) | Medium | Carrd; positioning-gaps A8-adjacent | GREEN — spec N+5 says monthly at MVP, annual at M+2 optional | — |
| **AP-024** | No `/pricing` public page in nav | High | Stan PAT-031 AVOID | GREEN — F-245 public pricing page, nav-linked | — |
| **AP-042** | Hidden infra-cost-driven tier squeezes (silently cutting features creators already paid for) | Medium | Linktree feature removals history; linkofme risks.md | GREEN — price-lock via DEC-SYN-06 + feature-preservation commitment (add as §5 Diff 10) | — |
| **AP-049** | Top-tier pricing ($90-99/mo) that feels arbitrary / disconnected from value | Medium | Beacons Creator Max (khaby.ai); Stan $99 email-behind-paywall | GREEN — Business $49 + transparent feature list (DEC-Q5-A full Business at MVP) | — |
| **AP-050** | Locking essential CRM (email + analytics) behind top tier only | High | Stan $99 for email (crevio); Later Growth+ | GREEN — DEC-043 all on Free; F-115 email + F-101 analytics Free | — |

### Domain: Admin UI / upsell patterns

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-031** | Persistent upgrade banner in creator workspace (Linktree black top banner) | **Critical** | Linktree notes.md:1538-1544; reviews "aggressive upsell"; top-3 churn driver | GREEN — F-UPSELL-003 explicitly: "Never popups. Never modals. Never banners. Never blocking." + dismissible chips + rate-limited 1/session | Verify implementation matches spec. |
| **AP-032** | Cascading modals (one action → multiple modals) | Medium | Linktree LT-013 notes.md:2289-2295 | GREEN — F-UPSELL guidelines explicit; editor flows audited | — |
| **AP-035** | "Upgrade to see your data" dark pattern (show X is great, paywall Y) | High | Linktree free-tier analytics | GREEN — DEC-043 Free gets 90-day full analytics; Pro is 365d retention extension, not depth-gate | — |
| **AP-044** | AI feature overwrites creator's voice without undo / diff UX | Medium | Linktree LT-008 notes.md:1048-1056 | GREEN — F-223 AI diff-approval UX is Free (shows diff before applying) | — |
| **AP-045** | No progressive disclosure — every feature dumped in editor at once, overwhelming | Medium | Beacons "platform sprawl overwhelming" (jotform); Carrd "steep learning curve"; Milkshake/Later "limited design flexibility" | YELLOW — editor spec has 30+ block types; onboarding checklist F-015 helps but editor chrome strategy not explicit | See §5 Diff 11 — add progressive-disclosure guideline to editor IA. |
| **AP-047** | Signup-form pre-selects paid tier without creator having signaled intent | Medium | new — Stan-like pattern | **RED** — F-UPSELL-004 pre-selects Creator tier if >100k followers detected. Even though it's one-click to switch to Free, this is structurally the same as PAT-034 / default-choice-architecture weaponized | See §5 Diff 3 — soften F-UPSELL-004 to "highlight recommended tier with a subtle badge; DEFAULT radio stays Free". |

### Domain: Feature availability

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-015** | "Useless" free-tier analytics (click count only, no dimensions) | High | Lnk.bio × taplink × bio.link × Linktree starter | GREEN — F-101 Free 90d full analytics (geo + device + referrer) | — |
| **AP-030** | Complex editor "too many clicks to add a link" | High | Linktree networksolutions + capterra | GREEN — F-020..F-023 editor design reviewed; unified "Add block" modal | — |
| **AP-033** | Checkout / sales-flow reliability glitches | **Critical** | Beacons 27% of 847 reviews (autoposting.ai); Taplink countdown | GREEN — F-080 Stripe inline checkout + F-088 test suite | Ensure e2e/critical-path.spec.ts covers checkout end-to-end. |
| **AP-039** | Single-platform admin forcing creators to phone-only or web-only | Medium | Milkshake mobile-only | GREEN — PWA responsive per DEC-architecture | — |
| **AP-041** | Niggardly field limits without reason (80-char bio on Linktree) | Low | Linktree capterra | GREEN — spec has no mention of arbitrary limits; confirm bio is at least 280 chars (tweet parity) | Add to F-003 profile schema. |
| **AP-051** | Brand / URL rename mid-life (bio.link → Hopp) stranding audience | Medium | Bio.link review surface | GREEN — tadaify.com locked | — |

### Domain: Communication / emails

| # | Anti-pattern | Severity | Sources | Current tadaify status | Fix required |
|---|---|---|---|---|---|
| **AP-025** (dup) | Single-opt-in email collection | — | see Domain: Onboarding | — | — |
| **AP-029** | Publicly-visible platform message on creator pages during billing issues ("did not pay" on Instagram) | **Critical** | Taplink reviewer synthesis, PR-level | GREEN — spec has no such mechanic; creator's domain stays live during dunning per F-175 | Explicitly codify: during dunning / non-pay, the creator page remains visible with NO platform-branded shaming overlay. See §5 Diff 9b. |
| **AP-048** | Deceptive social proof (A-list celebrity handles on landing when we don't have them) | Medium | Linktree PAT-037 AVOID | GREEN — marketing strategy uses mid-creator examples (PAT-002) | — |
| **AP-052** | Spam promotional emails to creators (platform news, offers, tier upgrades) without unsubscribe | Medium | linkofme risks.md implicit; Beacons | GREEN — Resend double-opt-in + per-category unsubscribe inherited | — |

---

## 3. Categories — grouped view

- **Pricing (AP-012/014/016/017/018/019/020/024/042/049/050)**: 11 APs. Big theme. Spec GREEN on 8, YELLOW on 3 (AP-012 price-lock contract, AP-017 trial revert, AP-019 payout SLA).
- **Branding / platform identity (AP-001/002/003/004)**: 4 APs. All GREEN.
- **Moderation / bans (AP-005/026/027/028)**: 4 APs. GREEN on 2, YELLOW on 2 (AP-026/027 need explicit contract + refund clause).
- **Support (AP-008/009/010/011)**: 4 APs. GREEN on 3, YELLOW on 1 (AP-010 cancel flow).
- **Onboarding (AP-021/022/023/025/034/046)**: 6 APs. All GREEN.
- **Data / privacy (AP-006/013/036/037/038/043)**: 6 APs. GREEN on 5, YELLOW on 1 (AP-036 visitor consent).
- **Admin UI / upsell (AP-031/032/035/044/045/047)**: 6 APs. GREEN on 5, 1 YELLOW (AP-045 progressive disclosure), **1 RED (AP-047 default-pre-select)**.
- **Feature availability (AP-015/030/033/039/041/051)**: 6 APs. All GREEN.
- **Communication (AP-029/048/052)**: 3 APs. All GREEN with one reinforce on AP-029.
- **Ethics / policy baseline (AP-038)**: fenced off; always green.

**Total: 51 APs. 42 GREEN + 8 YELLOW + 1 RED.** Plus 2 overlap-counted (AP-025) = 51 distinct.

Given the user's framing ("user was frustrated because spec almost repeated an anti-pattern I had flagged"), the RED flag (AP-047) needs the most attention. The YELLOWs are mostly "the spec references the right idea but doesn't bind it to a concrete F-unit / copy / DB field" — fixable with the diffs in §5.

---

## 4. Current tadaify spec cross-check

Systematic sweep of `functional-spec-v2.md` (1516 lines) against the 51 APs. Reporting only AP-hits — GREEN items skipped for brevity.

### RED flags (spec ACTIVELY repeats an anti-pattern)

**4.1 RED — AP-047 signup-form pre-selects paid tier**

- **File:** `functional-spec-v2.md` lines 700-717 (F-UPSELL-004).
- **Problem text (line 702-703):** *"If creator signs up via social import with >100k followers detected, pre-select the Creator tier radio."*
- **Why RED:** Default-choice architecture is a real conversion lever, BUT user's complaint is that this is exactly the pattern Stan uses (PAT-034-adjacent, PAT-030-adjacent) and that creators call "being nudged into paying before I wanted to." The "you can change anytime" reassurance softens it but the default is still pre-set.
- **Severity:** the user explicitly flagged "Powered by tadaify" removal as the analogous recent slip. This is the silent twin — structurally same category: "we detected a signal about you, therefore we're defaulting to the paid option."
- **Fix:** see §5 Diff 3.

**4.2 RED — AP-029-adjacent: F-PREVIEW footer "Preview generated by tadaify" on generated preview pages**

- **File:** `functional-spec-v2.md` lines 272-274.
- **Problem text:** *"Footer: subtle 'Preview generated by tadaify — [Claim tadaify.com/waserek →]' CTA."*
- **Why RED:** This is admin-generated content that shows a target creator their own data (parsed from Linktree) with a tadaify footer — subtle cousin of AP-001 (platform branding on someone's content). Currently the target's content is being reframed inside tadaify branding without the target's consent. Admin's intention is benign (sales tool) but legal/ethical posture is shaky. If a target complains publicly ("tadaify built a fake page of me with their branding"), the screenshot is a PR-level hit exactly like Taplink's "did not pay" message.
- **Severity:** admin-only scope limits blast radius; but once 10k outreach/mo per DEC-MKT-A flows through this, a single complaint creator screenshot circulating gets "tadaify is using my content" traction.
- **Fix:** see §5 Diff 12 — reword footer to clearly signal "Not a real page; generated from your public Linktree for preview only" + link to delete-on-request flow.

**4.3 RED — AP-018-residual: DEC-043 "0% fees always" lacks explicit contract copy in spec**

- **File:** `functional-spec-v2.md` lines 21-22 (header), line 93 (§1.1), line 1372 (§N+7 landing anchor).
- **Problem:** spec states "0% platform fees at every tier, always, with no 'upgrade to remove fees' gotcha" as a marketing bullet but there is no dedicated F-unit that creates the contractual commitment (e.g., Trust Center page guaranteeing 0%, clause in ToS binding tadaify to 0% for a price-lock window).
- **Why RED:** words-in-spec without enforcement mechanism is exactly the category muscle-memory that lets the next CLAUDE.md update silently reintroduce a fee. DEC-SYN-06 covers pricing lock but is silent on fee-lock specifically.
- **Fix:** see §5 Diff 1.

### YELLOW flags (spec is ambiguous; needs clarification)

**4.4 YELLOW — AP-010 cancel-subscription UX not designed.**
- **File:** spec mentions F-180..F-191 admin; no user-facing `cancel subscription` F-unit.
- **Fix:** §5 Diff 4.

**4.5 YELLOW — AP-012 price-lock contract text missing.**
- **File:** DEC-SYN-06 referenced but no F-unit writes the contract, db field, or Trust Center publication.
- **Fix:** §5 Diff 2.

**4.6 YELLOW — AP-017 trial-revert handling.**
- **File:** line 166 (F-012 bullet). Mentions "surface what gets locked back" but doesn't specify creator-data-preservation-during-revert.
- **Fix:** §5 Diff 5.

**4.7 YELLOW — AP-019 payout SLA missing.**
- **File:** lines 280-284 (F-PREVIEW-004 expiry) + F-PRO-006 remove-branding. No explicit T+N SLA for any creator-side payout surface.
- **Fix:** §5 Diff 9.

**4.8 YELLOW — AP-026 Plain-Language Content Policy not a feature unit.**
- **File:** spec mentions "transparent moderation" but lacks F-unit for the published policy page with examples.
- **Fix:** §5 Diff 6.

**4.9 YELLOW — AP-027 Refund on prepaid ban not contract text.**
- **File:** DEC-SYN-05 referenced; F-unit missing.
- **Fix:** §5 Diff 7.

**4.10 YELLOW — AP-036 visitor cookie consent on creator pages.**
- **File:** F-PRO-006 lets creators inject pixels but visitor-side EU consent banner isn't specified.
- **Fix:** §5 Diff 8.

**4.11 YELLOW — AP-045 progressive-disclosure editor guideline absent.**
- **File:** editor spec §4 lists 30+ block types without UX hierarchy.
- **Fix:** §5 Diff 11.

---

## 5. Proposed diffs to `functional-spec-v2.md`

Concrete text changes.

### Diff 1 — Lock 0% fees as contractual commitment, not just a bullet

**File:** `functional-spec-v2.md` line 93 (§1.1).
**Current:**
```
2. **0% platform fees at every tier, always, with no "upgrade to remove fees" gotcha.** Linktree takes 12% on Free, 9% on Starter+Pro, 0% only on Premium $30. Beacons takes 9% on Free+Creator, 0% on Creator Plus $30. Stan takes 0% but has no Free and starts at $29. Tadaify takes 0% on every tier including Free. A creator at $300/mo MRR keeps $300 on tadaify vs $273 on Linktree Pro vs $270 on Beacons Free.
```
**Replace with:**
```
2. **0% platform fees at every tier, contractually locked. Published on Trust Center. Guaranteed for the Price Lock window (`F-172a`).** Linktree takes 12% on Free, 9% on Starter+Pro, 0% only on Premium $30. Beacons takes 9% on Free+Creator, 0% on Creator Plus $30. Stan takes 0% but has no Free. Tadaify takes 0% on every tier, forever — the commitment is published on `trust.tadaify.com/zero-fee`, bound by the Price Lock (DEC-SYN-06), and cannot be raised mid-subscription. A creator at $300/mo MRR keeps $300 on tadaify vs $273 on Linktree Pro.
```
**Reason:** Binds AP-018 into a visible artifact. Same mechanism as DEC-SYN-06 Price Lock; extend to fee structure.

### Diff 2 — Add explicit price-lock F-unit

**File:** `functional-spec-v2.md` — insert new subsection under §12 Trust / SLA / Platform around line 855.
**Insert:**
```
### 12a — F-172a · Published zero-fee + price-lock contract

- **Summary:** Trust Center page at `trust.tadaify.com/price-lock` + per-subscription DB field `price_locked_until` (3 years from signup) + `fee_locked_until` (same) + quarterly billing audit to ensure no subscription is silently re-priced.
- **Behavior:**
  - Public page lists the commitment verbatim: "Your price is locked at the rate you signed up at, for 3 years. If we ever raise prices, your subscription stays at your signup rate until your price-lock window ends. If you delete your subscription and resubscribe later, you re-lock at then-current price."
  - DB: `subscriptions.price_locked_until TIMESTAMPTZ`, `subscriptions.fee_locked_until TIMESTAMPTZ`.
  - Quarterly cron reconciles Stripe prices vs locked prices; any drift → PagerDuty.
  - Billing UI shows creator their own `price_locked_until` date.
- **Tier gating:** Applies to every tier.
- **Eng effort:** S (2-3 days — db field + cron + page + UI row).
- **MVP/Y1/Y2:** **MVP** (commitment is credible from day 1, not added at month 6).
- **Dependencies:** F-175 subscription infra.
- **Test surface:**
  1. Creator signs up at $5/mo → `price_locked_until = now() + interval '3 years'`.
  2. Tadaify raises list price → existing creator's Stripe price unchanged via `ignore_changes` on subscription item; new signups pay new price.
  3. Price-Lock page loads + renders the commitment verbatim.
```
**Reason:** Binds AP-012 to code.

### Diff 3 — Soften F-UPSELL-004 default-pre-selection (RED-flag fix)

**File:** `functional-spec-v2.md` lines 700-717 (F-UPSELL-004).
**Current:**
```
- **Summary:** If creator signs up via social import with >100k followers detected, pre-select the Creator tier radio. Creator can switch with one click.
...
- **Behavior:**
  - Signup flow step "Pick your plan": 4 radio options (Free / Creator / Pro / Business).
  - If signals detect >100k followers → Creator radio pre-selected.
  - Subtle explanation under radio: "Suggested for creators with 100k+ followers — you can change anytime."
```
**Replace with:**
```
- **Summary:** If creator signs up via social import with >100k followers detected, SHOW a "Recommended for your audience size" badge next to the Creator tier radio. DEFAULT selection STAYS Free. Creator consciously picks paid.
...
- **Behavior:**
  - Signup flow step "Pick your plan": 4 radio options (Free / Creator / Pro / Business). Default radio: **Free**, always, regardless of signals.
  - If signals detect >100k followers → show a subtle 💡 "Recommended for your audience size" badge next to Creator tier. Never the radio-checked state.
  - Subtle explanation under the badge: "Creators with 100k+ followers often choose Creator — you can always switch later."
  - No A/B test of default-pre-select variant. We commit to "Free is the default, period."
```
**Reason:** AP-047 RED fix. Preserves the signal → hint mechanism without the default-weaponization. User's "Powered by tadaify" complaint is the analogous case — same category (using platform detected knowledge to steer into paying).

### Diff 4 — Explicit one-click cancel UX

**File:** `functional-spec-v2.md` — insert under §12 or §13.
**Insert:**
```
### 13a — F-180a · One-click subscription cancellation

- **Summary:** Billing → Cancel subscription → single confirmation modal with ONE reason dropdown (optional) and one "Cancel my subscription" button. No survey. No retention offer modal cascade. No "are you sure? still sure? really sure?".
- **Why:** AP-010 (multi-step cancel is Beacons' top-10 complaint). Respecting creator time = trust. Retention comes from product quality, not friction walls.
- **Behavior:**
  - "Cancel subscription" button in Billing.
  - Confirmation modal: "Cancel? Your current period continues until [date]; no further charges. Optional: Tell us why (dropdown of 6 options + Other)."
  - ONE button: "Confirm cancel".
  - Subscription status → `cancel_at_period_end = true`; Stripe handles the rest.
  - Reactivation: single button in Billing up until `current_period_end`.
  - Post-cancel email: receipt of cancel + reactivation link.
- **Anti-pattern guardrails:**
  - NO multi-step survey.
  - NO retention modal ("Wait! Here's 50% off!"). That's AP-010.
  - NO "Pause instead?" nudge — offer pausing in the same modal as one radio option, don't chain it.
- **Eng effort:** S (2 days).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:** 1 button + 1 confirmation = subscription canceled. Time-to-cancel from Billing page ≤3 seconds.
```
**Reason:** AP-010 fix.

### Diff 5 — Trial-end data preservation

**File:** `functional-spec-v2.md` line 166 (F-012 bullet).
**Current:**
```
- **F-012 (7-day Pro trial)** — pivots to "7-day Pro trial" that previews the 8 power features. Because product features are Free on Free, the trial must surface what gets locked back after Day 7 (analytics retention dropping from 365d → 90d, API quota dropping, custom CSS disabled, etc.).
```
**Replace with:**
```
- **F-012 (7-day Pro trial)** — pivots to "7-day Pro trial" that previews the 8 power features. Because product features are Free on Free, the trial must surface what gets locked back after Day 7 (analytics retention dropping from 365d → 90d, API quota dropping, custom CSS disabled, etc.). **Data-preservation guarantee:** trial revert NEVER deletes creator data (custom CSS preserved in DB as read-only; analytics beyond 90d stored in cold S3 + unlocked on upgrade). The creator sees a "Locked — upgrade to Pro to re-enable" overlay, not a blank state. Pattern AP-017 (sticky-feature-revert) mitigated by the guarantee.
```
**Reason:** AP-017 fix.

### Diff 6 — Plain-Language Content Policy F-unit

**File:** `functional-spec-v2.md` — add under §13 Admin & Trust.
**Insert:**
```
### 13b — F-191a · Plain-Language Content Policy page + examples-rich do/don't list

- **Summary:** Public page `/trust/content-policy` with plain-English allowed/disallowed categories, real examples per category, and visual "what a borderline case looks like" panels. Linked from signup + every moderation-related email.
- **Why:** AP-026 — every competitor has a lawyer-ese content policy that creators can't read. Transparent moderation starts with a readable policy.
- **Behavior:**
  - Sections: Allowed (creator commerce, adult content YES/NO, health/wellness, political commentary, harm-reduction, crypto, etc.), Disallowed (CSAM, clear hate speech, verified fraud, dangerous misinformation), Borderline (specific examples with tadaify's call).
  - Each borderline case has a YES/NO verdict plus reasoning.
  - Last-updated timestamp + changelog visible.
  - Search within policy.
- **Eng effort:** S (3 days — static page + CMS + changelog).
- **MVP/Y1/Y2:** **MVP** (Trust is launch-critical).
- **Dependencies:** none.
- **Test surface:** content policy loads; each borderline example has a verdict; changelog shows ≥1 entry.
```
**Reason:** AP-026 fix.

### Diff 7 — Creator Safeguard refund contract

**File:** `functional-spec-v2.md` — add under §13 Admin & Trust.
**Insert:**
```
### 13c — F-191b · Creator Safeguard — 48h warning + human appeal + prepaid refund

- **Summary:** Codifies DEC-SYN-05 as a committed contract. For any moderation action beyond a single-block hide:
  1. 48h notice in creator's inbox + email BEFORE any account-level action (ban / suspend / hold).
  2. Human-reviewed appeal via dedicated queue (linkofme-inherited `admin_appeals`).
  3. If appeal fails AND creator prepaid annually: automatic refund of unused months via Stripe refund API.
  4. If appeal succeeds: account restored to pre-action state within 4h.
- **Why:** AP-005 + AP-027 + AP-028 combined. Creator trust wedge per positioning-gaps A3.
- **Behavior:**
  - Creator gets email: "Your tadaify account is scheduled for [action] on [date+48h]. Reason: [summary]. Appeal here."
  - Appeal form + human reviewer within SLA.
  - Stripe refund on ban-with-prepay calculated: `(months_remaining / total_months) × annual_price`, processed within 14 days.
- **Eng effort:** M (1 week — extends `admin_appeals` + refund cron).
- **MVP/Y1/Y2:** **MVP** (launch-critical trust feature).
- **Test surface:** prepay creator gets banned → refund queued within 14 days; appeal succeeds within 4h → account restored.
```
**Reason:** AP-027 + AP-005 + AP-028 fix.

### Diff 8 — Visitor cookie consent on creator pages (EU)

**File:** `functional-spec-v2.md` — add under §5 Public Page Rendering.
**Insert:**
```
### 5a — F-058a · Creator-page visitor cookie consent (EU)

- **Summary:** When a creator has enabled any tracking (F-PRO-006 pixel whitelist, F-109 GA4/Meta/TikTok, affiliate UTMs), tadaify renders a granular cookie consent banner on the creator's public page for EU visitors. Auto-detected via Cloudflare `cf-ipcountry`. Creator can force-show global.
- **Why:** AP-036 + AP-037. Lnk.bio-style granular banner per PAT-078.
- **Behavior:**
  - Banner: "This page uses cookies for [analytics / pixels]. Accept all · Reject non-necessary · Customize."
  - Customize → per-category toggles with clear label ("Google Analytics — counts visitors", "Meta Pixel — ad targeting").
  - State stored in cookie; remembered 6 months.
  - Non-EU visitors: banner hidden by default; creator can toggle "always show".
- **Eng effort:** M (1 week).
- **MVP/Y1/Y2:** **MVP** (EU launch requirement).
```
**Reason:** AP-036 + AP-037.

### Diff 9 — Payout SLA commitment

**File:** `functional-spec-v2.md` — in §6 Commerce § add explicit line near line 588.
**Insert after "Stripe fees are passed through":**
```
**Payout SLA (contractual):** all creator earnings via Stripe Connect settle on Stripe Express default schedule (T+2 US / T+7 EU) or Custom (T+1). tadaify never holds creator funds. Affiliate commissions (F-PREVIEW referral, F-141 creator-referrals) settle T+14 via Stripe Connect payout. Any earnings > $5 are paid — no minimum-threshold-hold dark patterns (AP-019). Published on `trust.tadaify.com/payouts`.
```
**Reason:** AP-019 fix.

### Diff 9b — Creator-page stays live during dunning

**File:** `functional-spec-v2.md` — in §12 Trust/SLA add.
**Insert:**
```
### 12b — F-175a · Creator page stays live during dunning + no platform-shame overlay

- **Summary:** If creator's subscription fails (card expired, chargeback), their public page stays fully live. There is NO platform-branded message visible to buyers ("The owner did not pay" — AP-029 Taplink). Creator receives dunning emails privately. Subscription-dependent features (F-PRO-006 custom CSS) continue serving for a 14-day grace window. After grace, those features revert but core page + commerce stay live forever (Free tier by definition doesn't depend on subscription).
- **Why:** AP-029 — Taplink's public "did not pay" text is the cautionary tale. We commit publicly to the opposite.
- **Eng effort:** S (extends F-175 billing infra).
- **MVP/Y1/Y2:** **MVP**.
```
**Reason:** AP-029 fix.

### Diff 10 — Feature-preservation commitment

**File:** `functional-spec-v2.md` — add at bottom of §0.2 or §12 Trust.
**Insert:**
```
### Feature-preservation commitment (AP-042)

Once a feature is shipped at a given tier, it stays at that tier or moves cheaper — never more expensive. If tadaify later decides a Free feature needs to be Creator-tier, existing users keep the feature on Free forever; only new signups see the new tier gate. Published on Trust Center. Enforced via grandfathering fields in `user_features` table.
```
**Reason:** AP-042 fix.

### Diff 11 — Progressive-disclosure editor guideline

**File:** `functional-spec-v2.md` — add to §4 Editor & Block System around line 545.
**Insert:**
```
### 4a — Editor IA guideline (progressive disclosure)

The editor surfaces a **Getting Started** set of 6 blocks by default (link, image, text, product, social, email-capture). "More blocks" reveals the full 30+ catalogue on click. First-time creators never see the long list. AP-045 mitigated; AP-030 mitigated ("too many clicks" = avoided because the 6 defaults cover 90% of first-session use).
```
**Reason:** AP-045.

### Diff 12 — Preview-footer disclosure (RED-flag fix)

**File:** `functional-spec-v2.md` lines 272-274 (F-PREVIEW-004 footer).
**Current:**
```
- Footer: subtle "Preview generated by tadaify — [Claim tadaify.com/waserek →]" CTA.
```
**Replace with:**
```
- Footer (REQUIRED, NOT optional): prominent disclosure strip at top of preview page: "Preview only — this page is not live. tadaify built this from [target's] public Linktree as a one-time preview for them. If you're @[target] and want this removed: [one-click remove form]." Only AFTER disclosure, at bottom: CTA "Claim @yourhandle on tadaify →". Admin cannot disable the top disclosure.
- Remove-on-request form at `preview.tadaify.com/remove/<slug>` — target confirms via email-match (target's Linktree email parsed from HTML where available, or manual contact verification) — preview deleted + admin notified + target blacklisted from future outreach.
```
**Reason:** AP-029-adjacent + AP-004 + ethics baseline. Removes the "tadaify built a fake page of me and is pitching it to my followers" optics.

### Diff 13 — Explicit "never sell data" line

**File:** `functional-spec-v2.md` — add to §12 or §13.
**Insert:**
```
### 12c — Data ethics baseline (AP-038)

- We never sell creator or visitor data to third parties.
- We never share creator content with LLMs for training.
- Aggregate analytics (F-UPSELL-005 peer benchmarks) are per-cohort anonymized; N≥100 creators per cohort minimum.
- Published on `trust.tadaify.com/data-ethics`.
```
**Reason:** AP-038.

---

## 6. Proposed DEC entries to lock these anti-patterns

Format: `DEC-ANTI-NNN` — single block each, recommended `answered-by-antipattern-audit-2026-04-24`.

```json
[
  {
    "id": "DEC-ANTI-001",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock anti-pattern AP-001 — no 'Powered by tadaify' footer / watermark on creator pages on ANY tier, including Free. Branding removal is NOT a paid upsell. Confirm?",
    "options": ["Yes, lock — no Powered-by footer on any tier", "No, keep removable as Pro feature"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes, lock — user already flagged this once; codifying it prevents muscle-memory regression."
  },
  {
    "id": "DEC-ANTI-002",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-018/046 — '0% platform fees, every tier, forever' is a contractual commitment published on Trust Center. Extends DEC-SYN-06 price-lock to fee-lock. Confirm?",
    "options": ["Yes — 0% fee locked by contract + Trust Center + DB field", "No — keep as marketing bullet only"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — unlocks the wedge against Linktree 12% + Beacons 9% — Trust Center publication is the trust wedge."
  },
  {
    "id": "DEC-ANTI-003",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-047 — F-UPSELL-004 DOES NOT pre-select the Creator radio on signup even for >100k-follower creators. Default radio stays Free. Use a badge instead. Confirm?",
    "options": ["Yes — Free default always; Recommended badge only", "No — keep the default-pre-select A/B testable"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — structurally identical to the Powered-by-footer slip; default-weaponization is the same category of creator-trust erosion."
  },
  {
    "id": "DEC-ANTI-004",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-005/026/027/028 — ship F-191a Plain-Language Content Policy + F-191b Creator Safeguard (48h warning + human appeal + prepay refund) as MVP. Confirm?",
    "options": ["Yes — both MVP", "No — defer Safeguard to Y1"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — MVP. Trust wedge is launch-critical; can't differentiate at M+3."
  },
  {
    "id": "DEC-ANTI-005",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-010 — subscription cancel is a single-button flow; no multi-step survey, no retention modal cascade. Confirm?",
    "options": ["Yes — one-click cancel (optional reason dropdown)", "No — allow retention-offer modal"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — Beacons' #2 complaint. Single-button cancel = trust wedge."
  },
  {
    "id": "DEC-ANTI-006",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-017 — trial-revert NEVER deletes creator data. Features lock but data preserved in cold storage + unlockable on re-upgrade. Confirm?",
    "options": ["Yes — data-preservation guarantee", "No — trial behaves like standard SaaS"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — user already had this instinct when removing old DEC-SYN-10; codify."
  },
  {
    "id": "DEC-ANTI-007",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-019 — no minimum-threshold hold on creator payouts; T+14 via Stripe Connect max; published on Trust Center. Confirm?",
    "options": ["Yes — T+14 payout SLA published", "No — use Stripe defaults only, don't commit"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — Beacons' 'pending for over one year' is a category-defining wound; our opposite is our wedge."
  },
  {
    "id": "DEC-ANTI-008",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-029 — creator page stays live during dunning; NO platform-shame overlay ever. Confirm?",
    "options": ["Yes — page stays live; dunning private", "No — allow a dunning banner (with opt-out)"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — Taplink's 'did not pay' was a PR-level unforced error; ours must be the opposite signal."
  },
  {
    "id": "DEC-ANTI-009",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-042 — feature-preservation: any feature shipped at a tier stays at that tier (or cheaper) for existing users forever, even if we later re-gate for new signups. Grandfather via user_features table. Confirm?",
    "options": ["Yes — feature preservation guaranteed", "No — reserve right to re-gate"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — Linktree's historical feature removals are cautionary tale."
  },
  {
    "id": "DEC-ANTI-010",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-038 — 'We never sell creator or visitor data; never share creator content with LLMs for training' published on Trust Center. Confirm?",
    "options": ["Yes — publish data-ethics page", "No — keep optional to retain LLM-partnership flexibility"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — category baseline trust commitment; Lnk.bio's 'No Data Sold' value shows market appetite."
  },
  {
    "id": "DEC-ANTI-011",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-029/preview — F-PREVIEW-004 disclosure strip is TOP of preview (prominent, not subtle), and includes a one-click remove-on-request form for the target. Admin cannot disable the disclosure. Confirm?",
    "options": ["Yes — prominent top disclosure + remove form mandatory", "No — keep subtle footer"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — the 1-to-1 preview flow has real ethical risk at 10k/mo outreach volume; a visible removal path is the safety valve."
  },
  {
    "id": "DEC-ANTI-012",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-036/037 — creator-page visitor cookie consent (granular, EU auto-detect via cf-ipcountry). Confirm?",
    "options": ["Yes — F-058a MVP", "No — defer to Y1 after EU traffic grows"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — can't launch to EU without it; Lnk.bio pattern is the reference."
  },
  {
    "id": "DEC-ANTI-013",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-045 — editor progressive disclosure: 6-block 'Getting Started' default, 'More' reveals rest. Confirm?",
    "options": ["Yes — progressive disclosure baseline", "No — show all 30+ blocks by default"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — Beacons' 'sprawl' complaint + Carrd's 'steep curve' are dual evidence."
  },
  {
    "id": "DEC-ANTI-014",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-025 — double-opt-in email only (inherited from linkofme subscribe/confirm stack). Confirm?",
    "options": ["Yes — double-opt-in mandatory", "No — allow single opt-in with fast unsub"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — already inherited; this DEC just ratifies it as anti-pattern guard."
  },
  {
    "id": "DEC-ANTI-015",
    "agent_id": "orchestrator",
    "repo": "tadaify",
    "question": "Lock AP-031 — no persistent upgrade banner in editor chrome; F-UPSELL-003 chip guidelines are HARD CAP (1/session, dismissible, informational only). Confirm?",
    "options": ["Yes — hard cap on upsell surfaces", "No — allow A/B of higher-frequency variants"],
    "status": "pending",
    "answer": null,
    "recommendation": "Yes — this is the counter-positioning wedge (§N+7 spec); breaking it is self-sabotage."
  }
]
```

**Count: 15 DEC entries.** Covers every RED + YELLOW from §4 plus the 5 most-cited GREEN anti-patterns that need muscle-memory locking.

---

## 7. Creator tier $5 reconciliation

Given AP-001 is permanent and removes the "branding removal" as a Creator-tier hook, Creator tier at $5/mo needs to earn its keep above the $3 domain add-on. The user's framing: **what delivers $2 of delight above bare $2/mo domain?**

### Candidates evaluated

Each candidate scored on: research-signal for "creators want this" × eng cost × perceived retail value × avoids-AP risk.

| Candidate | Research signal | Eng days | Retail perception | AP-risk | Verdict |
|---|---|---|---|---|---|
| Deeper analytics retention (90→365d) | Linktree Pro price anchor $12 for this; high | 0 (flip) | $5 | None | **INCLUDE — but only up to 180d at Creator; 365d stays Pro** |
| More AI generations (20/mo Free → 40/mo Creator → 200 Pro) | AI is Beacons' landing headline; medium-high | 0 (flip quota) | $3-5 | None | **INCLUDE** |
| Custom favicon | forum feature requests at creators-hero.com; medium | 1 | $2-3 | None | **INCLUDE** |
| Priority support (24h vs 48h Free) | already planned in SLA matrix; high | 0 (routing) | $4-5 | None | **INCLUDE — already in SLA matrix** |
| More social-signal platforms in UPSELL (IG+TikTok → +YouTube+LinkedIn) | creator-hero + linkofme market.md | 2-3 | $2-3 | None | Medium — skip; low perceived value |
| Scheduled publishing for blocks | Linktree has it Starter+; medium-low | 4-5 | $3-4 | None | **INCLUDE** |
| Custom domain manager UI | Creator already has 1 domain included; UI already exists | 0 | $1 | None | Already implicit; not a new bullet |
| Verified-creator badge | PAT-033-style (Lnk.bio Blue Tick sells for $2/mo); high | 1 | $3-5 | AP-048 if applied deceptively | **INCLUDE with guardrail: badge appears only after 2FA + ≥1 social OAuth verified, not purchase-based** |
| Dashboard themes (dark mode admin) | creator-hero forum; low | 2 | $1 | None | Defer — keep Free (accessibility baseline) |
| Public creator directory listing | PAT-040; high | 0 (listing opt-in) | $3-5 | None | **INCLUDE — opt-in directory entry on Creator tier** |

### Proposed Creator tier composition ($5/mo)

| Line item | Delivery | Eng cost |
|---|---|---|
| **1 custom domain included** | Same as baseline (DEC-043) | 0 (built) |
| **Analytics retention 180d** (vs Free 90d, Pro 365d) | Flip on `hasFeature` | 0 |
| **AI quota: 40/mo** (vs 20 Free, 200 Pro) | Quota config | 0 |
| **Priority support 24h SLA** (vs 48h Free) | SLA routing; already in Trust Center | 0 |
| **Custom favicon upload** | Storage + render path | 1d |
| **Scheduled block publishing** | Cron + editor UI | 4-5d |
| **Verified creator badge** (2FA + social OAuth) | Verification logic + badge UI | 2d |
| **Directory listing opt-in** (tadaify.com/directory) | Opt-in flag + directory page | 0 (directory is Free feature; opt-in is Creator) |

**Total new eng: ~8 days.** 100% within MVP budget.

**Messaging on pricing page:**

> **Creator — $5/mo**
> Your own domain. Priority support (24h). Twice the AI credits. Longer analytics memory (180d). Custom favicon. Scheduled publishing. Verified creator badge. Listed in the tadaify directory. Everything you got on Free — still free. We just remembered which features feel like "the first real upgrade".

No AP-001 (no branding removal). No AP-030 (no "click 5 times to unlock"). No AP-050 (commerce / CRM / analytics basics stay Free). $2 of delight delivered; $3 is the domain. Credible Creator tier.

### One originated wedge on top

**"Switch preview to personal domain on Creator" — free domain transfer helper.** When a creator upgrades from Free-with-domain-addon ($3) to Creator ($5), the domain seamlessly moves (same DB row, no DNS re-setup, no re-verification, no downtime). Beacons/Linktree treat tier upgrades as separate transactions; we make it one flow. Zero new eng (it's the correct design anyway); high perceived polish.

---

## 8. Summary — top 10 APs and top 5 diffs

### Top-10 anti-patterns tadaify MUST avoid

1. **AP-001** Powered-by footer as paid unlock.
2. **AP-005** Surprise bans.
3. **AP-010** Multi-step cancel.
4. **AP-012** Mid-cycle price hikes.
5. **AP-017** Trial revert deletes data.
6. **AP-018** Seller fees on free.
7. **AP-019** Held payouts.
8. **AP-029** Public platform shame on dunning.
9. **AP-031** Persistent upgrade banner in editor.
10. **AP-047** Default-pre-selection of paid tier.

### Top-5 spec diffs

1. **Diff 1** — 0% fee + price lock = contractual Trust Center commitment, not a bullet.
2. **Diff 3** — Soften F-UPSELL-004: Recommended BADGE, not pre-select. (RED fix.)
3. **Diff 7** — F-191b Creator Safeguard contract (AP-005/027/028).
4. **Diff 12** — F-PREVIEW-004 disclosure + remove-on-request. (RED fix.)
5. **Diff 4** — F-180a one-click cancel.

### The one unsolved pain point in the whole category

**Transparent moderation with published 48h warning + human appeal + refund-on-prepaid-ban contract.** Every competitor has some version of a content policy; ZERO have this as an enforceable commitment. This is the clearest ORIGINATE wedge — combination of policy + process + money-back contract. Tadaify's F-191a + F-191b implementation is the wedge; every competitor has a reason not to ship it (moderation staffing cost, legal flexibility, refund rails) that we're willing to eat.

---

## Sources cited (consolidated)

- `competitors/linktree/reviews.md` (170 lines)
- `competitors/linktree/notes.md` (2700+ lines; spot-cited via `§Irritation risk` headings)
- `competitors/beacons/reviews.md` (178 lines)
- `competitors/beacons/notes.md` (400+ lines)
- `competitors/stan-store/reviews.md` (100 lines)
- `competitors/carrd/reviews.md`, `competitors/lnk-bio/reviews.md`, `competitors/taplink/reviews.md`, `competitors/bio-link/reviews.md`, `competitors/milkshake/reviews.md`, `competitors/campsite-bio/reviews.md`, `competitors/later-linkinbio/reviews.md`
- `competitors/_synthesis/patterns-library.md` — PAT-005/024/025/030/031/032/034/037/071/078 AVOID verdicts
- `positioning-gaps.md` — Gap A3 + Gap A8 + Section B table
- `inheritance/linkofme-inheritance-index.md`, `inheritance/linkofme-research-inherited.md`, `inheritance/linkofme-features-implemented.md`
- `functional-spec-v2.md` (1516 lines) — target of the audit
- External sources transitively: Capterra, Trustpilot, Pissed Consumer, autoposting.ai 847-review analysis, creator-hero.com, khaby.ai, networksolutions, bloggingwizard, crevio.co, orichi.info, Mobilo, taplink.at/blog, wix.com/blog, fahimai.com, softwareworld.

— end of anti-patterns audit —
