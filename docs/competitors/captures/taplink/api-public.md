---
type: competitor-research
project: tadaify
competitor: taplink
title: Taplink — public API
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Taplink — public API, SDKs, webhooks

## TL;DR

**Taplink does NOT publish a public creator-facing API as of April
2026.** No developer portal, no OpenAPI spec, no SDKs, no published
webhook catalogue surfaced via search.

Given Taplink's CRM-adjacent positioning (forms capture leads → CRM
stores them → creators manage customer lifecycle), a public API for
pulling lead data into external CRMs would be a natural product
extension, but it is not offered.

## Confirmed programmatic surfaces

- **Zapier bridge** [unclear — Taplink's Zapier connector is not
  prominently documented; may exist]
- **CSV export** from CRM [unclear — verify existence]
- **Embeddable payment buttons** from 60+ processors, managed at
  the processor layer (Stripe webhooks / PayPal IPN etc. — accessible
  to creators who own the processor account)

## Not offered

- No developer portal
- No OAuth app surface
- No REST API for page config / form submissions / CRM records
- No webhook endpoints on form submit (native)
- No SDKs

## Strategic position

Same closed-platform pattern as Linktree, Beacons, Stan. Taplink's
wide 60+ processor integration is its integration moat — API
openness is not.

## Sources

- [taplink.cc direct fetch](https://taplink.cc/)
- [taplink.at/en/blog/what-is-taplink](https://taplink.at/en/blog/what-is-taplink.html)
