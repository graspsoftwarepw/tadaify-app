# Technical Requirements — INDEX

> **Auto-generated** on 2026-04-29 by `bin/migrate-records.mjs --kind=tr`. Updated 2026-04-29 with TR-AUTH-01..06 (F-REGISTER-001a Slice B).
> Do NOT hand-edit this file. Edit the individual TR records in `docs/requirements/technical/`.
> To add a new TR: create `docs/requirements/technical/NNNN-<slug>.md` with MADR frontmatter.

## All Technical Requirements

| ID | Level | Title |
|----|-------|-------|
| [TR-001](requirements/technical/0001-tr-001-framework-react-router-7-remix-merged-in-framework-mo.md) | MUST | Framework: React Router 7 (Remix-merged) in framework mode (`ssr: true`), adapter `@react-router/cloudflare` |
| [TR-002](requirements/technical/0002-tr-002-runtime-cloudflare-workers-not-pages.md) | MUST | Runtime: Cloudflare Workers (NOT Pages). |
| [TR-003](requirements/technical/0003-tr-003-styling-tailwind-css-v4-via-tailwindcss-vite.md) | MUST | Styling: Tailwind CSS v4 via `@tailwindcss/vite`. |
| [TR-004](requirements/technical/0004-tr-004-database-supabase-local-docker-on-port-band-5435x-dev.md) | MUST | Database: Supabase (local Docker on port-band 5435X; DEV/PROD via Supabase hosted). |
| [TR-005](requirements/technical/0005-tr-005-email-local-dev-supabase-inbucket-on-port-54354.md) | MUST | Email (local dev): Supabase Inbucket on port 54354. |
| [TR-006](requirements/technical/0006-tr-006-guard-hooks-block-supabase-writes-py-blocks-all-supab.md) | MUST | Guard hooks: `block-supabase-writes.py` blocks all Supabase MCP write tools. |
| [TR-007](requirements/technical/0007-tr-007-supabase-mcp-read-only-in-all-sessions.md) | MUST | Supabase MCP: read-only in all sessions. |
| [TR-008](requirements/technical/0008-tr-008-language-typescript-everywhere.md) | MUST | Language: TypeScript everywhere. |
| [TR-009](requirements/technical/0009-tr-009-no-github-workflows-in-this-repo-yet-local-only-phase.md) | ~~MUST~~ | ~~No `.github/workflows/` in this repo yet — local-only phase.~~ **Superseded by TR-tadaify-001** |
| [TR-010](requirements/technical/0010-tr-010-every-commit-body-starts-with-claude-commit-line-huma.md) | MUST | Every commit body starts with `Claude commit:` line (human-scannable attribution). |
| [TR-011](requirements/technical/0011-tr-011-google-fonts-loaded-via-links-export-in-app-root-tsx-.md) | SHOULD | Google Fonts loaded via `links` export in `app/root.tsx` (no `@import url()` in CSS — avoids render-blocking in Workers SSR) |
| [TR-012](requirements/technical/0012-tr-012-cloudflare-workers-ai-binding-ai-configured-in-wrangl.md) | SHOULD | Cloudflare Workers AI binding (`AI`) configured in `wrangler.jsonc` [ai] block |
| [TR-013](requirements/technical/0013-tr-013-supabase-edge-functions-for-server-side-operations-th.md) | MAY | Supabase Edge Functions for server-side operations that need the service role key (GDPR export, account deletion) |
| [TR-AUTH-01](requirements/technical/0014-tr-auth-01-email-otp-login-uses-dedicated-login-otp-endpoint.md) | MUST | Login email-OTP uses `/api/auth/login-otp` (not signup endpoint) |
| [TR-AUTH-02](requirements/technical/0015-tr-auth-02-verify-returns-access-token-for-password-setup.md) | MUST | `POST /api/auth/verify` response includes `access_token` for downstream password setup |
| [TR-AUTH-03](requirements/technical/0016-tr-auth-03-handle-race-pre-check-in-verify.md) | MUST | Handle race-condition pre-check in `POST /api/auth/verify` before profiles INSERT |
| [TR-AUTH-04](requirements/technical/0017-tr-auth-04-handle-reserve-profiles-pre-check.md) | MUST | Handle reservation must check `profiles` table before inserting into `handle_reservations` |
| [TR-AUTH-05](requirements/technical/0018-tr-auth-05-supabase-profiles-table-service-role-insert-only.md) | MUST | `profiles` table: service-role INSERT only; RLS own-row for select/update |
| [TR-AUTH-06](requirements/technical/0019-tr-auth-06-handle-otp-meta-stored-in-raw-user-meta-data.md) | MUST | Handle + tos\_version stored in `raw_user_meta_data` at OTP send time |
| [TR-tadaify-001](requirements/technical/0020-tr-tadaify-001-unit-test-ci-gate.md) | MUST | Unit-test CI gate; Playwright stays local (supersedes TR-009) |

---

*Generated from 20 MADR records in `docs/requirements/technical/`.*
