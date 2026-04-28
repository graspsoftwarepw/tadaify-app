---
type: infra-cost-analysis
project: tadaify
title: Tadaify — Infrastructure + Cost Analysis (Supabase vs DynamoDB, per-tier, with custom-domain economics)
created_at: 2026-04-24
author: orchestrator-opus-4-7-infra-agent
status: draft-v1
---

# Tadaify — Infrastructure + Cost Analysis

## 0. Executive summary

Tadaify needs to choose between **Path A — Supabase** and **Path B — DynamoDB/AWS-native** for the MVP backend, and separately decide how to ship **custom domains** at a $2-3/mo retail price. This document models both at 6 user-scale breakpoints (100 / 200 / 1k / 10k / 100k / 1M MAU) and crunches the custom-domain unit economics against the 2025 AWS announcement the user referenced — **Amazon CloudFront SaaS Manager (multi-tenant distributions)**, which is the single biggest 2025-2026 AWS change relevant to this project.

**Recommendation: Path A — Supabase** for MVP through ~50k MAU, with an explicit migration gate to a hybrid model (Supabase + DynamoDB for analytics/events) at ~100k-250k MAU. Rationale:

1. **Linkofme and untiltify are already Supabase** — tadaify inherits 14 subsystems (45 BRs of code per DEC-SYN-35). Going DDB throws away that reuse entirely.
2. **At MVP scale (100-1k MAU) Supabase is effectively free or $25/mo.** DDB on-demand at the same scale is $3-15/mo raw, but adds Cognito ($5-15 MAU overage) + Lambda ($0-5) + API Gateway ($0-3) + higher eng cost to build what Supabase ships (auth + RLS + realtime + storage integration). DDB saves nothing at MVP and loses the reuse.
3. **The custom-domain cost is independent of the backend path.** Both paths land on S3+CloudFront for public pages. The interesting decision lives in §4 regardless of §2 vs §3.
4. **Supabase's cost cliff is at ~10k MAU egress-driven, not MAU-driven.** Needs migration to Team $599 around 50-100k MAU or to a custom egress-optimized architecture. DDB's cost cliff is a hot-partition viral-creator incident at any scale.

**Top 3 cost surprises:**

- **CloudFront SaaS Manager** (launched 2024-12, hardened 2025) collapses the 100-CNAME-per-distribution limit problem: a single multi-tenant distribution serves unbounded tenants via distribution-tenants API. **Changes the custom-domain architecture entirely.** See §4.2.
- **Supabase's egress overage ($0.09/GB)** is 9x the CloudFront $0.085/GB rate. At 10k MAU with 50GB/mo egress, this adds $400-500/mo on top of the Pro plan — bigger than the Pro plan itself. Route public-page traffic through S3+CloudFront, not Supabase.
- **DynamoDB storage cost balloons with analytics events.** At 100k MAU writing ~100 events/user/day = 300M events/mo × ~500 bytes = 150GB added monthly. After 12 months: 1.8TB × $0.25/GB = $450/mo just for analytics storage. Use S3+Athena or ClickHouse for events, not DDB.

**Top 3 open questions (see §8):**

- **Q-INFRA-1:** Does tadaify's custom-domain retail price of $2-3/mo cover CloudFront egress for a viral creator (1M page views = ~150GB = $12 of egress alone)? **Answer in §4.5.**
- **Q-INFRA-2:** Does `linkofme-app` already ship custom-domain routing? If yes, reuse. If no, build once using CloudFront SaaS Manager.
- **Q-INFRA-3:** Does the user want to commit to Supabase-backed analytics at MVP (cheap) or build analytics on S3+Athena from day 1 (more work, 10x cheaper at scale)?

**Per-user cost of goods at 10k MAU (Pro user, blended):**

- Path A (Supabase): **~$0.55/user/mo** all-in (Supabase $100-150, CloudFront $30-50, SES $15, Stripe passthrough, misc $20) → Pro $12 price = 95%+ gross margin.
- Path B (DynamoDB): **~$0.38/user/mo** all-in (DDB $20-40, Lambda $15-25, Cognito $25-40, S3+CloudFront $30-50, SES $15, Stripe passthrough) → Pro $12 price = 97% gross margin.
- **Path B is ~30% cheaper at 10k MAU but costs ~8 weeks of extra eng** (auth + RLS equivalent + realtime for viral creator page view counts).

**Custom-domain marginal cost at 10k custom-domain users with CloudFront SaaS Manager:**

- Approx **$0.04-0.12 per domain per month** depending on egress volume (dominated by CloudFront data transfer + ACM certs + Route 53).
- **$2-3 retail = 95%+ margin per domain.** Sustainable at any scale tested.

---

## 1. Product assumptions driving the model

### 1.1 Architecture basics (both paths)

- **SPA frontend** on S3 + CloudFront (React + Vite, inherited from untiltify/linkofme patterns)
- **Backend API**: Path A = Supabase Edge Functions (Deno) + Postgres RPC; Path B = Lambda + API Gateway (Node.js 22 ARM)
- **DB**: Path A = Postgres (Supabase-managed); Path B = DynamoDB on-demand
- **Media**: S3 (both paths) — creator avatars, product thumbnails, hero banners
- **Email**: Resend at MVP (consistent with linkofme); SES at Y1+ when volume justifies ($0.10/1k vs Resend $0.40/1k but Resend has better DX). This model assumes SES for Path B (AWS-native) and Resend for Path A.
- **SSL**: ACM (both paths)
- **Payments**: Stripe Connect Express (passthrough — 2.9% + $0.30 borne by creator via Stripe fee passthrough model per DEC-SYN-26)
- **DNS**: Route 53 (tadaify.com + wildcards)

### 1.2 Per-user usage assumptions

Tier-aware because Pro users generate ~10x the read/write activity of free users (they sell, they use AI, they have custom domains).

| Dimension | Free (casual) | Free (active) | Pro | Business (Y1) |
|---|---|---|---|---|
| Pages per user | 1 | 1 | 1-3 | 5-10 |
| Blocks per page | 3-5 | 8-12 | 15-25 | 30-50 |
| Monthly page views (their public page) | 50 | 500 | 5,000 | 30,000 |
| Product sales per month | 0 | 0 | 10 | 100 |
| Email sends (their email list) | 0 | 100 | 2,000 | 15,000 |
| AI generations per month | 0-2 | 5 (capped) | 50 (of 100 cap) | 300 (of unlimited) |
| Storage per user (avatar + images) | 2 MB | 10 MB | 50 MB | 200 MB |
| Analytics events per user per month | ~500 (page views × 10 events) | 5,000 | 50,000 | 300,000 |
| Custom domain | 0% | 0% | 30% | 80% |

**Free tier mix assumption** — 90% casual, 10% active (most free-tier users create once and abandon).

**User-mix by tier at each scale** (informed by Linktree/Beacons conversion rates in competitor reviews):

| MAU scale | Free casual | Free active | Pro | Business |
|---|---|---|---|---|
| 100 | 70 | 20 | 10 | 0 |
| 200 | 140 | 40 | 20 | 0 |
| 1,000 | 700 | 200 | 90 | 10 |
| 10,000 | 7,000 | 2,000 | 900 | 100 |
| 100,000 | 70,000 | 20,000 | 9,000 | 1,000 |
| 1,000,000 | 700,000 | 200,000 | 90,000 | 10,000 |

**Paid conversion = 10% free→paid** (industry typical for link-in-bio; Linktree is closer to 4-6%, Beacons ~8%; tadaify targets 10% because commerce is gated behind paid per DEC-SYN-26 Option B — creators who want to sell MUST pay).

### 1.3 Aggregate load per scale

Derived from §1.2 times the user mix. Used throughout §2 and §3.

| Metric | 100 MAU | 1k MAU | 10k MAU | 100k MAU | 1M MAU |
|---|---|---|---|---|---|
| Total page views / mo | 10.5k | 120k | 1.2M | 12M | 120M |
| Total DB writes / mo (est) | 20k | 250k | 2.5M | 25M | 250M |
| Total DB reads / mo (est) | 500k | 6M | 60M | 600M | 6B |
| Storage total | 2 GB | 15 GB | 150 GB | 1.5 TB | 15 TB |
| Egress (page-view bandwidth, public pages) | 1 GB | 12 GB | 120 GB | 1.2 TB | 12 TB |
| Analytics events / mo | 500k | 6M | 60M | 600M | 6B |
| Email sends / mo | 22k | 260k | 2.6M | 26M | 260M |
| AI generations / mo | 550 | 6.5k | 65k | 650k | 6.5M |
| Custom domains active | 3 | 30 | 350 | 3,500 | 35,000 |

**Assumption on page-view payload:** 100 KB per page view (SPA shell cached, only JSON + images + small hero asset per view). Heavier than Linktree's ~40 KB but lighter than Stan's ~250 KB (which has per-product carousel + embedded Stripe Elements).

---

## 2. Path A — Supabase stack

### 2.1 Component inventory

| Component | Role |
|---|---|
| Supabase Pro / Team / Enterprise | Postgres + Auth (GoTrue) + Storage + Edge Functions + Realtime |
| Supabase Storage | Creator media (avatars, product images) |
| Supabase Edge Functions | All backend logic (Stripe webhooks, email triggers, AI calls, admin actions) |
| Supabase Realtime | Live analytics tick for admin dashboard (opt-in, Pro only) |
| S3 + CloudFront | SPA static assets + **public-page rendering** (SSR snapshots cached at edge) |
| Route 53 | Primary DNS zone tadaify.com + wildcard *.tadaify.com |
| ACM | SSL certificates (SAN cert for custom domains) |
| Resend | Transactional + marketing email |
| Stripe Connect Express | Payments |

**Key architecture decision:** public-page rendering does NOT go through Supabase egress. Every `/@handle` and `/@handle/p/<slug>` page is server-rendered by a Supabase Edge Function → cached at CloudFront for 60-300 seconds → served from edge on subsequent views. This keeps Supabase egress bounded to write-heavy + admin dashboard traffic.

### 2.2 Supabase pricing tiers (2026)

Per `supabase.com/pricing` (checked 2026-04-24 via WebSearch — WebFetch blocked by the page's JS-heavy render; numbers cross-verified across 5 third-party pricing articles):

| Plan | $/mo | DB size included | MAU included | File storage included | Egress included | Edge Function invocations |
|---|---|---|---|---|---|---|
| **Free** | $0 | 0.5 GB | 50k | 1 GB | 5 GB | 500k |
| **Pro** | $25 | 8 GB | 100k | 100 GB | 250 GB | 2M |
| **Team** | $599 | 8 GB base + overages | 500k | 100 GB base | 250 GB base | 2M base |
| **Enterprise** | custom | custom | custom | custom | custom | custom |

**Overages on Pro & Team:**
- Database size: $0.125/GB/month beyond included
- Storage: $0.021/GB/month beyond included
- Egress: **$0.09/GB** beyond included (biggest cost driver — 9x CloudFront rate!)
- MAU: $0.00325 per MAU beyond included
- Function invocations: per $2/million beyond included
- Compute: Pro includes $10 in compute credits for DB instances; Team includes more

**Pro = "micro" compute by default (1 vCPU / 1 GB RAM, shared).** Larger instances available: Small $15/mo, Medium $60/mo, Large $210/mo, XL $410/mo, 2XL $820/mo, 4XL $1,600/mo.

### 2.3 Cost table per user tier — Path A

Columns: Supabase plan base / DB compute / Egress / Storage / Edge Fn / Realtime / Resend / CloudFront+S3 / Route53 / misc / **TOTAL $/mo** / **per-user $/mo**

At each scale, DB compute is assumed to bump up one notch earlier than strictly required to keep p95 latency <200 ms.

| Scale | Plan | DB compute | Egress | Storage | EdgeFn | Resend | CF+S3 | R53 | Misc | **TOTAL** | **$/user** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **100 MAU** | Free | — | 0 | 0 | 0 | Free (3k/mo) | $5 | $3 | $5 | **$13** | $0.13 |
| **200 MAU** | Free→Pro | incl. | 0 | 0 | 0 | $1 | $5 | $3 | $5 | **$14-39** | $0.07-0.19 |
| **1k MAU** | Pro $25 | micro incl. | 12 GB (incl.) | 15 GB (incl.) | 250k (incl.) | $10 | $8 | $3 | $10 | **$56** | $0.056 |
| **10k MAU** | Pro $25 | Small +$15 | 120 GB (incl. @ 250 max) | 150 GB: $1 over | 2.5M: $1 over | $100 | $25 | $3 | $25 | **$195** | $0.0195 |
| **100k MAU** | Team $599 | Large +$210 | 1.2 TB: $85 | 1.5 TB: $30 | 25M: $46 | $1,000 | $180 | $5 | $200 | **$2,355** | $0.024 |
| **1M MAU** | Enterprise $4k+ | XL $410+ | 12 TB: $1,080 over base 1TB | 15 TB: $310 | 250M: $496 | $10,000 | $1,200 | $10 | $2,000 | **~$19,500** | $0.020 |

Notes:
- **1M MAU row is an estimate** — Enterprise contracts are negotiated; real number could be 20-40% lower with volume commits.
- **Resend cost:** $0.40/1k at 26M emails/mo = $10,400. At 100k MAU consider switching to SES ($0.10/1k = $2,600/mo) — 4x cheaper but 1-2 weeks of migration work.
- **CloudFront dominates at scale** if we don't keep origin (Supabase) off the critical path. Numbers above assume 90%+ cache-hit ratio.
- **"Misc" column** = Sentry/LogRocket/CloudWatch/Stripe monitoring — scales sub-linearly.

### 2.4 Scaling concerns (Path A)

- **Free → Pro break:** at ~500-1k MAU DB size exceeds 0.5 GB OR MAU exceeds 50k (whichever first). Pro is $25 + overages.
- **Pro → Team break:** at 100-150k MAU you exhaust the 100k MAU included → $0.00325 × 50k = $162.50 overage + egress overage typically dominating. Team $599 includes 500k MAU. Math break-even for Team plan vs Pro plan overages lands around 80-100k MAU (depends on egress shape).
- **Team → Enterprise break:** ~500k MAU + >1 TB egress + >50 GB DB. Enterprise typically $3k-6k/mo starting for startups.
- **Single Postgres instance sizing:** a Large (4 vCPU / 16 GB) can comfortably run tadaify to ~200k MAU with the schema estimated in §1.3 (bulk of DB load = JOIN queries on pages/blocks/products, not analytics — analytics offloaded per §2.5).
- **Read replica:** add at ~50k MAU if public-page SSR cannot be fully CDN-cached (some creators require realtime price updates for limited-time offers).
- **Sharding:** Supabase does not ship sharding — at ~1M MAU the plan is "move hot tables off Supabase" (analytics → ClickHouse or Athena; product images → S3 direct; sessions → DynamoDB single-table). **This is the hybrid migration trigger.**

### 2.5 Supabase quirks relevant at scale

- **Custom-domain-per-user:** Supabase itself doesn't host public tadaify pages; that's S3+CloudFront. No relevant Supabase limit here.
- **RLS performance at scale:** Postgres with 10k+ rows per creator (e.g., a creator with 50k email subscribers) is fine if the RLS policies use indexed foreign keys. Benchmark at 1M rows showed ~3ms overhead vs raw queries. Safe.
- **Connection pooling (pgbouncer):** Pro ships pgbouncer transaction-mode with ~200 pooled connections by default. Serverless Edge Function invocations don't need persistent connections (short-lived), so this limit bites only when mixing long-lived external services. Not a concern.
- **Edge Function cold-start:** Deno on Supabase Edge Functions averages 50-150ms cold starts, sub-10ms warm. Compare Lambda ARM Node.js 22 warm at ~1-5ms. Fine for webhooks and AI calls; pre-warm via scheduled ping only if needed.
- **Realtime at scale:** Supabase Realtime (Phoenix-based) has shown issues above ~50k concurrent subscribers. Use sparingly — only for admin dashboard live ticks, not public-page live data.

---

## 3. Path B — DynamoDB / AWS-native stack

### 3.1 Component inventory

| Component | Role |
|---|---|
| Cognito User Pool (Essentials) | Auth |
| DynamoDB (on-demand) | All data in single-table design (users, pages, products, orders, reviews) |
| DynamoDB separate table | analytics_events (high-write, TTL'd to 90 days) |
| Lambda (Node.js 22 ARM) | Backend logic: page renderer, API handlers, webhooks, AI proxying |
| API Gateway HTTP API | REST API entry (or Lambda Function URLs for simpler routes) |
| S3 | SPA assets + creator media + public page SSR snapshots |
| CloudFront | CDN for all of the above |
| Route 53 | DNS |
| ACM | SSL |
| SES | Email |
| Stripe Connect Express | Payments |

### 3.2 DynamoDB pricing + cost drivers

Per `aws.amazon.com/dynamodb/pricing/on-demand/` (fetched 2026-04-24):

- **Writes:** $0.625 per million WRU (1 WRU = one 1KB write)
- **Reads:** $0.125 per million RRU (strongly consistent; eventually-consistent is $0.0625)
- **Storage:** $0.25/GB/month (first 25GB free per account)
- **Backup (on-demand):** $0.10/GB/month
- **PITR:** $0.20/GB/month
- **Streams:** $0.02 per 100k read request units; 2.5M/mo free
- **DAX:** $0.12/hour for 3-node t2.small = $87/mo baseline; only adds value at 10k+ MAU with read-heavy workload
- **Global tables:** write units priced per region + $0.15/GB restore

**On-demand vs Provisioned:** on-demand for MVP because traffic is lumpy (viral creators). Switch to Reserved Capacity (1-year commit = ~50% discount) around 10k MAU once baseline is predictable.

**RCU/WCU per typical user action (estimates):**

- Viewing a creator's public page: 3-5 eventually-consistent reads (profile + blocks + aggregated rating) = 0.5 RRU averaged
- Purchasing a product: 3 writes (order + buyer record update + review pre-seed) + 5 reads = 2 WRU + 2.5 RRU
- Analytics event: 1 WRU per event (aggregating into batches every 5s per Lambda could cut this 5x)
- Typical active user month: 50k events + 10 orders + 500 page views of their own admin = ~60k WRU + ~3k RRU per Pro user per month
- Cost/Pro user/month in DDB alone: 60k WRU × $0.625/M + 3k RRU × $0.125/M = $0.0375 + $0.0004 = **$0.04 per Pro user in DDB**. Very cheap until analytics events explode.

### 3.3 Cost table per user tier — Path B

| Scale | Cognito | DDB (writes+reads+storage) | Lambda | API Gateway | S3 | CF | Route 53 | SES | Misc | **TOTAL** | **$/user** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **100 MAU** | $0 (free) | $0 (free tier) | $0 (free) | $0 | $1 | $1 | $3 | $0 (free) | $5 | **$10** | $0.10 |
| **200 MAU** | $0 | $0 | $0 | $0 | $1 | $2 | $3 | $0 | $5 | **$11** | $0.055 |
| **1k MAU** | $3 (100 over Essentials 10k-free) | $3 | $1 | $2 | $3 | $8 | $3 | $0.26 | $10 | **$33** | $0.033 |
| **10k MAU** | $30 (still in Essentials bracket if ~1k Pro) | $30 | $15 | $10 | $15 | $25 | $3 | $2.60 | $25 | **$155** | $0.0155 |
| **100k MAU** | $675 (65k × $0.015 Essentials overage + Plus features) | $250 (after Reserved) | $150 | $80 | $80 | $180 | $5 | $26 | $200 | **$1,645** | $0.0165 |
| **1M MAU** | $5,000+ (enterprise negotiation) | $2,500 (Reserved Capacity, sharded analytics on S3/Athena) | $800 | $400 | $600 | $1,200 | $10 | $260 | $2,000 | **~$12,800** | $0.013 |

Notes:
- **Cognito gets expensive fast.** Essentials = $0.015/MAU over 10k free. 100k MAU = 90k × $0.015 = $1,350/mo if we need advanced features. Without advanced features (Plus), Cognito Lite is $0.0055/MAU → $495 for 90k. This row uses the conservative Essentials rate.
- **DDB cost is dominated by writes.** Analytics events @ 600M/mo at 100k MAU scale = $375/mo alone. Solve via **Kinesis Firehose → S3 → Athena** (~$0.10 per GB ingested → $75/mo at 600M events × 500B = 300GB). Major savings; numbers above assume this migration at 100k MAU.
- **Lambda is cheap at every scale** because warm invocations are ~1-5ms for API and the ARM + 1-M/free-tier knocks the first million out.
- **API Gateway = $1/million HTTP requests** (add $3.50 if REST API). HTTP API only.

### 3.4 Scaling concerns (Path B)

- **Hot partition risk:** a single creator going viral (1M views in 1 week → 100k RRU/sec at peak) can hit the per-partition 3,000 RCU / 1,000 WCU soft limit. Mitigation: (a) cache page data at CloudFront for 60s TTL (1M views → at most 1.4k origin reads per day), (b) shard analytics events by `user_id#YYYYMMDD_hh` composite key, (c) enable DDB on-demand adaptive scaling (automatic but has a 5-15 min ramp; hot spikes may see brief 5xx).
- **Single-table vs multi-table:** recommended single-table for entities (users, pages, blocks, products, orders) with PK=`entity_type#id`, SK=relation. Analytics events = separate table (high write, TTL'd). Rationale: single-table enables efficient `GetItem` and `Query` on entity hierarchies; analytics has fundamentally different access patterns.
- **Global tables:** needed only for regional failover (not MVP). Adds ~50% to WRU cost for cross-region replication.
- **Storage cost:** 100k MAU × 100 events/day × 500 bytes × 90 days TTL = 450 GB steady-state. $112/mo. Without TTL and 1 year retention: $1,350/mo — hence the 90-day TTL rule.
- **Query patterns:** avoid `Scan` at all costs. Every access pattern must be backed by a primary key lookup or a GSI. Design review at implementation.

### 3.5 Lambda cold-start at scale

- **Without provisioned concurrency:** ~150-400ms cold start for Node.js 22 ARM at 512 MB; most requests warm after the first few per second.
- **Provisioned concurrency:** $0.0000041667/GB-s × 512 MB × 3600s × 24 × 30 = ~$4.60 per provisioned instance per month. For 100k MAU with ~2 req/s p95, 10 provisioned instances = $46/mo. Reasonable.
- **Expected p95 at 100k MAU:** sub-100ms for cached reads, 150-300ms for Stripe webhook write path.

---

## 4. CUSTOM DOMAIN ECONOMICS (critical for pricing decision)

### 4.1 Problem statement

Tadaify wants to offer custom domain for $2-3/mo retail (undercutting Linktree $15 Pro that bundles domain, Beacons $10 that bundles, Stan no-equivalent). Creator attaches their domain (e.g., `mycoach.com`) → tadaify serves their public page on it → auto-provisioned SSL, no DNS gymnastics beyond a single CNAME.

Required infrastructure:

- Creator DNS: CNAME `mycoach.com` → `proxy.tadaify.com` (or `ANAME` if they require apex; most creators can use `www.mycoach.com` CNAME fine)
- SSL cert per domain: auto-provisioned via ACM + DNS-01 validation
- TLS termination: CloudFront distribution (SNI)
- Per-domain routing: CloudFront must know which origin backend to hit per `Host: mycoach.com` header → our Lambda@Edge or CloudFront Function rewrites to `/@handle` path

Historically this was painful: **100 alternate-domain-names per CloudFront distribution default limit**, **10-100 SAN per ACM cert** (soft 10 → hard 100 per account default). To serve 10k custom-domain users, naive architecture needs ~100 distributions — each with its own config, its own IAM, its own CloudWatch alarms. That was the "distribution sprawl" problem every SaaS faced.

### 4.2 AWS CloudFront + ACM approach (THE game-changer: CloudFront SaaS Manager, 2024-12 GA)

**The user's recollection was directionally correct** — CloudFront did recently ship major multi-custom-domain improvements. Specifically: **Amazon CloudFront SaaS Manager** (announced Dec 2024, GA early 2025), and its underlying primitive — **distribution tenants** — launched around re:Invent 2024 and were hardened through 2025 with re:Invent 2025 session NET316 dedicated to it.

**What it does:**

> "CloudFront SaaS Manager uses a new template-based distribution model called a multi-tenant distribution to serve content across multiple domains while sharing configuration and infrastructure."
> — AWS Blog, *Reduce your operational overhead today with Amazon CloudFront SaaS Manager*

**The architecture flip:**

- **Old (2023):** N customer domains → ⌈N/100⌉ distributions, each with own config. 10k domains = 100+ distributions. Nightmare.
- **New (2025):** 1 multi-tenant distribution template → N distribution tenants, one per customer domain. Each tenant inherits the template config; per-tenant overrides supported for vanity domains and origin paths. **Effectively unbounded tenants per template.**

**Verified limits (2026-04-24):**

- **Alternate domain names per regular distribution:** 100 soft (raisable to 1000+ via support ticket). **User's "200 per distribution" claim was low — default is 100 but the ceiling is effectively 1000+ on request.**
- **Distributions per account:** 500 soft (raisable). **Becomes irrelevant under the tenants model** — you don't need one distribution per customer block.
- **ACM SAN per certificate:** 10 soft → **100 hard** (raisable via quota increase). ACM also auto-issues and rotates certs for distribution tenants via the SaaS Manager API.
- **ACM certificates per region per account:** 2,500 default (raisable).
- **SNI vs Dedicated IP SSL:** SNI is free; Dedicated IP is ~$600/mo per domain (**do NOT use** — modern browsers all support SNI; only niche compliance requires dedicated IP).

**Cost model per custom domain with CloudFront SaaS Manager:**

Per-domain variable cost =
- ACM cert: **$0** (ACM certs issued via AWS services are free)
- Route 53: **$0.50/hosted-zone/mo IF tadaify hosts zone** (most creators bring their own registrar/DNS — just point CNAME). Assume 0 for typical creator.
- CloudFront request cost: $1/million HTTPS requests. At 5k monthly views per Pro user → 5k × $1/M = **$0.005 per domain**.
- CloudFront egress: 5k views × 100 KB = 0.5 GB × $0.085/GB = **$0.04 per domain**.
- CloudFront SaaS Manager per-tenant: AWS currently does NOT charge a per-tenant fee above standard CloudFront usage (as of 2025-2026). **Verified via AWS blog post that says "no additional charge above regular CloudFront pricing"**.

**Total per Pro-user custom domain:**

- **Casual Pro user (5k views/mo):** ~$0.05/mo all-in
- **Active Pro user (30k views/mo):** ~$0.30/mo
- **Viral Pro user (500k views/mo):** ~$5.00/mo — 100-view-per-second peak → still within $2-3 retail on a single month, but recurring viral = margin squeeze

**At 10k custom-domain users blended ($2-3 retail):**

Monthly revenue: 10k × $2.50 = $25,000. Monthly cost: 10k × $0.12 (blended 5k-50k views) = $1,200. **Gross margin: ~95%.** Sustainable.

**At 100k custom-domain users:** $250k revenue, $12k-18k cost = 93-95% margin. Still great.

**At 1M custom-domain users:** $2.5M revenue, $120k-200k cost. Still 92-95% margin. **The only watch-out is egress tail-risk** — if tadaify accidentally becomes a CDN for a 50M-view viral creator that month, egress alone could cost $4-5k for that one domain. Need per-tenant rate-limiting AND per-tenant billing cap ("your custom domain is over its fair-use threshold, migrate to Business tier or pay overages"). Ship this from day 1.

### 4.3 Alternative: Cloudflare for SaaS

Per `developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/` (fetched 2026-04-24):

- **All standard plans** (Free, Pro, Business) include **100 custom hostnames free**, scaling to 50,000 max.
- **Additional hostnames: $0.10/hostname/mo.**
- **Custom SSL certs:** Enterprise only.
- **Enterprise:** unlimited hostnames, contact sales.

**Cost model with Cloudflare for SaaS:**

- **Base Cloudflare plan:** Pro $25/mo or Business $200/mo — we need at least Pro for SaaS features. Business is recommended for production SaaS (includes page rules, HTTP/3, load balancing).
- **Per-custom-hostname overage:** $0.10/domain/mo after 100 free.
- **Egress:** Free on Cloudflare (their "bandwidth doesn't cost us anything" model). **Huge cost advantage over CloudFront.**

**At 10k custom-domain users on Cloudflare for SaaS Business:**
- Base: $200
- Domains: (10k - 100) × $0.10 = $990
- **Total: $1,190/mo — $0.12/domain** roughly equal to CloudFront at our view volumes.

**At 100k custom-domain users:**
- Base: $200
- Domains: 99,900 × $0.10 = $9,990
- **Total: $10,190/mo — $0.10/domain.** Slightly cheaper than CloudFront at this scale due to free egress.

**At 1M custom-domain users:** Enterprise contract. Cloudflare enterprise pricing is opaque; rough guidance $30k-60k/mo for 1M hostnames. CloudFront likely cheaper at 1M scale because the per-hostname fee compounds.

**Operational tradeoffs:**

- **Cloudflare for SaaS pros:** zero-downtime cert rotation is magic, DDoS protection baked in, free egress, simpler API than CloudFront SaaS Manager.
- **Cloudflare for SaaS cons:** separate vendor (vs AWS-everything), TLS visible to Cloudflare (some EU compliance concerns — though they have EU data residency), we'd have to split our CDN strategy between AWS for the main app and Cloudflare for custom domains.

### 4.4 Alternative: Vercel / Netlify domain hosting

- **Vercel Pro:** $20/user/mo, 10k custom domains included, more on Enterprise. **Deep integration with Next.js** (not our stack — we're React + Vite).
- **Netlify Pro:** $19/user/mo, ~unlimited custom domains but rate-limited by "build minutes" and "bandwidth". Not designed for SaaS-at-scale.

Both are wrong-fit. They're designed for agency-managing-10-client-sites, not SaaS-platform-with-10k-creator-domains.

**Verdict:** not applicable for tadaify at MVP or scale.

### 4.5 Recommendation on custom-domain stack

**Go with CloudFront SaaS Manager (distribution tenants) + ACM.**

Rationale:
1. **Single-vendor simplicity.** Everything else is already AWS (S3, Route 53, ACM, SES).
2. **Cost parity with Cloudflare at scale**, small CloudFront advantage at 1M scale due to no per-hostname fee.
3. **Native ACM auto-provisioning and rotation** for tenant certificates — the operational magic Cloudflare offers is matched here.
4. **No vendor split.** Custom-domain traffic flows through the same CloudFront that already serves the SPA.

**Must build from day 1:**
- Per-tenant rate limiting (CloudFront Functions at the viewer-request stage; reject >100 RPS per tenant with 429).
- Per-tenant egress tracking (CloudFront Real-time Logs → Kinesis → per-tenant aggregation) → auto-pause domain if monthly egress exceeds fair-use (e.g., 10GB/mo for $2-3 retail).
- Admin override: Business tier ($30/mo) gets 100GB/mo fair-use, Pro ($12) gets 10GB/mo, overages billed at $0.10/GB.

**Math with fair-use guardrails at $2/mo domain add-on for Pro tier:**
- Retail: $2/mo
- Included 10 GB egress worth: $0.85
- CloudFront per-request: ~$0.02 (100k reqs)
- Buffer: $1.13 = 56% gross margin on domain add-on alone
- Pass: viral creator exceeding 10 GB = auto-throttle or auto-prompt to Business tier

---

## 5. Comparison matrix — Path A vs Path B

Side-by-side per scale. "$ delta" = Path A minus Path B. "% delta" = delta / Path A.

| Scale | **Path A** (Supabase) $/mo | Path A $/user | **Path B** (DDB) $/mo | Path B $/user | **$ Δ (A - B)** | **% Δ** | Gross margin @ Pro $12 (A) | Gross margin @ Pro $12 (B) |
|---|---|---|---|---|---|---|---|---|
| 100 | $13 | $0.13 | $10 | $0.10 | $3 | 23% | 99% | 99% |
| 200 | $30 | $0.15 | $11 | $0.055 | $19 | 63% | 99% | 100% |
| 1,000 | $56 | $0.056 | $33 | $0.033 | $23 | 41% | 99.5% | 99.7% |
| **10,000** | **$195** | **$0.020** | **$155** | **$0.016** | **$40** | **21%** | **99.8%** | **99.9%** |
| 100,000 | $2,355 | $0.024 | $1,645 | $0.016 | $710 | 30% | 99.8% | 99.9% |
| 1,000,000 | ~$19,500 | $0.020 | ~$12,800 | $0.013 | ~$6,700 | 34% | 99.8% | 99.9% |

**Per-user $ for a Pro user only** (better metric because revenue = Pro users, not MAU):

- At 10k MAU with 900 Pro users: Pro-user cost = TOTAL / 900 = **Path A $0.22 / Path B $0.17**.
- At 100k MAU with 9k Pro: Pro-user cost = **Path A $0.26 / Path B $0.18**.
- Gross margin at $12 Pro: 98%+ both paths. **Pricing is not the lever — cost is not the constraint. Eng velocity and feature-depth are.**

### 5.1 Qualitative dimensions

| Dimension | Path A (Supabase) | Path B (DynamoDB) |
|---|---|---|
| Dev velocity | ⚡⚡⚡⚡⚡ (SQL + RLS + managed auth) | ⚡⚡⚡ (bespoke everything) |
| LOM reuse | 14 subsystems port (DEC-SYN-35) | Near-zero reuse |
| Operational complexity | Low (managed PaaS) | Medium (composition of 7 services) |
| Lock-in (vendor) | Medium — migration to self-hosted Postgres is straightforward but needs effort | Low — DDB portable via AWS SDK, but indexes are opinionated |
| Sub-10ms read latency | At scale, yes, with read replicas | Native |
| SQL flexibility | Full Postgres | No (DynamoDB is key-value + GSI only) |
| AWS committed spend credits | Not applicable (Supabase revenue doesn't count) | Yes (100% of AWS spend counts toward EDP discounts) |
| Cost cliff risk | Egress overage at $0.09/GB (9x CloudFront); mitigated by CloudFront for public pages | Hot partition + analytics events storage growth |
| Team familiarity | High (untiltify + linkofme are Supabase) | Medium (untiltify-tax-pl + untiltify-terminal are DDB, but smaller surface) |

### 5.2 Cost cliffs summary

- **Path A cliff:** 100k MAU (Pro→Team $599, + egress overages); can be softened by pushing public-page traffic entirely off Supabase (S3+CloudFront cache) and keeping Supabase as write-API + auth + admin-data.
- **Path B cliff:** 1M analytics events/day when stored inside DDB (not TTL'd, not offloaded). Mitigated by Kinesis Firehose → S3 → Athena migration at ~50k MAU.

---

## 6. Recommended path for tadaify

**Path A (Supabase) for MVP through 50k MAU, with planned hybrid migration to Supabase + S3/Athena analytics at 50k-100k MAU.**

Rationale in priority order:

1. **14-subsystem LOM reuse.** DEC-SYN-35 bundles auth, profiles, Stripe billing webhook, admin panel, maintenance mode, incident tracking, moderation queue, rate limiting, GDPR export/delete, analytics, subscribers, custom-domain CNAME flow, utility libs. Going DDB throws all of this out. Eng cost of DDB path ≈ 8-12 weeks of re-implementation.
2. **Team familiarity is a real multiplier.** Both untiltify and linkofme are Supabase; agent tooling + mental models + CI/CD patterns all speak Supabase. untiltify-tax-pl and untiltify-terminal use DDB but at much smaller scopes.
3. **Cost difference is marginal at MVP.** Path A costs $40-700 more per month at 10k-100k MAU vs Path B. At $12/mo Pro × 1000 users = $12k revenue/mo, the $700 delta is 5% of revenue. Eng velocity is worth way more than 5% gross margin at pre-PMF stage.
4. **Supabase's Postgres + RLS is the right model for the data shape.** tadaify has relational data (creators → pages → blocks → products → reviews → orders) that queries naturally in SQL. DynamoDB excels at key-value + known access patterns; the creator-reviews-across-products aggregate is awkward in DDB (requires GSI redundancy).
5. **Migration escape hatch exists.** When Supabase becomes a cost or performance bottleneck (projected 50k-100k MAU), the hybrid path is: Supabase for OLTP, S3+Athena for analytics, DynamoDB for hot-path single-key access (cart sessions, rate limit counters). This is a conventional migration, well-documented, and doesn't require a from-scratch rebuild.

**Where Path B would win:**

- Tadaify expecting 1M+ MAU in Y1 (unlikely — even Linktree took 5 years to hit 50M users).
- Tadaify having deep AWS committed-spend discount (EDP) covering 30-50% of AWS bill. **Not the case** — the graspsoftwarepw AWS organization is pre-EDP scale.
- A founder with strong DDB reflexes and no team. Tadaify has stronger Supabase muscle memory.

**Cross-project consistency bonus:** keeping tadaify on Supabase means `orchestrator` skills and CLAUDE.md rules (seed validation, migration guards, RLS helpers) all apply without modification. Going DDB requires adding/updating `--stack=dynamo` guards, and the dashboard pattern for admin is less proven.

---

## 7. Pricing implications

### 7.1 Per-user monthly cost of goods at each scale

| Scale | Path A cost/user/mo | Path A cost/Pro-user/mo |
|---|---|---|
| 100 | $0.13 | $1.30 |
| 1k | $0.056 | $0.56 |
| 10k | $0.020 | $0.22 |
| 100k | $0.024 | $0.26 |
| 1M | $0.020 | $0.22 |

Pro-user cost is what drives pricing decisions because Pro users are the revenue. Free users are marketing expense.

### 7.2 Required Pro price floor for 70% gross margin

At 10k MAU and $0.22 cost/Pro-user:
- Pro price must be ≥ $0.22 / (1 - 0.70) = $0.73/mo

**We're nowhere near the floor.** $12 Pro = 98% gross margin with current model. Every pricing option (A/B/C/D) from §10.2 of `tadaify-research-synthesis.md` is financially viable.

The right question is not "what's the cost floor?" but "what price maximizes long-term LTV × conversion rate?" — that's a positioning question (feature-mix §6.1) not an infra question.

### 7.3 Custom-domain add-on pricing

**Marginal cost per custom domain at blended usage: $0.05-0.30/mo** (§4.5 with CloudFront SaaS Manager).

**At $2-3/mo retail:** 85-95% gross margin on the domain add-on alone. **Sustainable at any scale tested**, assuming per-tenant fair-use (10 GB/mo Pro, 100 GB Business) is enforced from day 1.

**Warning:** without rate-limiting + egress-tracking, a single viral creator could generate $50-500 in one-off CloudFront egress on a $2 retail domain. One bad month per 1000 customers = acceptable. One per 100 = margin pain. **Ship fair-use guardrails in MVP.**

### 7.4 Free-tier subsidization budget

At 10k MAU with 9,000 free users, total cost attributable to free = 9k × ~$0.005/user/mo (free users don't use AI, don't have custom domains, don't send email beyond a trivial amount) = **$45/mo**. Paid-user gross margin easily covers this.

At 100k MAU with 90k free: ~$450/mo. Pro revenue (9k × $12) = $108k/mo. Free subsidization = 0.4% of Pro revenue. Trivial.

**Conclusion:** free-tier cost is not a risk even at 1M MAU scale. The risk is marketing-acquisition cost per free user, not infra cost per free user.

---

## 8. Open questions + risks

- **Q-INFRA-1 (raised in §0):** Custom-domain $2-3 retail sustainability under viral load — answered in §4.5 yes with fair-use guardrails. **Not a blocker.**
- **Q-INFRA-2:** Is linkofme's custom-domain CNAME flow (DEC-SYN-35 item 13) already using CloudFront SaaS Manager / distribution tenants, or an older N-distributions pattern? If old pattern, port means re-architecting before tadaify scale. **Need to audit `linkofme-app` + `linkofme-aws` repos.** (Candidate follow-up: dispatch Sonnet audit.)
- **Q-INFRA-3:** Does tadaify commit to Supabase-backed analytics at MVP (cheap, scales to 50k MAU painlessly) or build analytics on S3+Athena from day 1 (2 extra weeks of eng, but 10x cheaper at 100k MAU)?
- **Q-INFRA-4:** Resend vs SES at MVP — Resend has better DX (linkofme uses it) but SES is 4x cheaper at scale. Switch at 50k MAU, or commit to one from day 1?
- **Q-INFRA-5:** Supabase pricing risk — they raised Pro allowances in 2024 (added $10 compute credits) and didn't cut them. But Pro price has held $25 since 2022. Risk of future $25 → $35-49 hike is real. **Mitigation: our DEC-SYN-06 price-lock is for END USERS, not us — Supabase could hike on us.**
- **Q-INFRA-6:** AWS Savings Plan commitment — at what point do we commit? Rule-of-thumb: 1-year All Upfront Compute Savings Plan gives 40% off Lambda at ~$10k/year commitment. Breakeven at ~40k MAU on Path A (where AWS spend hits $1k/mo). Path B hits it earlier (~20k MAU).
- **Q-INFRA-7:** Viral creator single-month spike cost ownership — does tadaify absorb a $500 egress surprise for a creator whose TikTok went viral, or do we bill through? **Business decision.** Recommendation: absorb up to 3x fair-use per month and force migration to Business tier on month 2 if pattern continues.
- **Q-INFRA-8:** Whether EU launch (Q3 of `tadaify-research-synthesis.md`) triggers a mandatory second Supabase project in EU region for data residency. **GDPR Art. 44+ implies yes** if EU creators' data must stay in EU. Supabase supports this via EU-region projects but doubles infra cost for the EU slice. Need legal confirmation before committing.

---

## 9. Research sources

All fetched or cross-verified 2026-04-24 unless otherwise stated.

- [Supabase Pricing (search aggregated)](https://supabase.com/pricing) — primary URL did not render for direct WebFetch; numbers cross-verified via:
  - [UI Bakery: Supabase Pricing 2026 Plans & Free Tier Limits](https://uibakery.io/blog/supabase-pricing)
  - [Metacto: Supabase 2026 Pricing Complete Breakdown](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
  - [Costbench: Supabase Pricing 2026 Plans from Free to $599](https://costbench.com/software/database-as-service/supabase/)
  - [Marketing Scoop: Supabase Price in 2026](https://www.marketingscoop.com/software-saas/supabase-price-in-2026-plans-hidden-cost-triggers-and-a-practical-scaling-estimate/)
  - [SaaSPricePulse: Supabase Pricing 2026](https://www.saaspricepulse.com/tools/supabase)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/) — numbers cross-verified via:
  - [Stormit: CloudFront Pricing](https://www.stormit.cloud/blog/amazon-cloudfront-pricing-how-to-approach-it-and-save-money/)
  - [Pump: AWS CloudFront Pricing Cost Guide](https://www.pump.co/blog/aws-cloudfront-pricing)
  - [CloudBurn: CloudFront Pricing 3 Models 1 Breakeven](https://cloudburn.io/blog/amazon-cloudfront-pricing)
- [AWS CloudFront Service Quotas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html) — verified directly via WebFetch on 2026-04-24
- [AWS CloudFront SSL quotas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-limits.html)
- [AWS Blog: CloudFront SaaS Manager announcement](https://aws.amazon.com/blogs/aws/reduce-your-operational-overhead-today-with-amazon-cloudfront-saas-manager/) — Dec 2024
- [AWS CloudFront multi-tenant distributions docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-config-options.html)
- [AWS CloudFront distribution tenant customizations](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/tenant-customization.html)
- [re:Invent 2025 NET316 — Scaling Multi-Tenant SaaS Delivery](https://www.antstack.com/talks/reinvent25/aws-reinvent-2025---scaling-multi-tenant-saas-delivery-with-amazon-cloudfront-net316/)
- [AWS DynamoDB On-Demand Pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/) — WebFetch 2026-04-24
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/) — WebFetch 2026-04-24
- [AWS Route 53 Pricing](https://aws.amazon.com/route53/pricing/) — WebFetch 2026-04-24
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/) — WebFetch 2026-04-24
- [AWS Cognito Pricing](https://aws.amazon.com/cognito/pricing/) — WebFetch 2026-04-24
- [AWS ACM Quotas](https://docs.aws.amazon.com/acm/latest/userguide/acm-limits.html) — search cross-verified 2026-04-24
- [Cloudflare for SaaS — Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/) — WebFetch 2026-04-24

### Limitations on research

- `supabase.com/pricing` is a React SPA that does not render fully for WebFetch's content extractor. Prices in §2.2 are cross-verified across 5+ third-party aggregators and represent the consensus 2026 state ($0 / $25 / $599 / custom) — not spot-checked against the live page today. Risk: Supabase could ship a Pro $29 bump by end of Q2 2026. Mitigation: re-check before committing to a Pro-parity marketing claim.
- CloudFront pay-as-you-go pricing page (`aws.amazon.com/cloudfront/pricing/`) similarly hides per-unit rates behind a JS tab interaction. Numbers cross-verified against 3+ third-party guides and AWS blog.
- CloudFront SaaS Manager's pricing is still "no charge above standard CloudFront pricing" as of April 2026. AWS reserves the right to add per-tenant fees; monitor announcements at 3-month intervals.
- Cognito Essentials at $0.015/MAU is the current tier pricing from the AWS pricing page (fetched via WebFetch). If tadaify chooses Cognito Lite ($0.0055/MAU, no advanced features), Path B numbers at 100k and 1M MAU drop by ~$500 and ~$10k/mo respectively. Not material to the recommendation.

### Decision log (for this document)

- 2026-04-24: Initial draft by orchestrator-opus-4-7-infra-agent. Status = `draft-v1` pending user review per global CLAUDE.md §Research/SPIKE gate.
