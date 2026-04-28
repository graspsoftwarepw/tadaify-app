---
id: 0004
aliases: ["DEC-035"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [architecture, cloudflare, infrastructure, aws]
---

# Cloudflare-first architecture

## Context

tadaify is a global link-in-bio SaaS. The architecture decision centres on where to run
the edge layer, media storage, hot analytics, and custom domain provisioning. Standard
template uses AWS (CloudFront, S3, Lambda, Route53, ACM). Cloudflare-first is an
alternative that collapses these into Cloudflare Workers, R2, Pages, Cloudflare-for-SaaS,
and Analytics Engine — with Supabase as the central database brain.

## Decision

Edge + custom domains + media + hot analytics = Cloudflare (Workers, R2, Pages,
Cloudflare-for-SaaS, Analytics Engine, DNS). Central brain = Supabase (Postgres, GoTrue,
Edge Functions, Realtime). AWS = S3 cold analytics Parquet + Athena + Glue only.
No CloudFront, no Route53, no ACM, no Lambda by default.

## Alternatives considered

- **AWS-first (standard template)** — rejected; CloudFront + Lambda adds latency for
  edge-rendered pages; Cloudflare-for-SaaS is purpose-built for multi-tenant custom
  domains at scale; R2 zero-egress vs S3 egress costs.

## Consequences

- `tadaify-aws` Terraform is minimal (~100-150 lines vs ~500 standard): S3 analytics +
  Athena + Glue + IAM OIDC only (DEC-INFRA-MINIMAL-01).
- No CloudFront, no Route53, no ACM in tadaify-aws.
- Cloudflare Analytics Engine provides hot 90d analytics tier.
- Custom domain provisioning via Cloudflare-for-SaaS API (F-CUSTOM-DOMAIN-002).
- Cloudflare Workers pricing model at scale must be monitored.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L19, L1353; `architecture/infra-v2.md`
- Original ID: DEC-035
- Locked: 2026-04-24
