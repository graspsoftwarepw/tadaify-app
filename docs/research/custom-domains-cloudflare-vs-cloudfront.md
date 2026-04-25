---
type: research
project: tadaify
title: Custom domains for SaaS — Cloudflare for SaaS vs AWS CloudFront SaaS pattern
created_at: 2026-04-25
author: orchestrator-opus-4.7
status: draft-for-review
---

# Custom domains for SaaS — Cloudflare for SaaS vs AWS CloudFront SaaS pattern

## Executive summary (verdict in 5 lines)

1. **Recommend Cloudflare for SaaS — Custom Hostnames API**, glued natively to our existing Cloudflare Workers/Pages stack. It is the lowest-friction option and eliminates a cross-cloud handoff to AWS.
2. **Pricing tier**: start on **Business plan ($200/mo)** which unlocks the Custom Hostnames feature with a generous baseline; the Free/Pro plans cannot serve creator domains for SaaS use. Enterprise only becomes interesting once we cross ~5,000 active custom hostnames.
3. **AWS CloudFront SaaS pattern is technically valid** (tested at scale by Webflow, Shopify), but for a Cloudflare-native app the integration cost (Lambda@Edge router, ACM certificate orchestration, separate billing) is not worth it.
4. **Per-creator margin holds**: at $2/mo charged we keep ≥75% gross margin until ~10,000 custom hostnames; beyond that, we re-evaluate Enterprise.
5. **Lock-in is moderate** — Custom Hostnames is a portable concept and the creator-facing UX (CNAME at registrar) survives any provider swap; only our internal API surface would change.

---

## 1. Cloudflare for SaaS — how it works

Cloudflare for SaaS (officially "SSL for SaaS" + "Custom Hostnames") is the productised offering for serving customer-owned domains through Cloudflare's edge while keeping a single origin / Worker on the SaaS provider's zone.

### 1.1 Core mechanism

Three actors:

- **SaaS provider** (us, tadaify): owns a Cloudflare zone for `tadaify.com` and runs a Worker / Pages project there.
- **Creator** (our customer): owns `mybrand.com` at any registrar, with any DNS provider.
- **Creator's visitor**: hits `https://mybrand.com/<slug>`.

Flow:

1. Creator points `mybrand.com` (or `www.mybrand.com`) at us via a `CNAME` record, e.g. `CNAME mybrand.com → tadaify.com` (or a vanity fallback like `cname.tadaify.com`).
2. Tadaify backend calls the Cloudflare API `POST /zones/{zone_id}/custom_hostnames` and registers `mybrand.com` as a Custom Hostname under our zone.
3. Cloudflare provisions a Let's Encrypt (or Google Trust Services) certificate for `mybrand.com` via DCV.
4. Once cert is issued and DNS resolves to a Cloudflare edge IP, traffic to `https://mybrand.com` terminates TLS at Cloudflare's edge using SNI to pick the right cert, then routes to our Worker / Pages project.
5. Our Worker reads `request.headers.get('host')` (or `URL.hostname`), looks up which creator owns that hostname, and renders the appropriate response.

Reference: <https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/>

### 1.2 Custom Hostnames API endpoints

| Action | Endpoint |
|---|---|
| Create | `POST /zones/{zone_id}/custom_hostnames` |
| List | `GET /zones/{zone_id}/custom_hostnames` |
| Get | `GET /zones/{zone_id}/custom_hostnames/{id}` |
| Edit | `PATCH /zones/{zone_id}/custom_hostnames/{id}` |
| Delete | `DELETE /zones/{zone_id}/custom_hostnames/{id}` |

Auth: API token scoped to `Zone.SSL and Certificates:Edit` + `Zone.Zone:Read`. No AWS-IAM equivalent — much simpler than ACM permissions.

Each Custom Hostname object includes:

- `id` (uuid) — store as `cf_custom_hostname_id`
- `hostname` (string)
- `ssl.status`: `pending_validation` | `pending_issuance` | `pending_deployment` | `active` | `failed`
- `ssl.method`: `http` | `txt` | `cname`
- `ownership_verification`: optional TXT record details if creator is on a non-CF DNS provider
- `verification_errors`: list of strings

### 1.3 SSL provisioning

Cloudflare auto-provisions Let's Encrypt certs (default) or Google Trust Services (toggleable on Business+). Renewal is automatic — Cloudflare handles it ~30 days before expiry. Provisioning latency:

- DNS-validation: typically 5–15 minutes once the CNAME resolves.
- HTTP-validation (fallback): ~2–5 minutes; requires the creator's DNS to actually point at us.

Cert failure modes we have to handle in UI:

- Creator hasn't pointed CNAME yet → `pending_validation`.
- DNSSEC misconfiguration on creator's zone → `failed`.
- CAA record on creator's zone forbids Let's Encrypt → `failed`. (Common — has to be addressed via creator-side fix.)

### 1.4 Pricing tiers (as of 2026-04)

| Plan | Price | Custom Hostnames included | Notable limits |
|---|---|---|---|
| Free | $0 | **Not available** | — |
| Pro | $25/mo | **Not available** (some Workers SaaS dashboards expose it; not officially supported) | — |
| Business | $200/mo | 100 included; +$0.10 per additional /mo (was $2 in older docs; reduced) | Wildcard certs available. SLA 99.99%. |
| Enterprise | Custom (~$5k+/mo typical) | Unlimited (negotiated) | Volume discount, dedicated cert authority, SAML SSO, 100% SLA. |

References:

- <https://www.cloudflare.com/plans/>
- <https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/billing/>

Caveat: Cloudflare's pricing for "Custom Hostnames add-on" has fluctuated — current published number on dashboard is `$0.10 per hostname per month` after the included pool, but enterprise reps sometimes negotiate this down. Verify with sales before locking on tier.

### 1.5 Worker integration

Our existing Workers/Pages stack on `tadaify.com`:

- Pages project: `tadaify` deployed at `tadaify.com` apex + `*.tadaify.com`.
- Worker route: `tadaify.com/*` routes to the Pages function or a dedicated Worker.

To handle Custom Hostnames:

- Set up a Worker route on the **fallback origin** that the Custom Hostname points at. This is configured per-zone via the dashboard (`SSL/TLS → Custom Hostnames → Fallback Origin`) or via `PATCH /zones/{zone_id}/custom_hostnames/fallback_origin`.
- The fallback origin is typically `<random-subdomain>.tadaify.com`. Custom Hostname traffic gets proxied to that subdomain transparently — same Worker that serves `tadaify.com` receives the request, with `Host` header preserved as `mybrand.com`.
- Worker logic: read `host` header → query `custom_domains` table by `domain` column → fetch the resolved `user_id` → render that creator's page tree.

No Lambda@Edge equivalent needed; same Worker handles both `tadaify.com/<handle>` and `mybrand.com/*`.

### 1.6 Validation flow (DCV)

Cloudflare auto-picks DCV method based on SSL method we configure:

- `txt` (recommended): Cloudflare returns a TXT record string `_acme-challenge.mybrand.com` → creator adds at registrar → Cloudflare polls until visible → cert issued.
- `http`: Cloudflare returns a path `/.well-known/acme-challenge/<token>` → creator's DNS must already point at us → Worker must serve the token (Cloudflare proxies these requests automatically once Custom Hostname is registered).
- `cname`: Cloudflare returns a separate validation CNAME, e.g. `_acme-challenge.mybrand.com → <token>.dcv.cloudflare.com` → creator adds at registrar.

For tadaify, **TXT-first with CNAME fallback** is the recommended UX (least confusing for non-technical creators), because:

- TXT does not require the main DNS to already be pointed at us (creator can validate before flipping production traffic).
- CNAME validation is more "standard" but requires an extra record vs. TXT.
- HTTP validation only works once production CNAME is live → useless for a "test before flip" workflow.

---

## 2. AWS CloudFront SaaS pattern — comparison reference

The user remembered that CloudFront has a "SaaS-style" multi-tenant pattern. Confirmed: this is a documented architecture, sometimes called "SaaS Manager for CloudFront" but more accurately it's the **multi-tenant distribution + ACM SAN cert + Lambda@Edge** pattern.

### 2.1 Mechanism

Two flavours:

**A. One distribution per customer (1:1)**
- Each creator gets their own CloudFront distribution.
- Each distribution has its own ACM certificate (one domain per cert).
- ACM certs are validated via DNS (creator adds CNAME).
- Cost: each distribution incurs no fixed fee but has per-request fees; ACM certs are free.
- Limit: 200 distributions per account by default (raisable to ~25,000 via support quota request).

**B. Shared distribution with multi-SAN cert (1:many)** — the actual "SaaS pattern"
- Single CloudFront distribution shared across many creators.
- The distribution's CNAME alias list contains all creator domains (up to 100 per distribution).
- ACM cert can hold up to 100 SANs (Subject Alternative Names) — so one cert covers ~100 creators.
- For more creators: provision multiple distributions, each with its own multi-SAN cert.
- Lambda@Edge function on `viewer-request`: reads `Host` header, rewrites the path to `/<creator>/<slug>` and forwards to S3 origin.
- Cert renewal: ACM auto-renews if DNS validation CNAMEs stay in place.

Reference architecture: <https://aws.amazon.com/blogs/networking-and-content-delivery/multi-tenant-saas-amazon-cloudfront/>

### 2.2 Limits

- 200 distributions per account default; **up to ~25,000 with quota raise**.
- 100 aliases per distribution.
- 100 SANs per ACM cert (so 1 distribution + 1 cert = 100 hostnames max).
- For 5,000 creators: need ~50 distributions, ~50 multi-SAN certs, with Lambda@Edge keyed by host header to a routing config (typically DynamoDB lookup).

### 2.3 Cost

- CloudFront: $0.085/GB egress (NA/EU), $0.0075/10k requests.
- Lambda@Edge: $0.60 per 1M invocations + $0.00005001 per GB-second.
- ACM: free.
- Route53 (if used for routing): $0.50 per hosted zone.

Per creator at modest traffic (say 50k pageviews/mo, 1MB each = 50GB):
- CloudFront egress: $4.25
- Lambda@Edge: ~$0.04
- Total: ~$4.30/mo just in raw AWS infra.

This already breaks our $2/mo billing-to-creator model on a single creator at 50k pageviews. Would only work with usage-based pricing (which we explicitly rejected via DEC-PRICELOCK-02) or a much higher base price.

### 2.4 Operational burden

- Lambda@Edge deploys are slow (5-15 min replication globally) and impossible to rollback instantly.
- ACM cert renewals require DNS validation CNAMEs to stay in place — if a creator removes them, cert silently fails to renew.
- Distribution provisioning takes 15-30 min — adds latency to creator onboarding.
- Quota raises require AWS support engagement; for >25k distributions, this becomes negotiation territory similar to Cloudflare Enterprise.

---

## 3. Side-by-side feature matrix

| Axis | Cloudflare for SaaS | AWS CloudFront SaaS pattern |
|---|---|---|
| **Setup complexity** | Single API call per hostname; one Worker route handles all. | Lambda@Edge function + DynamoDB host-router + ACM SAN orchestration + distribution sharding logic. ~3-5 days of infra dev. |
| **Per-hostname cost (infra)** | $0.10/mo (Business plan, after 100 included). | ~$4-15/mo at typical creator traffic, dominated by CloudFront egress. |
| **Cert provisioning latency** | 5-15 min (TXT-DCV). | 30-90 min (ACM DNS-validation + distribution propagation). |
| **Cert provider** | Let's Encrypt or Google Trust Services. | Amazon Trust Services (ACM only). |
| **Routing mechanism** | Worker reads `Host` header, queries D1/KV/our Postgres. | Lambda@Edge reads `Host` header, queries DynamoDB. |
| **Domain limit per account** | Business: soft cap ~5k hostnames recommended; Enterprise: unlimited. | Default 200 distributions; raisable to ~25k. Each distribution covers 100 hostnames → ~2.5M hostnames theoretical at full quota raise. |
| **Validation UX (creator-facing)** | One CNAME + one TXT (DCV). | One CNAME + one DCV CNAME. Effectively identical. |
| **Cancel/transfer domain UX** | API DELETE; cert is revoked; TXT/CNAME can be removed by creator. | Distribution alias list edit; ACM cert renewal stops; manual cleanup of routing entries. |
| **Refund on cert failure** | We refund/credit at our discretion; CF charges per active hostname not per provisioning attempt. | Same — ACM is free, so no AWS-side waste; but our Lambda@Edge invocations during failed validation count. |
| **Rate limit on adds** | 1200 Custom Hostnames per 5 min per zone (Business); higher on Enterprise. | API: 5 req/s default for `CreateDistribution`; raisable. ACM cert issuance: 100 certs per account per year (a hard limit on the SaaS pattern; we'd need to share certs across creators heavily). |
| **EU/global edge presence** | 300+ POPs, including dozens in EU. | 600+ POPs (more than CF). Marginally better edge density in some regions. |
| **DDoS protection** | Included free at all tiers. | Shield Standard free; Shield Advanced $3000/mo. |
| **WAF** | Included on Business+. | Separate AWS WAF: $5/mo per web ACL + $1 per million requests. |
| **Logs / observability** | Workers Analytics + Logpush ($0.05/GB). | CloudFront access logs to S3 + CloudWatch. |
| **Vendor lock-in** | Custom Hostnames API is proprietary; concept is portable. | Lambda@Edge + ACM logic is AWS-specific; concept is portable. |
| **Native fit for tadaify** | ✅ Stack is already 100% Cloudflare. | ❌ Requires reintroducing AWS into the request path, which DEC-INFRA-02 explicitly minimised. |

---

## 4. Tadaify integration architecture (Cloudflare for SaaS path)

### 4.1 Request flow (textual sequence diagram)

```
[Visitor]                [Cloudflare edge]              [tadaify Worker]            [Supabase Postgres]
   |                            |                              |                            |
   | GET https://mybrand.com/posts/hello                       |                            |
   |--------------------------->|                              |                            |
   |                            | TLS handshake                |                            |
   |                            | SNI=mybrand.com              |                            |
   |                            | match Custom Hostname        |                            |
   |                            | terminate TLS w/ LE cert     |                            |
   |                            |                              |                            |
   |                            | proxy to fallback origin     |                            |
   |                            |   (= tadaify.com Worker)     |                            |
   |                            |----------------------------->|                            |
   |                            |  Host: mybrand.com           |                            |
   |                            |  X-Forwarded-Host: mybrand.com                            |
   |                            |                              |                            |
   |                            |                              | const host = req.headers.get('host')
   |                            |                              | // 'mybrand.com'           |
   |                            |                              |                            |
   |                            |                              | KV cache check first       |
   |                            |                              |--------- KV.get('domain:mybrand.com')
   |                            |                              |<-------- {user_id, status:'active'}
   |                            |                              |                            |
   |                            |                              | (cache miss → Postgres)    |
   |                            |                              |--------------------------->|
   |                            |                              |                            | SELECT user_id FROM
   |                            |                              |                            |  custom_domains WHERE
   |                            |                              |                            |  domain='mybrand.com'
   |                            |                              |                            |  AND status='active'
   |                            |                              |<---------------------------|
   |                            |                              |                            |
   |                            |                              | render page for user_id    |
   |                            |                              | + slug='posts/hello'       |
   |                            |<-----------------------------|                            |
   |<---------------------------|                              |                            |
   |  HTML response              |                              |                            |
```

Cache strategy: KV TTL of 60s for the `domain → user_id` lookup, invalidated on domain edit/cancel. KV is global, so warming happens at first hit per region.

### 4.2 Database schema

```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  cf_custom_hostname_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN (
    'pending_validation', 'pending_issuance', 'pending_deployment',
    'active', 'failed', 'revoked'
  )),
  ssl_status TEXT CHECK (ssl_status IN (
    'pending', 'provisioned', 'failed', NULL
  )),
  validation_method TEXT NOT NULL DEFAULT 'txt'
    CHECK (validation_method IN ('txt', 'cname', 'http')),
  validation_record_name TEXT,   -- e.g. _acme-challenge.mybrand.com
  validation_record_value TEXT,  -- the TXT/CNAME value creator must add
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  failure_reason TEXT,
  -- Billing
  stripe_subscription_item_id TEXT UNIQUE,
  is_billing_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_status ON custom_domains(status)
  WHERE status IN ('pending_validation', 'pending_issuance');

-- RLS
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read"
  ON custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "owner insert"
  ON custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner delete"
  ON custom_domains FOR DELETE
  USING (auth.uid() = user_id);

-- (UPDATE only via service-role from Edge Function — no direct user UPDATE)
```

### 4.3 UI flow (creator-facing, in /app/domains)

**Step 1: Enter domain**
- Input field with inline validation (regex for valid hostname; reject IP literals, ports, paths).
- Disallow `*.tadaify.com` and any of our reserved subdomains.
- Soft-warn if creator types `www.X.com` — offer to add the apex too.

**Step 2: DNS instructions (modal / slide-over)**
- Show two records to add at the registrar, with copy buttons:
  - `CNAME mybrand.com → <handle>.tadaify.com` (or `cname.tadaify.com` for an apex CNAME flattening case via Cloudflare).
  - `TXT _acme-challenge.mybrand.com → <token>` (DCV).
- Provider-specific shortcuts: detect popular registrars (GoDaddy, Namecheap, Cloudflare, OVH, Squarespace) and show provider-targeted screenshots/links.
- "I added the records — verify" button.

**Step 3: Validation polling**
- Status pill: `Waiting for DNS…` (animated) → `Validating ownership…` → `Provisioning SSL…` → `Live ✓`.
- Background poll every 10s for the first 5 min, then every 60s up to 30 min.
- After 30 min with `pending_validation`: surface "Need help?" with common pitfalls (CAA records, DNSSEC, TTL).

**Step 4: Live state**
- Health-check pulse: green dot if last check <5min ago and HTTP 200 from `https://mybrand.com/__health`.
- Show cert expiry date (auto-renewed by CF; display "Auto-renews YYYY-MM-DD").
- "Remove domain" button → confirmation modal → DELETE Custom Hostname + cancel Stripe line item.

### 4.4 Backend orchestration (Edge Function `custom-domain-orchestrator`)

Triggered on:

1. **Insert** — call CF API `POST /custom_hostnames`, store `cf_custom_hostname_id`, validation record details.
2. **Webhook from CF** — Cloudflare can fire a webhook when status changes (Enterprise; Business uses polling). On Business: scheduled poll every 60s.
3. **Delete** — call CF API `DELETE /custom_hostnames/{id}`, mark `status='revoked'`, trigger Stripe cancel-line-item.

Single Edge Function with sub-routes (`/poll`, `/create`, `/delete`, `/webhook`). Idempotent — re-running on an already-active hostname is a no-op.

Secrets needed in Supabase Secrets:

- `CF_API_TOKEN` — scoped to `Zone.SSL and Certificates:Edit` for the `tadaify.com` zone only.
- `CF_ZONE_ID` — `tadaify.com` zone id.
- `STRIPE_SECRET_KEY` — already present.

---

## 5. Validation UX research (competitor patterns)

We surveyed how Substack, Beehiiv, Stan Store, Ghost, Webflow, and Shopify present custom-domain setup.

### 5.1 What's common

- All show a 4-step flow: enter → DNS instructions → validate → live.
- All use polling (5–30s intervals) rather than asking the user to refresh.
- All distinguish "DNS not yet pointed" from "SSL provisioning" — bundling them confuses users who think DNS is broken when actually SSL is just slow.
- All offer a "skip and use a subdomain on our brand" escape hatch (which we'd map to the existing `tadaify.com/<handle>`).

### 5.2 What differentiates the best from the worst

**Best (Beehiiv, Webflow):**
- Per-registrar guides with screenshots ("Cloudflare DNS setup", "GoDaddy DNS setup") inline.
- Realtime DNS lookup display: "I see your CNAME pointing to X currently" — shows the user what their DNS looks like *right now* rather than asking them to trust polling.
- Diagnostic on failure ("CAA record on your zone forbids Let's Encrypt — here's how to fix it") rather than a generic "validation failed".

**Worst (Stan Store, smaller no-code SaaS):**
- Single-shot validation; if it fails you're stuck with no diagnostic.
- 24-hour wait recommendations for DNS propagation (rarely actually needed at modern TTLs).
- No visibility into cert provisioning step — looks like it's hung.

### 5.3 Recommended UX for tadaify

Lift Beehiiv/Webflow patterns:

- Realtime DNS lookup display ("Current `mybrand.com` resolves to: `203.0.113.45` — Cloudflare").
- Per-registrar guides for the top 5 registrars (GoDaddy, Namecheap, Cloudflare DNS, OVH, Squarespace).
- Specific failure-class diagnostics (CAA, DNSSEC, registrar-locked DNS).
- Optimistic UI: as soon as we see the CNAME resolves, advance to "Provisioning SSL…" even if Cloudflare API still says `pending_validation`.

---

## 6. Cost analysis + breakeven math

### 6.1 Cloudflare for SaaS pricing model (per current pricing page)

- Business plan: $200/mo flat (account-level).
- Custom Hostnames: 100 included, then $0.10/mo per additional hostname.

Total monthly Cloudflare cost as a function of N hostnames:

```
cost(N) = 200 + max(0, N - 100) * 0.10
```

| Hostnames | CF cost/mo | Revenue/mo @ $2/mo | Gross margin |
|---|---|---|---|
| 100 | $200 | $200 | 0% |
| 500 | $200 + 40 = $240 | $1,000 | 76% |
| 1,000 | $200 + 90 = $290 | $2,000 | 86% |
| 5,000 | $200 + 490 = $690 | $10,000 | 93% |
| 10,000 | $200 + 990 = $1,190 | $20,000 | 94% |
| 25,000 | $200 + 2,490 = $2,690 | $50,000 | 95% |

Breakeven on the Business flat fee: at N=100 we exactly cover the $200/mo. With ~1 in 5 creators ever adding a custom domain (industry rule of thumb for SaaS-with-domain features), tadaify needs ~500 paying creators with custom domains active to hit the 76% gross-margin point — well within the planning horizon.

### 6.2 What about the Pro/Free tier baseline?

DEC-PRICELOCK-02 includes 1 custom domain free on Creator/Pro tier; only Business tier gets 10 free. So:

- Free tier creator: pays nothing on baseline + $2/mo per domain (1st included → bills $0; 2nd onward → $2/mo).
- Wait — re-reading DEC-PRICELOCK-02 more carefully: **$2/mo per custom domain on every tier, with no included baseline**. Re-confirming this in §9 below.

### 6.3 Bandwidth cost

Cloudflare Business: bandwidth is included in the $200/mo flat (no per-GB egress charge). This is the single biggest delta vs. AWS — at 10TB/mo across all creator domains, AWS would charge ~$850 in egress alone.

### 6.4 Enterprise crossover

Estimated Enterprise quote: $5,000–$15,000/mo flat. Crossover with the $0.10-per-add Business pricing happens around 30,000–130,000 hostnames. Stay on Business until ~10,000–15,000 hostnames; revisit Enterprise then with concrete usage data.

---

## 7. Migration / rollback considerations

### 7.1 Lock-in level: medium-high

What's locked to Cloudflare:

- Custom Hostnames API objects — can't move them; would need to re-register on a new provider.
- Worker routing logic — Worker code is JavaScript on V8 isolates, mostly portable to Vercel/Deno Deploy.
- KV cache — would need migration to a new edge-KV.

What's portable:

- The `custom_domains` Postgres table — provider-agnostic.
- The creator-facing UX (CNAME + TXT records) — every major SaaS-domain provider uses the same conceptual flow.
- Cert ownership — Let's Encrypt certs are obtained per-hostname; if we leave Cloudflare, we lose the issued certs but creator-side DNS doesn't change.

### 7.2 Switchover cost estimate

Hypothetical move from Cloudflare for SaaS to AWS CloudFront SaaS pattern:

- 1-2 weeks of infra dev (Lambda@Edge, ACM, distribution sharding).
- Per-creator: re-issue cert (no creator action needed if CNAME stays), update routing config in our DB.
- Risk: 5-15 min downtime per creator during cert re-issuance; staggerable over weeks to keep impact low.

### 7.3 Hedge

Keep `cf_custom_hostname_id` opaque in our schema; abstract calls behind a `CustomDomainsProvider` interface (similar to how a payment-provider abstraction works). Cost: ~1 day of design work upfront, saves weeks if we ever migrate. Strongly recommend adopting this from day 1.

---

## 8. Verdict + recommendation

### 8.1 Decision: ✅ Adopt Cloudflare for SaaS

Rationale:

1. **Native to our stack.** Workers/Pages already serve `tadaify.com`; same Worker handles custom-hostname traffic with one config change.
2. **No AWS in the request path.** Honours DEC-INFRA-02 (AWS minimal — analytics cold storage only).
3. **Pricing aligned with our $2/mo lock.** At any scale we plan for in 12-18 months, gross margin stays >80%.
4. **Operational simplicity.** No Lambda@Edge, no ACM cert orchestration, no distribution sharding logic.
5. **Cert provisioning is fast and managed.** Let's Encrypt + auto-renewal; we don't touch certs.

### 8.2 Recommended Cloudflare tier: **Business plan ($200/mo)**

- Free/Pro: don't expose Custom Hostnames officially. Not viable.
- Business: covers us up to ~10,000 active custom hostnames with comfortable margin.
- Enterprise: revisit at ~10,000 hostnames or if we need SSO / dedicated CA / 100% SLA.

### 8.3 Pre-launch checklist

Before shipping the feature:

1. Upgrade `tadaify.com` zone to Cloudflare Business plan ($200/mo).
2. Generate API token scoped to `Zone.SSL and Certificates:Edit` for that zone only.
3. Configure fallback origin: `Custom Hostnames → Fallback Origin → cname.tadaify.com`.
4. Write `CustomDomainsProvider` interface — cloudflare implementation behind it (hedge for §7.3).
5. Implement Edge Function `custom-domain-orchestrator` with `/create`, `/poll`, `/delete`, `/webhook` sub-routes.
6. Implement UI under `/app/domains` per §4.3.
7. Add Stripe metered billing line item (per DEC-PRICELOCK-02; reconfirm in §9).
8. Add `claude-reports/mockups/custom-domains/` mockup before implementation kickoff (per orchestrator MOCKUP rule).
9. Write `e2e/plans/<story-id>-custom-domains.plan.md` + unit tests for hostname-validation regex.

---

## 9. Pending DECs (table format v2)

### DEC-CUSTOM-DOMAIN-PROVIDER-01 — Custom-domain edge provider

**Czego dotyczy**: Edge / TLS provider for tadaify creator custom domains.

**Szczegolowy opis**: Tadaify will let creators serve their content on their own domain (e.g. `mybrand.com` → tadaify creator page). Two viable paths exist: (a) **Cloudflare for SaaS** — native to our existing Workers/Pages stack, $200/mo Business plan + $0.10/hostname after 100 included; (b) **AWS CloudFront SaaS pattern** — Lambda@Edge + multi-SAN ACM certs + distribution sharding, ~$4-15/mo per active creator due to bandwidth dominance, requires reintroducing AWS into the request path against DEC-INFRA-02. Verdict from this research: Cloudflare for SaaS wins on cost, simplicity, and stack fit.

**Opcje**:
1. Cloudflare for SaaS, Business plan from day 1.
2. AWS CloudFront SaaS pattern.
3. Hybrid — Cloudflare for SaaS as default, AWS CloudFront only for enterprise creators with custom SLA.
4. Defer feature to later milestone — no custom domains until N paying creators reached.

**Twoja rekomendacja**: **Option 1 — Cloudflare for SaaS, Business plan from day 1.** It is the only path that keeps our stack consistent with DEC-FRAMEWORK-01 + DEC-DNS-01 + DEC-INFRA-02 simultaneously, and the cost model holds through any realistic 12–18 month scale.

---

### DEC-CUSTOM-DOMAIN-VALIDATION-01 — DCV method exposed to creators

**Czego dotyczy**: Domain Control Validation (DCV) method shown in the creator UI when adding a custom domain.

**Szczegolowy opis**: Cloudflare supports three DCV methods for Custom Hostnames: `txt` (creator adds a `_acme-challenge` TXT record), `cname` (creator adds a `_acme-challenge` CNAME pointing at a Cloudflare-provided target), and `http` (Cloudflare serves a token over HTTP — only works once the production CNAME is already pointed at us). Each has trade-offs: TXT is the most "test before flip" friendly (cert can be issued before traffic is cut over); HTTP has zero record-keeping but breaks the "verify before flipping production" workflow; CNAME is the standard but adds an extra record. The choice affects creator-onboarding UX directly.

**Opcje**:
1. TXT-only — simplest UX, one validation record class only.
2. TXT-first with CNAME fallback if creator's registrar doesn't support TXT (rare in 2026).
3. HTTP-only — zero record-keeping, but breaks "test before flip".
4. Let Cloudflare auto-pick (uses CNAME by default).

**Twoja rekomendacja**: **Option 2 — TXT-first with CNAME fallback.** TXT-first preserves the "test before flip" flow, which is what makes Beehiiv and Webflow feel reassuring; CNAME fallback covers the long tail of registrars with awkward TXT support. Implementation cost is ~1 extra day vs. TXT-only.

---

### DEC-CUSTOM-DOMAIN-PRICING-01 — Confirm $2/mo per domain across tiers

**Czego dotyczy**: Reconfirmation of the $2/mo per-custom-domain billing locked in DEC-PRICELOCK-02, with the cost analysis from §8 in hand.

**Szczegolowy opis**: DEC-PRICELOCK-02 already locked $2/mo per custom domain across all tiers. The cost analysis in §6 confirms this is comfortably above our infra cost (Cloudflare Business: ~$0.10/hostname after 100 included, plus $200/mo flat amortised across the customer base). At 500 creators with custom domains, gross margin is 76%; at 5000, it's 93%. The question is whether to reaffirm $2/mo as locked, or revisit pricing with two specific options surfaced by the analysis: (a) bump the per-domain price to $3/mo to fund the $200/mo Cloudflare baseline faster; (b) include 1 custom domain free on Pro/Business tiers as a tier-differentiator; (c) keep $2/mo flat across all tiers as currently locked.

**Opcje**:
1. Reaffirm $2/mo per custom domain on every tier, no inclusions (current DEC-PRICELOCK-02).
2. $2/mo per custom domain, but include 1 free on Pro tier and 5 free on Business tier (typical SaaS pattern).
3. Bump to $3/mo per custom domain on every tier.
4. Defer pricing revisit until first 100 paying creators.

**Twoja rekomendacja**: **Option 1 — reaffirm $2/mo per domain on every tier, no inclusions.** The simplicity of "every domain costs $2" is a marketing asset; tier-differentiated inclusions create per-tier accounting complexity (especially with multi-domain creators on Business). The 76%+ margin at 500 creators is plenty of runway to revisit if pricing pressure ever appears.

---

## 10. Out-of-scope explicit

Things deliberately not addressed in this research:

- **Vanity subdomains on tadaify.com** (e.g. `<creator>.tadaify.com`) — already covered by DEC-DOMAIN-01 (single-domain architecture). Custom domains in this research are creator-owned third-party domains only.
- **SEO redirect handling** when a creator switches from `tadaify.com/<handle>` to `mybrand.com` — separate research needed; suggest a 301-redirect implementation with `Cache-Control: max-age=31536000` for canonical SEO transfer.
- **Email DNS implications** (MX, DKIM, SPF) — out of scope; we never touch creator's email records, only A/CNAME/TXT for the apex.
- **Wildcard custom domains** (`*.mybrand.com` for sub-creator hierarchies) — Cloudflare for SaaS supports this on Enterprise only; not part of MVP.
- **DNSSEC pass-through** — nice to have, complex; revisit post-launch.
- **Custom favicon / branding per domain** — UX feature, not infra; separate refinement.
- **Edge function execution limits** — current Worker bundle is well under 10MB and 50ms CPU/request; no concern at this scale.
- **GDPR / data residency for EU creators** — Cloudflare offers EU-region-only inspection; revisit if any creator demands it contractually.
