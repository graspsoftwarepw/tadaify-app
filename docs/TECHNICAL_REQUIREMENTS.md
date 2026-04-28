# Technical Requirements — tadaify

This file documents technical conventions, patterns, and architectural decisions that govern implementation. Every new convention introduced by a PR must be added here (enforced by `feature-checklist §1b`).

## TR Index

### MUST (non-negotiable)

| ID | Requirement |
|---|---|
| TR-001 | Framework: React Router 7 (Remix-merged) in framework mode (`ssr: true`), adapter `@react-router/cloudflare`. |
| TR-002 | Runtime: Cloudflare Workers (NOT Pages). SSR for public creator pages; CSR for authenticated dashboard after hydration. |
| TR-003 | Styling: Tailwind CSS v4 via `@tailwindcss/vite`. Brand tokens imported from `mockups/tadaify-mvp/shared/tokens.css`. |
| TR-004 | Database: Supabase (local Docker on port-band 5435X; DEV/PROD via Supabase hosted). All schema changes via `supabase/migrations/`. |
| TR-005 | Email (local dev): Supabase Inbucket on port 54354. Every auth flow tested e2e through Inbucket — never seeded pre-confirmed users. |
| TR-006 | Guard hooks: `block-supabase-writes.py` blocks all Supabase MCP write tools. `seed-validator-pretool.py` blocks migration writes that drift from `seed.sql`. |
| TR-007 | Supabase MCP: read-only in all sessions. All writes via migrations + CI. |
| TR-008 | Language: TypeScript everywhere. No `any` in new code — use `unknown` + type-guards. |
| TR-009 | No `.github/workflows/` in this repo yet — local-only phase. CI added in a separate story. |
| TR-010 | Every commit body starts with `Claude commit:` line (human-scannable attribution). Every PR comment starts with `Claude comment:`. |

### SHOULD

| ID | Requirement |
|---|---|
| TR-011 | Google Fonts loaded via `links` export in `app/root.tsx` (no `@import url()` in CSS — avoids render-blocking in Workers SSR). |
| TR-012 | Cloudflare Workers AI binding (`AI`) configured in `wrangler.jsonc` [ai] block — uncomment when implementing F-AI-SUGGEST. |

### MAY

| ID | Requirement |
|---|---|
| TR-013 | Supabase Edge Functions for server-side operations that need the service role key (GDPR export, account deletion). |
