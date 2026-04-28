# Technical Requirements — tadaify

Technical conventions, patterns, and architectural decisions. Numbered TR-NNN. Referenced in feature PRs and Playwright tests via `// Covers: TR-NNN` comments.

## TR Index

### MUST (hard constraints)

| ID | Title | Description |
|----|-------|-------------|
| TR-001 | Cloudflare-native stack | Frontend hosted on Cloudflare Pages; API workers via Cloudflare Workers; Workers AI binding for AI features. |
| TR-002 | Vite + React 19 + TypeScript | SPA built with Vite, React 19, TypeScript strict mode. |
| TR-003 | Tailwind CSS v4 | Styling via `@tailwindcss/vite` plugin; brand tokens imported from `mockups/tadaify-mvp/shared/tokens.css`. |
| TR-004 | Supabase backend | Auth (GoTrue), Postgres DB, Realtime, Storage via Supabase. Local dev uses Docker (`supabase start`). |
| TR-005 | Supabase port-band 5435X | Local Supabase binds api=54351, db=54352, studio=54353, inbucket=54354, analytics=54357, pooler=54359. |
| TR-006 | Email confirmations enabled | `[auth.email] enable_confirmations = true` in config.toml. Every auth flow tested e2e via Inbucket (port 54354). |
| TR-007 | Supabase write guard hook | `.claude/hooks/block-supabase-writes.py` + `.claude/settings.json` installed. All schema changes via `supabase/migrations/`. |
| TR-008 | Migrations-as-source-of-truth | Every DB change ships a migration in `supabase/migrations/<timestamp>_<name>.sql`. `docs/schema.sql` mirrors consolidated DDL. |
| TR-009 | Per-test seed users | Pattern: `test-<story-id>-<scenario>@local.test` / `TestPass123!`. No shared fixtures. |
| TR-010 | Wrangler for local CF dev | `wrangler.toml` defines name, compatibility date, pages output dir. Workers AI binding `AI` commented until AI Suggest story. |

### SHOULD (strong recommendations)

| ID | Title | Description |
|----|-------|-------------|
| TR-011 | Unit tests in CI | Lambda/Worker unit tests (`node --test`, `vitest`) run in every deploy workflow before packaging. Playwright stays local-only. |

### MAY (optional, project-specific)

| ID | Title | Description |
|----|-------|-------------|
| — | — | (none yet) | — |
