---
type: competitor-research
project: tadaify
competitor: stan-store
title: Stan Store — UI audit notes + desk research summary
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: audited-partial-2026-04-24
---

# Stan Store — UI Audit Notes

## Desk Research Summary

Stan Store is the **highest-rated competitor in the link-in-bio /
creator-commerce category** (Trustpilot 4.8/5 from 1906 reviews) and
the **most opinionated** — it deliberately refuses to be a generic
link list and instead ships as a mobile-first, single-page creator
store. The link-in-bio aspect is incidental: creators drop
`stan.store/<name>` in their bio, but the point of the product is
commerce inside that page.

**Pricing (April 2026)**: two tiers, Creator $29/mo and Creator Pro
$99/mo. Both charge **0% platform fees** (Stripe/PayPal processor
fees passthrough only). No free plan — 14-day trial, then convert or
leave. This is a high-friction acquisition model that Stan can afford
because every signup is creator-pre-qualified by the paywall. The
$99 Pro jump is 3.4× Creator and unlocks email marketing, funnels,
upsells, order bumps, discount codes, affiliate tools, payment plans,
and ad-pixel tracking.

**Product surfaces**: Store (mobile-first sales page), Products
(digital download / course / 1:1 booking / subscription / community /
physical), AutoDM (post-sale Instagram DM), Stripe+PayPal payouts,
Google Cal + Zoom sync for bookings. Integrations are narrow by
design — Stripe, PayPal, Zapier (the bridge), GA4 + Meta Pixel +
TikTok Pixel (paid tier), Google Calendar, Zoom. No native Shopify
embed (Stan IS the store). No native Mailchimp/Klaviyo (Zapier
bridge only).

**API**: none public. Zapier bridge is the only programmatic surface.
Same closed-platform pattern as Linktree + Beacons.

**Themes / customisation**: 11 style presets, 10 fonts (5 serif + 5
sans), 2 custom colours (hex or picker), 1 header image, per-course
colour overrides. No custom CSS/HTML. No multi-page. No built-in
dark-mode toggle. A cottage industry has emerged on Etsy selling
Stan template configurations for $15-50 — confirming creators want
more differentiation than Stan allows.

**Reviews**: heavily positive. Creators praise setup speed (15-30
min to live store), zero platform fees, customer-service quality.
Complaints cluster on: no free plan ($29 from day 15 blocks
experimenting creators); cookie-cutter design (every Stan store looks
the same); $99 paywall for email + funnels + analytics; thin course
features (no quizzes, no certificates, no progress tracking —
problematic for serious course businesses); basic entry-tier
analytics.

**Strategic read for tadaify**:

1. **Stan's 4.8 rating + brand gravity are a moat** — a direct
   head-to-head feature-for-feature fight is a losing battle.

2. **The unoccupied gap is "Stan-speed + design flexibility"** —
   creators want Stan's 30-minute setup AND the ability to look
   different from every other Stan store. Tadaify could ship a
   design-rich mobile-first store that doesn't require a $50 Etsy
   template to look custom.

3. **"Course features depth" is an open lane** — Stan's thin course
   product (no quizzes, no certs) pushes course creators to
   Teachable. A competitor with stronger native course features +
   Stan's simplicity could take the course-creator segment.

4. **Free plan is Stan's deliberate gap** — tadaify offering a free
   plan + 0% platform fees is a direct challenge to the "no free"
   position.

5. **Email marketing not paywalled at the Creator tier** is a
   tadaify positioning angle. Stan charges $99 for email; most
   creators under $1k MRR can't justify that.

Full sources and per-file detail in sibling files in this directory.

---

# UI audit (to-do — Claude-in-Chrome screenshot pass pending)

## 00. Landing Page — stan.store (public marketing site)

### Screen STS-001 — Full landing page (stan.store root)

- **Flow:** unauthenticated visitor → `https://www.stan.store/`
- **Source:** BrowserMCP accessibility snapshot + live visit, 2026-04-24
- **URL:** `https://www.stan.store/`

#### What Stan ships on the landing (section by section, top to bottom)

1. **Top nav (sticky, transparent on purple hero)**
   - Logo `$ Stan` (dollar-sign icon + wordmark in white)
   - Links: `Home`, `Our Mission` (→ `/about`), `Blog` (rendered as text, not a link — likely a state bug or not-yet-linked in this build)
   - Right side: `Log in` (→ `#`, JS modal), `Sign Up` (white-filled button, → `#`, JS modal)

2. **Hero**
   - Solid deep-purple canvas (≈ `#5B4BF5`, more saturated than Indigo-500)
   - H1: `Meet Your All·in·One Creator Store` — uses **middle-dot `·`** as the syllable separator (typographic flourish — the exact pattern we considered for `ta·da!·ify` and rejected for variant F)
   - Subtitle: "Stan is the easiest way to make money online. All of your courses, digital products, and bookings are now hosted within your link-in-bio." (italicised `easiest`)
   - Single CTA: mint-green pill `Continue →` — no "Sign up free" language, just an action verb. Continue → leads to signup (modal or page).
   - Right column: a **layered device mockup** of a creator store ("Alexandra Silva") showing stacked product cards — "My Creator Course $129" (crossed `$149`, 50% off badge), "1:1 Coaching Session $49", "Download My Guide $25" — plus floating circular badges (CALENDAR, DOWNLOADS, COURSES). Sells the **concrete output**, not the feature list.

3. **Creator showcase** — `The Best Creators Use Stan 🚀`
   - Subtitle: "See how our creators use Stan to superpower their businesses!"
   - **5 real creator cards** with portrait + name + handle + platform + follower count + niche + CTA link to their actual public Stan store:
     - Abigail Peugh `@abigailpeugh` · 100K+ Followers · 💰 Business Coach → `stan.store/abigailpeugh`
     - Millie Adrian `@itsmodernmillie` · 150K+ Followers · 📲 Social Media Coach → `stan.store/itsmodernmillie`
     - Eddie Abbew `@eddieabbew` · 554K+ Followers · 💪 Fitness Coach → `stan.store/eddieabbew`
     - Sarah Perl `@hothighpriestess` · 2.4M+ Followers · ✨ Spirituality Creator → `stan.store/hothighpriestess`
     - Tatiana Londono `@tatlondono` · 2.8M+ Followers · 🏠 Real Estate Coach → `tiktok.com/@tatlondono` (note: links to TikTok, NOT a Stan store — either she's migrated off or this is a sloppy CMS entry)
   - **Strategic read:** Stan puts real, clickable public stores one link away from the landing. Visitors can audit the product **before** signing up. This is a **trust play that Linktree and Beacons do not run** — they keep creator examples behind mockups.
   - Total follower proof on-page: **~6M combined**, skewed to female mid-sized creators (2/5 female with 2M+, 2/5 female mid-size, 1/5 male fitness).

4. **Testimonials** — `See What People Are Saying 👀`
   - Subtitle: "Stan is the easiest way to start selling online."
   - Masonry grid of ~9 social-proof tiles mixing:
     - **Twitter/Threads text quotes** (@abigailpeugh "2 year anniversary with @stanforcreators, 11,000+ students later", @montylans "host, manage and sell my digital products from ONE place", @creatively_madi "I'd use Stan even if it cost my left arm")
     - **UGC video thumbnails with overlaid revenue claims**: `Wow, $1k a week 🤯` (@ashley.theaffiliate, `$6,714.90` dashboard overlay), `$1,716,041.00` lifetime revenue (@jennapeterson), `Wowww $32k in a week 🤩🤩` (@evita_social with `$32,012 · 100%` Stan dashboard screenshot)
   - **Pattern to note:** Stan uses **raw revenue screenshots from the Stan dashboard itself** as social proof. Every screenshot looks like it's from the Stan admin UI → acts as a mini-product-demo + testimonial in one. Linktree and Beacons don't do this — they use sanitised charts in figma-style mockups.

5. **Transaction-fee banner**
   - H1: `0%` (oversized)
   - H2: `Transaction Fees, Always.`
   - This is Stan's single biggest differentiator and they dedicate an entire section to it. No asterisk, no "starting at", no tier qualifier on the landing — "Always" is the promise. (Actual pricing still hides the Creator `$29/mo` + `$99/mo` subscription gate — but zero platform fees on top of that is real.)

6. **Product positioning block** — `Not just another link·in·bio🚀`
   - Subtitle: "Stan has everything you need to run your business. All-in-one place."
   - Single carousel/slide image showcasing product features — likely rotates through: products / bookings / email / checkout / analytics (visible as `img "slide"` in snapshot).
   - **Strategic read:** Stan actively **distances itself from the "link-in-bio" category** even though that's how it's discoverable. Framed as a creator commerce platform that happens to live at a bio link. This is a positioning move that Tadaify needs to decide on early — are we a link-in-bio tool (Linktree positioning) or a creator storefront that replaces one (Stan positioning)?

7. **Tool-consolidation block** — `A Simpler Solution 💰`
   - H2: "No more paying for 5+ different apps! Stan brings it all home."
   - Image + `Start My Trial →` CTA (pill, purple/blue)
   - **The 5+ apps** implied are: link-in-bio (Linktree), course host (Teachable/Kajabi), booking (Calendly), email (Mailchimp), store (Shopify/Gumroad). The argument is bundle economics. This is the same argument Beacons runs — but Stan frames it as SAVINGS ("stop paying") rather than FEATURES ("we have more"). Subtle but meaningful CTA-copy difference.

8. **3-column feature icons**
   - `No Coding Required` — "Stan is the simplest and easiest way to get started. You can build your Store in just a few minutes!"
   - `1-Tap Checkout` — "Your audience shouldn't have to go through hurdles to purchase your product. Stan maximizes your checkout conversion rates."
   - `Integrates with Your Favorite Apps` — "Stan integrates with all the third party tools you use."
   - **Note on the middle one:** "1-Tap Checkout" is positioned as a conversion-rate feature, not a convenience feature. They lean on the business outcome for the creator, not the UX for the end-buyer. This is a smart inversion of how most SaaS talk about checkout.

9. **Bottom CTA band**
   - H3: `Try Stan for 14 Days Free`
   - `Start My Trial` button
   - **Trial, not free plan.** Stan has NO free tier — this is consistent across the landing. 14 days → pay $29+/mo or leave.

10. **Footer**
    - Social row: Youtube, Twitter (`@stanforcreators`), Instagram, TikTok, LinkedIn — creator-heavy distribution, no Facebook
    - Footer links: `Sign In` → **`https://admin.stan.store/register`** (this is the public signup URL — no other linktree-style funnelling), Blog, Referral Program (`help.stan.store/article/89-referral-program-overview`), Jobs (`careers.kula.ai/stan` — external ATS), Help, Privacy Policy (PDF on `assets.stanwith.me`), Terms (PDF).
    - **Jobs on a third-party ATS (`kula.ai`)** and **legal docs as PDFs on `stanwith.me`** (different domain) → Stan is a lean SaaS that didn't bother to in-house these surfaces. Good indicator of engineering-resource priorities: product over plumbing.

#### How the flow works

- **One conversion path**, repeated 3×: Hero CTA `Continue →` + mid-page `Start My Trial` + footer `Start My Trial`. All three land on the same signup destination. Linktree has 5+ CTAs with varying copy; Stan keeps it to **one verb-shape × 3 placements**.
- **No free tier shortcut** — landing aggressively pre-qualifies the visitor for a paid-trial intent. If you came here for a free link-in-bio, you bounce. That's deliberate.
- **Dashboard revenue screenshots as social proof** is the single most differentiated UX pattern on this landing vs Linktree/Beacons. It sells the product by showing its own UI — no separate "product shots" section needed.

#### UI / usability assessment

- **Visual hierarchy:** clean, single-column marketing layout with oversized type on every section header (H1 for every block, not H2 — visual consistency trick that makes every section feel important).
- **Colour system on the landing:** hero purple `#5B4BF5` → neutral light-grey sections for social proof/testimonials → purple resurfaces for CTA bands. Two colours + white + green CTA. Restrained.
- **CTA colour choice (mint green on purple hero):** the mint `#3DDC97` against deep purple is a deliberate high-contrast pairing (complementary-ish). Very high click-affordance. Tadaify: our warm `#F59E0B` against Indigo `#6366F1` is a *similar* pairing (warm against cool) — same strategic logic.
- **Typography:** single sans-serif family throughout, very bold weights for H1s, no serif anywhere (unlike our locked Indigo SERIF palette which explicitly includes a serif display). Stan is more "creator-startup playful" than "serif premium".
- **Middle-dot separator is their signature.** `All·in·One`, `Not just another link·in·bio`, `Stan is the easiest way to start selling online.` — they use `·` consistently as a brand rhythm marker. Functional equivalent of the `ta-da!` beat in our wordmark.

#### Strategic assessment for tadaify

1. **Stan's "not just link-in-bio" framing is the most defensible positioning in this category.** It lets them charge $29–99/mo without competing on the $0 free-plan axis. Tadaify should decide explicitly: do we play link-in-bio (Linktree axis, price-anchored to free) or do we play creator storefront (Stan axis, price-anchored to value)? **Recommended: play storefront with a free tier** — Stan's refusal to offer free is their biggest acquisition gap, and their $29 friction is what drives creators to try Beacons and Linktree first.

2. **Real public stores as the landing's primary proof.** 5 clickable stores, zero friction, visitor can audit the product without signup. Tadaify should ship this **from launch**, even if it means paying 5 early creators to maintain demo stores. Linktree/Beacons don't have this and it's a visible trust gap.

3. **Dashboard screenshots as testimonials.** Stan's UGC features raw `$32,012 · 100%` dashboard numbers. Implication for tadaify: **the admin UI itself needs to be screenshot-worthy**. Revenue chart, product list, total — all should be beautiful enough that creators voluntarily screenshot them for social. This is a design constraint on the admin, not a marketing decision.

4. **"1-Tap Checkout" framed as conversion-rate feature.** Stan talks to the creator's P&L, not the buyer's convenience. Tadaify should adopt the same framing: every feature sold as "this increases your earnings", not "this is a nice UX". Buyer experience is table stakes; creator outcomes are the marketing language.

5. **Middle-dot `·` separator.** Stan owns this as a brand rhythm device. We rejected `·` for our wordmark (variant E) in favour of `-` (variant F) — good call, we'd have clashed with Stan.

6. **Single conversion path × 3 placements.** Much simpler than Linktree's multi-CTA landing. Consider a single `Claim your handle` or `Start free` across the whole landing — no variant copy, no A/B visible to the visitor.

7. **Purple + mint-green.** Very close to our Indigo + warm-accent pairing logic. Subtle differentiator: Stan's mint is a *cool* CTA colour (green), we lean *warm* (orange). Warm-accent says "celebration/reveal", cool-accent says "action/start". Our wordmark concept is a reveal moment → warm is defensible.

#### Irritation risk for visitors

- **No pricing on the landing.** Visitor has to click `Start My Trial` to find out it's $29/mo. Depending on locale this is either "normal SaaS friction" or a dark pattern — feedback on Trustpilot ranges both ways. Tadaify should surface pricing with one click from nav (Linktree does this; Stan and Beacons don't).
- **`Blog` rendered as text, not a link** in the nav — either a CMS bug or an intentional "coming soon" placeholder. Either way, **dead nav items erode credibility**. Tadaify nav should ship with zero dead items from day 1.
- **Tatiana Londono's card links to TikTok, not a Stan store** — looks like a stale CMS entry. Small trust ding.
- **`Our Mission` as a top-nav item** is a big signal that Stan prioritises brand-story over product pages (no `Features`, no `Pricing` in the nav — you have to start the signup flow to see features beyond the landing). Aggressive.

#### Worth implementing for tadaify

**Yes, adopt in modified form:**
- Single conversion path × 3 placements (replace Linktree's multi-CTA landing) — MVP critical
- Real public stores as the primary proof section — MVP critical (even with 2–3 seeded example creators)
- Dashboard-screenshot social proof — design constraint on admin UI, not launch-blocker but bake into admin design system
- "X-Tap Checkout = conversion feature" framing language — copywriting guideline

**No, avoid:**
- No-pricing-on-landing — tadaify should publish pricing in nav
- `Our Mission` as top-nav instead of `Features`/`Pricing` — too aggressive for an unknown brand; revisit at 100k MRR
- 14-day trial without free tier — positioning hole

#### How tadaify could do it better

1. **Keep the single-CTA-repeated-3x pattern, but make the CTA claim-oriented.** Stan's `Continue →` is weak. `Claim tadaify.com/yourname` is stronger — triggers ownership instinct, pre-commits the visitor to a handle.

2. **Replace dashboard-screenshot testimonials with dashboard-screenshot demos.** Every section of the landing can be a real Tadaify admin screenshot captioned "This is your admin view on day 1", "This is your revenue chart at $5k MRR", "This is how one product sells". Takes Stan's pattern a step further: not just social proof, product walkthrough via UI shots.

3. **Ship pricing in the nav.** Removes the #1 friction signal on Stan (no-pricing-on-landing). Our $0 free plan is an acquisition wedge; hide it at your own cost.

4. **Add an open developer API mention on the landing.** Stan explicitly has no public API (desk research). We can use our API as a landing differentiator vs Stan+Linktree+Beacons — a dedicated section "Build on top of tadaify".

5. **Keep serif typography where Stan uses sans.** Our "Indigo Serif" brand is a deliberate differentiator. Stan feels "startup playful"; we should feel "first-impression premium" (matches our tagline "Turn your bio link into your best first impression").

6. **Trust section for EU/Polish creators.** Stan is US-coded (revenues in $, creator list 5/5 US). A Tadaify landing with one PL/EU creator card + GDPR/VAT line is a wedge in a market Stan ignores.

#### Open questions

- Does Stan `Continue →` land on a username-first signup (like Beacons) or an email-first one? To be confirmed in STS-002.
- Is the `Log in` / `Sign Up` in the top nav actually a modal (href=`#`) or dead? To be confirmed in STS-002.
- Do the real creator stores render mobile-first at 100% width on desktop (Stan's brand promise), or do they have a desktop layout? Critical for deciding whether Tadaify commits to mobile-first-only or ships a desktop-optimised store too.
- What is the exact signup → first-store-live time? Stan claims "a few minutes" on the landing. To be measured in STS-00N when we run the signup flow.

---

## 01. Onboarding & Auth

### Screen STS-020 — Signup page (admin.stan.store/register)

- **Flow:** any of the 3 landing CTAs (Continue / Start My Trial × 2) OR footer Sign In link → redirects to `admin.stan.store/register` → actually renders from `v2.admin.stan.store/register`
- **Source:** BrowserMCP snapshot + screenshot, 2026-04-24
- **URL:** `https://admin.stan.store/register` (redirects to `https://v2.admin.stan.store/register`)
- **Page title:** `Stan Admin`

#### Layout and visible functionality

**Single-screen registration form** (all fields visible on first paint):

1. **Progress bar** at top (purple thin bar showing ~15-20% filled) — implies multi-step signup with 5-7 steps total
2. **Heading:** `Hey @Username 👋` — the handle placeholder dynamically updates as the user types into the username field (confirmed via snapshot where the placeholder is literal text, presumably replaced on input)
3. **Subheading:** `Let's monetize your following!` — aggressive creator-first positioning; assumes the visitor already HAS an audience. Not inclusive of "I want to start a side business".
4. **Form fields (all on one screen):**
   - `stan.store/` prefix + `username` input (@ icon)
   - `Full Name` (user icon)
   - `Email` (envelope icon)
   - Country code dropdown — **defaults to `+66` Thailand flag** (!) + `Phone Number` input
   - `Password` (padlock icon + eye/eye-off visibility toggle)
5. **Primary CTA:** large purple pill `Next` (brand purple `#5B4BF5`, same as landing hero)
6. **Legal footer:** "By continuing, you agree to our Terms of Service and Privacy Policy" (both link to PDF on `stanwith.me`)
7. **Auth toggle:** `Have an account? Login` (→ `/login`)

**Explicitly absent:**
- No reCAPTCHA visible on first paint (may load lazily; or only appears on Next click)
- **NO SOCIAL LOGIN / NO SSO INTEGRATION** (user-confirmed observation, 2026-04-24) — Stan ships **zero** third-party identity providers. No Google, no Apple, no Facebook, no Twitter/X, no LinkedIn, no TikTok, no Microsoft. Every creator must manually enter username + full name + email + phone + password. **This is one of Stan's biggest acquisition-friction gaps** and an immediate wedge for tadaify: Google + Apple SSO on day 1 removes ≥60% of the friction for creators who already have Google accounts.
- No "continue as guest" / trial-without-signup path
- No free-plan pathway — Next proceeds into the 14-day trial flow

**Hidden DOM modals** (pre-rendered but hidden on first load, per snapshot):
- `Heads up! You have unsaved changes. What would you like to do? [Stay on Page] [Discard Changes]` — shown on navigation-away attempt
- `Close Modal` button — implies signup renders as a modal overlay within a page shell (explains the `v2.admin.stan.store` rewrite; the admin app is an SPA and `/register` is a modal state)

#### How the flow works

- **Handle claim + personal data + phone + password all on ONE screen.** This is the opposite of Beacons' progressive signup (BCN-001: handle first → Next → credentials next). Stan asks for everything at once, trading friction for completion atomicity.
- **Phone number is mandatory** — Stan collects it for 2FA, SMS marketing, or fraud detection. Beacons does NOT require phone. Linktree does NOT require phone. **This is the highest-friction signup in the category.**
- **Default country code is Thailand (`+66`)** — either a geolocation default bug (possibly my browser's IP isn't being detected correctly) or Stan's infra is headquartered in Asia. **This is a real usability bug** — US/EU creators must open the dropdown and scroll/search. Mobile UX is even worse.
- **Welcome heading personalization** — "Hey @Username 👋" updates in real-time as the user types. Small delight-touch that raises the perceived investment cost before the user can back out.
- **No username availability indicator visible** (unlike Beacons' green check). Possibly appears on blur/after typing; to be confirmed by typing into the field.

#### UI / usability assessment

- **Brand consistency with landing:** Purple primary, same pill button style as landing `Continue →` CTA. Good.
- **Form density:** 5 fields on one screen feels heavy for a SaaS signup. Industry norm is 2-3 on first screen (email + password or email + social-login-button).
- **No social login is a real acquisition penalty** — Beacons offers Google, Linktree offers Google + Apple. Stan's absence is either deliberate (avoid OAuth provider friction for creator verification) or an engineering debt.
- **Phone mandatory is a regulatory + privacy signal** — creators from PL/EU with GDPR-consciousness may bounce. Stan is US-tilted; their conversion model can absorb this.
- **Thailand country default** — cosmetic bug but psychologically undermines trust. "Did the form work? Is this site legit?" moment.
- **Pre-rendered unsaved-changes modal** — mature SPA behaviour, respects user's entered data. Positive.

#### Strategic assessment for tadaify

1. **Tadaify adopts Beacons' progressive signup (handle → Next → credentials), NOT Stan's all-at-once.** Progressive = lower perceived commitment, higher completion rate. Confirmed by BCN-001 "user pattern preference: podoba mi się taki rodzaj sign-up, wybieramy najpierw handle" (brand-lock reference) — this is already our locked pattern.

2. **Don't require phone on signup.** Tadaify only collects phone at moment of need (Stripe Connect onboarding, 2FA opt-in, SMS reminders opt-in). Collecting phone on signup is a conversion hole Stan has created.

3. **Ship social login day 1.** Google + Apple + (optional) LinkedIn SSO. Stan's absence is a wedge — halves signup time for creators who already have Google accounts. Beacons ships Google; we match or exceed.

4. **Auto-detect country from geolocation/IP for country-code defaults, with sensible fallback.** Stan's Thailand default is a bug. Tadaify: IP-geo → fallback to `+1` (US) if detection fails → never `+66` unless user is in Thailand.

5. **Reserve "Let's monetize your following" positioning for the paid-tier upgrade, not the initial signup.** Tadaify's inclusive positioning covers both established creators AND aspiring creators. Opening copy like "Claim tadaify.com/yourhandle — your bio link that actually sells" (handle-claim + feature hint) instead of "Let's monetize your following" (prerequisite-gated).

6. **Progress bar at top is a neutral-to-positive pattern** — adopt, show 3-4 distinct steps visually.

#### Irritation risk

- **High — Thailand country default**, phone-mandatory, no social login. A US creator hitting this has 3 friction points on the first screen.
- **Medium — "Let's monetize your following"** alienates creators pre-audience. Stan deliberately filters for established creators; we don't.

#### Worth implementing for tadaify

**AVOID everything Stan does here:**
- All-fields-at-once signup (use Beacons-style progressive)
- Phone mandatory on signup (collect only at Stripe onboarding)
- No social login (ship Google + Apple SSO day 1)
- Hardcoded non-geo country default (IP-geo + US fallback)
- "Monetize your following" copy (use inclusive "Claim your handle" copy)

**ADOPT selectively:**
- Progress bar at top (shows commitment, sets expectation)
- Unsaved-changes modal on nav-away (data preservation, respect for user input)
- Dynamic placeholder that updates as user types (delight-touch)
- Brand-consistent primary CTA colour (same purple as landing, same pill style)

#### Open questions

- Does the username field have a live availability indicator that fires on blur? (Not visible in snapshot; would need to type into it.)
- What are the next steps after Next click? 14-day trial payment collection? Stripe Connect onboarding? Product creation? (Not audited — no registration completed.)
- Is the admin app (v2.admin.stan.store) mobile-responsive or desktop-only? (To test via resize.)
- Is `admin.stan.store` (v1) still accessible, or is v2 the forced path? (URL rewrites happen; v1 may be deprecated.)
- Does the Apple ID login absence block Stan from the iOS App Store if they publish a native app? (Strategic relevant — Apple requires Sign in with Apple if any third-party SSO is offered. Stan has no SSO, so they're not blocked, but also have no mobile app either per desk-research.)

---

## 02. Dashboard & Navigation

### Screen STS-021 — Onboarding step 2 `/subscribe/socials`

- **URL:** `https://v2.admin.stan.store/subscribe/socials`
- **Trigger:** after submitting signup form (STS-020)

#### Layout and functionality

- **Heading:** `Connect your social accounts to your store`
- **Progress bar:** step 2 of N (~25-30% filled)
- **3 social inputs visible by default:**
  - Instagram `@ Your Username` (empty by default — user manually typed `waserek` during audit; **Stan does NOT auto-fill from store username**, corrected 2026-04-24 per user observation)
  - TikTok `@ Your Username` (empty)
  - LinkedIn `URL https://www.linkedin.com/` (prefix-hinted, empty)
- **"View more ▼"** — expandable to reveal additional social providers (not expanded in audit)
- **Next** button (primary) + **Skip** link (secondary)

#### Strategic observations

1. **Socials are entirely manual entry — NO autofill, NO OAuth connect.** Creator types every handle by hand. No "Connect Instagram" button that verifies and auto-reads the profile. This is another acquisition/onboarding friction Stan leaves on the table.
2. **Skip is prominently available.** Stan doesn't gate progress on socials. Compare Beacons which pushes harder through setup.
3. **Instagram + TikTok + LinkedIn are the 3 default visible** — NOT Facebook, NOT Twitter/X, NOT YouTube. Reveals Stan's creator-demographic assumption: Instagram-primary + TikTok-secondary + LinkedIn-business. YouTube is buried under "View more".

#### Tadaify implications

- **ADOPT** prominent Skip button on socials step
- **ORIGINATE against Stan:**
  - Offer **social-handle autofill from the store username** as a first try (80%+ of creators use same handle across platforms). Stan does NOT do this — we ship it as a delight touch.
  - Offer **`Connect Instagram` / `Connect TikTok` OAuth buttons** that verify the handle is real AND auto-fetch follower count + bio + avatar → pre-populate creator credentials for STS-011 product-page social-proof block (PAT-019). Stan forces creators to type handles + later re-upload IG screenshots; tadaify threads it once.
  - Manual handle input remains available as fallback.

---

### Screen STS-022 — Onboarding step 3 `/subscribe/plan` (pricing DURING signup)

- **URL:** `https://v2.admin.stan.store/subscribe/plan`
- **Trigger:** after STS-021 Next or Skip

#### Layout and functionality

- **Heading:** `Pick your plan, start earning today 💸`
- **Progress bar:** step 3 of N (~40-50%)
- **2 value-prop ticks** with checkmark icons:
  - `Save $100s by choosing Stan`
  - `All-In-One store, easy to set up`
- **2 radio options (ONLY 2 plans visible during signup):**
  - **Monthly** (pre-selected): `$0 for 14 days, then $29/mo`
  - **Yearly** (secondary, Save 20% badge): `$0 for 14 days, then $300 $360/yr`
- **Due today $0 🙌** callout
- **Next** button (purple pill)

#### Critical strategic observations

1. **ONLY Creator tier ($29 / $300) is visible during signup. Pro tier ($99 / $948) is HIDDEN.** This is a deliberate acquisition funnel design:
   - New signups ALL enter at Creator price point (lower friction, easier "yes")
   - Pro tier is upsold LATER — likely when the creator hits a Pro-gated feature (email marketing, funnels, advanced analytics, ad pixels)
   - Linktree's pricing page shows all 4 tiers upfront; Beacons shows all 3; Stan deliberately shows 1 during signup
2. **Pricing surfaces DURING onboarding, not BEFORE landing-page click.** This is consistent with Stan's landing strategy (no pricing in nav, all CTAs → signup). The pricing page is a **trial-conversion step**, not a marketing page.
3. **Monthly is pre-selected; Yearly requires one extra click.** Default psychology: most users don't change the pre-selection. Stan gets $29 first-charge revenue from the majority, then Yearly converts happen via admin after trial.
4. **"Due today $0 🙌"** — classic SaaS trial-pattern. Zero friction to start, card required (card capture happens on Next click).
5. **"Save 20%"** on Yearly is aggressive. Linktree offers 17%; Beacons offers ~16%. Stan's 20% is the highest annual-commit incentive in the category.

#### Tadaify implications — major positioning lever

**Tadaify opposing strategy:**

- **Show ALL tiers upfront on the pricing page** (publicly nav-linked), NOT hidden inside a signup funnel. Transparency = trust, differentiator vs Stan.
- **Ship a FREE tier** — Stan's `$0 for 14 days then $29` is the single-line summary of Stan's acquisition hole. Tadaify's free tier is a permanent alternative, not a ticking-clock trial.
- **If we do paid tiers, default the signup landing on the FREE plan, not a trial.** Creator can upgrade when they hit value; no card collected at signup.
- **Yearly savings positioning** — match or exceed 20% savings on Yearly if we go paid. Stan's benchmark is the category high.

**Tadaify funnel decision** (to resolve in tadaify-feature-mix §6.1):
- Option A (match Linktree): Free / Pro $X / Business $Y — all shown upfront
- Option B (match Stan): trial-only paid entry, no free tier — REJECTED per existing decision
- Option C (originate): Free + one paid "Pro" tier, no business tier (Notion-style). Simpler pricing, less decision paralysis
- **Recommended: Option C** — fewest decision points, easiest to communicate

**What we do NOT replicate from Stan:**
- Hiding higher tiers during signup (trust erosion)
- Pre-selecting Monthly over Yearly (honest default = explicit choice)
- Card-at-signup for "free trial" (only collect card when creator opts INTO paid)

#### Open questions

- What happens on Next click? Stripe hosted card form? Stripe Elements? Custom? (Not audited — would charge card.)
- Does Pro tier upsell happen at first Pro-gated feature click, or on a schedule (day-7 of trial)?
- Does the "Save 20%" Yearly discount apply to Pro too, or only Creator?
- Is there a student / non-profit / education discount? (Not visible.)

---

## 02. Dashboard & Navigation (bis)

## 03. Page Editor

No screens documented yet.

## 04. Public Page / Profile

### Screen STS-010 — Real creator public page (Abigail Peugh)

- **Flow:** unauthenticated visitor → `https://stan.store/abigailpeugh` (a live, paying-creator Stan store linked from the landing)
- **Source:** BrowserMCP accessibility snapshot, 2026-04-24
- **URL:** `https://stan.store/abigailpeugh`
- **Page title:** `Abigail Peugh (@abigailpeugh) | Stan`

#### What a real Stan creator store actually contains

Structure (from snapshot, top to bottom):

1. **Identity header** — avatar + creator display name ("Abigail Peugh"), no tagline surfaced
2. **4 external social icons** — Instagram, TikTok, `mailto:` email, YouTube (icon-only row; no platform labels)
3. **Paid product blocks** (5 — the commerce core of the page):
   - `Rich Girl Community` — $67 — rating 5.0 — CTA `Join My Community` — copy "Learn how to make daily digital product sales for $2.23 a day (price is going up in May)" — uses **urgency nudge in description** (price raise), not a banner
   - `IG Growth for Sales` — $97 — rating 5.0 — CTA `TAP HERE TO GRAB IT` — copy "Learn how to grow your Instagram WITH the intention of selling a digital product! 💸"
   - `Rich Girl Stories 💸 2025` — $97 — CTA `GRAB IT HERE` — copy "A training + 10 day challenge to teach you how to turn your Instagram Stories into sales!"
   - `PreSell Like a Rich Girl` — $147 — CTA `GRAB IT HERE`
   - `Rich Girl Launch` — $197 — CTA `HAVE A RICH GIRL LAUNCH`
4. **Podcast external link** — `LISTEN TO MY PODCAST 🎧` (single button, no price, external)
5. **Lead magnet / freebie block** — `7 Days, 7 Ways to Sell Like a Rich Girl 💰` — no price — CTA `START SELLING MORE` — description nods at existing buyers ("Already have a digital product and want to sell more of it?")
6. **Section separator label** — `THINGS I LOVE (affiliate links)` — group header, not a block
7. **Affiliate product blocks** (4):
   - `ManyChat Sign up!` — "Get 14 days free of ManyChat pro" — CTA `CLICK HERE TO CLAIM!`
   - `50% off FLODESK 💌` — (button-only, no detail surfaced)
   - `Get your own Stan Store!` — **self-referral to Stan itself — every creator's page promotes Stan** (PAT-008)
   - `Terms & Conditions for DP` — (looks like creator's own ToS for digital products — repurposed affiliate block for legal)
8. **Separate bundle section** — `CONTENT CREATION TOOLS` (H4 separator) — `CHECK THEM OUT` button → likely a bundled page of recommended tools
9. **Footer** — single `Privacy Policy` text link (no Stan branding visible on the snapshot — possibly hidden until scroll)

#### Functional observations (what the product actually supports)

- **Per-product ratings** (`5.0`) surface only on 2 of 5 paid products — likely means products need N reviews before rating renders. Good trust floor (we'll adopt at 3+ reviews — PAT-007).
- **Custom CTA text per block** — all 5 paid products use different CTA labels (`Join My Community`, `TAP HERE TO GRAB IT`, `GRAB IT HERE` × 2, `HAVE A RICH GIRL LAUNCH`). This is the personalization superpower (PAT-006).
- **Mixed monetization types on one page** — paid products + community (recurring) + lead magnet + affiliates + external podcast + legal doc. A single tadaify page needs to support ALL of these block types on day 1 (PAT-012).
- **Urgency nudges live inside descriptions**, not as platform-wide banners — creator owns their own scarcity messaging.
- **Price ladder visible** — $67 → $97 → $97 → $147 → $197 — classic "value ladder" with high-ticket at the bottom. Stan evidently supports **order** as a creator-set thing (not algorithmic).
- **Self-referral block (`Get your own Stan Store!`) on every creator's page** — Stan's viral acquisition loop is built in. Abigail earns affiliate commission on signups she sends to Stan, Stan earns a creator she recruited. **This is Stan's paid-acquisition-replacement.**
- **No Stan branding visible in the main scroll** — the footer likely has a small "powered by Stan" but it's not prominent. Abigail's page reads as Abigail's brand, not Stan's. (Compare Linktree, which keeps branding much more visible on free tier.)

#### UI / usability assessment

- **Single vertical scroll, mobile-first** — every block is full-width. No columns, no grid. Consistent with Stan's "mobile store" positioning.
- **No dark mode** — page is always light.
- **No theme customization visible from the URL** — Abigail's page uses what looks like a near-default Stan theme (no background image, minimal colour accent). Stan desk-research confirmed 11 presets + 10 fonts + 2 custom hex colours — Abigail appears to have kept close to defaults.
- **Cookie banner / consent / GDPR** — NONE visible on initial load. This is a US-tilted product; EU compliance is thin (risk to creators selling into EU).
- **Loading / empty states** — not observable here (page is fully populated).

#### Strategic assessment for tadaify

1. **Six block types is the MVP minimum** — `product`, `community` (subscription), `lead-magnet`, `affiliate-link`, `external-link`, `section-header`. If tadaify ships fewer, creators like Abigail can't move their whole funnel over. This is a hard constraint on the MVP.

2. **Custom CTA per block is a tier differentiator** — Stan ships it on all tiers; Linktree locks CTA overrides behind Pro. Tadaify: free tier should ship it (defensible against Stan, superior to Linktree).

3. **Self-referral block is Stan's paid-acquisition-replacement** — tadaify MUST ship this from day 1. Without it, we need a $/CAC budget to compete. With it, creators pay us for the block (via kickback) and their audiences become our funnel.

4. **Per-product reviews = product trust at checkout** — Stan ships numeric rating only. Tadaify should go further: ship a full reviews sub-page per product (PAT-007 ORIGINATE delta).

5. **Affiliate disclosure label is table stakes** — "THINGS I LOVE (affiliate links)" is the FTC-compliant pattern. Tadaify bakes the disclosure into the block type (PAT-011).

6. **Urgency is creator's job, not platform's** — Abigail writes "price is going up in May" into the product description. Stan does NOT ship countdown timers or platform scarcity UI. Good restraint — avoids sleaze-by-default. Tadaify should follow: no platform-wide urgency UI.

7. **No EU compliance visible** — risk for serious EU creators. Tadaify's GDPR + VAT handling is a regional differentiator (feature-mix §9).

#### Irritation risk for buyers

- **No native search / filter** on creator pages — if Abigail's audience grows to 20+ products, the page becomes a long scroll. Not visible here (10 blocks total) but will bite at scale. Tadaify could ship a light search / sections UX for large stores.
- **All CTAs shout in caps** — creator-authored, but aesthetic. Platform can't prevent this; allow it.
- **External links mix with paid products without clear visual separation** — only the `THINGS I LOVE` label separates them. Cleaner approach: tadaify renders affiliate blocks with a subtle badge or tinted background.

#### Worth implementing for tadaify

**ADOPT:**
- All 6 block types from day 1
- Custom CTA per block on all tiers (free included)
- Per-product rating (at 3+ reviews, not 1)
- Self-referral block by default on every creator page
- Affiliate-disclosure label baked into affiliate block type
- Mobile-first single-column public page default

**AVOID / AVOID-FOR-NOW:**
- Platform-wide urgency / countdown UI (Stan correctly doesn't ship it — let creator author urgency in copy)
- Search / filter on public page (not needed at MVP; revisit at $1M ARR creator cohort)
- Dark mode for public pages (Stan doesn't ship it; we can originate this as a subtle upsell later)

#### How tadaify could do it better

1. **Reviews sub-page per product** — Stan shows `5.0` with no breakdown. Tadaify: click the rating → full reviews page with quote cards. Higher buyer trust, higher creator conversion.
2. **Better visual separation for affiliate vs paid vs free** — subtle tinted card backgrounds per block type so the buyer instantly knows "this is a paid course", "this is affiliate", "this is a free freebie".
3. **Light dark-mode toggle for public pages** — Stan doesn't ship it; creators on Etsy are selling theme packs for $15-50 to differentiate. Tadaify bakes dark mode + 3-5 theme presets with palette overrides → removes the Etsy-template cottage industry from the funnel.
4. **"Store stats footer"** — on paid tier, display "500+ buyers · 4.8 avg rating · since 2024" at bottom of page. Stan doesn't do this. Adds trust without being pushy.
5. **Section-level rearranging + conditional blocks** (Pro-tier) — "show this block only to returning visitors" / "hide affiliates on checkout pages". Grown-up personalisation. Original to tadaify.

#### Open questions

- Does Stan expose a "draft" state on the public page, or does publishing flip everything atomically?
- How does multi-currency work for EU/PL buyers hitting US creators' stores? (Stan is USD-centric per desk-research.)
- Is the `Powered by Stan` footer actually on this page, or has Abigail removed it? (Confirm via scroll or direct DOM inspection.)
- Are blocks draggable only in editor, or does Stan also support "pin to top" / "featured"? (To confirm in admin audit.)

### Screen STS-011 — Product detail page + inline checkout drawer (IG Growth for Sales $97)

- **Flow:** from STS-010 → click `TAP HERE TO GRAB IT` on `IG Growth for Sales` → URL changes to `/<handle>/p/<product-slug>` with creator identity panel left-pinned + product detail drawer right
- **Source:** BrowserMCP snapshot + live visit, 2026-04-24
- **URL:** `https://stan.store/abigailpeugh/p/ig-growth-for-sales-2025`
- **Page title:** `IG Growth for Sales by @abigailpeugh | Stan`

#### Critical structural discovery

- **Desktop layout is 2-column split, NOT mobile-first single-column as earlier notes assumed.**
  - Left column (≈ 1/3 width): sticky creator identity — avatar + name + social icons (persists during right-column scroll)
  - Right column (≈ 2/3 width): product detail drawer, independently scrollable
- **Each product gets its own vanity URL** `/<handle>/p/<product-slug>` — shareable, presumably SEO-indexable, deep-linkable from external marketing. The store root `/<handle>` is the hub; each product is a sub-page. This is richer than Linktree's "every link is a redirect" model.

#### What the product detail drawer actually contains (top to bottom)

1. **Back-arrow chip** in top-left of drawer (returns to store root without full page reload)
2. **Hero image banner** — full-width, creator-chosen image; in Abigail's case a deep-red background with serif typography `IG Growth For Sales` + script `training` subtitle. Implies creators can upload a **cover image per product** (not just a small thumbnail as on the hub)
3. **Product title** (H-equivalent, smaller than banner)
4. **Price** in prominent creator-brand red (`$97`)
5. **Short intro copy** (1 paragraph above the fold)
6. **Embedded Instagram profile mini-card** — avatar + handle `abigailpeugh ✓` + follower stats `487 posts · 100K followers · 1,197 following` + bio line. **Acts as live social proof** — not a screenshot, looks like an actual IG embed widget. Creator's own IG profile on their own sales page → "I have 100K followers, trust me" signal baked in
7. **Long-form sales copy** — 6+ paragraphs, rich formatting (bold, italic, emphasis, strong), bullet list of 6 learning outcomes:
   - "How to set up your IG account properly (Bio, highlights, pinned posts)"
   - "How to grow your IG account full of future buyers for your digital products"
   - "How to story sell so people wake up excited to watch your stories and buy from you"
   - "The tool I use to make digital product sales (even when I'm not working)"
   - "How to use Trial Reels For Growth (this one is soooooo much fun)"
   - "What's actually working on IG right now..."
   - This is **effectively a landing page per product**, not a product card. Word count ≈ 500+.
8. **ONE TIME OFFER — upsell checkbox** — "Digital Product Starter Kit for just $67 ($87 Value)" + 5-star rating + **checkbox `Yes, I'd like this One-Time-Offer!`** pre-order bump. Creator configures one upsell per product. Stan's equivalent of Shopify's "order bump" — surfaces AT checkout, not post-purchase.
9. **5 review tiles** — each with:
   - Reviewer IG handle (`@somewhereworthwhile`, `@ellysugc`, `@krystalmorrisonmindset`, `@chefclarisseflon`, `@virtual.vivian`)
   - Quoted result-focused review ("gained 1500 followers, reel is almost to 1 MILLION", "made 3 sales", "11k → 15.9k followers in a few weeks")
   - 5-star rating per review
   - Review image thumbnails (likely screenshots of their results)
   - Review carousel has prev/next buttons (prev disabled = carousel starts at review 1)
10. **Inline checkout form** — `GRAB YOUR SPOT!`
    - `Enter your name` textbox
    - `Enter your email` textbox
    - `Discount Code` section + `Enter promo code here` input + `Apply` button
    - `I understand and agree to the Terms & Conditions` checkbox
    - **Total: US$97** (live total, updates when promo applied)
    - **PURCHASE** button (single primary CTA)
    - Tail: `or Privacy Policy`

**No card fields visible yet** — Stan collects name + email + ToS agreement on this page, then (presumably) opens Stripe hosted checkout or Stripe Elements drawer after `PURCHASE`. Not further tested (no real purchase executed).

#### Functional observations — Stan's checkout is NOT what tadaify assumed

- **Inline, on-page checkout** — not a redirect to Stripe, not a modal. Everything (product copy + upsell + reviews + name/email/promo/ToS) lives on one scrollable page. Card details likely come in a final step post-PURCHASE click.
- **Per-product URL is canonical** — `stan.store/abigailpeugh/p/ig-growth-for-sales-2025` can be pasted into Twitter, IG DM, email. **Creators share the product URL, not the store URL.** Tadaify URL model must support this from MVP.
- **Upsell is one-click (checkbox)** — no separate confirmation step. Pre-ticked? Unclear from snapshot (checkbox state not captured as checked/unchecked explicitly, but "Yes, I'd like this One-Time-Offer!" copy is phrased as opt-in).
- **Reviews surface on product page**, not on a separate `/reviews` sub-page. Creator writes/curates them via the admin.
- **Discount code box is visible by default** — no "have a code?" collapsible link. Either Stan's UX choice (show friction to reduce cart abandonment via "I should find a code first") or a deliberate conversion pattern to allow affiliates to share promo codes openly. Worth confirming via other creator stores — if widespread, it's the product default.
- **Rich-text/markdown editor support** for product description — bold, italic, bullets, paragraphs. Not plain text.
- **Creator-uploaded hero banner per product** — separate from the hub thumbnail. Two images per product at minimum (card thumbnail + detail hero).

#### UI / usability assessment

- **Sticky left identity column** → reinforces creator brand during the entire product journey, even during checkout. Elegant solution to the "buyer forgets who they're buying from" problem.
- **Long-form sales page baked in** → creators don't need Carrd or a separate landing page for their product. Stan swallows that surface.
- **Back-arrow returns without reload** → SPA routing (product URL change but no page flash). Good UX.
- **Discount code + promo surface at checkout** → live recalc of total, visible before purchase click.
- **Reviews are on-product, not on-platform** → Stan doesn't aggregate reviews at the creator level or platform level. Reviews live per-product, which is correct for creator businesses but could mean a fresh product starts with `0 reviews` and lower trust.

#### Strategic assessment for tadaify — MVP REDESIGN REQUIRED

1. **Product detail page is a first-class surface, not an afterthought.** Tadaify MUST ship per-product URL + long-form rich-text description + hero banner + embedded social proof + inline checkout + reviews. NOT optional for MVP. This is the biggest product decision shift from earlier notes.

2. **Per-product URL is shareable — this is how creators market.** `tadaify.com/<handle>/p/<slug>` (or `tadaify.com/p/<handle>-<slug>`). Decision to resolve in URL-MODEL item of tadaify-feature-mix §3.2.

3. **Inline checkout is the Stan moat.** Not redirecting to Stripe preserves creator brand through payment. Tadaify should do the same (Stripe Elements or Payment Intent API + custom UI, NOT redirect). More expensive to build but product-defining.

4. **Upsell checkbox (order bump)** is a revenue multiplier — Stan's 0% platform fees + order bump = creator gets $97 + $67 bump on 40% of orders = meaningful uplift. Ship in tadaify Pro tier.

5. **Instagram profile embed as product credential.** Stan embeds the creator's own IG profile mid-product-page. Tadaify can do same + extend: "link any social profile as credential" (IG, TikTok, LinkedIn, YouTube — platform picks the API or fallback to screenshot).

6. **Reviews per-product, not per-platform/creator.** Strategic decision: tadaify should surface product reviews BUT also (ORIGINATE) offer aggregated creator trust score at creator hub level ("Abigail has 4.8 avg across 5 products / 230 reviews"). Stan doesn't do this.

7. **Desktop 2-column split vs mobile single-column responsive behaviour.** Stan has this right: desktop creator-sticky, mobile single-column drawer overlay. Adopt directly (PAT-NEW).

#### Irritation risk for buyers

- **Long-form sales copy can feel overwhelming on small products** — a $9 ebook doesn't need 500 words. Stan leaves this to creator judgement. Tadaify: allow short-form default layout + long-form toggle per product.
- **Upsell checkbox UX is sleazy-adjacent** if default-checked. Tadaify should DEFAULT to unchecked + require explicit opt-in. Honesty-first brand.
- **Reviews can be cherry-picked by creator** — Stan likely lets Abigail select which reviews display. Real customer can't leave a review without creator's moderation approval. Trust risk. Tadaify: consider a "verified buyer" badge on reviews (auto-generated after purchase).

#### Worth implementing for tadaify

**ADOPT (MVP critical):**
- Per-product URL `/<handle>/p/<slug>` — SPA routing, shareable
- Product detail page with rich-text description, hero banner, embedded social proof, reviews
- Inline checkout (Stripe Elements embed, not redirect)
- Sticky creator identity column on desktop, full-width drawer on mobile
- Discount code input visible by default
- Reviews rendered on product page, per-product

**ADOPT (Pro tier):**
- Upsell checkbox / order bump per product (one upsell per product)
- Multi-image hero banner (slideshow or video banner)
- Moderated review collection flow ("email buyer 7 days after purchase, request review, creator approves before display")

**ORIGINATE (beyond Stan):**
- Auto-generated "Verified Buyer" badge on reviews (from Stripe purchase record)
- Short-form layout default for products under $X price point (creator can toggle long-form)
- Aggregated creator trust score at hub level (Stan doesn't show this)
- SEO-ready product pages — canonical URL + OpenGraph + Schema.org Product/Review markup (Stan may do some of this; to verify)
- EU VAT auto-calc at checkout (Stan doesn't handle this per desk-research)

**AVOID:**
- Default-checked upsell (sleaze pattern)
- Creator-curated reviews only (trust risk — require verified-buyer flag)

#### How tadaify could do it better

1. **Rich product analytics surfaced to creator** — Stan shows revenue only. Tadaify: "56 visitors hit this product page today, 3 converted, 53 bounced — here's what copy changed last week". Data-driven product optimization.
2. **"Review request" flow baked in** — after purchase, email buyer 7 days later with one-click review form. Creator doesn't have to chase reviews manually.
3. **Product URL A/B routing** — tadaify supports 2 versions of the same product page with different copy/hero; 50/50 traffic split; winner promotes automatically. Turn every $97 product into a marketing experiment.
4. **Cart / multi-product purchase** — Stan forces one product per checkout (need to confirm with second click). If confirmed, tadaify's differentiator: ship cart where buyer can check multiple products then check out once. Major UX lift.
5. **Buyer account** — Stan likely ships no buyer account (every purchase is guest checkout). Tadaify ORIGINATE: optional buyer account for access to purchased courses/communities, one-click repeat purchase for returning customers. Creator sees "this buyer has bought 3 products from me" analytics.
6. **Inline checkout with Apple Pay / Google Pay one-tap** — 1-tap checkout for logged-in users; massive conversion win on mobile. Stan's "1-Tap Checkout" landing claim may actually mean this.

#### Open questions (post this audit)

- What happens AFTER `PURCHASE` click? Stripe hosted, Elements embed, or custom? (Not tested — no real purchase.)
- Does Stan ship Apple Pay / Google Pay / Klarna on the checkout step? (Desk-research: Stripe + PayPal; BNPL at Creator Plus tier.)
- Is the upsell checkbox default-checked or unchecked on first load? (Need fresh snapshot after dismiss.)
- Are reviews auto-generated via verified-buyer flow, or manually entered by creator? (Admin audit required.)
- How does Stan render the product page on mobile — drawer overlay, bottom sheet, or push-new-page? (Resize browser to test.)
- Does Stan let creators reorder reviews, or auto-sort by date/rating? (Admin audit.)
- SEO: is `/<handle>/p/<slug>` server-rendered or JS-routed only? (Affects crawlability — check View Source.)

---

## 06. Monetization / Billing

### Screen STS-011 observations (cross-reference from section 04)

See full walkthrough of Abigail Peugh's `IG Growth for Sales $97` product in STS-011. Key monetization surfaces there:

- **Inline checkout** — name + email + promo code + ToS checkbox + PURCHASE button, all on-product-page (no Stripe redirect visible pre-purchase)
- **Upsell checkbox / order bump** — one additional product (`Digital Product Starter Kit $67, $87 Value`) gated by single pre-checked-or-unchecked checkbox before PURCHASE
- **Discount codes** — textbox + Apply button, live recalc of Total, visible by default (no "have a code?" collapsed link)
- **Terms & Conditions** — inline checkbox, non-optional, per-purchase
- **Total line** — `Total : US$97` — currency hardcoded USD (need EU/PL audit, tadaify-feature-mix §9)

### Still to audit in section 06
- Pricing page (Stan's $29/$99 Creator/Pro paywall UI)
- Billing page (post-signup, inside admin)
- Refund flow
- Payout dashboard (creator-side)
- Stripe connect flow (creator-side onboarding)

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
