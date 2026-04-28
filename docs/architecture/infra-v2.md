---
type: infra-architecture
project: tadaify
title: Tadaify — Infrastructure Architecture v2 (Cloudflare-first)
created_at: 2026-04-24
author: orchestrator
status: draft-v1-supersedes-infra-cost-analysis-v1
supersedes: infra-cost-analysis.md (Agent 2 v1 output — kept for reference but superseded by this)
---

# Tadaify — Infrastructure Architecture v2

## 0. What changed vs v1

v1 (Agent 2's `infra-cost-analysis.md`) assumed a **CloudFront-first** architecture:
- Public pages: S3 + CloudFront + ACM
- Custom domains: CloudFront SaaS Manager (AWS's Dec 2024 multi-tenant primitive)
- Analytics: CloudFront real-time logs → Kinesis → S3 → Athena
- Per-user cost @ 10k MAU: $0.22 Supabase path

v2 (this doc) switches to **Cloudflare-first**:
- Public pages: Cloudflare Workers + R2 storage
- Custom domains: Cloudflare for SaaS
- Analytics: Workers → Analytics Engine (hot) + S3 (cold)
- Per-user cost @ 10k MAU: ~$0.03 (88% lower)

**Why the switch** (reasoned over 3 conversation turns with user):
1. CloudFront doesn't solve the viral-creator egress problem at our margins. Cloudflare does (unlimited bandwidth on Business plan).
2. R2 has zero egress fees — S3 has $0.09/GB. At 100k MAU × media delivery, this is $4500/mo savings.
3. Cloudflare Workers provide richer analytics than CloudFront access logs (geo, bot score, custom dimensions) at zero marginal cost.
4. Cloudflare for SaaS + R2 + Workers = all edge-native. Removes the AWS roundtrip for every buyer request.
5. CloudFront SaaS Manager solves the multi-tenant custom domain problem but still ties us to pay-per-GB egress.

**Key user decisions folded into this architecture:**
- DEC-027: Supabase accepted as the backend of record
- DEC-029: S3 + Athena for cold analytics from day 1 (per user's "if cheaper elsewhere, go to AWS")
- DEC-033: Cloudflare for SaaS accepted as the edge layer
- DEC-034: Bandwidth-based pricing model (Vercel/Framer style) — requires view metering at the edge

---

## 1. Executive summary

Tadaify runs on **three vendors**:

1. **Cloudflare** — the edge: serves all public pages, hosts media (R2), handles custom domains, runs analytics (hot tier), provides DDoS + bot filtering. This is the vendor doing the most heavy lifting.
2. **Supabase** — the central brain: Postgres database, auth (GoTrue), Edge Functions for server-side logic, Realtime for live editor sync. This is the vendor holding all the structured state.
3. **AWS** — the cold-storage layer: S3 for analytics log archives + Athena for ad-hoc queries + IAM for CI/CD OIDC. That's it. Minimal AWS presence.

Plus external services paid per-use: **Stripe** (billing + commerce), **Resend** (transactional email), **OpenAI** (AI features).

**At 100k MAU, estimated monthly cost: ~$1,200-1,500**.
**Per-user cost: ~$0.012-0.015** (80% cheaper than v1's $0.22).
**Custom domain marginal cost: ~$0.00-0.05/mo per domain** (depending on Cloudflare plan scaling).

---

## 2. Architecture diagram

```
                                   ┌──────────────────────────────────┐
                                   │      BUYER / VISITOR              │
                                   │  (mycoach.com or tadaify.com/X)   │
                                   └─────────────────┬─────────────────┘
                                                     │
                                  ═══════════════════↓═══════════════════
                                           CLOUDFLARE EDGE
                                           (300+ POPs global)
                                  ═══════════════════════════════════════
                                  │                                     │
      ┌───────────────────────────┼─────────────────────────────────────┼──────────────┐
      │                           │                                     │              │
      │  ┌──────────────────┐    │      ┌──────────────────────┐      │              │
      │  │ Cloudflare for   │    │      │ Cloudflare Workers    │      │              │
      │  │ SaaS             │    │      │ ・SSR public pages     │      │              │
      │  │ ・Custom domain   │    │      │ ・Tenant routing       │      │              │
      │  │   SSL (auto)     │    │      │ ・View counting        │      │              │
      │  │ ・100 free domains│    │      │ ・Edge auth for R2     │      │              │
      │  │ ・DDoS protect    │    │      │ ・Bot filtering        │      │              │
      │  └──────────────────┘    │      │ ・Free geo enrichment  │      │              │
      │                           │      └──────────┬───────────┘      │              │
      │                           │                 │                   │              │
      │  ┌──────────────────┐    │      ┌──────────↓───────────┐      │              │
      │  │ Cloudflare Pages │    │      │ Cloudflare Cache     │      │              │
      │  │ (SPA dashboard)  │    │      │ ・HTML 5-60 min       │      │              │
      │  │ app.tadaify.com  │    │      │ ・Assets 1 year       │      │              │
      │  │ Free hosting     │    │      │ ・Purge API on edit   │      │              │
      │  └──────────────────┘    │      └──────────────────────┘      │              │
      │                           │                                     │              │
      │  ┌──────────────────┐    │      ┌──────────────────────┐      │              │
      │  │ Cloudflare R2    │←───┼──────│ Cloudflare Analytics │      │              │
      │  │ ・Hero images    │    │      │ Engine (hot, 90 days)│      │              │
      │  │ ・Thumbnails     │    │      │ ・Real-time queries   │      │              │
      │  │ ・Custom fonts   │    │      │ ・GraphQL API         │      │              │
      │  │ ・Uploaded media │    │      │ ・Creator dashboard   │      │              │
      │  │ ・ZERO EGRESS    │    │      └──────────────────────┘      │              │
      │  └──────────────────┘    │                                     │              │
      └───────────────────────────┘                                    │              │
                                                                        │              │
                              cache miss                                │              │
                              data fetch                                │              │
                                   │                                    │              │
                                   ↓                                    │              │
      ═══════════════════════════════════════════════                  │              │
      │            SUPABASE (EU region)                │                 │              │
      ═══════════════════════════════════════════════                  │              │
      │                                                │                  │              │
      │  ┌──────────────────────────────────────────┐  │                  │              │
      │  │ PostgreSQL (primary DB)                   │  │                  │              │
      │  │ ・profiles, pages, blocks, products        │  │                  │              │
      │  │ ・orders, subscribers, reviews             │  │                  │              │
      │  │ ・RLS + policies                           │  │                  │              │
      │  │ ・Triggers + functions                     │  │                  │              │
      │  └──────────────────────────────────────────┘  │                  │              │
      │  ┌──────────────────────────────────────────┐  │                  │              │
      │  │ GoTrue (Auth)                             │  │                  │              │
      │  │ ・Email + password, Google, Apple SSO     │  │                  │              │
      │  │ ・Magic links                              │  │                  │              │
      │  │ ・Session mgmt                             │  │                  │              │
      │  └──────────────────────────────────────────┘  │                  │              │
      │  ┌──────────────────────────────────────────┐  │                  │              │
      │  │ Edge Functions (Deno, TypeScript)         │  │                  │              │
      │  │ ・Stripe webhook handler                   │  │                  │              │
      │  │ ・Social import (IG, TikTok fetch)         │  │                  │              │
      │  │ ・Preview generator (Track B)              │  │                  │              │
      │  │ ・AI proxy (OpenAI API calls)              │  │                  │              │
      │  │ ・Cache purge triggers                     │  │                  │              │
      │  └──────────────────────────────────────────┘  │                  │              │
      │  ┌──────────────────────────────────────────┐  │                  │              │
      │  │ Realtime                                  │  │                  │              │
      │  │ ・Editor live collaboration (if we ship)   │  │                  │              │
      │  │ ・Analytics ticker                         │  │                  │              │
      │  └──────────────────────────────────────────┘  │                  │              │
      └───────────────────────────────────────────────┘                  │              │
                                                                           │              │
                    ═════════════════════════════════════════════════════  │              │
                                    cold analytics flush                  │              │
                                    (hourly batch)                        │              │
                    ═════════════════════════════════════════════════════  │              │
                                               ↓                          │              │
      ═════════════════════════════════════════════════════════════════════            │
      │                     AWS (minimal footprint)                        │            │
      ═════════════════════════════════════════════════════════════════════            │
      │                                                                                 │
      │  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐    │
      │  │ S3                 │  │ Athena             │  │ IAM (OIDC)           │    │
      │  │ ・Analytics Parquet│  │ ・Ad-hoc queries    │  │ ・GitHub Actions roles│    │
      │  │ ・Log archives     │  │ ・Creator reports   │  │ ・Per-repo trust      │    │
      │  │ ・DB backups (cold)│  │ ・GDPR exports      │  │ ・Read-only RO role   │    │
      │  │ ・Partitioned by   │  │ ・Custom dimensions │  │   for Claude          │    │
      │  │   date + creator   │  │   (block_id, etc.) │  └──────────────────────┘    │
      │  └────────────────────┘  └────────────────────┘                                 │
      │  ┌────────────────────┐  ┌────────────────────┐                                 │
      │  │ Glue Data Catalog  │  │ CloudWatch (opt.)  │                                 │
      │  │ ・Athena schemas    │  │ ・Only if Lambda    │                                 │
      │  │ ・Auto-update       │  │   used (unlikely)  │                                 │
      │  └────────────────────┘  └────────────────────┘                                 │
      └─────────────────────────────────────────────────────────────────────────────────┘


                             ═════════════════════════════════
                                  EXTERNAL SERVICES (SaaS)
                             ═════════════════════════════════
                             │                                │
                             │  ・Stripe (billing + commerce)  │
                             │  ・Resend (transactional email)│
                             │  ・OpenAI (AI generations)      │
                             │  ・Stripe Tax (EU VAT OSS)      │
                             │                                │
                             └────────────────────────────────┘
```

---

## 3. Component inventory by layer

### 3.1 Cloudflare layer (edge delivery + storage)

| Component | Role | Cost model | MVP | Y1 |
|---|---|---|---|---|
| **Cloudflare for SaaS** | Custom domains per creator — SSL auto-provisioning, tenant routing, DDoS | Business plan $200/mo includes 100 custom domains free; $0.10/domain beyond | ✅ | ✅ |
| **Cloudflare Workers** | Edge SSR, tenant routing, view counting, bot filtering, edge auth | Business $200/mo includes 10M req/mo; $0.30/million overage | ✅ | ✅ |
| **Cloudflare R2** | Media storage (images, fonts, thumbnails, user uploads) | $0.015/GB stored; **$0 egress**; $4.50/1M class-A ops | ✅ | ✅ |
| **Cloudflare Pages** | Static SPA hosting for `app.tadaify.com` creator dashboard | Free (100k deploys/mo, unlimited bandwidth) | ✅ | ✅ |
| **Cloudflare Analytics Engine** | Hot analytics data, real-time dashboard queries (90-day window) | Free tier 10M writes + 1M reads/mo; Business plan $0.25/1M writes overage | ✅ | ✅ |
| **Cloudflare D1** (SQLite edge) | Edge cache for tenant metadata (fast domain → creator lookup) | Free 5GB; $0.75/GB beyond | ⚠️ opt | ✅ |
| **Cloudflare KV** | Distributed key-value — session tokens, edge cache | Free 1GB; $0.50/GB beyond | ⚠️ opt | ✅ |
| **Cloudflare Stream** | Video hosting if we add creator video uploads | $5/mo per 1000 min stored + $1/mo per 1000 min delivered | ❌ | ⚠️ Y1 |
| **Cloudflare Images** | Image CDN with on-the-fly resize/optimize | $5/mo per 100k images stored + $1/mo per 100k delivered | ❌ | ⚠️ Y1 opt |
| **Cloudflare DNS** | Authoritative DNS for tadaify.com + creator custom domains | Included in any plan | ✅ | ✅ |

### 3.2 Supabase layer (central brain)

| Component | Role | Cost model | MVP | Y1 |
|---|---|---|---|---|
| **PostgreSQL** | Primary relational DB (profiles, pages, blocks, products, orders, subscribers, reviews) | Pro $25/mo includes 8GB DB + 50GB bandwidth; Team $599/mo includes 8GB + 250GB + daily backups + read replicas | ✅ | ✅ |
| **GoTrue (Auth)** | Email/password, Google SSO, Apple SSO, magic links | Included in Pro/Team | ✅ | ✅ |
| **Edge Functions** | Server-side logic (webhooks, AI proxy, social import, preview gen) | Pro: 2M invocations/mo; Team: 10M | ✅ | ✅ |
| **Realtime** | Live editor collaboration, admin dashboard live tickers | Pro: 200 concurrent; Team: 500 | ⚠️ Y1 | ✅ |
| **Storage** | Not used for public media (R2 handles that); used only for internal temp files | Minimal usage | ⚠️ opt | ⚠️ opt |
| **Vault** | Runtime secrets (Stripe keys, OpenAI key, Resend key) | Included | ✅ | ✅ |
| **pg_cron** | Scheduled jobs (analytics flush, quota reset, email digest) | Extension available on Pro+ | ✅ | ✅ |

### 3.3 AWS layer (cold storage + CI/CD only)

This is where most SaaS would have their whole stack. We have ~5% of that.

| Component | Role | Cost model | MVP | Y1 |
|---|---|---|---|---|
| **S3** | Cold analytics Parquet archives (from Cloudflare Workers + Analytics Engine flush), DB backups beyond Supabase retention, GDPR export staging | $0.023/GB storage, $0.005/1k PUT, **no egress if from Athena in-region** | ✅ | ✅ |
| **Athena** | Ad-hoc SQL queries over S3 analytics data; creator long-term reports; admin audit queries | $5/TB scanned; typically $10-50/mo at 100k MAU | ✅ | ✅ |
| **Glue Data Catalog** | Auto-updating schema for Athena tables | $1/100k objects (essentially free for our scale) | ✅ | ✅ |
| **IAM** | GitHub Actions OIDC role for deploy; `claude-readonly` role for Claude AWS audits | Free | ✅ | ✅ |
| **CloudWatch Logs** | Only if we use Lambda or specific AWS services with logs; otherwise unused | $0.50/GB ingest; minimal use | ⚠️ opt | ⚠️ opt |
| **Secrets Manager** | Not needed — Supabase Vault + GitHub Secrets cover all secrets | — | ❌ | ❌ |
| **Route 53** | Not needed — Cloudflare DNS is authoritative for tadaify.com | — | ❌ | ❌ |
| **ACM** | Not needed — Cloudflare handles all SSL (both tadaify.com and custom domains) | — | ❌ | ❌ |
| **CloudFront** | Not needed — Cloudflare replaces it | — | ❌ | ❌ |
| **Lambda** | Typically not needed — Supabase Edge Functions + Cloudflare Workers cover all server-side logic; exceptions: specific AWS-only integrations (none identified) | — | ❌ | ⚠️ opt |
| **SES** | Optional email backend — Resend preferred for creator-facing email (better deliverability) | — | ❌ | ❌ |
| **DynamoDB** | Not used — Supabase Postgres is the DB of record | — | ❌ | ❌ |
| **RDS** | Not used — Supabase provides managed Postgres | — | ❌ | ❌ |

**AWS total footprint: S3 + Athena + Glue + IAM.** That's it.

### 3.4 External services (SaaS, per-use)

| Service | Role | Pricing | MVP | Y1 |
|---|---|---|---|---|
| **Stripe** | Billing (subscriptions), commerce (buyer checkouts), Connect (creator payouts), Tax (VAT OSS EU) | 2.9% + $0.30 per transaction; Tax $0.50/filing | ✅ | ✅ |
| **Resend** | Transactional email (welcome, password reset, purchase confirmation, review requests) | Free 3k/mo; $20/mo for 50k; $80/mo for 250k | ✅ | ✅ |
| **OpenAI API** | AI features (product description, page copy, image thumbnails if we use DALL-E) | GPT-4o-mini $0.15/$0.60 per 1M I/O tokens; gpt-4o $5/$15 | ✅ | ✅ |
| **Przelewy24 / BLIK** | PL payment methods (EU/PL wedge per feature-mix §9) | Per-transaction ~1.5-2% | ⚠️ Y1 | ✅ |
| **Mailchimp / ConvertKit / Kit** | Third-party email integrations (creator brings their own) | No cost to us (creator's account) | ✅ | ✅ |

---

## 4. AWS deep-dive — what we actually run on AWS

Since user specifically asked "jakie komponenty na AWS byśmy mieli wtedy" — here's the explicit inventory + what each does + why we need it + cost per scale.

### 4.1 S3 — analytics cold storage

**What's in it:**
- Hourly Parquet flushes from Cloudflare Workers (view events, click events, conversion events)
- Schema: `s3://tadaify-analytics-prod/events/year=YYYY/month=MM/day=DD/hour=HH/part-*.parquet`
- Retention: 24 months (GDPR-compliant)
- Partitioning: by date (primary) + by creator_id (sub-partition, enables single-creator queries without full scan)

**Supporting folders:**
- `s3://tadaify-backups-prod/supabase/` — daily Supabase dump backups beyond Supabase's 7-day Pro retention
- `s3://tadaify-gdpr-exports-prod/` — staging for user data export requests (7-day lifecycle auto-delete)
- `s3://tadaify-cdn-origin-prod/` — ONLY if we need an S3 fallback for Cloudflare outage (disaster recovery)

**Bucket policy:**
- Encryption at rest: SSE-S3 (free)
- Versioning: on for backups bucket, off for analytics (immutable Parquet)
- Lifecycle: analytics → Glacier Deep Archive after 90 days ($0.00099/GB/mo)

**Costs per scale:**

| MAU | Events/mo | Parquet size | S3 storage/mo | S3 requests/mo |
|---|---|---|---|---|
| 100 | 100k | 50 MB | $0.001 | $0.01 |
| 1k | 1M | 500 MB | $0.01 | $0.05 |
| 10k | 10M | 5 GB | $0.12 | $0.50 |
| 100k | 100M | 50 GB | $1.20 | $5.00 |
| 1M | 1B | 500 GB | $12 | $50 |

### 4.2 Athena — SQL over S3

**Used for:**
- Creator long-term reports ("show me traffic from Germany in last 6 months")
- Admin audit queries ("which creators had >10k views in March but didn't upgrade")
- GDPR data export (user requests full analytics history)
- Platform ops (churn analysis, funnel analysis, cohort analysis)

**Query patterns:**
- Most queries are single-creator (partition by `creator_id` → scan 100 MB per month)
- Platform-wide queries scan full hour or full day
- Pricing: $5/TB scanned — typical creator report scans ~50 MB = $0.00025 per report

**Costs per scale (assuming 10 creator reports/user/month + 20 platform queries/day):**

| MAU | Queries/mo | Data scanned | Cost/mo |
|---|---|---|---|
| 100 | 1.6k | 80 MB | $0.0004 |
| 1k | 16k | 800 MB | $0.004 |
| 10k | 160k | 8 GB | $0.04 |
| 100k | 1.6M | 80 GB | $0.40 |
| 1M | 16M | 800 GB | $4 |

Athena is **essentially free** at all our scales. The concern is **query latency** (3-30s per query) — mitigated by Cloudflare Analytics Engine for real-time dashboards + Athena only for long-range reports.

### 4.3 Glue Data Catalog — Athena schema

**Used for:**
- Table definitions for Athena to interpret S3 Parquet files
- Auto-partition discovery
- Schema evolution (if we add columns to events)

**Cost:** $1 per 100k objects stored in catalog. At 2-3 tables × ~1k partitions/year, total cost is < $0.01/mo. Effectively free.

### 4.4 IAM + OIDC

**Used for:**
- **`GitHubActionsDeployRole`** — per-repo trust relationship with GitHub Actions OIDC. Allows Terraform apply without static credentials. Permissions scoped to each repo (e.g., `tadaify-app` can only deploy to tadaify S3 buckets).
- **`ClaudeReadOnlyRole`** — cross-account assume-role from `waserek-sso` intermediate. Claude uses `--profile tadaify-ro` for read-only AWS audits. Only `AWS-managed ReadOnlyAccess` policy, nothing custom.
- **Service roles** — Athena, Glue execution roles.

**Cost:** Free.

### 4.5 Optional — CloudWatch Logs

Only if we run any Lambda (which we don't by default). Kept in inventory as optional escape hatch if we need an AWS-native scheduler or integration.

### 4.6 What we DON'T run on AWS

Explicit anti-list (helps clarify the decision):

- ❌ **No RDS / DynamoDB / other managed DBs** — Supabase is the database
- ❌ **No EC2 / ECS / Fargate / App Runner** — no always-on compute
- ❌ **No Lambda** (by default) — Supabase Edge Functions + Cloudflare Workers cover it
- ❌ **No CloudFront** — replaced by Cloudflare
- ❌ **No Route 53** — Cloudflare DNS is authoritative
- ❌ **No ACM** — Cloudflare handles all TLS
- ❌ **No SES** — Resend is better for our use case
- ❌ **No Cognito** — Supabase GoTrue is our auth
- ❌ **No ElastiCache / MemoryDB** — Cloudflare KV + Supabase Postgres cover caching
- ❌ **No API Gateway** — Supabase exposes its own REST API; Cloudflare Workers handle edge routing
- ❌ **No Secrets Manager / KMS** — Supabase Vault + GitHub Secrets cover everything
- ❌ **No SageMaker / Bedrock** — OpenAI API does AI; no self-hosted ML at our scale

**The entire AWS footprint is S3 + Athena + Glue + IAM.** A Terraform file describing this is ~100 lines.

---

## 5. Cost model at 6 user scales

All costs USD/month. Assumes current 2026 pricing.

### 5.1 100 MAU (private beta / bootstrap)

| Component | Plan | Cost |
|---|---|---|
| Cloudflare | Free plan (dev) | **$0** |
| Cloudflare R2 | Pay-per-use | $0.10 |
| Supabase | Free plan | **$0** |
| AWS S3 | Pay-per-use | $0.01 |
| AWS Athena | Pay-per-use | $0.00 |
| Stripe | Pay-per-use | — |
| Resend | Free tier | **$0** |
| OpenAI | Pay-per-use | ~$5 |
| **Total** | | **~$5-10/mo** |

### 5.2 1k MAU (soft launch)

| Component | Plan | Cost |
|---|---|---|
| Cloudflare | Pro $20 | $20 |
| Cloudflare R2 | 5 GB storage | $0.08 |
| Supabase | Free plan (still OK at 1k MAU) | **$0** |
| AWS S3 | 500 MB | $0.01 |
| AWS Athena | ~16k queries | $0.004 |
| Resend | Free tier | **$0** |
| OpenAI | ~500 AI gens | ~$20 |
| **Total** | | **~$40-50/mo** |

### 5.3 10k MAU (post-launch growing)

| Component | Plan | Cost |
|---|---|---|
| Cloudflare | Business $200 (unlimited bandwidth + 100 custom domains + bot mgmt) | $200 |
| Cloudflare R2 | 50 GB storage + 10M class-A ops | $1 |
| Cloudflare Workers overage | ~30M req (20M above included) | $6 |
| Cloudflare Analytics Engine | 50M writes (40M above free) | $10 |
| Supabase | Pro $25 (8GB DB, 250GB bandwidth) | $25 |
| AWS S3 | 5 GB + 500k req | $0.60 |
| AWS Athena | 160k queries / 8 GB scan | $0.04 |
| Resend | 50k emails | $20 |
| OpenAI | ~5k AI gens | ~$40 |
| Stripe | Pay-per-commerce-transaction | — |
| **Total** | | **~$300/mo** |

Per-user cost: **$0.03/mo** (all-in). If 30% Pro at €10/mo = €30k revenue → **99% gross margin**.

### 5.4 100k MAU (scaled)

| Component | Plan | Cost |
|---|---|---|
| Cloudflare | Business $200 + custom domain overage (assume 500 paid domains × $0.10) | $250 |
| Cloudflare R2 | 500 GB + 100M ops | $10 |
| Cloudflare Workers overage | 300M req (290M above) | $90 |
| Cloudflare Analytics Engine | 500M writes | $125 |
| Supabase | Team $599 (incl. read replica, daily backups, 250GB bandwidth) | $599 |
| Supabase bandwidth overage | Some, if analytics in DB | ~$50 |
| AWS S3 | 50 GB + 5M req | $1.40 |
| AWS Athena | 1.6M queries / 80 GB scan | $0.40 |
| Resend | 500k emails | $80 |
| OpenAI | ~50k AI gens | ~$400 |
| **Total** | | **~$1,600/mo** |

Per-user cost: **$0.016/mo**. If 30k Pro at €10 = €300k revenue → **99.5% gross margin**.

### 5.5 1M MAU (scale)

| Component | Plan | Cost |
|---|---|---|
| Cloudflare | Enterprise (negotiated) | ~$3,000 |
| Cloudflare R2 | 5 TB + 1B ops | $85 |
| Cloudflare Workers | Enterprise-included | (bundled) |
| Cloudflare Analytics Engine | Enterprise-included | (bundled) |
| Supabase | Team $599 + read replicas + compute add-ons | $1,500 |
| AWS S3 | 500 GB + 50M req | $14 |
| AWS Athena | 16M queries / 800 GB scan | $4 |
| Resend | 5M emails | $500 (or self-host) |
| OpenAI | 500k AI gens | ~$4,000 |
| **Total** | | **~$9,000/mo** |

Per-user cost: **$0.009/mo**. If 300k Pro at €10 = €3M revenue → **99.7% gross margin**.

### 5.6 1M MAU summary — is this realistic?

Yes. The architecture scales linearly because:
- Cloudflare handles the bandwidth-heavy path (zero marginal egress cost)
- Supabase scales sub-linearly (reads dominated by edge cache → DB sees ~1% of buyer traffic)
- AWS role stays minimal (only cold analytics)

Biggest unknown: **OpenAI costs at 1M MAU**. If AI generation is popular, $4k/mo is a floor. Could be $20k-50k/mo if every creator uses AI heavily. Mitigation: tighter AI quotas on paid tiers, cache AI outputs, use gpt-4o-mini (already our default).

---

## 6. Custom domain economics

Per-domain marginal cost on Cloudflare for SaaS:

- First 100 domains: **$0** (included in Business $200)
- Domains 101+: **$0.10/domain/mo**

At our retail price of **€2-3/mo custom domain add-on**:

| Domains | Our cost | Retail revenue | Net margin |
|---|---|---|---|
| 100 | $0 | €300 | 100% |
| 1000 | $90 | €3,000 | 97% |
| 10,000 | $990 | €30,000 | 97% |
| 100,000 | $9,990 | €300,000 | 97% |

**Custom domain is ~97% margin at all scales** — extraordinary unit economics. The €2-3/mo pricing is sustainable forever. Could actually drop to €1.50 and still maintain 95% margin.

---

## 7. Analytics architecture detail (critical component)

Because user explicitly asked about analytics quality earlier, here's the full pipeline:

```
1. Buyer request lands at Cloudflare edge
   │
2. Cloudflare Worker intercepts
   │
   ├─→ Primary: serve page (HTML from cache, or render from Supabase+R2)
   │
   └─→ Async event log (non-blocking, <1ms):
        │
        ├─→ Cloudflare Analytics Engine (HOT, 90-day retention)
        │   ├─ Real-time creator dashboard
        │   ├─ "Views last hour" / "Top product today"
        │   └─ GraphQL API queries <50ms
        │
        └─→ Cloudflare Workers → POST to S3 staging bucket
            │
            └─→ Hourly pg_cron on Supabase triggers ETL:
                │
                └─→ Parse staging → Parquet → S3 analytics bucket
                    │
                    └─→ Glue crawler auto-updates schema
                        │
                        └─→ Athena queries available for long-range reports
```

**Event fields captured** (see previous conversation turn for full list):
- Timestamp, creator_id, page, block_id, block_type, event_type
- Country, city, region, lat/lng (from Cloudflare IP geo — free)
- Device type, OS, browser
- ASN, network name
- Referrer, source, UTM params
- Visitor fingerprint (hashed, 24h rotation, GDPR-compliant)
- Bot score, verified bot flag
- A/B variant, language

**Three query paths:**
1. Real-time (last hour) — Analytics Engine GraphQL, <50ms
2. Recent (last 30 days) — Analytics Engine or Supabase rollup table, <500ms
3. Long-range (last 6-24 months) — Athena over S3 Parquet, 3-30s

---

## 8. Comparison to v1 (Agent 2 CloudFront-first)

| Dimension | v1 (CloudFront-first) | v2 (Cloudflare-first) |
|---|---|---|
| Public page serve | S3 + CloudFront + Lambda@Edge | Cloudflare Workers + R2 |
| Custom domains | CloudFront SaaS Manager | Cloudflare for SaaS |
| Media storage | S3 ($0.09/GB egress) | R2 ($0 egress) |
| Analytics hot path | CloudFront real-time logs → Kinesis → Lambda | Cloudflare Workers → Analytics Engine |
| Analytics cold path | CloudFront logs → S3 → Athena | CF Workers → S3 → Athena (same) |
| Bot mitigation | AWS Shield Standard (basic) | Cloudflare Bot Management (world-class) |
| DDoS protection | AWS Shield Standard | Cloudflare DDoS protection (unlimited, Business+ tier) |
| Edge POPs | ~450 CloudFront locations | ~300 Cloudflare cities — comparable |
| Custom domain cost at 10k | ~$150-300/mo (CloudFront overages) | $0 (within Business plan's 100 free) |
| **Per-user cost @ 10k MAU** | **$0.22/mo** | **$0.03/mo** (87% cheaper) |
| AWS footprint | S3 + CloudFront + Lambda@Edge + ACM + Route53 + Kinesis + Glue + Athena + IAM + CloudWatch | S3 + Athena + Glue + IAM (minimal) |
| Terraform complexity | ~500 lines | ~100 lines |
| Operational surface | 8-10 AWS services to monitor | 4 services (mostly passive) |
| Vendor concentration risk | Medium (1 big AWS dep) | High (Cloudflare dep) |

**v1 advantage:** no vendor concentration — everything in AWS.
**v2 advantage:** 87% cheaper, simpler, better analytics, better DDoS, smaller ops surface.

**Decision:** v2 is the architecture. v1 kept as "emergency escape hatch" plan if Cloudflare ever degrades severely.

---

## 9. Vendor concentration risk (honest acknowledgement)

Cloudflare-first = significant Cloudflare dependency. Risk mitigations:

1. **Origin abstraction** — S3 fallback bucket kept warm; if Cloudflare outage >1h, DNS switch to direct S3+CloudFront (2-hour migration window, pre-scripted)
2. **DB independence** — Supabase DB is Cloudflare-independent; creators never lose data if Cloudflare fails
3. **Multi-CDN plan** — at 100k+ MAU, add Bunny.net or Fastly as secondary edge for paying creators (they'd pay premium)
4. **Cloudflare SLA** — 99.99% uptime commit (4-9s) on Business plan; credits if breached
5. **Historical reliability** — Cloudflare has had two major outages in past 3 years (2022 BGP misconfig, 2023 control plane). Each <2h. Manageable.

Compare to v1's AWS concentration: AWS has equivalent outage history + concentration risk. The risk is not asymmetrically higher on Cloudflare. It's a lateral swap.

---

## 10. Implementation checklist (Terraform + setup)

For when we actually build this.

### 10.1 Cloudflare setup (week 1)

- [ ] Create Cloudflare account under `tadaify` organization
- [ ] Buy Business $200/mo plan
- [ ] Add `tadaify.com` zone, update nameservers at registrar
- [ ] Create R2 bucket `tadaify-media-prod`
- [ ] Create Analytics Engine dataset `tadaify_events`
- [ ] Create Worker `tadaify-edge-router` (placeholder)
- [ ] Create Pages project `tadaify-dashboard`
- [ ] Enable Cloudflare for SaaS
- [ ] Generate API token for Terraform (scope-limited)

### 10.2 Supabase setup (week 1)

- [ ] Create two projects: `tadaify-dev`, `tadaify-prod` under organization
- [ ] Pro plan on prod from launch
- [ ] Link to GitHub for Edge Function deployment
- [ ] Configure email templates (welcome, reset, purchase receipt)
- [ ] Enable Auth providers: Email, Google, Apple
- [ ] Configure custom SMTP (via Resend)

### 10.3 AWS setup (week 1) — minimal

- [ ] Create AWS account `tadaify` via AWS Organizations
- [ ] Configure `tadaify-ro` and `tadaify-sso` SSO profiles per CLAUDE.md convention
- [ ] Create S3 buckets: `tadaify-analytics-prod`, `tadaify-backups-prod`, `tadaify-gdpr-exports-prod`
- [ ] Configure bucket lifecycle: analytics → Glacier after 90 days; gdpr-exports → delete after 7 days
- [ ] Create Athena workgroup `tadaify-analytics` with query result location
- [ ] Create Glue database `tadaify_events`
- [ ] Create IAM OIDC provider for GitHub
- [ ] Create `GitHubActionsDeployRole` with scoped S3 + Glue + Athena perms

### 10.4 External services setup

- [ ] Stripe account + Connect setup + webhook endpoint
- [ ] Stripe Tax enable (EU VAT OSS)
- [ ] Resend account + domain verification (`mail.tadaify.com`)
- [ ] OpenAI API key (gpt-4o-mini + gpt-4o budget limits)

### 10.5 Secrets management (per CLAUDE.md conventions)

Every secret gets 2 homes:
- SSM Parameter in Terraform (`/tadaify/prod/stripe-secret-key` with `CHANGE_ME_VIA_CLI` placeholder)
- Runtime value in Supabase Vault (actual secret, set via `supabase secrets set`)

Terraform SSM serves as documentation + cleanup registry per orchestrator rules.

---

## 11. Open questions

- **Q-INFRA-v2-01:** Do we want to keep an S3+CloudFront "warm spare" for Cloudflare disaster recovery? Adds ~$10/mo at 10k MAU for the 2-hour-switchover insurance. Recommend: YES.
- **Q-INFRA-v2-02:** At what scale do we negotiate Cloudflare Enterprise? Signals suggest 250k-500k MAU. Below that, Business plan overages are fine.
- **Q-INFRA-v2-03:** Self-host email (SMTP via EC2/container) at 1M MAU where Resend hits $500+/mo? Saves money but adds ops burden. Revisit at 500k MAU.
- **Q-INFRA-v2-04:** EU data residency — Supabase EU region sufficient? Analytics in AWS EU region (Frankfurt) for matching? User decision on Q-INFRA-v1-08 blocks this.
- **Q-INFRA-v2-05:** Add Cloudflare Stream for creator video uploads at Y1, or stick to R2 + native HTML5 video? Stream has better transcoding but costs $5/month per 1k minutes stored. Defer decision.

---

## 12. Summary for the user

**What runs where:**

1. **Cloudflare** — the edge: custom domains, SSL, public page rendering, media storage (R2), analytics hot tier, DDoS protection. `$200-3000/mo` depending on scale.
2. **Supabase** — the brain: database, auth, server-side functions, live collaboration. `$25-1500/mo`.
3. **AWS** — minimal: S3 for analytics archive, Athena for long-range queries, IAM for CI/CD. `$0.50-15/mo`.
4. **External** — Stripe, Resend, OpenAI. Pay per use.

**AWS components specifically:**
- S3 (analytics Parquet archive, backups, GDPR staging)
- Athena (ad-hoc SQL over analytics)
- Glue Data Catalog (Athena schemas)
- IAM OIDC + roles (CI/CD + Claude readonly)

**Not on AWS:** no EC2, no Lambda (by default), no CloudFront, no Route 53, no ACM, no SES, no RDS, no DynamoDB, no Cognito, no Secrets Manager. We're 95% off AWS.

**Cost at 10k MAU:** ~$300/mo all-in. Per-user: $0.03. At €10 Pro × 30% = €30k revenue → **99% gross margin**.

**Cost at 100k MAU:** ~$1,600/mo. Per-user: $0.016. At €10 Pro × 30% = €300k revenue → **99.5% gross margin**.

**Custom domain marginal cost:** $0-0.10/mo per domain. Retail at €2-3 → 97% margin sustained at all scales.

**Viral creator protection:** Cloudflare Business plan unlimited bandwidth = viral creator never costs us more than our flat $200/mo. Eliminates the biggest economic risk in the v1 model.
