---
id: 0002
aliases: ["DEC-DNS-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [dns, cloudflare, infrastructure]
---

# Cloudflare authoritative DNS for `tadaify.com`

## Context

`tadaify.com` is registered at OVH. DNS hosting options considered: OVH nameservers,
Route 53 (standard for AWS-heavy stacks), and Cloudflare. Given the Cloudflare-first
architecture (DEC-035), having Cloudflare also as authoritative DNS is natural — it
allows Cloudflare Workers routes, Cloudflare Pages, and email SPF/DKIM records to be
managed in one place.

## Decision

Cloudflare is the authoritative DNS provider for `tadaify.com`. OVH holds registrar
ownership; nameservers point to Cloudflare (`ns1.cloudflare.com` + `ns2.cloudflare.com`).
Route 53 is not used for `tadaify.com`.

## Consequences

- All DNS records (A, CNAME, MX, TXT/SPF/DKIM) managed in Cloudflare dashboard / Terraform.
- No Route 53 zone for `tadaify.com` — AWS is invisible backend only (DEC-INFRA-MINIMAL-01).
- OVH renewal of registrar ownership must remain active; DNS delegation via nameserver records.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L79, L1351
- Original ID: DEC-DNS-01
- Locked: 2026-04-24
