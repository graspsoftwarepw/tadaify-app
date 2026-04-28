---
id: 0015
aliases: ["DEC-Q5-C"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [preview-generator, mvp-scope, parsers]
---

# Linktree-only preview parser at MVP; Beacons/Stan/Bio.link at M+0.5

## Context

The preview generator needs to parse competitor profiles to build tadaify previews.
Building parsers for all 4 competitors at MVP is high-risk due to HTML drift; each
parser needs weekly regression tests. Linktree is the dominant competitor and primary
target for acquisition outreach.

## Decision

MVP launches with Linktree-only parsing (F-PREVIEW-003). Beacons, Stan, and Bio.link
parsers are M+0.5 (~week +2 post-launch):
- F-PREVIEW-010: Beacons HTML parser
- F-PREVIEW-011: Stan Store HTML parser
- F-PREVIEW-012: Bio.link HTML parser

## Consequences

- Admin outreach at MVP targets Linktree creators only.
- Linktree parser must have weekly regression tests from day 1 (Linktree HTML drift risk).
- M+0.5 parsers are fast to build (S: 2-3 days each) once Linktree pattern is established.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L353, L1361, L1486; `docs/decisions/INDEX.md`
- Original ID: DEC-Q5-C
- Locked: 2026-04-24
