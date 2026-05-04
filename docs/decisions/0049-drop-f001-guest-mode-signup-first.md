---
id: 0049
aliases: ["DEC-355"]
status: accepted
date: 2026-05-04
supersedes: []
superseded_by: null
topics: [onboarding, guest-mode, signup-flow, f-001]
---

# Drop F-001 guest-mode editor — tadaify is signup-first (DEC-355=C)

## Context

F-001 specified a Carrd-inspired guest-mode editor at `tadaify.com/try`: visitors could
build a full page without signing up, with a `guest_drafts` table storing drafts keyed
to a UUID cookie (60-day TTL), migrated to a real page on signup. The rationale was
friction reduction (pattern `PAT-067`, Carrd-only).

During F-002 progressive signup audit (tadaify-app#181), F-001 was surfaced as a
dependency for AC 1.6 ("Given visitor is in guest-mode editor (F-001) when signing up,
draft migrates"). The user explicitly killed this resurfacing and was furious it re-appeared
after being killed in an earlier session.

DEC-355 was answered C = "Drop entirely. Signup first, no guest mode, ever."

## Decision

**F-001 guest-mode editor + `guest_drafts` data pattern are permanently dropped from the
tadaify roadmap.**

- No `/try` route.
- No `guest_drafts` table.
- No draft migration on signup.
- No unauth editor surface.
- Tadaify adopts the **Linktree/Beacons signup-first model**: visitors must sign up before
  accessing the editor.

This decision is **irrevocable**. Do NOT re-litigate, propose "lite guest mode", or
resurrect any form of pre-auth editing. If a future session proposes it, cite this record
and reject.

## Consequences

- `app/routes/_index.tsx` FAQ — removed the guest-mode promise from "How fast can I
  launch?" answer. Replaced with accurate signup-first copy.
- `docs/specs/functional-spec.md` §3.1 — F-001 section tombstoned with DEC-355=C note.
- `docs/specs/functional-spec.md` routing table — `tadaify.com/try` marked REMOVED.
- `docs/changelog.md` — cleanup entry added citing DEC-355=C.
- `claude-startup-ideas#8` (F-002 progressive signup) — AC 1.6 removed; F-001 dependency
  removed; DEC-355=C note added.
- Memory rule `feedback_tadaify_no_guest_mode_drafts.md` — permanent kill switch.
- Tests: U1 (`_index.test.tsx`) + S1/S2 (`landing-no-guest-mode.spec.ts`) verify the
  removal at the code level.

## Rationale

The competitive moat from guest-mode (Carrd-only pattern) was not worth the complexity:

1. `guest_drafts` table = extra schema, extra API routes, cookie management, TTL cleanup
   jobs, draft-migration logic, and a separate auth state that all downstream features
   (themes, block editor, social import) must handle.
2. Linktree and Beacons (the direct comp set) are signup-first and dominate the market.
   Signup friction is solved better by the handle-preview on the landing (live
   `tadaify.com/<handle>` wordmark materializes as you type) — zero extra implementation.
3. The user decision was explicit and twice-confirmed. Surfacing it again wastes DEC budget
   and trust.

## Provenance

- DEC-355=C answered: 2026-05-04
- Original alias: DEC-355
- Cleanup issue: tadaify-app#184
- Memory rule: `feedback_tadaify_no_guest_mode_drafts.md`
- Parallel cleanup: DEC-346=C (Apple SSO drop) — tadaify-app#183
