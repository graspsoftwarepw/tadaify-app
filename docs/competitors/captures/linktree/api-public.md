---
type: competitor-research
project: tadaify
competitor: linktree
title: Linktree — public API, SDKs, webhooks
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Linktree — public API, SDKs, webhooks

## TL;DR

Linktree has a **developer API in controlled early-access**, not a
self-serve public API. Prospective developers sign up via an expression
of interest form at
[`https://linktr.ee/marketplace/developer`](https://linktr.ee/marketplace/developer).
The API exposes OAuth auth, REST endpoints, and webhooks, per the
APITracker profile, but the full documentation is gated behind the
developer-program signup. No public SDK has been announced.

This is a material product/business signal: Linktree treats integrations
as a partnership surface rather than a platform-marketplace play. The
contrast with Beacons (more open embed model) and with infra-positioned
competitors (which publish OpenAPI) is sharp.

## What we can confirm

### Developer landing
- `https://linktr.ee/marketplace/developer` — "App, API, and Integration
  developers expression of interest" [source:
  https://linktr.ee/marketplace/developer listed in search]
- `https://linktr.ee/api` — public-facing API info page
  [source: Google SERP title "api | Linktree"; direct fetch 403]

### Feature inventory (from APITracker profile)
[source: https://apitracker.io/a/linktr-ee]

- "Developer docs" — exists, not public
- "API Reference" — exists, not public
- "Webhooks" — documented as existing
- "Webhooks management API" — exists (programmatic webhook CRUD)
- "OpenAPI/Swagger specs" — noted as available (to accepted devs)
- "9 Integrations" — count of APIs this service exposes [unclear if 9 =
  number of API endpoints, OAuth scopes, or integration categories]
- Sandbox environment — referenced
- OAuth for authentication — referenced
- GraphQL playground alongside REST — referenced

### Auth model
- OAuth 2.0 [source: apitracker.io profile]
- Developer must be enrolled in the early-access programme to obtain
  client credentials
- Scopes are not public [unclear]

### Rate limits
- Not publicly documented [unclear — must be in gated docs]

### Webhooks
- Supported
- Webhook management API exists (register / update / delete endpoints
  via API rather than dashboard)
- Event catalogue not public [unclear — likely includes `link.clicked`,
  `email.captured`, `product.sold`, `tip.received` but unconfirmed]

### GraphQL vs REST
- Both referenced in APITracker's feature list; the "GraphQL playground"
  suggests a GraphQL surface exists even if REST is the primary path

## Community / third-party APIs (NOT official)

Because the official API is gated, a cottage industry of unofficial
scrapers has emerged:

- **Keosariel Linktree-API** (Python) — scrapes a public Linktree page
  and returns its link list + metadata.
  [source: https://github.com/keosariel/Linktree-API]
- **Postman LinkTree API Implementation** (community Postman workspace)
  documenting an unofficial / community-reverse-engineered API.
  [source: https://documenter.getpostman.com/view/14039622/Tzsik4P8]
- **Scrape Creators — Linktree Page API** — commercial scraper-as-a-
  service offering a "Linktree page API" that returns structured data
  from any public profile. [source:
  https://docs.scrapecreators.com/v1/linktree/]
- **Apify — Linktree Profile Listing Scraper** — Apify actor that
  crawls Linktree directory / public pages. [source:
  https://apify.com/ecomscrape/linktree-profile-listing-scraper/api]
- **linktree-api GitHub topic** — active open-source reverse-engineering
  community. [source: https://github.com/topics/linktree-api]

These exist precisely because the official API is closed — organic
market demand for programmatic access exists but Linktree has not
opened the gate publicly.

## Cross-product footprint

- **Buttondown** (email-newsletter tool) ships a Linktree integration
  from its own side [source:
  https://docs.buttondown.com/linktree] — typically an iframe-embed or
  link-out, not an API call
- **Zapier** sits at the other end of the Linktree triggers surface
  [unclear — Zapier is a paid-tier integration per talkspresso]

## Impact on SaaS product strategy

From a **competitive-research** lens (not recommendation):

- A closed API means creators using Linktree cannot freely export their
  link data, page config, or analytics to another tool — lock-in by
  opacity
- A **tadaify-style competitor that ships a public, documented REST
  API + webhook catalogue on day one** has a clear differentiation angle
  that infra-minded creators and agencies would value
- Scraper prevalence suggests real unmet demand for programmatic link
  list / analytics access

## Data export for users (GDPR surface)

Separate from the developer API, creators can request a data export of
their own Linktree under GDPR Art. 20 (portability). The mechanism is
documented in "Security and Policies" help articles rather than
programmatically [source: help-centre structure per
talkspresso]. Format, latency, and completeness of export [unclear —
verify].

## Sources

- [Linktree developer expression of interest](https://linktr.ee/marketplace/developer)
- [Linktree /api page](https://linktr.ee/api)
- [APITracker — Linktree](https://apitracker.io/a/linktr-ee)
- [Postman — LinkTree API Implementation](https://documenter.getpostman.com/view/14039622/Tzsik4P8)
- [keosariel/Linktree-API GitHub](https://github.com/keosariel/Linktree-API)
- [linktree-api GitHub topic](https://github.com/topics/linktree-api)
- [Scrape Creators — Linktree page API](https://docs.scrapecreators.com/v1/linktree/)
- [Apify — Linktree Profile Listing Scraper](https://apify.com/ecomscrape/linktree-profile-listing-scraper/api)
- [Buttondown — Linktree integration](https://docs.buttondown.com/linktree)
