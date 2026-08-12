# tadaify-app

A creator link-in-bio platform: public creator pages at `/<handle>` and an authenticated creator dashboard at `/app`. React Router 7 runs on Cloudflare Workers with Supabase-backed auth and data.

## Local Workflow

- Keep this file repo-specific. Do not duplicate global Grasp GitHub, worktree, language, or review rules here.
- Load only the local docs needed for the task.

## Project Context

- `npm run setup` bootstraps the local stack.
- `npm run dev` runs the app.
- `npm run test` runs Vitest.
- `npm run test:e2e:local` acquires/inherits global Docker capacity, starts a seeded ephemeral
  Supabase stack in the worktree's reserved port band, runs Playwright, and removes only that stack.
  It never starts, resets, or stops the fixed-port main stack.
- Deeper context: `docs/agent-context/claude-full-context.md`.
