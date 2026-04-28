---
type: competitor-research
project: tadaify
competitor: carrd
title: Carrd — public API
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Carrd — public API, SDKs, webhooks

## TL;DR

**Carrd does NOT offer a public REST API or webhook catalogue.**
However, Carrd is the ONLY competitor in this research set that
grants creators **actual ownership of their generated source code**
via the Pro Plus source-download feature.

## Confirmed programmatic surfaces

- **Form submissions → Zapier / Google Sheets / Mailchimp** — first-
  class destinations for form data (Pro Standard+)
- **Form webhooks** — [unclear — Pro Plus may allow custom webhook
  endpoints on form submit; verify]
- **Custom JavaScript** — on Pro Plus, creators can inject arbitrary
  JS which can call external APIs (effectively opening unlimited
  programmatic surface downstream)
- **Source download** — Pro Plus creators get HTML/CSS/JS download of
  their entire site; this is effectively a "data portability" API in
  static form

## Not offered

- No developer portal / OAuth app surface
- No published REST API for site config / page content / analytics
- No SDKs
- No public webhook catalogue for events like `site.published`
- No marketplace for third-party Carrd-specific apps

## Community / third-party

- Carrd's `carrd.co/docs` community forum has creators trading
  custom-code snippets
- GitHub: searches for "carrd embeds" surface indie projects like
  custom Carrd sections and themes
- No dedicated scraper ecosystem (unlike Linktree) because Carrd
  pages are private-domain-hosted rather than subdomain-centralised

## Strategic position

Carrd's "we don't have an API, but we give you your code" posture is
unique and **arguably stronger** than a half-baked API. Creators who
need programmatic control can leave Carrd and self-host, which means
Carrd users experience LOWER lock-in than ANY other tool in this
research set.

## Sources

- [Carrd docs](https://carrd.co/docs)
- [Carrd Pro page](https://carrd.co/pro)
- [Carrd Pro plans doc](https://carrd.co/docs/pro/plans)
- [nocode.mba — Carrd 2026](https://www.nocode.mba/articles/carrd-pricing)
