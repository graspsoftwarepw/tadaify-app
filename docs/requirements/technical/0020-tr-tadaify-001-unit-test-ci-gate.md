---
id: TR-tadaify-001
type: tr
status: accepted
date: 2026-05-02
level: MUST
topics: [ci, github-actions, unit-tests, typecheck, build]
supersedes: [TR-009]
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-05-02
---

# TR-tadaify-001 — Unit-test CI gate; Playwright stays local

> **Level:** MUST

Codifies global memory rules (`feedback_ci_unit_tests_allowed.md`, `feedback_no_ci_tests.md`) as a tadaify-local TR for grep-traceability (`// Covers: TR-tadaify-001`).

**Supersedes TR-009** ("No .github/workflows/ in this repo yet — local-only phase"). CI added in issue #152 / PR feat/ci-unit-workflow-152.

## Acceptance criteria

1. Workflow fires on `pull_request` targeting `main` + `push` to `main` events.
2. Steps include `npm ci`, `npm run typecheck`, `npm test` (vitest run), `npm run build` — in that order.
3. ZERO Playwright / e2e tests in CI — Playwright stays LOCAL per `feedback_no_ci_tests.md`.
4. `workflow_dispatch` trigger present + `.github/workflows/ci.yml` is NOT in `paths-ignore` (self-path rule per `feedback_workflow_dispatch.md`).

## Additional constraints

- Node 24+ per `feedback_node_version.md`.
- Minimal permissions: `contents: read` only per `feedback_minimal_permissions.md`.
- `paths-ignore` skips `**.md`, `mockups/**`, `claude-reports/**`, `docs/**` — doc-only PRs do NOT consume build minutes (ECN-CI-UNIT-01).
- Concurrency group per branch (`cancel-in-progress: true`) prevents stacked runs from eating budget (ECN-CI-UNIT-06).
- Time budget: < 90 s warm cache, < 3 min cold cache (ECN-CI-UNIT-05).

## Canonical reference

Canonical Lambda CI pattern: `untiltify-aws#147` (`npm ci → node --test → npm prune --omit=dev → terraform`).
Frontend variant used here: drop terraform, add typecheck + build.

## Migration note

Introduced 2026-05-02 via issue #152. Supersedes TR-009 which was a placeholder noting CI had not been added yet.
