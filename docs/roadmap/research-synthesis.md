---
type: synthesis
project: tadaify
title: Tadaify Research Synthesis — from 17 research docs to MVP decisions
created_at: 2026-04-24
author: orchestrator-opus-4-7-synthesis
status: pending-user-approval-post-audit-2026-04-24
---

# Tadaify Research Synthesis — from 17 research docs to MVP decisions

This document consolidates the full tadaify research corpus (per-competitor deep-dives × 10, marketing catalogue, feature matrix, positioning gaps, user segments, linkofme inheritance audit) into an opinionated MVP plan, expressed as numbered **DEC-SYN-NN** proposals the user approves or rejects one-by-one.

Every claim below cites source. When I recommend, I say "I recommend: X. Reason: Y." — no hedging. Where I genuinely can't resolve something from desk research, it goes to Section 8 (Open Questions).

**Total DEC-SYN proposals:** 34. See Section 9 for the full index.

---

## 1. Executive summary

The link-in-bio category is saturated on table-stakes features (blocks, analytics, Stripe, basic templates) and economically commoditised (Bio.link $5, Taplink $3, Carrd $0.75). Competing on feature count vs Linktree/Beacons is Sisyphean — they have head-starts measured in years and dollars. Tadaify's credible edge is a **narrow, opinionated, visually distinctive "reveal-first" product** paired with **two policy commitments no incumbent can match without cannibalising themselves**: transparent moderation with a 48h warning + price-lock guarantee against Linktree's November 2025 hike (`positioning-gaps.md` A3, A8; `competitors-pricing-normalized.md` §G).

**Top 3 product wedges** (ship at MVP):
1. Entrance animation gallery (5 core + 50 extended) — nobody ships this; `positioning-gaps.md` A1.
2. 30-second social-import → animated hero page reveal — Linktree/Beacons each have parts, nobody bundles; `positioning-gaps.md` C1.
3. Transparent moderation + price-lock policy pages — zero competitors offer; `positioning-gaps.md` A3+A8.

**Top 3 GTM levers** (first 90 days):
1. Affiliate program at 30% recurring lifetime ("tadaify Amplify") — matches Later, beats Lnk.Bio + Campsite, sits below Taplink's 40% but wins on recurring math; `marketing-affiliate-programs.md` §Summary.
2. 11 ownable-now pair-query SEO pages (e.g. `tadaify.com/vs/linktree`, `/vs/bio.link`, `/vs/campsite`) where current SERPs are weak; `marketing-seo-keyword-map.md` §Pair-query bets.
3. 5 niche-vertical landing pages (real estate, newsletter creators, coaches, musicians, photographers) — all "very ownable" underserved SEO; `marketing-seo-keyword-map.md` §Listicle bets.

**Top 3 things NOT to build at MVP**:
1. Course hosting / heavy commerce (Stan.Store's $400M GMV moat; `positioning-gaps.md` F1).
2. Native Shopify sync (Later.com's deep bundling; `positioning-gaps.md` F3).
3. Native iOS/Android apps (`positioning-gaps.md` §Summary — PWA is enough at MVP).

Everything below is proposed decisions against these three vectors.

---

## 2. Proposed tadaify MVP scope

Competitor row cites reference `competitors-feature-matrix.md` section letters (A, B, C, ...). Review signals come from per-competitor `reviews.md` aggregates.

### 2.1 MVP-CRITICAL (can't launch without)

#### DEC-SYN-01 — Entrance animation gallery (5 core free, 50 extended paid)
- **What:** Choreographed entrance animations for public pages (falling stars, paper confetti, spotlight sweep, card cascade, sticker pop at MVP; 50-library on Pro).
- **Competitors:** None (`positioning-gaps.md` A1). Linktree Pro has background loops + button hovers, not choreographed entrance.
- **Why:** The one defensible product signature; drives the "screenshot and share" distribution loop for nano-micro creators; `positioning-gaps.md` E9 ranks it "unique + signature, MVP-critical".
- **LinkofMe reuse:** NONE — fresh build.
- **I recommend:** APPROVE. Status: MVP-critical wedge #1.

#### DEC-SYN-02 — Social import → animated hero page (30-second reveal onboarding)
- **What:** User pastes IG + TikTok handle → tadaify imports avatar, bio, recent 3 posts → generates styled hero page with default entrance animation in <10s on the same screen. Shows before/after split.
- **Competitors:** Linktree 2026 Social Commerce has social-import but no animation; Beacons has prompt-based AI gen but not handle-based import; Taplink AI has prompt but not social import (`competitors-feature-matrix.md` A4, A10).
- **Why:** Kills empty-state friction — Linktree's 11-step onboarding is a documented churn vector (`competitors-feature-matrix.md` A11); `positioning-gaps.md` A2 flags this as under-served.
- **LinkofMe reuse:** LOW — public page shell from `PublicProfilePage.tsx` can host it, but the import + palette extraction are net-new.
- **I recommend:** APPROVE. Status: MVP-critical wedge #2. Scope IG+TikTok only at MVP. YouTube/Spotify to v2.

#### DEC-SYN-03 — Palette auto-extract from avatar
- **What:** On social import, run k-means on avatar pixels to derive 3-5 brand colours, apply to page. User can override.
- **Competitors:** None (`positioning-gaps.md` C1). Beacons has AI design suggestions but doesn't explicitly extract from avatar.
- **Why:** Part of the 30-second reveal (`positioning-gaps.md` A2); cheap to build; high perceived magic.
- **LinkofMe reuse:** NONE.
- **I recommend:** APPROVE. Status: MVP-critical wedge #3.

#### DEC-SYN-04 — Hero-first default layout (not stacked link list)
- **What:** Every new page starts as `hero + spotlight + card grid + link list`, not the Linktree-standard stacked buttons.
- **Competitors:** Nobody defaults to hero-first (`positioning-gaps.md` C4, E3). Milkshake does swipeable cards (mobile-only), Carrd does sections (not bio-link). This is the product identity.
- **Why:** Hero-first is what makes the "before/after" demo visually pop; makes page look unlike every other link-in-bio.
- **LinkofMe reuse:** LOW — linkofme's public page is stacked-list; needs rebuilt renderer.
- **I recommend:** APPROVE. Status: MVP-critical. Offer classic list as opt-in only.

#### DEC-SYN-05 — Transparent moderation + Creator Safeguard page
- **What:** Plain-language Content Policy + Creator Safeguard page committing to: 48h warning before account action, human review for appeals, refund-for-annual-bans. Link from signup + every billing email.
- **Competitors:** Zero (`positioning-gaps.md` A3). Linktree is the #1 complaint volume on Trustpilot for surprise bans.
- **Why:** Policy, not feature. Cost is ~0 if moderation staffing is right. Positioning value is huge against Linktree-displaced creators.
- **LinkofMe reuse:** HIGH — `CommunityStandardsPage.tsx` + `strikes`+`appeals` tables + `submit_moderation_appeal()` RPC + `TransparencyPage.tsx` all ported from LOM (BR-026, BR-029, BR-035-040). Rewrite the copy for tadaify's voice.
- **I recommend:** APPROVE. Status: MVP-critical. This is 70% inherited from linkofme.

#### DEC-SYN-06 — Price-lock guarantee
- **What:** Marketing + checkout copy commitment: the price you signed up at is your price for 3 years. DB field `profiles.price_locked_until` enforced by billing webhook logic.
- **Competitors:** Zero (`competitors-pricing-normalized.md` §G). Linktree raised Pro $9 → $15 in Nov 2025 and charged existing subscribers the new rate; Trustpilot blew up.
- **Why:** Policy hook that directly weaponises Linktree's live Trustpilot pain. Implementation is trivial (one column + quarterly audit).
- **LinkofMe reuse:** LOW — `profiles` table inherited, add `price_locked_until` column.
- **I recommend:** APPROVE. Status: MVP-critical. Add the policy page; implement the DB column; audit quarterly.

#### DEC-SYN-07 — Email capture form on free tier
- **What:** Email-capture block available on free tier (unlike Linktree where it's $8 Starter).
- **Competitors:** Beacons free, Bio.link free, Campsite free (`competitors-feature-matrix.md` B6). Linktree gates on Starter.
- **Why:** Biggest Linktree complaint point in reviews; `positioning-gaps.md` §D table says "cheap technically, maximum positioning value".
- **LinkofMe reuse:** HIGH — `email_subscribers` table + `subscribe` Edge Function + double-opt-in + Resend integration (BR-023/024/025 = LOM-011/012/013) ports directly. Just rebrand FROM address.
- **I recommend:** APPROVE. Status: MVP-critical. ~90% inherited.

### 2.2 MVP NICE-TO-HAVE (ship if trivial, defer otherwise)

#### DEC-SYN-08 — QR code generator
- **What:** Share modal with colour-picker + PNG download for the user's public page.
- **Competitors:** Linktree, Beacons, Taplink, Milkshake, Campsite all have it. Table stakes.
- **Why:** Expected feature; easy win.
- **LinkofMe reuse:** HIGH — BR-022/LOM-010 (2026-04-18 PR #91) — copy-paste.
- **I recommend:** APPROVE. Status: MVP nice-to-have (but it's 1 day of work).

#### DEC-SYN-09 — Social icon auto-detection (24 platforms)
- **What:** When user pastes a URL, auto-detect platform and suggest the matching social icon.
- **Competitors:** Most have it; unremarkable.
- **Why:** UX polish; already built.
- **LinkofMe reuse:** HIGH — BR-021/LOM-009 is shipped in linkofme with 62 unit tests.
- **I recommend:** APPROVE. ~0 net cost — port wholesale.

#### DEC-SYN-10 — Link scheduling (publish at / expire at)
- **What:** Per-link `scheduled_at` + `expires_at` with RLS-aware public rendering.
- **Competitors:** Linktree ($ Starter), Beacons, Later, Taplink, Campsite (`competitors-feature-matrix.md` B13).
- **Why:** Expected by creators who run time-boxed launches; already built in linkofme.
- **LinkofMe reuse:** HIGH — BR-020/LOM-008 full stack (migration + UI + RLS).
- **I recommend:** APPROVE. Free tier.

#### DEC-SYN-11 — Privacy-first analytics on free (geo + device + referrer)
- **What:** Analytics pipeline with session-id-only tracking (no PII), free-tier access to geo + device + referrer. Linktree gates this on Pro $15.
- **Competitors:** Beacons has geo/device free; Linktree gates it. Tadaify matches Beacons on analytics-on-free, signal of creator-friendly ethos.
- **Why:** `positioning-gaps.md` §D — "Free, ahead of Linktree" is a cheap positioning win.
- **LinkofMe reuse:** HIGH — BR-012 + BR-014 + BR-015 (`analytics_events` table + `track-event` Edge Function + summary RPCs + dashboard page). Analytics events cleanup scheduler TODO from LOM must be addressed (see DEC-SYN-33).
- **I recommend:** APPROVE. Status: MVP nice-to-have — port full LOM stack.

#### DEC-SYN-12 — Before/After page preview (during onboarding + on landing)
- **What:** Split-screen showing "what your page looks like on Linktree" vs "what tadaify just built you". Marketing demo + first-run surface.
- **Competitors:** Nobody does it at product level (`positioning-gaps.md` E8 — unique + cheap).
- **Why:** Converts visitors on the landing page; converts sign-ups at first-run.
- **LinkofMe reuse:** NONE.
- **I recommend:** APPROVE. Cheap — 1-2 days of static render comparator.

### 2.3 EXPLICITLY NOT IN MVP (competitors have but tadaify skips)

#### DEC-SYN-13 — NO course hosting at MVP
- **What:** No Teachable-style video hosting, no lesson progression, no drip schedule.
- **Reason:** Stan.Store's moat ($400M GMV + mature commerce; `positioning-gaps.md` F1). Don't try.
- **I recommend:** DECLINE / NOT-IN-MVP.

#### DEC-SYN-14 — NO native Shopify sync at MVP
- **What:** No Shopify product API integration; no live inventory; no Shop Pay checkout.
- **Reason:** Later.com bundling moat (`positioning-gaps.md` F3). Post-MVP candidate if we specifically go after the post-Linkpop Shopify refugees (`marketing-channels.md` #7 Shopify Blog angle).
- **I recommend:** DECLINE / NOT-IN-MVP. Revisit at 6-month mark with Shopify app plan.

#### DEC-SYN-15 — NO native iOS/Android apps at MVP
- **What:** PWA + responsive web only. No Expo build, no App Store submission.
- **Reason:** Milkshake, Linktree, Beacons, Stan.Store have native; most editing happens desktop per review patterns (`positioning-gaps.md` B2). Native is post-Series-A.
- **I recommend:** DECLINE / NOT-IN-MVP.

#### DEC-SYN-16 — NO AI brand-deal pitch emails at MVP
- **What:** No Beacons-style "auto-pitch brands for you" feature.
- **Reason:** Beacons' proprietary moat + out of category; `positioning-gaps.md` F7.
- **I recommend:** DECLINE / NOT-IN-MVP.

#### DEC-SYN-17 — NO lifetime one-time-payment plan
- **What:** No $99 forever-access offer like Lnk.Bio Unique.
- **Reason:** Lnk.Bio owns this segment (subscription-fatigued users); stay SaaS-native for cash flow predictability; `positioning-gaps.md` F4.
- **I recommend:** DECLINE / NOT-IN-MVP. AppSumo lifetime deal at month 6 is a separate decision (see DEC-SYN-26).

#### DEC-SYN-18 — NO enterprise SSO / SCIM / multi-brand workspace
- **What:** No SAML, no per-brand seats, no audit log.
- **Reason:** Later Enterprise + Linktree Enterprise territory; `positioning-gaps.md` F5.
- **I recommend:** DECLINE / NOT-IN-MVP.

#### DEC-SYN-19 — NO media kit builder
- **What:** No auto-updated follower-count media kit page.
- **Reason:** Beacons' signature; `positioning-gaps.md` F6. Copy later only if influencer segment shows traction.
- **I recommend:** DECLINE / NOT-IN-MVP.

---

## 3. Proposed tadaify differentiators

Reconciling the 9 reveal-first concepts from `tadaify-feature-mockups.md` against Agent 3's unique-flag analysis in `positioning-gaps.md` §E. Agent 3 marked 4 as "genuinely unique": #1 (1-click social import bundled), #3 (hero-default), #8 (before/after demo), #9 (animation gallery).

My synthesis: **the 4 unique ones are THE wedges**. The other 5 concepts either match parity (#4 smart cards, #7 spotlight) or are polish (#2 block library framing, #5 design assistant, #6 template naming) — they ship, but they are not the pitch.

#### DEC-SYN-20 — Pitch tadaify as THREE wedges (not nine features)
- **What:** Externally we say tadaify = (a) reveal onboarding in 30 seconds, (b) the only animated link-in-bio, (c) a no-ban no-price-hike contract with creators.
- **Why:** The 4 unique concepts collapse into 3 sellable messages. Three wedges fit on a landing hero; nine features do not.
- **I recommend:** APPROVE. Three-wedge narrative on `tadaify.com` homepage + all pitch angles.

#### DEC-SYN-21 — Ship the full 50-animation extended library at launch (not "50 coming later")
- **What:** Don't launch with 5 and "50 more coming". Ship all 55 at launch, gate the 50 on Pro.
- **Why:** Creators evaluate the Pro library during signup; "coming soon" kills conversion. The core signature must be complete at launch.
- **Alternative:** Launch with 20 total (5 free + 15 Pro), promise growth. Weaker pitch but ships faster.
- **I recommend:** APPROVE full 55 at launch. Budget 3-4 weeks of motion-design work (Lottie/Framer Motion).

#### DEC-SYN-22 — Reveal is an opt-out, not an opt-in
- **What:** Every new page has an entrance animation applied by default (one of the 5 core). User can disable, but the default IS the reveal.
- **Why:** If it's opt-in, 80% of users never find it. Opt-out makes the product identity visible in every shared tadaify page.
- **I recommend:** APPROVE. Opt-out in `Appearance → Animation` settings.

---

## 4. Proposed pricing model

Tadaify target pricing per `positioning-gaps.md` §D + `competitors-pricing-normalized.md` §A: Free / Pro $5 / Business $15. Agent 3 ran the unlock table; I synthesize the three-tier contract here.

#### DEC-SYN-23 — Free tier contents
- **Proposed unlocks:** unlimited links, no tadaify branding on public page, email capture form, privacy-first analytics (views + clicks + geo + device + referrer), 5 core entrance animations, age gate, link-health weekly digest, QR code, social icon auto-detect, all standard blocks, link scheduling.
- **Gated (not on free):** custom domain, 50-animation extended library, revenue attribution, geo-targeted blocks, link-health realtime, A/B testing, multi-site, custom CSS/HTML, team seats, API.
- **Tradeoff:** No branding on free directly matches Bio.link (`competitors-pricing-normalized.md` §D). Loses the classic "remove branding" upgrade hook but neutralises Bio.link's only real positioning. The upgrade pressure comes from **custom domain + revenue attribution + extended animations**, not branding.
- **I recommend:** APPROVE exactly this shape. Free is generous but upgrade triggers are concrete.

#### DEC-SYN-24 — Pro tier $5/mo (annual billed)
- **Proposed unlocks on top of free:** custom domain, revenue attribution (Stripe Connect-based first), geo-targeted conditional blocks, 50-animation extended library, link-health realtime, A/B testing per block, 5 sites, block scheduling (already on free — no, this is on free), priority email support.
- **Price anchor:** Matches Bio.link ($5). Undercuts Linktree Starter ($8), Beacons Pro ($10). Sits above Taplink Pro ($3) but Taplink has regional brand issues in Western markets.
- **0% transaction fee** at this tier and above.
- **I recommend:** APPROVE $5. Do NOT start at $7 — the $5 round number + exact parity with Bio.link is marketing-efficient.

#### DEC-SYN-25 — Business tier $15/mo (annual billed)
- **Proposed unlocks on top of Pro:** team seats (up to 5), API + webhooks, custom CSS/HTML, white-label (domain + email sender), priority support, multi-site unlimited, SOC2 available on request (not SOC2 default — that's a promise we can't keep at MVP).
- **Price anchor:** Matches Linktree Pro ($15) — not Linktree Premium ($35). Positions us as "Linktree-Pro features at half the Linktree-Premium price".
- **I recommend:** APPROVE $15. Do NOT offer enterprise SSO/SCIM at this tier — see DEC-SYN-18.

#### DEC-SYN-26 — Transaction fees: 0% on all paid tiers, 0% on free
- **Proposed:** Zero platform transaction fee at every tier. Only Stripe's ~2.9% + $0.30 processor fee applies.
- **Competitors:** Linktree 12% free / 0% Premium; Beacons 9% free / 0% Store Pro+; Taplink 0% all; Bio.link 0% all (`competitors-pricing-normalized.md` §E).
- **Tradeoff:** Gives up a revenue source (Linktree's 12% free-tier fee generates real $). But: Taplink and Bio.link already charge 0% — we're not the outlier; Linktree is.
- **Why approve:** Pitch Angle 7 ("For creators who hate transaction fees") from `marketing-pitch-angles.md` directly depends on this.
- **I recommend:** APPROVE 0%. Accept the revenue tradeoff.

#### DEC-SYN-27 — Annual billing discount: 20%
- **Proposed:** $5/mo monthly = $48/yr annual ($4/mo effective). $15/mo monthly = $144/yr annual ($12/mo effective).
- **Anchor:** Industry standard 15-25% (`competitors-pricing-normalized.md` §F). 20% is the middle.
- **I recommend:** APPROVE 20%.

---

## 5. Proposed marketing-first-90-days plan

From `marketing-pitch-angles.md` (10 angles), `marketing-channels.md` (121 outlets), `marketing-seo-keyword-map.md` (45 queries), `marketing-affiliate-programs.md`.

#### DEC-SYN-28 — Three Tier-1 pitch targets in first 30 days
- **Target 1: Site Builder Report** (60k/mo, strongest editorial voice per `marketing-channels.md` T2 #3) — Angle 1 (mockup-first). Proof needed: live demo + 10 beta pages + 90-day lifetime Pro offer. I recommend as **#1 pitch target**.
- **Target 2: Adam Connell / Bloggingwizard** (500k/mo, `marketing-channels.md` T2 #1) — Angle 1 or Angle 7 (0% fees). Proof: affiliate slot + free lifetime Pro. Adam owns the #1 Linktree alternatives listicle.
- **Target 3: Indie Hackers** (2M/mo, T1 #17) — Angle 5 (indie SaaS in public). Proof: transparent MRR + build-log at `tadaify.com/changelog`.
- **I recommend:** APPROVE. Pitch all three in week 2 after launch. Budget 5-8 hours/week for outreach.

#### DEC-SYN-29 — Affiliate program: tadaify Amplify at 30% recurring lifetime
- **Match:** Agent 2's recommendation (`marketing-affiliate-programs.md` §What tadaify must do).
- **Positioning:** Above median (20-25%), matches Later exactly, recurring beats Carrd's per-sale, undercuts Taplink's 40% headline but wins on total $ per referral with good retention.
- **Must-haves:** Instant enrollment (no approval), PayPal + Stripe Connect payouts, 90-day cookie, branded ref links (`tadaify.com/go/handle`), marketing kit (graphics + pre-written pitch), dedicated affiliate manager part-time from month 1.
- **T2 seeding:** 50% first-10-referrals boost for Site Builder Report, Adam Connell, Creator Hero, Ecomm.design.
- **I recommend:** APPROVE 30% recurring lifetime. Launch with the program live on day 1 — don't wait.

#### DEC-SYN-30 — SEO: 11 vs-pages targeting weak SERPs in first 90 days
- **Ownable-now queries** (SERP is weak per `marketing-seo-keyword-map.md` §Pair-query bets):
  - `linktree vs campsite` (#8) • `linktree vs bio.link` (#5) • `bio.link vs lnk.bio` (#11) • `bio.link vs carrd` (#12) • `beacons vs bio.link` (#13) • `stan vs carrd` (#17) • `stan vs bio.link` (#18) • `campsite vs carrd` (#21) • `milkshake vs stan` (#23) • `taplink vs stan` (#24) • `buffer start page vs linktree` (#30).
- **Format:** `tadaify.com/vs/<competitor>` pages with tables, honest pros/cons (including where tadaify loses), PAA-answer subheadings, pricing grids, internal-link mesh.
- **Skip / ads-only:** `linktree vs beacons`, `linktree vs stan`, `beacons vs stan` — first-parties own those.
- **I recommend:** APPROVE 11 pages. 2 weeks of content writing. Publish in one batch for internal-link lift.

#### DEC-SYN-31 — 5 niche-vertical landing pages in first 90 days
- **Queries** (all flagged "VERY ownable" in `marketing-seo-keyword-map.md` §Listicle bets):
  - `best link in bio for real estate` (#8) • `best link in bio for newsletter creators` (#14) • `best link in bio for coaches` (#15) • `best link in bio for musicians` (#4) • `best link in bio for photographers` (#5).
- **Format:** `tadaify.com/for/<niche>` with niche-specific templates, guest-post-ready outline for the vertical publication (Pixieset for photographers, beehiiv blog for newsletters, NotNoise for musicians).
- **Why these 5:** Each maps to a proven under-served SEO query AND a pitch-ready `marketing-pitch-angles.md` Angle 8 variant. Coaches = highest ARPU per `competitors-user-segments.md` §B.
- **I recommend:** APPROVE. Coupled with DEC-SYN-30 this is the foundation of organic growth.

#### DEC-SYN-32 — NO native Shopify integration in MVP; re-evaluate at month 6
- **Context:** Shopify sunset Linkpop on 2025-07-07. `marketing-pitch-angles.md` Angle 2 + `marketing-channels.md` #7 both flag the Shopify opportunity. BUT: `positioning-gaps.md` F3 argues Later.com's Shopify bundling is structurally sticky.
- **Tradeoff:** Early Shopify-native positioning would unlock Shopify Blog editorial + the huge post-Linkpop refugee pool. But it requires building a full Shopify app (product sync, Shop Pay, inventory badges) — at least 6 weeks of eng dedicated.
- **I recommend:** APPROVE "NOT IN MVP, revisit month 6". Ship tadaify-generic first; validate the reveal-first thesis; add Shopify as v2 vertical wedge.

---

## 6. Proposed target segment

Agent 3's recommendation (`competitors-user-segments.md` §E): **Primary = nano-micro IG/TikTok creators (0-100k followers) frustrated with Linktree** — ~85% of addressable market.

#### DEC-SYN-33 — Primary segment: nano-micro IG/TikTok creators (0-100k), frustrated with Linktree
- **Confirm Agent 3's recommendation.** Reason: the reveal-first product identity generates the most marketing value from this segment because they screenshot and share their tadaify page (visual-native distribution loop). Secondary segment: solo digital-product sellers at $5-50/mo revenue who find Stan.Store too expensive ($29 min) and Gumroad too stark.
- **Tertiary (post-MVP):** Policy-displaced creators (Linktree-banned) leveraging the moderation transparency pitch.
- **Explicit non-targets:** Enterprise, agencies, Shopify-first, deep-commerce, Russian-language (Taplink territory), lifetime-OTP seekers (Lnk.Bio territory).
- **I recommend:** APPROVE primary + secondary as stated. Do NOT launch with adult-content targeting — `positioning-gaps.md` A7: ship age-gate quietly, let word-of-mouth find it.

#### DEC-SYN-34 — Ship 3 of 5 niche verticals at MVP (not all 5)
- **Dilemma:** Section 5 DEC-SYN-31 proposes 5 niche landing pages for SEO. But niche SEO pages imply niche product polish (photographer templates, coach booking embed, newsletter-first CTA hierarchy).
- **Proposed split:** Landing-page SEO for all 5 niches (cheap content). Niche-specific templates in product for 3 at MVP: **newsletter creators, coaches, photographers**.
  - Newsletter creators = beehiiv/Kit OAuth + email-first CTA layout (drives Pitch Angle 3).
  - Coaches = Calendly embed + booking-first template.
  - Photographers = image-grid template + EXIF preservation.
- **Defer:** Real estate (niche tool requirements like MLS) + musicians (Spotify smart card = v2 anyway).
- **Tradeoff:** 5 landing pages cost ~1 week each; 3 niche templates cost ~1 week each = 8 weeks of content-and-template work packed into first 90 days. Tight but doable.
- **I recommend:** APPROVE 3-of-5 templates, all 5 landing pages.

---

## 7. Proposed linkofme inheritance plan

From `inheritance/linkofme-features-implemented.md` + `inheritance/linkofme-features-planned.md`. LinkOfMe shipped 45 BRs, 0 open. First PROD deploy never happened — all features are DEV-only, but the code is production-quality per the audit.

### 7.1 PORT (direct code copy, minor edits)

All numbered as single DEC to keep the list manageable — APPROVE as a bundle unless specific item needs carve-out.

#### DEC-SYN-35 — Bundle: port the following 14 subsystems from linkofme

1. **Auth + profiles + plan tiers** (Supabase GoTrue + profiles table + plan enum). Foundational.
2. **DashboardLayout + sidebar shell** (BR-004, TR-011). Visual skin reworked for tadaify.
3. **Stripe billing 3-function pattern** (checkout, portal, webhook — BR-006, BR-011). Change price IDs + plan names + add `price_locked_until` enforcement for DEC-SYN-06.
4. **`app_settings` + `admin_users` + `is_admin()` SECURITY DEFINER** (BR-007, TR-023). Mandatory per orchestrator rules.
5. **Maintenance mode** (BR-041/042, TR-024 — MaintenanceContext, MaintenanceGuard, MaintenancePage). Mandatory per orchestrator.
6. **Incident tracking + public StatusPage** (BR-043/044/045). Trust signal.
7. **Admin user management** (admin-list/ban/unban Edge Functions + UserManagementAdminPage).
8. **Admin moderation queue + appeals queue** (BR-035-040, LOM-022/023 + `MarkdownView.tsx` + `MarkdownEditor.tsx`). Powers the DEC-SYN-05 transparency pitch.
9. **Rate limiting infrastructure** (4 tables + `check_rate_limit()` RPC + Edge Function, BR-009). Needed for abuse-resilient public pages.
10. **GDPR export/delete Edge Functions + RPC** (BR-008, BR-010). Mandatory for EU launch. Update table list.
11. **Privacy-first analytics stack** (BR-012/014/015/017 — events table + track-event + summary RPC + dashboard + CSV export). Drives DEC-SYN-11.
12. **Subscriber system** (BR-023/024/025 — `email_subscribers` + subscribe + confirm + unsubscribe + Resend). Drives DEC-SYN-07.
13. **Custom domain CNAME flow** (BR-005). Tadaify Pro feature.
14. **Utility libraries**: `src/lib/countries.ts` (EU27 + flags), `src/lib/vcard.ts` (RFC 2426 — useful if we add digital business cards post-MVP), all TRs except TR-005 (port number) and TR-019 (linkofme Wordmark).

- **Why one DEC:** These are 45 BRs worth of battle-tested code with documented patterns. Auditing one-by-one burns a week; they either all port or we're not actually reusing linkofme.
- **I recommend:** APPROVE as bundle. If user wants to cherry-pick, we break it down.

### 7.2 DO NOT PORT

#### DEC-SYN-36 — DO NOT port: Linktree Import Tool (BR-030/LOM-017)
- **Why:** Linkofme's import is a competitor-specific scraper. Tadaify's onboarding is via social-handle import (DEC-SYN-02), not competitor-page import. Pattern (import job table + preview wizard) is useful concept but we'd rebuild different.
- **I recommend:** APPROVE skip.

#### DEC-SYN-37 — DO NOT port: A/B testing per link + Geo-targeting per link (BR-031/032)
- **Reasoning:** These were LOM-018/LOM-019 shipped but Linkofme's implementation is per-link (single URL row with variants). Tadaify's content model is richer (blocks, cards, sections). Port the CONCEPTS — `link_variants` + `assign_ab_variant` RPC + EU27 + `resolve_geo_variant` — but rebuild against block-level, not link-level.
- **Tradeoff:** Loses the ~2 weeks of work, but forcing link-level A/B into a block model creates tech debt.
- **I recommend:** APPROVE skip direct port; reuse concepts when building DEC-SYN-24 Pro features.

#### DEC-SYN-38 — DO NOT port: Link Health Monitor (BR-016/018)
- **Reasoning:** Linkofme's link-health scanner makes sense when the whole product is "a list of links". Tadaify's hero-first model has fewer-but-richer blocks per page; nightly URL scanning is still valuable but can be v2. `positioning-gaps.md` A5 flags it as Gap — ship only the **weekly email digest** version on Free at MVP (DEC-SYN-23 includes this). Defer realtime + dashboard to v2.
- **Implementation for MVP:** Just the weekly-digest email (1 Edge Function + cron + Resend). Skip the dashboard.
- **I recommend:** APPROVE partial port (weekly digest only at MVP).

### 7.3 CARRY OVER (linkofme planned but unshipped → tadaify backlog)

Per `inheritance/linkofme-features-planned.md` §Summary.

#### DEC-SYN-39 — Carry: Onboarding checklist (LOM-025)
- **Why:** Activation lever — complete profile → add first link → customize appearance → connect custom domain → invite followers. Proven SaaS retention pattern. Not shipped in linkofme.
- **When:** Month 2-3 of tadaify (post-MVP soft launch, before paid marketing push).
- **I recommend:** APPROVE as backlog item, not MVP-critical.

#### DEC-SYN-40 — Carry: Email onboarding sequence (LOM-026)
- **Why:** Drip campaign on signup via Resend. High-ROI retention mechanism.
- **When:** Month 2-3.
- **I recommend:** APPROVE backlog.

#### DEC-SYN-41 — Carry: Registration-limit with admin threshold (REG-LIMIT)
- **Why:** Cost-controlled beta / waitlist. `app_settings` table already ported.
- **When:** Month 1 (before public launch — needed for safe onboarding pace).
- **I recommend:** APPROVE early.

#### DEC-SYN-42 — Carry: Analytics-events cleanup scheduler (LOM TODO)
- **Why:** Prevents unbounded `analytics_events` table growth. Linkofme has a `-- TODO` in the migration. Fix it at port time in tadaify (pg_cron OR scheduled Edge Function), don't inherit the TODO.
- **I recommend:** APPROVE — fix at port time (DEC-SYN-35 item 11).

#### DEC-SYN-43 — DO NOT carry at MVP: Support ticket system, Community forum, Blog, External moderation API cascade
- **Why:** Use Crisp or Intercom for support ticketing at MVP; use Canny-hosted for feedback; blog CMS waits; external moderation (OpenAI + Perspective cascade) only needed if tadaify gets DEC-SYN-05 volume issues — not a launch concern.
- **I recommend:** APPROVE skip. Re-evaluate each at 6-month mark.

---

## 8. Open questions (not DEC-ified)

Things I couldn't resolve from research alone. User input needed.

### Q1 — Age-gate implementation depth
`positioning-gaps.md` A7 recommends a "click-through interstitial" at MVP and notes that real age verification needs third-party integration (Yoti). But US state age-verification laws in 25+ states are tightening; how much legal risk does "click-through-not-real-verification" carry for tadaify at MVP launch? I can't assess without legal counsel — flagging for the user to decide: (a) ship click-through at MVP, (b) skip age-gate entirely at MVP, (c) spring for Yoti integration from day 1 ($$$).

### Q2 — Geographic launch scope
None of the research specifies launch geography. EU launch from day 1 implies GDPR fully wired (we have it from linkofme) + potential German age-verification law risk + EU VAT complexity on Stripe. Launch US-only is simpler. Launching global default like Linktree is riskiest but biggest addressable market. I recommend US+UK+EU launch given the inherited GDPR stack, but flagging for user to confirm.

### Q3 — Moderation staffing model
DEC-SYN-05 commits to "human review for appeals" within 48h. Who runs that at tadaify? Founder-as-moderator doesn't scale past 1k active users. Budget: dedicated contractor at $400-800/mo from month 3? The whole Creator Safeguard pitch depends on it being real, not theatre.

### Q4 — Adult-content stance
`positioning-gaps.md` A3 recommends "don't advertise as adult-friendly, ship the infrastructure (age gate), let the audience self-select." Do we want to go further and explicitly INCLUDE adult creators in our community standards (like "legal adult content is permitted"), or play safe and mimic industry boilerplate? First is high-trust but carries Stripe-account-closure risk; second is safe but won't win the Linktree-displaced adult-creator segment.

### Q5 — Pricing currency
All `competitors-pricing-normalized.md` uses USD. Tadaify is a Polish-registered entity (per orchestrator `projects.json` norms). Do we bill EUR? USD? Both with auto-detect by billing country? Stripe supports multi-currency but Polish-entity USD-billing has VAT OSS implications.

### Q6 — Landing page vs /app split
Linkofme keeps landing on the same React app (linkofme.com = SPA, linkofme.com/app = dashboard). Tadaify has a bigger landing surface (DEC-SYN-30 = 11 vs-pages, DEC-SYN-31 = 5 niche pages, plus DEC-SYN-05 policy pages + Creator Safeguard + Transparency + Animation showcase). Do we split `tadaify.com` (marketing, static-SSG or Astro) from `app.tadaify.com` (SPA dashboard)? I lean toward split for SEO performance, but it's an infra decision with ops cost.

### Q7 — Launch date vs feature cut
If the 55-animation gallery (DEC-SYN-21) + social import (DEC-SYN-02) + palette extraction (DEC-SYN-03) + hero layout renderer (DEC-SYN-04) take ~14-16 weeks of eng, that's a Q3-2026 launch. Is that acceptable, or do we cut to 20 animations + single-platform import + no palette extract and ship in Q2?

---

## 9. Index of DEC-SYN-NN proposals

| # | Area | Title | My recommendation |
|---|---|---|---|
| DEC-SYN-01 | MVP critical | Entrance animation gallery (5 core + 50 extended) | APPROVE |
| DEC-SYN-02 | MVP critical | Social import → animated hero page (30s reveal) | APPROVE (IG+TikTok only) |
| DEC-SYN-03 | MVP critical | Palette auto-extract from avatar | APPROVE |
| DEC-SYN-04 | MVP critical | Hero-first default layout | APPROVE |
| DEC-SYN-05 | MVP critical | Transparent moderation + Creator Safeguard | APPROVE (70% from LOM) |
| DEC-SYN-06 | MVP critical | Price-lock guarantee (3 years) | APPROVE |
| DEC-SYN-07 | MVP critical | Email capture form on free tier | APPROVE |
| DEC-SYN-08 | MVP nice | QR code generator | APPROVE |
| DEC-SYN-09 | MVP nice | Social icon auto-detection (24 platforms) | APPROVE |
| DEC-SYN-10 | MVP nice | Link scheduling | APPROVE |
| DEC-SYN-11 | MVP nice | Privacy-first analytics on free tier | APPROVE |
| DEC-SYN-12 | MVP nice | Before/after onboarding preview | APPROVE |
| DEC-SYN-13 | Not in MVP | Course hosting | DECLINE (Stan.Store moat) |
| DEC-SYN-14 | Not in MVP | Native Shopify sync | DECLINE at MVP; revisit m6 |
| DEC-SYN-15 | Not in MVP | Native iOS/Android apps | DECLINE (PWA enough) |
| DEC-SYN-16 | Not in MVP | AI brand-deal pitch emails | DECLINE |
| DEC-SYN-17 | Not in MVP | Lifetime OTP plan | DECLINE |
| DEC-SYN-18 | Not in MVP | Enterprise SSO / multi-brand | DECLINE |
| DEC-SYN-19 | Not in MVP | Media kit builder | DECLINE |
| DEC-SYN-20 | Differentiator | 3-wedge pitch (not 9 features) | APPROVE |
| DEC-SYN-21 | Differentiator | Ship full 55 animations at launch | APPROVE |
| DEC-SYN-22 | Differentiator | Reveal is opt-out, not opt-in | APPROVE |
| DEC-SYN-23 | Pricing | Free tier contents | APPROVE |
| DEC-SYN-24 | Pricing | Pro tier $5/mo | APPROVE |
| DEC-SYN-25 | Pricing | Business tier $15/mo | APPROVE |
| DEC-SYN-26 | Pricing | 0% transaction fees all tiers | APPROVE |
| DEC-SYN-27 | Pricing | 20% annual-billing discount | APPROVE |
| DEC-SYN-28 | GTM | 3 Tier-1 pitch targets (SBR, Adam Connell, IH) | APPROVE |
| DEC-SYN-29 | GTM | tadaify Amplify affiliate @ 30% recurring lifetime | APPROVE |
| DEC-SYN-30 | GTM | 11 vs-pages targeting weak SERPs | APPROVE |
| DEC-SYN-31 | GTM | 5 niche-vertical landing pages | APPROVE |
| DEC-SYN-32 | GTM | NO Shopify integration at MVP; revisit m6 | APPROVE decline |
| DEC-SYN-33 | Segment | Primary = nano-micro IG/TikTok creators (0-100k) | APPROVE |
| DEC-SYN-34 | Segment | Ship 3 of 5 niche templates at MVP | APPROVE (newsletter/coaches/photographers) |
| DEC-SYN-35 | Inheritance | Bundle port: 14 linkofme subsystems | APPROVE as bundle |
| DEC-SYN-36 | Inheritance | DO NOT port: Linktree importer | APPROVE skip |
| DEC-SYN-37 | Inheritance | DO NOT port: A/B + geo per-link; reuse concepts | APPROVE skip |
| DEC-SYN-38 | Inheritance | Partial port: link-health weekly digest only | APPROVE |
| DEC-SYN-39 | Inheritance | Carry: onboarding checklist (LOM-025) | APPROVE backlog |
| DEC-SYN-40 | Inheritance | Carry: email onboarding sequence (LOM-026) | APPROVE backlog |
| DEC-SYN-41 | Inheritance | Carry: registration-limit admin threshold | APPROVE early (m1) |
| DEC-SYN-42 | Inheritance | Fix analytics-events cleanup TODO at port | APPROVE |
| DEC-SYN-43 | Inheritance | SKIP at MVP: support/forum/blog/ext-moderation | APPROVE skip |

Total: **43 DEC-SYN** proposals. Approve, reject, or modify each.

---

## Source map

- `positioning-gaps.md` — primary strategic input (gaps A1-A8, concepts C1-C5, matrix §D, summary §Summary).
- `competitors-pricing-normalized.md` — §A tier table, §D branding paywall, §E transaction fees, §G price-hike history.
- `competitors-user-segments.md` — §A competitor targeting, §B under-served segments, §E recommended tadaify segment.
- `competitors-feature-matrix.md` — A onboarding, B editor/blocks section feature rows.
- `marketing-pitch-angles.md` — all 10 angles, 90-day prioritisation §Angle prioritization.
- `marketing-channels.md` — T1 + T2 tables.
- `marketing-seo-keyword-map.md` — pair + listicle priority tables.
- `marketing-affiliate-programs.md` — competitor program summary + tadaify Amplify proposal.
- `inheritance/linkofme-features-implemented.md` — all 16 sections + high-reuse summary.
- `inheritance/linkofme-features-planned.md` — open issues + carry-to-tadaify summary.

---

## 10. Post-audit alignment — 2026-04-24 (live competitor audit)

Between the creation of this synthesis (desk research only) and 2026-04-24, a live UI audit of 7 competitors was executed via BrowserMCP, producing:

- `competitors/stan-store/notes.md` — Stan deep audit (landing + 2 public stores + inline checkout + signup + onboarding)
- `competitors/linktree/notes.md` — Linktree deep audit (landing + pricing + marketplace + templates)
- `competitors/beacons/notes.md` — Beacons landing audit
- `competitors/carrd/notes.md` — Carrd landing audit
- `competitors/lnk-bio/notes.md` — Lnk.bio landing audit
- `competitors/taplink/notes.md` — Taplink landing audit
- `competitors/_synthesis/patterns-library.md` — 78 cross-competitor patterns (PAT-001..PAT-078) with verdicts + tags
- `competitors/_synthesis/tadaify-feature-mix.md` — 10-section product decision doc with ~45 sub-decisions
- `competitors/_synthesis/00-tldr.md` — 1-page executive summary

This section reconciles the 43 DEC-SYN proposals above with the audit findings. Most are confirmed; four have pricing conflicts needing user resolution.

### 10.1 DEC-SYN status after audit

| DEC-SYN | Area | Post-audit status | Audit cross-ref |
|---|---|---|---|
| 01 | Entrance animations | CONFIRMED (unique wedge; no competitor ships) | patterns-library: none match |
| 02 | Social import → hero | CONFIRMED + ENHANCED | PAT-019 (IG embed as creator credential, Stan STS-011) |
| 03 | Palette auto-extract | CONFIRMED (no competitor ships) | — |
| 04 | Hero-first default layout | CONFIRMED (no competitor defaults to hero-first; Stan uses product detail drawer which is adjacent) | Stan PAT-014 2-col sticky-creator / drawer-product |
| 05 | Creator Safeguard + transparent moderation | CONFIRMED + AMPLIFIED by PAT-039 (enterprise trust surfaces — Linktree has them, Stan+Beacons don't) | PAT-039, PAT-044 (tier SLA) |
| 06 | Price-lock guarantee | CONFIRMED; still unique wedge | — |
| 07 | Email capture on free | **CONFLICT** — see §10.2 (free-tier commerce framing) | feature-mix §6.1, §6.2 |
| 08 | QR code | CONFIRMED (table stakes; PAT-NONE required) | — |
| 09 | Social icon autodetect | CONFIRMED | — |
| 10 | Link scheduling | CONFIRMED | — |
| 11 | Privacy-first analytics on free | CONFIRMED + AMPLIFIED by PAT-048, PAT-049 (time-window + depth tiers) | feature-mix §6.5 |
| 12 | Before/after preview | CONFIRMED (no competitor ships) | — |
| 13 | NO course hosting | CONFIRMED (Stan's $400M GMV moat reinforced by deep STS-010/STS-011 audit) | Stan STS-011 |
| 14 | NO Shopify sync at MVP | CONFIRMED | Linktree PAT-053 (Shopify is an Integration, not native) |
| 15 | NO native iOS/Android | CONFIRMED + BATTLE-TESTED (Linktree + Beacons ship, Stan doesn't — Stan still outperforms on Trustpilot 4.8; mobile app not causal) | PAT-042 DEFER |
| 16 | NO AI brand-deal pitch | CONFIRMED (Beacons's moat) | Beacons BCN-LAND-001 |
| 17 | NO lifetime OTP | CONFIRMED + REINFORCED by Lnk.bio PAT-073 verdict DEFER | PAT-073 |
| 18 | NO enterprise SSO | CONFIRMED | Linktree enterprise is contact-sales (PAT-052 area) |
| 19 | NO media kit builder | CONFIRMED (Beacons's specific wedge) | Beacons BCN-LAND-001 |
| 20 | 3-wedge pitch | CONFIRMED — feature-mix §5.3 "single conversion path × 3 placements" aligned (PAT-004) | feature-mix §5.3 |
| 21 | 55 animations at launch | PENDING user decision — see Q10 (budget vs eng) | — |
| 22 | Reveal opt-out not opt-in | CONFIRMED | — |
| 23 | Free tier contents | **CONFLICT — see §10.2** | feature-mix §6.2 |
| 24 | Pro $5/mo | **CONFLICT — see §10.2** | feature-mix §6.1 |
| 25 | Business $15/mo | **CONFLICT — see §10.2** | feature-mix §6.1 |
| 26 | 0% fees all tiers | **CONFLICT — see §10.2** | feature-mix §6.2 |
| 27 | 20% annual discount | CONFIRMED + VERIFIED (Linktree, Stan both at 20%) | PAT-033 |
| 28 | 3 Tier-1 pitch targets | CONFIRMED (not audited against new data) | — |
| 29 | Affiliate 30% recurring lifetime | CONFIRMED + VERIFIED via Stan self-referral pattern (PAT-008) — Stan's `Get your own Stan Store!` footer block is exactly this mechanic | PAT-008 |
| 30 | 11 vs-pages | CONFIRMED (not audited against new data) | — |
| 31 | 5 niche landing pages | CONFIRMED | PAT-041 (Linktree solutions-by-intent taxonomy) |
| 32 | NO Shopify at MVP | CONFIRMED (dup of DEC-SYN-14) | — |
| 33 | Primary segment nano-micro creators | CONFIRMED | — |
| 34 | 3-of-5 niche templates | CONFIRMED + AMPLIFIED by PAT-057, PAT-058 (8-12 templates with PL-culture names, category-filtered) | feature-mix §9.5 |
| 35 | Bundle port 14 LOM subsystems | CONFIRMED (audit does not change inheritance plan) | — |
| 36 | DO NOT port Linktree importer | CONFIRMED (tadaify onboarding is via social import per DEC-SYN-02) | — |
| 37 | DO NOT port A/B + geo per-link | CONFIRMED (tadaify block model supersedes LOM link model) | — |
| 38 | Partial port link-health weekly digest | CONFIRMED | — |
| 39 | Carry onboarding checklist | CONFIRMED | — |
| 40 | Carry email onboarding sequence | CONFIRMED | — |
| 41 | Carry registration-limit | CONFIRMED | — |
| 42 | Fix analytics cleanup TODO | CONFIRMED | — |
| 43 | SKIP support/forum/blog/ext-moderation | CONFIRMED | — |

### 10.2 Pricing conflict — DEC-SYN-23 / 24 / 25 / 26 vs feature-mix §6.1, §6.2

Synthesis (pre-audit) proposed: Free + Pro $5 + Business $15 with **0% fees at every tier including free**. Free tier has email capture + unlimited links + analytics + QR + full commerce at 0% fees.

Feature-mix (post-audit, from Linktree pricing deep-dive) proposed: Free + Pro ~$12 + Business $30 Y1 with **0% on paid tiers only; free has no commerce at all** (no digital products, no bundles, no courses).

**Why feature-mix diverged:**

1. **Linktree fee ladder analysis** (LT-PAY-001 in `competitors/linktree/notes.md` §11) revealed that 12%/9%/9%/0% fee ladders are the most effective self-upgrade engine in the category. Our options were: (a) match Linktree's fee ladder on free; (b) match Stan's 0% on all tiers + no free; (c) originate — free has no commerce, paid has 0% always.
2. **Option (c) was chosen** because it preserves "0% always" marketing copy on paid, avoids fee complexity, and keeps free acquisition hook intact.
3. **Pro/Business prices were bumped** to Linktree Pro ($12) + Premium ($30) parity because the feature-mix ships MORE than DEC-SYN-23/24/25 listed:
   - Inline Stripe Elements checkout (eng cost)
   - Public self-serve API + docs (eng + hosting cost)
   - 3 AI features with volume tiers (AI credits cost)
   - Real-time SLA adherence (support staffing cost)
   - Buyer-locale currency auto-convert (maintenance cost)
   - 8-12 templates + PL localization (content cost)
   - Each of these has marginal cost that makes $5/mo Pro hard to sustain.

**User decision needed — 4 permutations to choose:**

| Option | Free has commerce? | Free fee | Pro price | Business price | Pro/Bus fees | Matches |
|---|---|---|---|---|---|---|
| **A — Synthesis as written** | YES (unlimited, all block types) | 0% | $5/mo | $15/mo | 0% | Bio.link $5 anchor; most creator-friendly; hardest to fund AI + SLA + API |
| **B — Feature-mix as refined** | NO (link-list only) | N/A | $12/mo | $30/mo | 0% | Linktree Pro + Premium parity; funds commerce infra; free-tier is narrower |
| **C — Hybrid low** | YES (limited: 1 product, 3 blocks) | 0% or 5% | $8/mo | $20/mo | 0% | Middle ground; gets free-tier reviews while funding infra |
| **D — Hybrid high** | NO | N/A | $10/mo | $25/mo | 0% | Like B but softer prices; more acquisition-friendly |

**Claude's recommendation: Option B.** Reason: aligns with 0% always paid-tier messaging, keeps MVP scope realistic (commerce infra is not free), and the free-tier "upgrade to sell" friction is a feature not a bug — creators who commit to selling are the creators who pay.

**If Option A (synthesis as written) preferred:** accept that (a) we defer AI features to Y1, (b) support SLA is 48h / 24h only, (c) no real-time SLA adherence dashboard, (d) Business tier gets most of the premium features deferred to Y1. These trade-offs are acceptable if "cheapest full-feature creator commerce" is the stronger marketing promise.

User picks A / B / C / D. Default if no decision in 48h: **B** (Claude's recommendation).

### 10.3 New DEC-SYN-NN proposed by audit

The audit surfaced product wedges not covered by the original 43 DEC-SYN. These are candidates for the next round of user approval.

#### DEC-SYN-44 — Guest-mode editor (Carrd-pattern) — **SUPERSEDED by DEC-355=C**

- ~~**What:** Visitor at `tadaify.com/try` can build a mockup of their public page without signup; account gate fires at Publish / Save.~~
- **Status:** Permanently dropped. DEC-355=C (2026-05-04) adopted signup-first model; F-001 and `/try` route removed. See `docs/decisions/0049-drop-f001-guest-mode-signup-first.md`.

#### DEC-SYN-45 — Public self-serve creator API + webhooks + OpenAPI docs day 1

- **What:** REST endpoints (products / orders / analytics / email list) + webhooks + API keys self-serve in creator dashboard + OpenAPI 3.1 spec + docs portal.
- **Competitors:** Linktree has partner-gated dev program; Stan + Beacons have zero. Tadaify wedge = public, self-serve, documented.
- **Why:** Agency tooling + indie-developer ecosystem = only integration wedge uncaptured in category.
- **Cost:** Docs portal + rate limiting + API key management. 3-4 weeks of eng.
- **Cross-ref:** feature-mix §8.1, PAT-055
- **Claude recommends:** APPROVE. MVP-critical if agency + indie-dev is a primary segment at Y1.

#### DEC-SYN-46 — Inline Stripe Elements checkout + per-product vanity URLs

- **What:** Every product gets `/<handle>/p/<slug>` SSR URL + sticky creator identity on left (desktop) + full product detail drawer + name/email/promo code/ToS/PURCHASE inline checkout form + Stripe Elements embed for card.
- **Competitors:** Stan ships this; Linktree + Beacons + Carrd don't.
- **Why:** Stan's inline checkout is their real moat. Tadaify adopts directly. Also enables product URL as shareable marketing asset (creator's primary distribution channel).
- **Cost:** Large — ~4-6 weeks of eng (SSR routing + Stripe Elements integration + upsell UI + reviews schema + payment flow).
- **Cross-ref:** feature-mix §3.2-3.6, PAT-013..020
- **Claude recommends:** APPROVE as MVP-critical IF we're serious about commerce depth. Otherwise, defer and be honest that we're a link-in-bio tool only.

#### DEC-SYN-47 — EU/PL localization day 1 (VAT + PL payment methods + PL directory + PL copy)

- **What:** Auto-calculate EU VAT on checkout + Przelewy24 + BLIK + SEPA payment methods + PL-language creator directory + native PL copy on landing (not translation).
- **Competitors:** None of the 7 are EU-focused; all are US-only.
- **Why:** Real regulatory wedge that no copy-paste catch-up from US rivals can execute quickly.
- **Cost:** VAT OSS integration (Stripe Tax) + Przelewy24/BLIK integration + PL copy + PL directory UI. ~3 weeks of eng + copywriting.
- **Cross-ref:** feature-mix §9, §6.1.1, §7.3.1
- **Claude recommends:** APPROVE. This is the EU wedge thesis — cannot be deferred if we're serious about EU/PL positioning.

#### DEC-SYN-48 — Audience-persona tabs in hero (Taplink pattern)

- **What:** Hero has 4 interactive tabs (Twórcy / Edukatorzy / Usługi / Sklepy) with persona-specific messaging + visual per tab.
- **Competitors:** Taplink only ships tabs; Linktree has static marquee ticker.
- **Why:** Persona-specific conversion without 4 separate URLs.
- **Cost:** Low — 1 week of frontend.
- **Cross-ref:** feature-mix §9.10, PAT-075
- **Claude recommends:** APPROVE. MVP nice-to-have.

#### DEC-SYN-49 — "Ask AI about tadaify" bilingual footer (Beacons pattern extended)

- **What:** Footer row with 5 AI-assistant icons (ChatGPT / Claude / Gemini / Perplexity / Grok) + pre-authored queries steering the LLM answer toward tadaify's framing. Both EN and PL versions.
- **Competitors:** Beacons ships English-only. Tadaify extends with PL version.
- **Why:** LLM-era marketing; visitors ask AI anyway — pre-steer the answer.
- **Cost:** 1 day of frontend.
- **Cross-ref:** feature-mix §9.7, PAT-060
- **Claude recommends:** APPROVE. Cheap wedge.

#### DEC-SYN-50 — Trust Center + real-time SLA adherence dashboard

- **What:** Public `/trust` page + real-time support SLA adherence (48h free / 12h Pro / 4h Business) + uptime page + incident log.
- **Competitors:** Linktree has commitment only; Stan + Beacons zero.
- **Why:** Trustpilot proves Stan + Beacons fail here. Tadaify publishes REAL adherence — if we can't meet it we don't claim it.
- **Cost:** Internal ticket-SLA tracking + public dashboard. 2 weeks of eng + ongoing staffing.
- **Cross-ref:** feature-mix §6.3, §7.2, §7.4, PAT-044
- **Claude recommends:** APPROVE IF support staffing model (Q3) is resolved. Without staffing, this becomes a commitment we can't meet — worse than silence.

**Total new DEC-SYN: 7 (DEC-SYN-44..50)** — bringing the grand total to **50 DEC-SYN** pending user approval.

### 10.4 Q-list updated

Questions from §8 remain open (Q1-Q7). Audit adds:

- Q8: Free-tier commerce framing — Option A/B/C/D per §10.2
- Q9: Pro + Business price points — $5+$15 (synthesis) vs $12+$30 (feature-mix) vs hybrids
- Q10: Entrance animations (DEC-SYN-01) scope vs commerce depth (DEC-SYN-46) — both are MVP-wedge; eng budget constrained. Reduced MVP = 10 animations + core commerce; full MVP = 55 animations + core commerce = Q3-2026 launch.

### 10.5 Files added by audit (read in order)

1. `competitors/_synthesis/00-tldr.md` — 1-page executive summary
2. `competitors/_synthesis/patterns-library.md` — 78 cross-competitor patterns
3. `competitors/_synthesis/tadaify-feature-mix.md` — 10-section product decision doc
4. Per-competitor notes: `stan-store/notes.md`, `linktree/notes.md`, `beacons/notes.md`, `carrd/notes.md`, `lnk-bio/notes.md`, `taplink/notes.md`
- `tadaify-feature-mockups.md` — 9 reveal-first concepts input.
