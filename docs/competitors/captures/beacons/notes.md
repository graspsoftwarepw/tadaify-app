---
type: competitor-research
project: tadaify
competitor: beacons
title: Beacons.ai — UI audit notes + desk research summary
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: audited-landing-only-2026-04-24
---

# Beacons — UI Audit Notes

## Desk Research Summary

(~800 words synthesising the 6 desk-research files in this folder —
`landing.md`, `pricing.md`, `help-docs.md`, `integrations.md`,
`api-public.md`, `reviews.md`, `templates-themes.md`. Authored by
orchestrator-opus-4-7 on 2026-04-24. Screenshot-based UI audit below
is a separate later pass.)

Beacons.ai is the **second-largest link-in-bio tool** after Linktree
and the **most feature-dense** in the category. Where Linktree
positions itself as "the simple link list for everyone", Beacons
positions itself as an all-in-one **creator OS**: a bundle of link-in-
bio, multi-page website builder, digital store, media kit, email
marketing, Instagram DM automation ("Smart Reply"), an AI teammate
branded "Beam", and a drop-in catalogue of 12,000 affiliate brand
partners. The help-centre breakdown is the cleanest signal of this
positioning: 48 articles on Products (monetisation), 35 on Link-in-
Bio & Website, 19 on Brand Collabs, 13 on Email Marketing, 7 on Smart
Reply — a heavy commerce + marketing tilt vs Linktree's ~8-article
analytics-and-links focus.

**Pricing (April 2026, verified via direct fetch of
`beacons.ai/i/plans`)**: Free / Creator $10/mo / Creator Plus $30/mo /
Creator Max $90/mo, with "2 months free" on annual. The pricing moat is
the **seller-fee ladder**: 9% on Free + Creator, 0% on Creator Plus and
Max. Crucially, Beacons' zero-fee tier ($30) is $5 CHEAPER than
Linktree's zero-fee tier ($35) — and Beacons' $10 Creator plan
includes a FREE custom domain whereas Linktree does not offer custom
domains on ANY tier. This is the most exploitable competitive wedge in
the category: **Linktree's refusal to ship custom domains is a gift
to Beacons**, repeated across every alternatives blog.

**Landing / positioning**: Hero frames Beacons as "All-in-One Creator
Platform to Monetize & Grow". Trusted-by logos cover Instagram,
TikTok, Facebook, YouTube, X. A "12k brand partners" affiliate claim
is the main social proof. Growth hooks include a dedicated Referrals
programme, free-first-year custom domain on Creator tier, and — on
Creator Max — a physical NFC card that turns the SaaS into a tangible
object.

**Integrations**: Beacons ships an **Integration Block** architecture
— a single editor block type that renders partner content inline
(not just a link-out). Launch partners Laylo, QuikPlace, Split, Ko-fi
in April 2024; pipeline "rolling out weekly" since. Payments via
Stripe + PayPal + Klarna/Affirm BNPL (Creator Plus+). Shopify
connect for physical-product creators. Mailchimp + Zoom referenced
but [unclear — exact depth]. **No public creator API** exists —
`beacons.ai/api` / `/apis` / `/developer.com` are routing stubs.

**Themes / customisation**: 1024+ fonts, video-background support at
free tier, per-block shape/shadow/outline/transparency control, but
**no custom CSS/HTML** (platform-locked). Multi-page: 1 / 1 / 3 /
10-per-site × 10-sites across tiers. No public `/templates` gallery
URL — template discovery happens in-editor, which costs Beacons
organic SEO and leaves that airspace open.

**Reviews (critical risk signal)**: Trustpilot 1.9/5. 41% of 847
negative reviews reference unreliable support; 27% reference technical
glitches affecting sales. Affiliate payouts held "over one year" per
autoposting.ai. Subscription cancellation is gated behind multi-step
surveys. Charged accounts with no phone support (+1 415-843-2267 is
only surfaced via Pissed Consumer, not Beacons itself). G2 reviewers
praise the free-plan value and the media-kit auto-update; they
complain about billing + support friction.

**Strategic read for tadaify competitive positioning**:

1. **The "bundle vs focus" tension**: Beacons' feature density is its
   brand but also its support-quality liability. Trustpilot 1.9 + 41%
   negative-review support-complaints proves the bundle outpaces the
   ops. A tadaify that ships a **tighter surface area with
   verifiable support quality** can win the "serious creators who
   left Beacons" segment.

2. **Custom domain is the universal unlock**: Beacons' $10 custom
   domain is the reason defectors leave Linktree. Tadaify should ship
   custom domain at or BELOW that price point and make it the headline
   acquisition hook.

3. **Transaction-fee escape**: Beacons' 9% free tier is the hidden
   tax — $1000/mo of sales = $90/mo out. A **lower-or-flat-fee free
   tier** is an acquisition wedge for small creators.

4. **Open API as developer-agency wedge**: neither Linktree nor
   Beacons offers a public creator API. Agencies managing 10+ creator
   accounts cannot automate anything. A documented REST + webhook
   surface on day 1 is an uncontested niche.

5. **Template SEO**: Beacons does not rank on `/templates` keywords.
   Linktree does. An entrant with a well-SEO'd template gallery can
   steal long-tail organic from both.

6. **Support quality as a marketing feature**: an entrant with
   publishable support SLAs (first-response <4h, resolution <48h)
   and a published uptime status page turns Beacons' biggest
   weakness into a product moat.

Full sources and per-file detail in the sibling files in this
directory.

---

# UI audit (to-do — Claude-in-Chrome screenshot pass pending)

## 00. Landing Page — beacons.ai (public marketing site)

### Screen BCN-LAND-001 — Full landing page (beacons.ai root)

- **Flow:** unauthenticated visitor → `https://beacons.ai/`
- **Source:** BrowserMCP accessibility snapshot, 2026-04-24
- **URL:** `https://beacons.ai/`
- **Page title:** `Beacons: All-in-One Creator Platform to Monetize & Grow`

#### What Beacons ships on the landing (section by section)

1. **Top nav (pre-snapshot)**
   - `Beacons` logo
   - Personas switcher: `For Creators` / `For Managers` / `For Brands` (3 audience paths, a B2B2C signal — Beacons also sells TO brands looking to hire creators)
   - `Login` + `Start for free` (right side)
   - **No pricing in nav** (pricing is inline on landing + separate `/i/pricing` page via footer)
   - **Delta vs Linktree:** Linktree is single-persona (creators); Beacons is multi-persona (creators + managers + brands)

2. **Hero**
   - H1: `All you need to power your creator growth`
   - **No handle-claim form in hero** (surprising — Linktree + Stan both ship it in hero; Beacons buries handle-claim at page bottom). This is a UX mistake or deliberate simplification.
   - Hero visual: grid/collage of **9 real creators** with niche labels:
     - Chloe Shih (Creator), Heather Gardner (Comedy), Scott Ho (Fitness), DJ Habibeats (DJ), Elena Shinohara (Gymnastics), Chipmunksoftiktok (Chipmunks), Stream Elements (Streaming), Mr TOV (Creator), Andrea Botez (Lifestyle)
   - More chaotic curation than Stan (5 niches); Beacons showcases eclecticism. Also includes `Chipmunksoftiktok` — a chipmunk TikTok account — indicating Beacons doesn't gatekeep niche seriousness.

3. **5 product-area sections (labelled framings)**
   - `Customize your page` → H3 `Make your brand unforgettable` — customizable link-in-bio OR full website
   - `Own your audience` → H3 `Screw the algorithm & market direct to fans` — email list + Smart Reply auto-DMs
   - `Drive sales` → H3 `Sell your own products & promote affiliate links` — digital products, courses, appointments, native checkout, **"cash out in one day"** (payout speed as differentiator)
   - `Get paid` → H3 `Build your dream brand partnerships` — media kits + brand pitch workflow
   - `Brand Deals` → H3 `Turn your inbox into brand deals` — **email integration + CRM for brand deals** showing fake inbox with 5 real brand deals (OSEA, Fenty Beauty, Lululemon, Armani Beauty, Blue Bottle) + deal statuses (Paid / Gifted / Affiliate / TBD)
   - **"Screw the algorithm"** is an aggressive anti-platform positioning — brave, polarizing.
   - **Brand Deals CRM is unique in category** — neither Linktree nor Stan does this. Beacons IS a creator CRM, not just a link-in-bio tool.

4. **"Become the next big thing" section** — 6 feature bullets:
   - Earn right from your page (digital storefront + affiliate links)
   - Build your email list (email broadcasts + sales funnels)
   - Build an unforgettable brand (customizable link in bio + website)
   - Auto-updating media kit
   - Smart Reply automatic DMs
   - All-in-one traffic & sales analytics

5. **Creator case studies** — 3 real creators with usage data:
   - `@niuviews` — 10-year digital marketer, uses Beacons for content business
   - `@dailyalissa` — uses Beacons for brand sponsorships + media kit
   - `@dyeshajador` — uses affiliate conversion data to build long-term brand relationships
   - Tonal read: **more professional / less flex than Stan**, more specific / less corporate than Linktree. Middle ground.

6. **AI section — `AI that Helps You Work Smarter`**
   - **7 AI features:**
     - Social Asset Generation
     - Ready for You Email Marketing
     - Social Digest Emails
     - Email Automations
     - Product Descriptions
     - Audience Intelligence
     - Image Thumbnails
   - "An AI learning engine that gets smarter the more you use it"
   - **Beacons is the only competitor in category with prominent AI features on landing.** Stan has zero AI. Linktree has Instagram auto-replies only. Beacons ships 7 AI surfaces.
   - This is a competitive wedge that tadaify must address (our feature-mix §6.4 volume-tiered AI matches this).

7. **Pricing inline on landing** — `Get the best bang for your buck on the internet`
   - **2 tiers visible on landing** (Beacons has 3-4 tiers per desk research; landing simplifies to 2):
     - **Free Forever** (FOR BEGINNERS):
       - Customizable link-in-bio
       - Smart Reply Auto-DMs
       - Sell with **9% Seller Fees**
       - Auto-updating Media Kits
       - Courses with Video Hosting
       - 5 Email Automations
       - → `Start for free`
     - **Creator Plus** (MOST POPULAR):
       - All Free Features
       - Unlimited daily AI Credits
       - **0% Seller Fees**
       - **BNPL** (buy-now-pay-later — Klarna/Affirm implied)
       - Unlimited Email Sends
       - Unlimited Memberships
       - Free Custom Domain
       - → **$30/month** → `Upgrade to Creator Plus`
   - **Fee ladder is present** (9% Free → 0% Creator Plus) — matches Linktree's upgrade-engine approach (PAT-043)
   - **BNPL is new vs our audit set** — Beacons ships Klarna/Affirm integration on paid tier as buyer-side checkout feature (enables high-ticket sales on installments)

8. **Final handle-claim bar** — bottom of page
   - `beacons.ai/` + `username` input + `Claim your username`
   - Buried at page bottom — not in hero, not repeated mid-page.
   - Weak CTA architecture vs Linktree (3× CTA placements) and Stan (3× Continue placements).

9. **Footer — corporate-scaled but weaker trust layer than Linktree**
   - **Audience switch:** For Creators / For Managers / For Brands
   - **Content:** Blog, Referral Program (Notion page), Brand Resource Center, Resources
   - **Creator Tools quick links:** `Link in Bio` · `Store` · `Email Marketing` · `Media Kit` · `Income Dashboard` → **5 core product surfaces surfaced publicly** (Beacons's product feature structure)
   - **Mobile apps:** iOS + Android (same as Linktree — Beacons matches scale here)
   - **Support:** `Need help? support@beacons.ai` — single email, not help center (though Help Center exists separately)
   - **Legal:** Terms of Service, Privacy Policy, Cookie Notice, Report Violation, Community Standards — **NO Trust Center, NO Transparency Report, NO Law Enforcement Access Policy, NO Human Rights page** — thinner trust layer than Linktree (which has all 4)
   - **"Ask AI about Beacons" block** — **unique pattern in category** — pre-built query links to 5 AI assistants (ChatGPT, Claude, Gemini, Perplexity, Grok) with the prompt: "Explain Beacons (beacons.ai) for creators: what it is, what I can build, how monetization works, setup steps, and how it compares to Linktree."
   - **Meta-marketing move:** Beacons knows visitors will ask AI anyway; they pre-author the prompt to steer the answer.

#### How the Beacons landing works — strategic reading

- **Broadest product surface of the 3 competitors** — link-in-bio + e-commerce + email marketing + brand deals CRM + 7 AI surfaces + media kits + income dashboard. More product than Stan + Linktree combined.
- **AI-first positioning** — tadaify should note: if we ship without AI features, we look dated.
- **"Screw the algorithm" + "Own your audience"** — anti-platform framing. Beacons positions itself as the anti-algorithm tool. Polarizing but memorable.
- **Multi-persona (creators + managers + brands)** — Beacons is B2B2C. They sell to brands too (brands pay Beacons to reach creators). Creator side is free because brand side funds it.
- **Light on trust signals** — no Trust Center, no SLA, no enterprise footer. Trustpilot 1.9/5 + reviews-of-late-support suggest they don't want to publish SLA they can't meet.
- **"Ask AI about us" prompts** — LLM-era marketing pattern; first-in-category.
- **Pricing inline on landing (2 tiers)** — simpler than Linktree's 4-tier compare. Combined with separate `/i/pricing` full page (not audited here).

#### UI / usability assessment

- Snapshot-only (screenshot capture failed for this page); layout visualization inferred from DOM structure.
- **Handle-claim at page bottom is a UX mistake** — visitors with intent land in hero, don't find the form, bounce.
- Creator collage in hero is more editorial than Stan's device mockups; less premium than Linktree's lifestyle photography.
- Pricing callout "MOST POPULAR" on Creator Plus ($30) — same center-bias psychology as Linktree's Recommended badge on Pro (PAT-045).

#### Strategic assessment for tadaify

1. **Beacons is the most dangerous competitor for tadaify's positioning** — also free-tier, also creator-commerce, also email marketing, also custom domain. Tadaify's defensible wedge vs Beacons:
   - **Trust layer** (Trust Center + SLA + uptime — Beacons explicitly weak here, per Trustpilot 1.9)
   - **EU/PL focus** (Beacons is US-only, no EU VAT, no PL localization)
   - **Open API** (Beacons has no public API)
   - **Scope discipline** (Beacons is feature-bloat; tadaify's tight surface area is the quality signal)

2. **AI features on landing — must-have for credibility.** Tadaify needs at least 3 AI features on landing:
   - AI product description
   - AI page copy
   - AI image thumbnail generation
   - (Feature-mix §6.4 volume-tiered approach matches Beacons's "Unlimited daily AI Credits" on paid)

3. **"Ask AI about tadaify" prompts in footer** — adopt as `ORIGINATE` for EU market (PL + EN versions). Pre-steer the LLM answer before AI assistants give a random comparison.

4. **Fee ladder reconfirmed** — Linktree (12/9/9/0) + Beacons (9/0) both use it. Stan (0/0) doesn't. Tadaify's "0% on paid, commerce gated behind paid" (feature-mix §6.2 refined) remains cleanest.

5. **Brand Deals CRM is a deep Y2+ feature for tadaify** — outside MVP scope but worth tracking. Beacons's moat here is impressive.

6. **Handle-claim in hero — lesson from Beacons's omission.** Always put it in hero. Beacons loses conversions by burying it. Tadaify feature-mix §5.3.1 already has this.

7. **Multi-persona nav (Creators / Managers / Brands)** — Beacons pattern; defer. MVP creators only; Managers (agencies) at Y1; Brands at Y2. Keep the URL taxonomy ready (`/for-creators`, `/for-managers`, `/for-brands`).

#### Irritation risk for visitors

- **Handle-claim buried at bottom** — high-intent visitor can't find signup path in hero, bounces.
- **"Screw the algorithm" copy** — polarizing; some creators will love it, some will find it cringe.
- **5 product-area sections + 7 AI features + 6 bullets + 3 case studies + 2-tier pricing + 5 Creator Tools links** — feature-bloat landing. Visitor leaves with "this does too much, can it actually do any one thing well?" Trustpilot 1.9 suggests the answer is "not reliably".
- **Missing trust signals in footer** — visitors comparing Beacons vs Linktree directly will notice Linktree's Trust Center + Transparency Report and may assume Beacons is less mature.

#### Worth implementing for tadaify

**ADOPT:**
- AI features prominently on landing (3 AI surfaces MVP, volume-tiered per feature-mix §6.4)
- 2-tier inline pricing on landing (+ separate full `/pricing` page)
- Center-bias badge on recommended tier
- BNPL support on paid tier (Stripe Klarna/Affirm — Y1+)
- "Ask AI about tadaify" pre-authored prompts in footer — PL + EN versions

**ADOPT LATER:**
- Multi-persona nav (Creators / Managers / Brands) — Y1+
- Brand Deals CRM — Y2+

**AVOID:**
- Handle-claim buried at bottom (always put it in hero)
- "Screw the algorithm" anti-positioning (tonal mismatch for tadaify)
- Feature-bloat landing with 5 product sections + 7 AI + 6 bullets + 3 cases — keep tadaify landing focused
- Single email support channel (use help center + SLA commitments)

**ORIGINATE vs Beacons:**
- Trust Center + SLA commitment + real-time SLA adherence (Beacons is weak here, Trustpilot 1.9 proves it)
- EU VAT + PL localization + PL creator directory
- Public self-serve API (Beacons has none)

#### How tadaify could do it better

1. **Trust wedge** — lead the landing with real uptime + SLA numbers ("99.95% uptime, 4h support SLA — published in real-time on our Trust Center"). Beacons cannot match this without fixing their support reliability first.

2. **AI honesty** — where Beacons says "AI that helps you work smarter", tadaify says "AI where you can see what changed and why". Show AI diffs and approvals, not black-box suggestions.

3. **Compact landing** — 3 product-area sections (not 5), 3 AI features (not 7), 2 case studies (not 3). Tighter surface = higher perceived quality.

4. **"Ask AI about tadaify" bilingual prompts** — PL + EN pre-authored queries. European creators comparing options in PL first will get tadaify-favored answers.

5. **Handle-claim in hero + footer + mid-page** — 3-placement rule from Stan + Linktree, not Beacons's bottom-only.

#### Open questions

- Where does "9% seller fee" apply exactly — only commerce products, or also on Smart Reply / email revenue? (Help center check.)
- Does Beacons's Brand Deals CRM actually work, or is it a signup magnet that underdelivers? (Trustpilot 1.9 suggests weak execution on promises.)
- What does the 7-AI-feature `/ai` or similar URL look like — pricing, quotas, quality? (Not surfaced on landing.)
- Does the "For Managers" persona page surface an agency seat model (multi-creator-under-one-account)? (Strategic for tadaify Y1+.)
- Full pricing page at `/i/pricing` — 4 tiers visible there vs 2 on landing? (Defer unless we want to audit.)

---

## 01. Onboarding & Auth

### Screen BCN-001 — Username-first signup (pre-account)

- **Flow:** landing page → signup page; username chosen BEFORE account credentials
- **Source:** user-provided screenshots via chat, 2026-04-24
- **URL:** `https://beacons.ai/signup` (reached from landing CTA "Claim your username")

#### Layout and visible functionality

Landing (`beacons.ai`):
- Full-bleed hero: headline "All you need to power your creator growth" (oversized sans-serif black)
- Aspirational product visual: phone mockup showing "ELIZABETH KANE" creator page with magenta/pink theme
- **Primary CTA bar at bottom**: `beacons.ai/` prefix + `username` input + `Claim your username` button (bright blue fill)
- The bottom bar is sticky / prominent — it IS the primary conversion surface

Signup page (`beacons.ai/signup`):
- Split layout: form on left, aspirational product visual on right
- Left column: black beacons logo → "Sign up to Beacons" → subheader "Get a Link in bio, Website, Online Store, Email Marketing, Media Kit and more for free." ("more for free" bolded)
- Section label: "Claim your free Link in Bio!"
- Username input with `beacons.ai/` prefix + user-entered handle ("waserek")
- **Live availability indicator** — green check when available
- Single primary `Next` button (full-width, black)
- ToS / Privacy + reCAPTCHA disclosure under the button
- "Already have an account? Sign in" link at the bottom
- Right column: phone mockup with "hey hello recruiter" creator page + floating cards (coaching session, $3,761 earnings, media kit views chart, traffic sources)

#### How the flow works

- **Username is the first commitment** — user claims handle BEFORE entering email / password
- Prevents the "blank canvas" frustration — identity is established immediately
- Live availability feedback inline
- No option to skip / try before signup — handle claim is gating

#### Strategic assessment for tadaify

- **Adopt this pattern**. Strong match with tadaify "creator-first" positioning.
- Matches Linktree LT-001 (post-Google username step) but Beacons goes further: username BEFORE auth at all.
- Tadaify implementation nuance: since brand has the `ta-da!` reveal theme, consider positioning copy like: "Grab your tada.ify/yourname" with a slight animation on the username suffix.
- Live availability + 2-3 auto-suggestions if taken (Linktree doesn't do that — tadaify can win on friction).

#### Irritation risk

- Low. Feels legitimate, single decision, reversible ("you can change later" implied).
- Main risk: user abandons if handle they want is taken. Mitigate with live suggestions.

#### Worth implementing for tadaify?

- **Yes — MVP critical.** Adopt as first-screen experience.
- Link: see tadaify-research-synthesis.md (pending, Opus agent) for BR-level spec.

#### How tadaify could do it better

- **Live availability + 3 smart alternatives** if taken (beacons shows green/red only, no suggestions)
- **Preview of the future public URL** below the input in real time (`tadaify.com/waserek` in the brand font)
- **Soft skip**: allow exploring the product with a draft-only auto-generated handle that the user can claim later if they stay
- **Locale-aware suggestions**: if user email is Polish, offer PL-friendly handle variants

#### Open questions

- Does Beacons claim the handle before email verification? Could a user squat handles?
- Rate limiting on claim attempts to prevent bot enumeration of taken handles?

#### User-side decision captured on 2026-04-24

User pattern preference: "podoba mi się taki rodzaj sign-up, wybieramy najpierw handle"
→ Adopted as tadaify MVP pattern BR candidate.

---

(More screens pending — user to complete Beacons signup / log in so Claude-in-Chrome can begin the systematic audit.)

### Screen BCN-002 — Signup broken (reported by user)

- **Flow:** user attempted to complete Beacons signup on 2026-04-24 after BCN-001 handle claim; registration did NOT complete.
- **Source:** user chat note: "beacons reg nie działa"
- **Root cause:** unknown — could be a server-side bug, a Polish-locale / geo restriction, reCAPTCHA blocking, or email verification failure. Not investigated (user chose to move on to next competitor rather than troubleshoot).

#### Strategic assessment for tadaify

- **Reliability signal, not a joke.** If a motivated user cannot even sign up, Beacons is losing activation at the point of highest intent. Matches `reviews.md` theme (Trustpilot 1.9 — support rot).
- **MVP-critical takeaway:** tadaify signup flow MUST be heavily instrumented and monitored. A broken signup is unrecoverable — no product exposure, no upsell path.
- **Test at launch:** signup flow from PL-locale / mobile / different email providers / Polish email (wp.pl, onet.pl) — the corners where international SaaS often breaks.

#### Open question

- Was the failure user-side (credentials rejected) or server-side? Mark as inconclusive; reopen if tadaify team ever does a commercial teardown of Beacons support-ticket churn.

---

(Further Beacons audit deferred — user moved on to Stan Store per priority list.)

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
