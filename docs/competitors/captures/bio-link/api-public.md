---
type: competitor-research
project: tadaify
competitor: bio-link
title: Bio.link / Hopp — public API
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Bio.link (Hopp by Wix) — public API, SDKs, webhooks

## TL;DR

**Hopp does NOT publish a public creator-facing API as of April
2026.** No developer portal, no OpenAPI spec, no SDK repositories
under either Wix's or Name.com's GitHub orgs for Hopp specifically.

Programmatic access is theoretically possible through:
- Wix's Velo / Wix platform API — if Hopp exposes its data models
  through Velo, creators could script against them [unclear — verify
  whether Hopp data is accessible via Wix's developer platform]
- Stripe webhooks — creators can subscribe to their own Stripe events
  for payment data
- [unclear — no Zapier connector for Hopp surfaced in search]

## Disambiguation note

Search for "bio.link API" commonly returns:
- **Bio**.link scrapers (third-party, unofficial)
- The **ncbi.nlm.nih.gov Bio**Link (bioscience citation tool — not
  related)
- Wix's broader API

None of these are an official Hopp creator API.

## Community / unofficial access

Third-party Hopp/bio.link scraping is minimal compared to Linktree —
probably because Hopp's smaller market share means less commercial
incentive for scraper authors.

## Strategic takeaway

Hopp inherits Wix's "platform-closed" posture. For an agency-
oriented tadaify entrant that wants to sync Hopp page data with
internal BI tools, that's impossible today.

## Sources

- [name.com/hopp](https://www.name.com/hopp)
- [Wix support — Hopp configuration](https://support.wix.com/en/article/hopp-by-wix-adding-and-managing-actions-for-link-in-bio)
