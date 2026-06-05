# Technical Requirements — INDEX

> **Auto-generated** on 2026-06-05 by `bin/migrate-records.mjs --kind=tr`.
> Do NOT hand-edit this file. Edit the individual TR records in `docs/requirements/technical/`.
> To add a new TR: create `docs/requirements/technical/NNNN-<slug>.md` with MADR frontmatter.

## All Technical Requirements

| ID | Level | Title |
|----|-------|-------|
| [TR-APPDASHBOARD-001](requirements/technical/0022-tr-tadaify-005-app-dashboard-ssr-contract.md) | MUST | App Dashboard SSR-first contract |
| [TR-APPSETTINGS-001](requirements/technical/0025-tr-tadaify-004-tier-persistence-semantics.md) | MUST | Tier persistence semantics on top of TR-tadaify-007 |
| [TR-AUTH-001](requirements/technical/0014-tr-auth-01-email-otp-login-uses-dedicated-login-otp-endpoint.md) | MUST | Login email-OTP uses `/api/auth/login-otp` (not signup endpoint) |
| [TR-AUTH-002](requirements/technical/0015-tr-auth-02-verify-returns-access-token-for-password-setup.md) | MUST | `POST /api/auth/verify` response includes `access_token` |
| [TR-AUTH-003](requirements/technical/0016-tr-auth-03-handle-race-pre-check-in-verify.md) | MUST | Handle race-condition pre-check in `POST /api/auth/verify` |
| [TR-AUTH-004](requirements/technical/0017-tr-auth-04-handle-reserve-profiles-pre-check.md) | MUST | Handle reservation must check `profiles` table before inserting |
| [TR-AUTH-005](requirements/technical/0018-tr-auth-05-supabase-profiles-table-service-role-insert-only.md) | MUST | `profiles` table: service-role INSERT only; RLS own-row for select/update |
| [TR-AUTH-006](requirements/technical/0019-tr-auth-06-handle-otp-meta-stored-in-raw-user-meta-data.md) | MUST | Handle + tos_version stored in `raw_user_meta_data` at OTP send time |
| [TR-AUTH-007](requirements/technical/0021-tr-tadaify-002-auth-email-templates.md) | MUST | Auth email templates contract |
| [TR-ONBOARDING-001](requirements/technical/0023-tr-tadaify-006-onboarding-preview-pane-event-contract.md) | MUST | Onboarding preview-pane event/state contract |
| [TR-ONBOARDING-002](requirements/technical/0024-tr-tadaify-003-r2-avatar-pipeline-contract.md) | MUST | R2 avatar pipeline contract |
| [TR-PUBLICPAGES-001](requirements/technical/0028-tr-tadaify-009-public-render-edge-cache.md) | MUST | Public-render edge cache contract |
| [TR-PUBLICPAGES-002](requirements/technical/0029-tr-tadaify-010-cache-purge-on-crud.md) | MUST | Cache purge on block CRUD |
| [TR-SHARED-001](requirements/technical/0001-tr-001-framework-react-router-7-remix-merged-in-framework-mo.md) | MUST | Framework: React Router 7 (Remix-merged) in framework mode (`ssr: true`), adapter `@react-router/cloudflare` |
| [TR-SHARED-002](requirements/technical/0002-tr-002-runtime-cloudflare-workers-not-pages.md) | MUST | Runtime: Cloudflare Workers (NOT Pages). |
| [TR-SHARED-003](requirements/technical/0003-tr-003-styling-tailwind-css-v4-via-tailwindcss-vite.md) | MUST | Styling: Tailwind CSS v4 via `@tailwindcss/vite`. |
| [TR-SHARED-004](requirements/technical/0004-tr-004-database-supabase-local-docker-on-port-band-5435x-dev.md) | MUST | Database: Supabase (local Docker on port-band 5435X; DEV/PROD via Supabase hosted). |
| [TR-SHARED-005](requirements/technical/0005-tr-005-email-local-dev-supabase-inbucket-on-port-54354.md) | MUST | Email (local dev): Supabase Inbucket on port 54354. |
| [TR-SHARED-006](requirements/technical/0006-tr-006-guard-hooks-block-supabase-writes-py-blocks-all-supab.md) | MUST | Guard hooks: `block-supabase-writes.py` blocks all Supabase MCP write tools. |
| [TR-SHARED-007](requirements/technical/0007-tr-007-supabase-mcp-read-only-in-all-sessions.md) | MUST | Supabase MCP: read-only in all sessions. |
| [TR-SHARED-008](requirements/technical/0008-tr-008-language-typescript-everywhere.md) | MUST | Language: TypeScript everywhere. |
| [TR-SHARED-009](requirements/technical/0009-tr-009-no-github-workflows-in-this-repo-yet-local-only-phase.md) | MUST | No `.github/workflows/` in this repo yet — local-only phase. |
| [TR-SHARED-010](requirements/technical/0010-tr-010-every-commit-body-starts-with-claude-commit-line-huma.md) | MUST | Every commit body starts with `Claude commit:` line (human-scannable attribution). |
| [TR-SHARED-011](requirements/technical/0011-tr-011-google-fonts-loaded-via-links-export-in-app-root-tsx-.md) | SHOULD | Google Fonts loaded via `links` export in `app/root.tsx` (no `@import url()` in CSS — avoids render-blocking in Workers SSR) |
| [TR-SHARED-012](requirements/technical/0012-tr-012-cloudflare-workers-ai-binding-ai-configured-in-wrangl.md) | SHOULD | Cloudflare Workers AI binding (`AI`) configured in `wrangler.jsonc` [ai] block |
| [TR-SHARED-013](requirements/technical/0013-tr-013-supabase-edge-functions-for-server-side-operations-th.md) | MAY | Supabase Edge Functions for server-side operations that need the service role key (GDPR export, account deletion) |
| [TR-SHARED-014](requirements/technical/0020-tr-tadaify-001-unit-test-ci-gate.md) | MUST | Unit-test CI gate; Playwright stays local |
| [TR-SHARED-015](requirements/technical/0024-tr-tadaify-007-profile-extras-shared-data-contract.md) | MUST | `profile_extras` shared data contract |
| [TR-SHARED-016](requirements/technical/0026-tr-tadaify-008-radix-dialog-canonical.md) | MUST | Radix UI Dialog as canonical modal/dialog primitive |
| [TR-SHARED-017](requirements/technical/0027-tr-tadaify-014-icon-libraries-lucide-react-simple-icons.md) | MUST | Icon libraries: lucide-react + simple-icons (DEC-378=A) |

---

*Generated from 30 MADR records in `docs/requirements/technical/`.*
