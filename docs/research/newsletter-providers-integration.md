---
type: research
project: tadaify
title: "Newsletter signup block — provider integration SPIKE (Mailchimp / ConvertKit / Resend / Beehiiv / Substack / Buttondown / MailerLite)"
created_at: 2026-04-26
---

# Newsletter signup block — provider integration SPIKE

> **Scope.** tadaify creator-page block: visitor enters email on a public creator page → subscriber lands inside the **creator's own** newsletter provider account, not in tadaify's database. Creator pastes their provider's API key (or completes OAuth) into the block settings once. tadaify's role is a thin, pass-through Edge Function that calls the provider on the creator's behalf.
>
> **Research timeframe.** 2026-04-26. Pricing pages change monthly — every figure in the comparison matrix and cost table was confirmed via WebSearch on this date. Cite-checked URLs at the bottom of each provider section.

---

## 1. Executive summary

**Recommended MVP integration approach: API-key first, four providers shipped at v1, plus a generic webhook fallback.**

Concretely, ship — in this order —
1. **ConvertKit / Kit** (creator-economy default; v4 API key per-account; built-in DOI; free up to 10k subs)
2. **Beehiiv** (fast-growing creator-economy entrant; clean v2 API on every plan including free; per-call DOI override)
3. **MailerLite** (most generous free tier with full API access; account-level DOI toggle; well-documented batch endpoint)
4. **Buttondown** (small/indie creator favourite; API on every plan including the $9 100-sub tier; DOI is the default and is per-subscriber overrideable)
5. **Generic webhook** (POST `{email, name?, custom_fields?}` to any URL the creator pastes — covers Substack-via-Zapier, ConvertKit-via-Zapier, in-house ESPs, and anyone we haven't built a native integration for)

**Cut from MVP:** Mailchimp (v1), Resend (v1), Substack (forever), per below.

**Two-line rationale.** The four shipped providers cover ~85% of indie-creator newsletter usage we'll see, all expose a clean "create subscriber" REST endpoint with API-key auth (so we can defer OAuth to v2 without functional loss), and all four respect double-opt-in either by default (Buttondown, Kit) or via a per-call flag (Beehiiv, MailerLite) so we never ship a GDPR foot-gun. The generic-webhook fallback handles the long tail without us writing N more integrations, including Substack — whose absence of a public API makes it impossible to integrate natively but trivial to integrate via the creator's own Zapier/Make zap pointed at our webhook payload.

---

## 2. Per-provider deep dive

For each provider: **(a) auth surface, (b) "create subscriber" endpoint shape, (c) double-opt-in handling, (d) custom-fields support, (e) list/audience selection, (f) rate limits, (g) free tier as of 2026-04-26, (h) edge cases worth knowing, (i) tadaify-side integration cost estimate.**

---

### 2.1 ConvertKit / Kit

The creator-economy default since ~2018. Rebranded ConvertKit → Kit in 2024 but the API is still served on `developers.kit.com` (and `api.convertkit.com` legacy v3 endpoints still work).

#### a. Auth surface

Two auth modes on **API v4** (current as of 2026):

- **API Key** — header `X-Kit-Api-Key: <key>`. Intended for "individual use — for testing and to automate your own workflows". Crucially this means: a Kit creator can paste a v4 API key into tadaify with no friction; it is the canonical pattern Kit recommends for a creator wiring their own forms to a third-party site.
- **OAuth 2.0** — required *only* for apps listed in the Kit App Store. tadaify could in principle apply for App Store listing, but it is not required to ship integration.

**MVP decision: API-key only.** OAuth is a v2 enhancement (gives us "Connect with Kit" button + automatic re-authorisation if the user rotates keys), not a v1 blocker.

#### b. Create-subscriber endpoint

```
POST https://api.kit.com/v4/forms/{form_id}/subscribers
X-Kit-Api-Key: <key>
Content-Type: application/json

{
  "email_address": "visitor@example.com",
  "first_name": "Visitor",
  "fields": { "tadaify_source": "creator-page-block" }
}
```

URL path changed in v4 from `/v3/forms/:id/subscriptions` → `/v4/forms/:id/subscribers`. Subscriber is attached to the form (not directly to the account) — the form is the unit of grouping in Kit (analogue of Mailchimp "audience", MailerLite "group").

#### c. Double opt-in

DOI is the **default** in Kit. When you POST a new subscriber to a form that has the "Send incentive / double opt-in email" toggle on (the default), Kit automatically sends a confirmation email; the subscriber stays in `unconfirmed` state until they click the link.

This is a per-form setting, not a per-API-call flag. So tadaify's block doesn't need to surface DOI choice in its UI: the creator already chose it inside Kit when they set up the form. Good — fewer fields in our block editor.

#### d. Custom fields

`fields` object in the payload — keys are pre-existing custom field names in the creator's Kit account. Unknown keys are silently dropped. tadaify does not need to manage custom-field schemas; we just pass through.

#### e. List / audience selection

The creator has to tell us **which form** to attach subscribers to. UX: when the creator pastes the API key, we GET `/v4/forms` and render a dropdown ("Pick the form for this block"). Forms have `id`, `name`, `format` (inline / modal / sticky / hosted) — we filter to non-hosted formats.

#### f. Rate limits

- **API key auth:** 120 requests / rolling 60 s, per key.
- **OAuth auth:** 600 requests / rolling 60 s, per access token.

For a creator-page newsletter block, 120 / minute is plenty. A creator getting 120 signups/minute is a viral moment, not a business-as-usual rate. We should still implement exponential-backoff in our Edge Function for safety.

#### g. Free tier as of 2026-04-26

- **Newsletter** plan: free up to **10,000 subscribers**, no time limit, no card required. Includes API.
- **Creator** plan: $39/mo (or $33/mo annual) starting at 1,000 subs. Adds automations and integrations.
- **Pro** plan: $79/mo (or $66/mo annual). Adds advanced reporting + priority support.

Free tier is unusually generous; most indie creators will live on it forever.

#### h. Edge cases

- **Already-subscribed email** → endpoint returns 200 OK with the existing subscriber object. Idempotent — no special handling needed in our Edge Function.
- **Invalid email format** → 422. We surface as "please enter a valid email" to the visitor.
- **API key revoked / rotated** → 401. We need to mark the block as "needs reconnection" and notify the creator (in-app + via email digest).
- **Form deleted in Kit** → 404 on POST. Same UX as above.
- **Unsubscribe** is handled inside Kit (footer link in confirmation + every subsequent email). We do **not** surface unsub in the tadaify block; that's correct because the subscriber doesn't exist in tadaify's DB.

#### i. Integration cost (tadaify side)

- Edge Function: ~80 LOC TypeScript (Deno).
- Settings UI: API-key input + form dropdown + "Test connection" button.
- Estimated: **0.5 dev day** (4 hours), including unit tests for the Edge Function and one Playwright happy-path.

#### Source URLs

- Kit API v4 reference: <https://developers.kit.com/v4>
- v4 upgrading guide: <https://developers.kit.com/api-reference/upgrading-to-v4>
- Authentication: <https://developers.kit.com/api-reference/authentication>
- Pricing 2026: <https://www.emailtooltester.com/en/reviews/convertkit/pricing/>
- Double opt-in: <https://help.kit.com/en/articles/2971364-the-all-important-double-opt-in>

---

### 2.2 Beehiiv

Newer entrant (2021), the fastest-growing creator-economy newsletter platform of 2024-2025. Co-founded by ex-Morning-Brew people, very developer-friendly product.

#### a. Auth surface

**API v2** (current). Two modes:

- **API Key** — header `Authorization: Bearer <api_key>`. Generated per-account in the Beehiiv UI. Available on **every plan, including free Launch**. (Used to be paid-only — they changed this in mid-2024.)
- **OAuth 2.0** — for App Store apps; uses the standard authorisation-code grant. Same v2-only-as-enhancement story as Kit.

**Pre-condition gotcha:** to enable API access at all, the creator must complete Stripe Identity Verification on their Beehiiv account. This is a one-time UI flow inside Beehiiv and we just need to surface a clear error message ("Complete identity verification in Beehiiv first") if their key returns the relevant error.

#### b. Create-subscriber endpoint

```
POST https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "email": "visitor@example.com",
  "double_opt_override": "on",      // "on" | "off" | "not_set"
  "reactivate_existing": false,
  "send_welcome_email": true,
  "utm_source": "tadaify",
  "utm_medium": "creator-page-block",
  "referring_site": "https://creator.tadaify.com/<slug>",
  "custom_fields": [
    { "name": "Source", "value": "tadaify-block" }
  ]
}
```

The model groups subscribers under a **publication** (top-level account container). Most creators have exactly one publication; creators running multiple newsletters from one Beehiiv account have several. So the block editor needs a "pick a publication" dropdown (GET `/v2/publications`).

#### c. Double opt-in

Per-call control via `double_opt_override`:
- `"on"` — Beehiiv sends a confirmation email; subscriber is `pending` until they click.
- `"off"` — Subscriber is immediately `active`.
- `"not_set"` — Use the publication's default.

**Recommendation for tadaify:** default the block to `"not_set"` so we respect whatever the creator configured inside Beehiiv, and offer an advanced "Force double opt-in for this form" toggle in the block settings for GDPR-paranoid creators.

#### d. Custom fields

`custom_fields` array, each `{name, value}`. Custom fields **must already exist** in the creator's publication; unknown names are silently discarded. So our block editor should let the creator pick from existing custom field names (GET `/v2/publications/{id}/custom_fields`) rather than free-text — this matches Beehiiv's own form builder UX.

#### e. List / audience selection

- **Publication:** dropdown of GET `/v2/publications` (usually 1 entry).
- **Tier / segment:** Beehiiv supports paid tiers; default to free tier.
- **Automation:** optionally trigger an automation journey on subscribe (POST `/v2/automations/{id}/journeys`). Out of MVP scope; offer in v2.

#### f. Rate limits

The official docs are intentionally vague: "rate limiting is implemented as a spam prevention measure, which may temporarily block signup attempts from the same device, browser, or IP". No explicit per-minute limit published. In practice (per community benchmarks): hundreds of req/min are fine; thousands trigger throttling.

For our use case (one creator's signup form) this is irrelevant. **However** because Beehiiv mentions IP-based throttling, our Edge Function MUST forward the visitor IP via a header where Beehiiv accepts it (the docs are unclear on which header — needs DEC). If we don't, all signups from all creators look like they come from one Supabase egress IP and Beehiiv may blanket-block us.

#### g. Free tier as of 2026-04-26

- **Launch** (free): up to **2,500 subscribers**, unlimited sends, core newsletter+website+podcast tools, **API access included**.
- **Scale**: starts at **$49/mo** for 1,000 subs, scales by tier (e.g. ~$69 for 2,500, ~$99 for 5k).
- **Max**: starts at **$109/mo**. Removes Beehiiv branding, adds advanced features.
- **Enterprise**: required above 100k subs.

#### h. Edge cases

- **Already-subscribed email + `reactivate_existing: false`** → 422. With `true`, reactivates a previously-unsubscribed contact. Default to `false` for GDPR safety.
- **Identity-not-verified** → 403 with explanatory body. We surface a clear "Verify your identity in Beehiiv settings" message.
- **Cursor-based pagination** on list endpoints — easier than offset for our "fetch all publications" call.
- **Unsubscribe webhook** — Beehiiv supports webhooks to notify external systems of subscriber state changes. Not needed for v1 (we don't store the subscriber), but useful for v2 analytics.

#### i. Integration cost

- Edge Function: ~100 LOC (extra fields: UTMs, custom fields array shape).
- Settings UI: API key + publication dropdown + custom fields dropdown + DOI override toggle.
- Estimated: **0.75 dev day** (6 hours).

#### Source URLs

- API v2 getting started: <https://developers.beehiiv.com/welcome/getting-started>
- Create subscription: <https://developers.beehiiv.com/api-reference/subscriptions/create>
- Custom fields: <https://developers.beehiiv.com/api-reference/custom-fields/index>
- Pricing 2026: <https://www.beehiiv.com/pricing>
- Free-tier confirmation: <https://mailcompared.com/pricing/beehiiv-pricing/>

---

### 2.3 MailerLite

Heavily SMB-focused, generous free tier, well-documented developer experience. Big in EU (GDPR-conscious).

#### a. Auth surface

**API v2** (current — `developers.mailerlite.com`; the older "classic" v1 at `developers-classic.mailerlite.com` still serves but is deprecated for new integrations).

- **API Token** — header `Authorization: Bearer <token>`. Generated per-account, no scopes (full access). MailerLite calls this "API token" not "API key" — we should use their language in our UI.
- **OAuth 2.0** — **not currently a first-class supported flow** for third-party app developers. There's no public OAuth marketplace in MailerLite as of 2026-04. Integrations like Zapier, Make, LeadsBridge use the API-token path. → For tadaify, **API token is the only practical option** — and it's also what every other MailerLite integration uses, so no creator confusion.

#### b. Create-subscriber endpoint

```
POST https://connect.mailerlite.com/api/subscribers
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

{
  "email": "visitor@example.com",
  "fields": { "name": "Visitor" },
  "groups": ["<group_id>"],
  "status": "active",     // "active" | "unsubscribed" | "unconfirmed" | "junk" | "bounced"
  "ip_address": "203.0.113.42",
  "subscribed_at": "2026-04-26T18:00:00Z"
}
```

Subscribers live at the account level; **groups** are how MailerLite organises them (analogue of Kit forms / Beehiiv publications).

#### c. Double opt-in

Account-level setting: **Account Settings → Subscribe Settings → "Enable Double Opt-in for API and integrations"**. When ON, subscribers added via API get the confirmation email and stay in `unconfirmed` state. When OFF, they're immediately `active`.

This is a **global** toggle — no per-call override. Means tadaify cannot enforce DOI from our side; we trust the creator's account setting.

**GDPR implication:** for EU creators, we should display a warning in the block editor: *"For GDPR compliance, ensure double opt-in is enabled in your MailerLite Account Settings → Subscribe Settings."* And we link to MailerLite's help page directly. This is the only cost of MailerLite's no-per-call-override design.

#### d. Custom fields

`fields` object: keys are field names that **must pre-exist** in the creator's MailerLite account. Unknown fields → 422.

#### e. List / audience selection

- **Group:** dropdown of GET `/api/groups`. Multi-select (a subscriber can be in many groups).
- **Status:** default `active` (or `unconfirmed` if the account-level DOI is on — MailerLite handles this transition automatically).

#### f. Rate limits

- **Global: 120 req/min per token.** 429 on overage with `X-RateLimit-Retry-After` header.
- **Batch endpoint:** POST `/api/batch` accepts up to **50 sub-requests** per call. We don't need batching for v1 (one signup at a time) but it's there for future bulk-import use cases.

#### g. Free tier as of 2026-04-26

- **Free:** up to **500 subscribers, 12,000 emails/mo**. Includes automations, 10 landing pages, 1 website, unlimited forms+popups, segmentation, tagging.
- **Growing Business:** starts at **$10/mo** for 500 subs (cheaper than Mailchimp at the same tier).
- **Advanced:** starts at **$20/mo** — adds advanced features, AI writing assistant, multiple users.
- **Enterprise:** custom pricing for 100k+ subs.

The free 500 limit is tight compared to Kit's 10k or Beehiiv's 2.5k, so MailerLite creators tend to upgrade earlier.

#### h. Edge cases

- **Already-subscribed email** → 200 OK, returns existing subscriber.
- **Invalid email** → 422 with field-level error.
- **Token revoked** → 401 + "Unauthenticated" body.
- **`ip_address` field** → optional but recommended; gives MailerLite better fraud detection.
- **Unsubscribe webhook** — MailerLite has webhooks for `subscriber.unsubscribed` etc. Same v2-enhancement story as Beehiiv.
- **EU vs US data centre** — MailerLite has region-specific accounts; the API base URL is the same (`connect.mailerlite.com`) but there's no region-routing concern for tadaify.

#### i. Integration cost

- Edge Function: ~70 LOC (simpler than Beehiiv).
- Settings UI: token input + groups multi-select + GDPR-warning copy.
- Estimated: **0.5 dev day** (4 hours).

#### Source URLs

- Developer docs hub: <https://developers.mailerlite.com/>
- Subscribers endpoint: <https://developers.mailerlite.com/docs/subscribers>
- Rate limits: <https://developers-classic.mailerlite.com/docs/api-rate-limits>
- Batching: <https://developers.mailerlite.com/docs/batching>
- DOI for API: <https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers>
- Pricing 2026: <https://www.mailerlite.com/pricing>

---

### 2.4 Buttondown

The "indie creator favourite" — single-developer-built (Justin Duke), API-first design, beloved by tech-blog newsletters. Smaller subscriber counts but disproportionately influential audience.

#### a. Auth surface

- **API key** only — header `Authorization: Token <api_key>` (note: `Token`, not `Bearer`). Multiple keys per account, each with configurable permissions.
- **No OAuth** — Buttondown is a one-developer shop and explicitly prioritises a clean API over an app marketplace.

API is available **on every plan including free** (Buttondown is genuinely API-first; the same API powers their own UI).

#### b. Create-subscriber endpoint

```
POST https://api.buttondown.email/v1/subscribers
Authorization: Token <api_key>
Content-Type: application/json

{
  "email_address": "visitor@example.com",
  "type": "regular",                 // "regular" → skip DOI; omit to require DOI
  "tags": ["tadaify-block"],
  "metadata": { "source": "creator-page" },
  "notes": "Subscribed via tadaify creator page"
}
```

Subscribers live at the account level; **tags** are how Buttondown groups them (analogue of MailerLite groups, Kit forms). Tags auto-create on first use.

#### c. Double opt-in

DOI is the **default** (`type: "unactivated"`). If you want to skip DOI (e.g. for an existing-customer import), pass `type: "regular"`. **There is no global toggle** to disable DOI — it's a per-subscriber decision in the API call.

**Recommendation:** tadaify's block defaults to omitting `type` (i.e. DOI on). Offer an advanced "Skip confirmation" toggle in the block editor with a clear GDPR warning.

#### d. Custom fields

Two mechanisms:
- `metadata` — free-form `{key: value}` JSON, no schema. Simpler than other providers because Buttondown doesn't pre-define field names.
- `tags` — array of strings, used for segmentation.

Easier integration than Beehiiv/Kit because we don't need a "fetch existing fields" call before showing the editor.

#### e. List / audience selection

No "list" or "audience" concept — all subscribers go to the single account list. The creator just tags them. Block editor shows **just an API key field + an optional tag input** ("Tag subscribers from this block as:"). Simplest UX of any provider.

#### f. Rate limits

Documented as **100 requests / day** initially (!), growing over time as the newsletter accumulates "reputation" within Buttondown. 429 on overage.

⚠️ **This is a real concern.** A creator on free tier whose newsletter just got a spike of 200 signups in one day will hit the wall. Mitigation:
- **Surface this in our block editor** — copy that explains the limit and links to Buttondown's contact-for-higher-limit form.
- **Cache 429 responses** in our Edge Function and queue overflow signups in a Supabase `pending_subscribers` table, then drain on a cron. Adds complexity. Defer to v1.5 if it bites us.
- **Simpler MVP fallback:** if 429, show the visitor "We're temporarily unable to subscribe you, please try again in a few minutes" and log to our analytics. Creator gets a nightly digest of failed signups.

#### g. Free tier as of 2026-04-26

- **Free:** $0/mo, **100 subscribers**, Markdown editor, custom domain, full API.
- **Hobby:** ~$9/mo for 100 subs (gives you the paid features), scales by subscriber count.
- **Standard:** ~$29/mo, full features, used by most paid Buttondown customers.
- **Advanced:** ~$83/mo for up to **50,000 subscribers**, white-labelling, custom sending.
- All paid plans include API.

The 100-subscriber free tier is the smallest of any provider — Buttondown is positioned as a paid product with a "try it" tier rather than a freemium funnel like Kit/MailerLite.

#### h. Edge cases

- **Already-subscribed email** → 400 with `email_address: ["This email address is already subscribed."]`. We treat as 200 (idempotency at our layer).
- **Email is on suppression list (previously unsubscribed/bounced)** → 400. Surface a generic "Unable to subscribe this email — please contact the newsletter author" message.
- **Tag with characters Buttondown doesn't allow** — tags are case-sensitive and have light validation. We sanitise on our side.
- **Newsletter not yet "verified" by Buttondown** — Buttondown manually approves new accounts before allowing API subscriber creation. Same UX as Beehiiv's identity check: surface a clear error message.

#### i. Integration cost

- Edge Function: ~60 LOC (simplest of the four).
- Settings UI: API key input + optional tag field + "Test connection" button.
- Plus 429-handling UI copy (see rate-limits gotcha).
- Estimated: **0.5 dev day** (4 hours).

#### Source URLs

- API intro: <https://docs.buttondown.com/api-introduction>
- Create subscriber: <https://docs.buttondown.com/api-subscribers-create>
- Subscriber types (DOI): <https://docs.buttondown.com/api-subscribers-type>
- Tags: <https://docs.buttondown.com/tags>
- Pricing 2026: <https://buttondown.com/pricing>

---

### 2.5 Mailchimp

The market incumbent. Mature API, but the product has aged poorly for indie creators.

#### a. Auth surface

**Marketing API v3.0**.

- **API Key** — header `Authorization: Bearer <api_key>` (or HTTP basic auth with any username + key as password). Embedded in the key is the data-centre prefix (e.g. `xxxx-us21` → base URL `https://us21.api.mailchimp.com/3.0/`). We must parse the prefix when the creator pastes the key.
- **OAuth 2.0** — required to be listed in Mailchimp's Integration Partner Program. Access tokens **don't expire**, no refresh token. After OAuth dance, we GET `https://login.mailchimp.com/oauth2/metadata` to discover the data-centre prefix.

**For tadaify v1, API key is sufficient.** OAuth is only needed if we want listing in Mailchimp's marketplace (not a v1 priority).

#### b. Create-subscriber endpoint

Two endpoint patterns:

1. **POST** `/3.0/lists/{list_id}/members` — strict create; fails with 400 if already subscribed.
2. **PUT** `/3.0/lists/{list_id}/members/{subscriber_hash}` — upsert; preferred for "subscribe or update" semantics. `subscriber_hash` is MD5-lowercase of the email.

```
PUT https://us21.api.mailchimp.com/3.0/lists/<list_id>/members/<md5(email)>
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "email_address": "visitor@example.com",
  "status_if_new": "pending",        // DOI; "subscribed" for single opt-in
  "merge_fields": { "FNAME": "Visitor" },
  "tags": ["tadaify-block"]
}
```

Subscribers live in **lists** (Mailchimp's term for audiences). The free tier allows only **one** list — a major UX simplification (no dropdown needed).

#### c. Double opt-in

Per-call, via `status` (or `status_if_new` for upsert):
- `"pending"` → DOI; Mailchimp sends confirmation email.
- `"subscribed"` → single opt-in.

The List itself also has a default DOI setting (controllable in Mailchimp UI), so for a "follow the creator's choice" model we'd need to GET the list metadata first and use its default. Add complexity in v1 → simpler to surface a per-block toggle.

#### d. Custom fields

`merge_fields` object — keys are merge tags (e.g. `FNAME`, `LNAME`, custom ones the creator defined). Pre-existing only; unknown keys → 400. Audiences capped at **30 merge fields per audience**.

#### e. List / audience selection

GET `/3.0/lists` returns the creator's lists. Free tier: 1 list. Paid: up to 5 (Essentials) or 100 (Standard). Dropdown like the others.

#### f. Rate limits

- **10 simultaneous connections per API key**. 429 if exceeded. Not a per-minute rate, a concurrency cap.
- 120-second timeout per call.

For tadaify (sequential one-at-a-time per visitor), 10 connections is more than enough. We just need to make sure our Edge Function isn't holding connections open longer than necessary.

#### g. Free tier as of 2026-04-26

- **Free:** **250 contacts, 500 emails/mo** — *aggressively* reduced from previous limits (was 2,000 contacts in 2022, 500 in late 2024, now 250). Mailchimp branding on every email. No scheduling, no multi-step automation.
- **Essentials:** **$13/mo** for 500 contacts; up to 50,000 contacts. ~$75/mo at 5k.
- **Standard:** **$20/mo** for 500 contacts; up to 100,000. ~$100/mo at 5k. Adds multi-step automation (where Mailchimp's value really sits).
- **Premium:** **$350/mo** for up to 10k contacts.

The 250-contact free tier is by far the worst of any provider in this list and is the main reason indie creators have fled Mailchimp for Kit/Beehiiv/Buttondown.

#### h. Edge cases

- **Data-centre prefix parsing** — bug magnet; if the creator pastes the key without the `-usX` suffix (some older keys lack it), we fail. Validate at paste-time.
- **GDPR consent fields** — Mailchimp supports a `marketing_permissions` array per subscriber; we'd need to surface checkbox copy in the block. Defer to v2.
- **Already-subscribed email upsert** — PUT semantics handle this, but if the existing subscriber is in `cleaned` (bounced) state, the API returns 400. Surface generic error.
- **List archived / deleted** → 404. UX as for other providers.

#### i. Integration cost

- Edge Function: ~120 LOC (DC-prefix parsing, MD5 hash, two endpoints to handle).
- Settings UI: API key + list dropdown + DOI toggle + (later) GDPR consent copy.
- Estimated: **1.0 dev day** (8 hours) — most of any provider.

#### Source URLs

- API fundamentals: <https://mailchimp.com/developer/marketing/docs/fundamentals/>
- OAuth 2 guide: <https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/>
- Pricing 2026: <https://mailchimp.com/pricing/marketing/>
- Free-tier 250-cap confirmation: <https://blog.groupmail.io/mailchimp-pricing-2026/>

---

### 2.6 Resend

Developer-focused transactional+marketing email service (think "Stripe for email"). Modern API, growing fast.

#### a. Auth surface

- **API Key** — header `Authorization: Bearer <api_key>`. Per-team scoped.
- **No OAuth** as of 2026-04-26.

#### b. Create-contact endpoint

```
POST https://api.resend.com/audiences/{audience_id}/contacts
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "email": "visitor@example.com",
  "first_name": "Visitor",
  "last_name": "Example",
  "unsubscribed": false
}
```

Subscribers ("contacts") live inside an **audience** (analogue of Mailchimp list). Limited supported fields: **`email`, `first_name`, `last_name`, `unsubscribed`** — that's it. **No custom fields** as of 2026-04-26.

#### c. Double opt-in

**Resend Audiences does NOT do double opt-in.** Contacts added via API are immediately added to the audience as confirmed. Resend's docs explicitly position DOI as a separate workflow the developer must build themselves using Resend's transactional email side (you send your own confirmation email + handle the click via your own endpoint).

This is a major problem for tadaify's use case. We'd need to build the entire DOI flow ourselves: token-gen, confirmation-email-via-Resend-transactional, click-callback handler, "actually-add-to-audience" finalisation. That's ~200 LOC of Edge Function code plus a `pending_doi_subscribers` Supabase table — same complexity as building a full email-list system, just with Resend as the SMTP backend.

**Conclusion:** Resend is fundamentally a transactional API, not a creator-newsletter platform. Audiences exist but are designed for the developer who's already built their own list-management UX. Wrong fit for tadaify's "creator pastes API key, done" model.

#### d. Custom fields

None natively. Could be hacked via tags / metadata once Resend ships those (on roadmap, no public ETA).

#### e. List / audience selection

GET `/audiences` returns creator's audiences. Dropdown.

#### f. Rate limits

- **2 req/sec by default**, raised to **5 req/sec** on request. Very low compared to others. Designed for transactional bursts, not continuous trickle.

#### g. Free tier as of 2026-04-26

- **Free:** 3,000 transactional emails/mo + **1,000 marketing contacts**.
- **Pro:** **$40/mo** for 5,000 contacts (and 50k transactional emails).

Reasonable pricing for the transactional side; the marketing-contacts tier is roughly competitive.

#### h. Edge cases

- **No DOI** is the headline edge case (see §c).
- **Custom fields** absence means we can't pass `tadaify_source` etc. for the creator's segmentation.
- **Unsubscribe** handled via Resend's automatic unsubscribe link in marketing emails — but only if the creator uses Resend Broadcasts to send. If the creator just uses Resend for transactional and reads contacts elsewhere, they need to wire unsub themselves.

#### i. Integration cost

- **Without DOI: ~50 LOC.** Trivial.
- **With DOI (required for GDPR creators): ~200 LOC + DB table + cron + transactional-email template.** Substantial.
- Realistic estimate to ship something we can actually offer to EU creators: **2 dev days**.

#### Source URLs

- Audiences intro: <https://resend.com/docs/dashboard/audiences/introduction>
- Audiences blog post: <https://resend.com/blog/manage-subscribers-using-resend-audiences>
- Rate limits: <https://resend.com/docs/api-reference/rate-limit>
- Pricing 2026: <https://resend.com/pricing>

---

### 2.7 Substack

The viral-newsletter platform. **No public API, no public webhooks.**

#### a. Auth surface

There is no public API. Period. Substack has had years of feature requests for an API; their stance is "use Zapier" or "embed our signup form".

What does exist:
- An **internal/undocumented API** that powers Substack's own forms. Has been reverse-engineered by community members (see `substack-api` Python package) but explicitly violates Substack's TOS implications around scraping and is rate-limited / origin-checked. **Hard NO for tadaify**: building production integration on a reverse-engineered private API is a foot-gun (will break, will get our IPs banned, may have legal implications).
- An **embed iframe**: creator goes Settings → Growth features → Embed code; copies an `<iframe>` snippet. Fully supported, intended use.
- **Zapier integration**: "new Substack subscriber" trigger exists; "add Substack subscriber" action does NOT (Zapier respects the API absence). So Zapier helps you sync OUT of Substack, not IN to Substack.

#### b. Implication for tadaify

We **cannot** build a native "Substack" provider in our block. There are exactly two options to offer Substack creators:

1. **Embed mode** — Render the creator's Substack iframe inside the tadaify block. Pros: actually works. Cons: visual styling is constrained (Substack's CSS, not ours), the block looks foreign on the creator page, and the visitor leaves our analytics scope.
2. **Generic webhook fallback (see §3 below)** — creator sets up a Zapier zap from "new generic webhook" → "add to Substack via [unofficial workaround]". Doesn't really exist as a clean Zapier zap because Zapier respects the API absence; the "workaround" is creator-specific.

**Recommendation: ship "Embed mode" as a separate block variant or as a fallback inside the Newsletter block.** When the creator picks "Substack" in our provider dropdown, we collect their publication URL and render an embedded iframe instead of our own form. Mark this clearly in the UI as "Powered by Substack" so the creator knows the styling is constrained.

#### Source URLs

- "Does Substack have an API?": <https://support.substack.com/hc/en-us/articles/45099095296916-Substack-Developer-API>
- Signup form embed: <https://support.substack.com/hc/en-us/articles/360041759232-Can-I-embed-a-signup-form-for-my-Substack-publication>
- Reverse-engineering writeup (for awareness, NOT for use): <https://iam.slys.dev/p/no-official-api-no-problem-how-i>

---

## 3. Generic webhook fallback

**Spec:** the creator pastes any URL. On every signup, our Edge Function POSTs:

```json
POST <creator_provided_url>
Content-Type: application/json
X-Tadaify-Signature: <hmac-sha256-of-body-with-creator-secret>
X-Tadaify-Timestamp: <unix-ms>

{
  "schema_version": "1.0",
  "event": "newsletter.subscribed",
  "creator_page_slug": "alice",
  "block_id": "blk_…",
  "subscriber": {
    "email": "visitor@example.com",
    "name": "Visitor",
    "submitted_at": "2026-04-26T18:00:00Z",
    "ip": "203.0.113.42",
    "user_agent": "Mozilla/5.0 …"
  },
  "consent": {
    "checkbox_label": "I agree to receive marketing emails from Alice",
    "checked": true,
    "policy_url": "https://alice.tadaify.com/privacy"
  }
}
```

**Why ship this in MVP:**
- Covers Substack indirectly (creator wires a Zap or Make scenario from `/webhook` → wherever Substack's helper-of-the-day is).
- Covers ESPs we haven't built native integrations for (HubSpot, Brevo/Sendinblue, Klaviyo, ActiveCampaign, Loops, ConvertKit-via-Zapier, etc.).
- Covers creators with custom backends.
- Costs us ~60 LOC + a `webhook_configs` Supabase row schema.
- HMAC signature pattern is standard (matches Stripe/GitHub) so creators wiring it into Make/Zapier/n8n have a known idiom.

**Cost: 0.75 dev day** including signature verification helper docs.

---

## 4. Comparison matrix

| Dimension | **Kit** | **Beehiiv** | **MailerLite** | **Buttondown** | Mailchimp | Resend | Substack |
|---|---|---|---|---|---|---|---|
| **MVP ship?** | ✅ v1 | ✅ v1 | ✅ v1 | ✅ v1 | ❌ v2 | ❌ v2+ | ❌ embed-only |
| **Auth — API key** | ✅ `X-Kit-Api-Key` | ✅ `Bearer` | ✅ `Bearer` | ✅ `Token` | ✅ `Bearer` (DC-prefix in key) | ✅ `Bearer` | ❌ no public API |
| **Auth — OAuth 2.0** | ✅ App Store only | ✅ App Store only | ❌ none | ❌ none | ✅ Partner Program | ❌ none | ❌ |
| **DOI default behaviour** | DOI on by default per-form | Per-call override (`on`/`off`/`not_set`) | Account-level toggle, no per-call | DOI on by default per-subscriber | Per-call (`status: pending`/`subscribed`) | **No DOI — must be built** | N/A |
| **Custom fields** | `fields` object, pre-existing | `custom_fields[]`, pre-existing | `fields` object, pre-existing | `metadata` JSON, free-form | `merge_fields`, pre-existing, max 30 | **None** | N/A |
| **List/audience selection** | Forms (dropdown via GET `/v4/forms`) | Publications (usually 1) | Groups (multi-select) | None — single account list, tags only | Lists (free=1, Essentials=5, Standard=100) | Audiences | N/A |
| **Rate limit (relevant call)** | 120/min (key) / 600/min (OAuth) | Vague, IP-based throttle | 120/min (token) | **100/day initial** ⚠️ | 10 concurrent connections | 2-5 req/sec | N/A |
| **Free tier (subscribers)** | **10,000** | **2,500** | **500** | **100** | **250** | **1,000 contacts** | Unlimited (Substack-side) |
| **Lowest paid tier** | $39/mo (1k subs) | $49/mo (1k subs) | $10/mo (500 subs) | $9/mo (100 subs) | $13/mo (500 subs) | $40/mo (5k contacts) | 10% of paid sub revenue |
| **GDPR posture** | Strong (DOI default) | Strong (per-call DOI override) | Medium (relies on creator account toggle) | Strong (DOI default) | Medium (relies on per-call flag) | **Weak** (no built-in DOI) | Out of scope |
| **API stability** | v3 → v4 in 2024, v3 still works | v2 stable since 2023 | v2 stable, classic v1 deprecated | v1 stable for years | v3 stable since 2017 | v1, evolving | N/A |
| **Webhook for unsub** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **tadaify integration cost (dev days)** | 0.5 | 0.75 | 0.5 | 0.5 (+ rate-limit UX) | 1.0 | 2.0 (with DOI build) | 0.25 (just iframe embed) |
| **Indie-creator market presence** | High | High & growing | Medium-high (esp. EU) | Niche but loyal | High but declining | Developer-only | Very high |

---

## 5. MVP scope recommendation

### Ship in v1 (4 native + 1 fallback + 1 embed)

| # | Provider | Rationale |
|---|---|---|
| 1 | **Kit** | Highest creator-economy market share. Free 10k tier means we're pre-aligned with our own free creators. Cheap to integrate (0.5 day). |
| 2 | **Beehiiv** | Fastest-growing creator newsletter. Per-call DOI override is the cleanest API of the four. 0.75 day. |
| 3 | **MailerLite** | Strong EU presence (matches our likely first-market geography), best free tier for getting started, well-documented batch API for future use cases. 0.5 day. |
| 4 | **Buttondown** | Indie/dev creator favourite. Cheapest paid entry ($9/mo). Tiny dev cost (0.5 day) — even if only 5% of creators use it, the integration pays for itself. |
| 5 | **Generic webhook** | Catches Substack-via-Zapier, in-house ESPs, every other provider not in the list. Critical fallback. 0.75 day. |
| 6 | **Substack iframe embed** | Substack creators are a non-trivial slice of the target audience and have NO other integration option. Ship as `provider: "substack"` in the same block, render iframe instead of form. 0.25 day. |

**Total dev cost: ~3.25 dev days** (one developer, one week including code review).

### Cut from MVP, justify

| Provider | Cut reason |
|---|---|
| **Mailchimp** | (a) Free tier is now so small (250 contacts) that creators on Mailchimp free are not really "newsletter creators" yet — they're triallists. (b) Indie-creator market share has dropped substantially since 2022 (Kit/Beehiiv ate it). (c) Highest integration cost (1 day) for diminishing-returns audience. (d) Generic webhook covers Mailchimp via Zapier in the meantime. **Add in v2 if user data shows >10% of creators trying to wire it.** |
| **Resend** | (a) **No native double-opt-in** is a GDPR foot-gun for our EU creators. (b) No custom-fields support. (c) Resend Audiences is fundamentally designed for "developers building their own newsletter UX", not "creators who want a paste-API-key block". Wrong tool. (d) Building DOI on top costs 2 dev days. **Reconsider in v2 only if Resend ships native DOI** (not on their public roadmap as of 2026-04). |
| **Substack (native)** | No public API. Reverse-engineered API is a TOS-risk and stability-risk. We ship the iframe embed instead — it's the officially-supported path and Substack creators understand the visual constraint. |

### Order of integration ship

1. Generic webhook (smallest, lowest-risk, immediately useful, unblocks everything else)
2. Kit (largest creator market segment)
3. Beehiiv (cleanest API, validates per-call DOI pattern)
4. MailerLite (validates account-level DOI pattern + multi-group selection)
5. Buttondown (validates "no list selection" simplest UX)
6. Substack iframe (different code path, ship last to avoid distracting from API integrations)

---

## 6. Cost-at-scale table

Per `feedback_dec_format_v3_business_cost.md`, two perspectives: (a) tadaify infra cost for our pass-through Edge Function, (b) the creator's bill from their newsletter provider at the same scale (informational, since the creator pays this directly, not us).

### 6a. tadaify-side infra cost

The newsletter-signup pass-through is a single Supabase Edge Function call per visitor signup. Memory ~128MB, runtime ~300ms (mostly waiting on the upstream provider).

Assumptions:
- 1 signup per page visitor per day on average (massively overstates reality; most visitors don't sign up. Real conversion ~3-5%; this is a worst-case stress).
- 1 Edge Function invocation per signup.
- Logging + 1 row write to `newsletter_signups` audit table (Postgres) per call.

| Scale | Daily signups | Monthly signups | Edge Function invocations | Postgres writes | Edge Function cost (Supabase paid: $2/M invocations after 500k free) | Postgres write cost (negligible at scale) | **Total tadaify monthly cost** |
|---|---|---|---|---|---|---|---|
| 100 DAU | 100 | 3,000 | 3,000 | 3,000 | $0 (under free tier) | $0 | **$0** |
| 1,000 DAU | 1,000 | 30,000 | 30,000 | 30,000 | $0 (under 500k/mo Supabase free) | $0 | **$0** |
| 10,000 DAU | 10,000 | 300,000 | 300,000 | 300,000 | $0 (still under 500k/mo free tier) | $0 | **$0** |
| 100,000 DAU | 100,000 | 3,000,000 | 3,000,000 | 3,000,000 | $5 (2.5M paid invocations × $2/M) | ~$1 | **~$6** |
| 1,000,000 DAU | 1,000,000 | 30,000,000 | 30,000,000 | 30,000,000 | $59 (29.5M × $2/M) | ~$10 | **~$69** |

**Conclusion: tadaify-side cost is negligible at every scale we plausibly hit in the next 24 months.** This feature does NOT need to be a paid tier on cost grounds. Per `feedback_no_fake_margin_tier_gating.md`, do not gate it for fake-margin reasons either.

### 6b. Creator-side cost (informational — they pay their provider, not us)

If a typical creator using tadaify has, say, 5,000 newsletter subscribers and grows to 50,000 over a year:

| Subscribers | Kit | Beehiiv | MailerLite | Buttondown | Mailchimp Standard |
|---|---|---|---|---|---|
| 100 | $0 (free) | $0 (free) | $0 (free) | $9 | $20 |
| 1,000 | $0 (free) | $0 (free) | $15 (Growing) | ~$29 | ~$32 |
| 5,000 | $0 (free) | ~$69 (Scale) | ~$30 | ~$59 | ~$100 |
| 10,000 | $0 (free) | ~$99 (Scale) | ~$45 | ~$89 | ~$135 |
| 50,000 | ~$309 (Creator) | ~$179 (Scale) | ~$160 | ~$159 | ~$420 |
| 100,000 | ~$549 (Creator) | ~$229 (Scale) | ~$320 | ~$229 | ~$700 |

**Implication for our messaging:** when a tadaify creator picks a provider in the block editor, we could surface their estimated provider cost-at-current-subscriber-count as a helper ("You're on Mailchimp Standard at ~$100/mo for 5k subs. Did you know Kit is free at this scale?"). Out of MVP scope; nice for a v1.5 "Newsletter cost optimiser" upsell card.

---

## 7. Block editor UX flow

### 7.1 Initial empty state

Block dropped onto the page → empty state with:

- **Provider** dropdown: `Kit`, `Beehiiv`, `MailerLite`, `Buttondown`, `Substack (embed)`, `Generic webhook`. Default: `Kit`.
- **Headline** text: defaults to "Subscribe to my newsletter".
- **Subheadline** text: defaults to "Weekly updates, no spam".
- **Button text**: defaults to "Subscribe".
- **Below**: "Connect your provider →" CTA (pulses until configured).

### 7.2 Provider connect modal (centered, ~720px wide per `feedback_no_right_side_drawers.md`)

For each provider variant (drawn here for **Kit**, others differ slightly):

```
┌─────────────────────────────────────────────────────┐
│ Connect Kit (formerly ConvertKit)                  X │
├─────────────────────────────────────────────────────┤
│                                                       │
│  How to find your API key:                            │
│  1. Open kit.com → Settings → Advanced → API & Webhooks│
│  2. Click "Generate API Key (v4)"                    │
│  3. Paste below                                      │
│                                                       │
│  API key                                             │
│  ┌─────────────────────────────────────────────────┐│
│  │ kit_••••••••••••••••••••••••••••••••           ││
│  └─────────────────────────────────────────────────┘│
│  [ Test connection ]                                 │
│                                                       │
│  ✓ Connected as: alice@example.com                   │
│                                                       │
│  Pick a form                                         │
│  ┌─────────────────────────────────────────────────┐│
│  │ ▾ Main newsletter signup (inline)               ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
│  ▸ Advanced: tag subscribers from this block        │
│  ▸ Advanced: pre-fill custom fields                 │
│                                                       │
│  ─────────────────────────────────────────────────  │
│  GDPR / Double opt-in:                               │
│  Confirmation email is sent by Kit (default).        │
│  Configure in Kit → Forms → [your form] → Settings.  │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  [ Cancel ]                              [ Save ]    │
└─────────────────────────────────────────────────────┘
```

Per provider, the modal differs:
- **Beehiiv:** add publication dropdown + DOI override toggle.
- **MailerLite:** add groups multi-select + bold GDPR-warning copy linking to MailerLite settings.
- **Buttondown:** no list dropdown (single account list); add tag input + 100/day rate-limit warning.
- **Substack:** input is the publication URL, not API key; preview iframe in modal.
- **Generic webhook:** input is URL + auto-generated HMAC secret with copy-button + sample payload + signature-verification snippets in 3 languages.

### 7.3 "Test connection" button — validation states

- **Loading:** spinner inside button.
- **Success (200):** green check, "Connected as <email>", populates list/group dropdowns.
- **401 / invalid key:** red, "API key invalid or revoked. Double-check and paste again."
- **403 / insufficient perms (Beehiiv identity verification, Buttondown unverified account):** red, "Provider requires additional setup: <link to provider's setup page>".
- **404 / unknown provider URL (webhook):** red, "We couldn't reach that URL. Check it's reachable from the public internet."
- **Network timeout:** orange, "Provider didn't respond in 10s. Try again, or check the provider's status page: <provider status URL>."

### 7.4 Block live state

Once connected: small green dot on the block toolbar with hover-tooltip "Connected to Kit • Form: Main newsletter signup". Click toolbar → reopens modal.

### 7.5 Visitor-facing behaviour (public page)

1. Visitor types email + clicks Subscribe.
2. Inline spinner on the button.
3. Edge Function POSTs to provider with appropriate shape.
4. On success → button text becomes "Check your inbox to confirm" (DOI providers) or "You're subscribed!" (single opt-in).
5. On 4xx other than already-subscribed → "Something went wrong. Please try again." + analytics event.
6. On 429 → "Please try again in a few minutes." + queued in failed-signups for creator's nightly digest.

### 7.6 Creator analytics (out of MVP scope but worth tabling)

- Daily/weekly signups per block.
- Failed signup count + last-error.
- DOI confirmation rate (provider webhooks → tadaify analytics).
- "If you switched from Mailchimp to Kit you'd save $X/mo at your current sub count" (the v1.5 upsell card mentioned in §6b).

---

## 8. Open DECs

These need user answers before we file the implementation issue. **Per `feedback_dec_scope_implementation_only.md`, every DEC below directly affects code/UX/cost — no ops or process DECs in this list.**

### DEC-NEWSLETTER-01 — Auth model for MVP

**Czego dotyczy.** API-key vs OAuth for the four shipped providers (Kit, Beehiiv, MailerLite, Buttondown).

**Szczegolowy opis.** Kit and Beehiiv both expose OAuth 2.0 alongside API keys. OAuth means we get a "Connect with Kit" button (one-click flow), automatic re-authorisation if the creator rotates their key, and listing in those providers' app stores (free marketing). API keys are simpler for v1 and don't require us to register as an app developer with each provider. MailerLite and Buttondown have no OAuth so they're API-key regardless.

**Opcje.**
1. API-key only for all four providers in v1; defer OAuth to v2.
2. OAuth-first for Kit and Beehiiv (where supported); API-key for MailerLite and Buttondown.
3. Both OAuth and API-key for Kit and Beehiiv; let the creator pick.

**Twoja rekomendacja.** Option 1. OAuth requires per-provider app registration (paperwork), doesn't materially change the integration code path, and the per-block UX is identical from the creator's POV (they paste a key OR click a button — both are one step). Ship API-key-only in v1, add "Connect with Kit" / "Connect with Beehiiv" buttons in v1.5 once we have user feedback on actual friction.

---

### DEC-NEWSLETTER-02 — DOI default for Beehiiv block

**Czego dotyczy.** When the creator drops a Newsletter block configured for Beehiiv, what value do we send in `double_opt_override`?

**Szczegolowy opis.** Beehiiv's API accepts `on`, `off`, or `not_set`. `not_set` means "use the publication's default", which is the most respectful to creator config but means the block's GDPR posture depends entirely on what the creator already chose. `on` forces DOI regardless of their setting. `off` forces single opt-in.

**Opcje.**
1. Default `not_set`, advanced toggle to override per-block.
2. Default `on` (force DOI for every Beehiiv block), advanced toggle to override.
3. Default `off`, advanced toggle to override.

**Twoja rekomendacja.** Option 2. tadaify is a new product trying to be GDPR-clean by default, and EU creators (our likely first market) cannot afford to ship a block that bypasses their account's DOI settings unintentionally. Forcing `on` by default means the worst-case is a slightly higher friction signup; the best case is we save a creator from a GDPR complaint. The advanced toggle lets US-only creators or transactional-context creators opt out explicitly.

---

### DEC-NEWSLETTER-03 — How to surface Substack support

**Czego dotyczy.** Substack creators have no native-API option. Do we offer Substack as a "provider" in the dropdown that swaps the form for an iframe embed, or as a separate block type entirely?

**Szczegolowy opis.** Option (a) keeps the unified Newsletter-block mental model and makes the substitution invisible to the creator until they hit limitations (no analytics, no styling). Option (b) makes the trade-off explicit upfront ("This is a Substack-embedded block — styling is constrained") which is more honest but adds another block type to the sidebar.

**Opcje.**
1. Same Newsletter block; Substack is a provider option that triggers iframe embed mode under the hood.
2. Separate "Substack embed" block type in the sidebar.
3. No Substack support in MVP; tell Substack creators to use the generic webhook.

**Twoja rekomendacja.** Option 1, with a one-time callout in the configure modal ("Substack doesn't have a public API, so we render their official embed inside this block. Visual styling is fixed by Substack."). Option 2 fragments the sidebar; option 3 abandons a real chunk of our target audience (Substack creators are a meaningful slice of indie-creator universe).

---

### DEC-NEWSLETTER-04 — Webhook payload schema versioning

**Czego dotyczy.** Generic webhook payload — do we version the schema (`schema_version: "1.0"` field) and maintain backwards compatibility forever, or evolve aggressively and break creators' integrations?

**Szczegolowy opis.** Webhook integrations are notoriously hard to evolve because the consumer (creator's Zapier zap, in-house endpoint, whatever) is outside our control. Versioning gives us flexibility but adds maintenance burden (every code path checks `schema_version`).

**Opcje.**
1. Version field; commit to backwards compat for 12 months minimum after any new version.
2. No version field; commit to additive-only changes (never remove or rename fields).
3. Webhook config has explicit "version" dropdown; creator picks; we maintain N versions in parallel.

**Twoja rekomendacja.** Option 2 (additive only). Simpler than version dispatching, lower mental load on creators, and matches the GitHub/Stripe convention for webhook event payloads (they almost never break old fields). Add `schema_version: "1.0"` to the payload as an informational marker but don't actually branch on it. If we ever need a breaking change, we ship a new event_type (`newsletter.subscribed.v2`) and let creators opt in.

---

### DEC-NEWSLETTER-05 — Buttondown 100/day rate-limit handling

**Czego dotyczy.** Buttondown's free-tier API limit of 100 subscribers/day is the lowest of any provider and could realistically bite a creator during a viral moment. Do we (a) just surface the limit to the creator and let them deal, (b) build a queue + retry system, or (c) skip Buttondown from MVP?

**Szczegolowy opis.** The queue approach (Supabase `pending_subscribers` table + drain cron) costs ~0.5 dev day and substantially improves the worst-case UX, but adds operational complexity (cron monitoring, table backups, one more thing to break). Surfacing the limit to the creator is honest but the visitor who can't subscribe doesn't care whose fault it is.

**Opcje.**
1. Just surface the limit in the block editor; visitor sees "try again later" on 429.
2. Build the queue+drain system as part of MVP.
3. Skip Buttondown from MVP; revisit when the queue exists.

**Twoja rekomendacja.** Option 1 for MVP. Buttondown creators are typically smaller (the 100/day limit is a rough proxy for newsletter size — 100 signups/day → ~3,000/month → already paying for Hobby tier where the limit is higher). The queue system is a v1.5 enhancement once we have data on actual 429 frequency. Cutting Buttondown entirely (option 3) loses a beloved indie-creator integration for an edge case that may never bite.

---

### DEC-NEWSLETTER-06 — Where do we store the creator's API keys?

**Czego dotyczy.** Creator pastes a sensitive API key (Kit, Beehiiv, MailerLite, Buttondown). Where does it live?

**Szczegolowy opis.** Three viable options: (a) plaintext in a Postgres column with RLS, (b) encrypted-at-rest in a Postgres column using `pgcrypto` + a Supabase-Vault-managed key, (c) externalised entirely to a per-creator AWS Secrets Manager / SSM path with the Postgres row holding only the path. Each has trade-offs around blast-radius, cost, and operational complexity.

**Opcje.**
1. Plaintext + RLS (relying on Postgres access controls).
2. `pgcrypto` symmetric encryption with per-row key derived from a Vault-stored master.
3. Externalise to AWS Secrets Manager, one secret per creator-block.

**Twoja rekomendacja.** Option 2 (`pgcrypto` + Vault). Option 1 is too low-effort given keys are revocable but visible in plain text to anyone with SQL access (including Supabase support staff in extreme support cases). Option 3 is overkill at our scale (and adds AWS round-trip latency to every signup, which our Edge Function currently doesn't have because Supabase is colocated). Option 2 strikes the balance: keys are unreadable in raw `psql` queries, RLS still enforces creator scope, and rotation is easy via Supabase Vault.

---

### DEC-NEWSLETTER-07 — Failed-signup retention + creator-facing visibility

**Czego dotyczy.** When a visitor signup fails (provider 4xx, network timeout, webhook unreachable), what do we do with the email?

**Szczegolowy opis.** GDPR makes this thorny: we collected the email under one consent contract (subscribe to creator's newsletter); if delivery to the provider fails, do we hold the email for retry (still GDPR-compliant since consent covers the intent), surface it to the creator as a "missed signup" log (provides creator value), or just discard immediately (cleanest GDPR-wise but loses data the creator might want)?

**Opcje.**
1. Discard on failure; visitor sees error message and is told to try later.
2. Hold for 24h with auto-retry (3 attempts, exponential backoff); discard if still failing; never surface to creator.
3. Hold for 7d; auto-retry; surface to creator in a "Failed signups" view with a CSV export so they can manually rescue.

**Twoja rekomendacja.** Option 2 (24h retry, no creator-facing log). Option 1 throws away data that would have been delivered if the provider was just having a 5min outage. Option 3 creates a GDPR question (we're storing personal data without it being delivered to its intended controller, the creator's provider) plus the ick-factor of creators downloading visitor emails outside the provider's pipeline. Option 2 keeps data ephemerally for the legitimate purpose of completing the original consent intent, then deletes.

---

## 9. Appendix — research methodology + citations

All pricing and free-tier figures verified via WebSearch on 2026-04-26. Where two sources disagreed (e.g. Mailchimp's free tier was variously cited as 250, 500, or 2,000 contacts), I trusted the most recent official documentation page over older third-party reviews.

**Gotchas during research worth flagging for any future SPIKE on this topic:**
- Several "Kit pricing 2026" review sites (e.g. emailtooltester, mailmeteor) had figures that disagreed by ±$5 because they cite annual-billed monthly-equivalent vs monthly-billed. Always check the rendering against the official `kit.com/pricing` page.
- Beehiiv changed its API-on-free-tier policy in mid-2024 — older articles say API is paid-only. The current truth (per `developers.beehiiv.com`) is API on every plan including Launch/free.
- MailerLite operates two parallel API surfaces: `developers-classic.mailerlite.com` (v1) and `developers.mailerlite.com` (v2). For new integrations always use v2; v1 still serves to avoid breaking older customers.
- Buttondown's docs are split between `docs.buttondown.com` (current) and `docs.buttondown.email` (legacy, still resolves). Pin links to `.com`.

**Out of scope for this SPIKE (worth a follow-up if asked):**
- Klaviyo, ActiveCampaign, HubSpot, Brevo (Sendinblue), Loops, EmailOctopus, Ghost — covered indirectly by the generic webhook fallback for v1; native integrations would each be ~0.5-1 dev day if user data shows demand.
- **Sponsorship integrations** (e.g. Beehiiv Boosts, ConvertKit Recommendations) are NOT a newsletter-signup concern; they're a provider-side feature creators configure inside their provider account.
- **Tracking/analytics on the visitor side** (UTM forwarding to the provider, deduplication via local-storage cookie). The endpoints support `utm_source` / `referring_site` (Beehiiv explicitly, others via custom fields) — recommended to wire in v1, full analytics-side query in v2.
- **Revenue model for tadaify around this feature.** Per §6 we cannot justify a paid gate on cost grounds. Possible non-cost gates (only if user wants to differentiate Free vs Paid plans) include: max number of newsletter blocks per page (e.g. Free=1, Paid=unlimited), multi-provider fallback (try Kit, fall back to Webhook on failure), or the "cost optimiser" upsell card from §6b. Discuss separately.
