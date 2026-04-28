---
type: competitor-research
project: tadaify
competitor: campsite-bio
title: Campsite.bio — public API
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Campsite.bio — public API

## TL;DR

**Campsite.bio does NOT publish a public creator-facing API as of
April 2026.** No developer portal, no OpenAPI, no SDK repos.

Campsite.bio's Organizations / Pro+ tier offers multi-profile team
management via its UI but does not expose a programmatic surface for
agencies to manage bulk profiles via API.

## Confirmed programmatic surfaces

- **UTM parameter injection** — Campsite parses UTM on inbound clicks
  and surfaces them in analytics (not an "API" but a data-layer
  interface)
- **Embeddable blocks** — users can embed Stripe Link / Gumroad /
  Shopify Buy Button widgets; those platforms' APIs are accessible
  at their layers
- **Pixels (GA / Meta / TikTok)** — client-side tracking layer

## Not offered

- No REST API for page config / link management
- No webhook events catalogue
- No SDKs
- No OAuth surface

## Strategic position

Same closed-platform pattern as every other competitor in this set
(except Carrd's source-download). Campsite.bio's B2B positioning
(Dell, Georgetown, OrangeTheory) would benefit from API access for
enterprise IT teams, but it's not offered.

## Sources

- [campsite.bio — direct fetch](https://campsite.bio/)
- Search-based inference: no developer portal surfaced
