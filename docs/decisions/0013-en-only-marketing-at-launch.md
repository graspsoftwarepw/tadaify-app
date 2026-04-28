---
id: 0013
aliases: ["DEC-MKT-C"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [marketing, localization, language]
---

# EN-only marketing at launch; PL deferred to Y2+

## Context

tadaify targets nano/micro creators globally with particular strength in Poland. PL
localization (UI copy, PL-culture template names like Chopin/Kopernik/Skłodowska, and
PL outreach templates) requires translation effort and cultural adaptation. The question
is whether to invest in PL marketing at MVP or defer.

## Decision

**EN-only marketing at launch.** PL copy, PL-culture template names (Chopin/Kopernik/
Skłodowska), and PL outreach templates (IG DM copy, email sequences) are deferred to
Y2+ pending organic PL pull.

Affected:
- Template naming at MVP: neutral/brand-neutral (e.g., "Indigo", "Dusk", "Minimal",
  "Bold", "Earth")
- Admin outreach workflow (F-PREVIEW-007): EN-only DM copy + email copy
- F-235 bilingual AI footer: still ships MVP (pre-authored queries for ChatGPT/Claude/Gemini)

Infrastructure (Przelewy24/BLIK, VAT OSS, PLN currency, PL legal docs) ships MVP.

## Consequences

- PL creators can use the product at MVP but marketing is EN-only.
- PL market expansion at Y2+ when organic pull signal is strong enough.
- Template names: neutral at MVP. No PL-culture naming until Y2+.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L54; `docs/decisions/INDEX.md`
- Original ID: DEC-MKT-C
- Locked: 2026-04-24
