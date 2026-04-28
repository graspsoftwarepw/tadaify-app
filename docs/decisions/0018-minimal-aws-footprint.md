---
id: 0018
aliases: ["DEC-INFRA-MINIMAL-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [infrastructure, aws, terraform]
---

# Minimal AWS footprint — S3 cold analytics + Athena + Glue only

## Context

Standard project template uses ~500 lines of Terraform covering CloudFront, S3 for app
hosting, Route53, ACM certificates, Lambda. With Cloudflare-first architecture (DEC-035),
most of those concerns move to Cloudflare. AWS becomes invisible backend only.

## Decision

AWS usage is minimal (~100-150 lines Terraform total):
- `terraform/analytics/` — S3 bucket `tdfy-analytics-{env}` + Athena workgroup + Glue catalog
- `terraform/iam-oidc/` — GitHub Actions OIDC role for deploy
- `terraform/backup/` — S3 bucket `tdfy-backups-{env}` (Supabase dumps + GDPR export staging)

NOT in tadaify-aws (removed vs standard template):
- `terraform/frontend/` — no CloudFront, no S3 for app hosting
- `terraform/dns/` — no Route53
- ACM certificates — TLS handled by Cloudflare
- No Lambda by default

## Consequences

- `tadaify-aws` repo is significantly simpler than standard template.
- Pro creators get 365d analytics via Athena-backed queries on S3 Parquet.
- Business gets all-time analytics dashboard via same Athena path.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1555; `architecture/infra-v2.md`
- Original ID: DEC-INFRA-MINIMAL-01
- Locked: 2026-04-24
