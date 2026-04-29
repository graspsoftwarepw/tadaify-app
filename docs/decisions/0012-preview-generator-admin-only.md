---
id: 0012
aliases: ["DEC-MKT-B-v2"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [marketing, preview-generator, admin]
---

# Preview generator is admin-only tool — not a public endpoint

## Context

The preview generator is a marketing acquisition tool: admin pastes a competitor's
creator URL, customizes a tadaify preview, sends it privately 1-to-1. An earlier design
considered a public `tadaify.com/preview/<handle>` URL. That would collide with the
creator handle namespace (DEC-DOMAIN-01) and create a mass-harvesting scraping risk.

## Decision

The preview generator is an **admin-only private marketing tool** at
`tadaify.com/admin/marketing/preview-generator`. There is no `tadaify.com/preview/<handle>`
public URL. Generated previews are served at `preview.tadaify.com/<slug>?ref=<hash>`
(kept on subdomain specifically to prevent handle-namespace collision) and sent privately
1-to-1.

Preview disclosure strip is mandatory at the TOP of every preview page: "Preview only —
this page is not live. tadaify built this from [target's] public Linktree as a one-time
preview for them." Admin cannot disable. (DEC-ANTI-011)

## Consequences

- Preview generator is gated behind admin auth only.
- `preview.tadaify.com` subdomain justified by handle-namespace collision avoidance.
- Remove-on-request form at `preview.tadaify.com/remove/<slug>` — target confirms via
  email-match → preview deleted + admin notified + target blacklisted from future outreach.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L351, L1483
- Original ID: DEC-MKT-B-v2
- Locked: 2026-04-24
