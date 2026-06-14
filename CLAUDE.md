# tadaify-app

A creator link-in-bio platform: public creator pages at `/<handle>` and an authenticated creator dashboard at `/app`. React Router 7 runs on Cloudflare Workers with Supabase-backed auth and data.

## Identity

- Default Grasp GitHub App identity for Claude in this repo: `grasp-spiderman` (Junior Developer).

## Local Workflow

- Use the global Claude instructions from `~/.claude/CLAUDE.md`.
- Keep this file repo-specific. Do not duplicate global Grasp GitHub, worktree, language, or review rules here.
- Load only the local docs needed for the task.

## Project Context

- `npm run setup` bootstraps the local stack.
- `npm run dev` runs the app.
- `npm run test` runs Vitest.
- `npm run test:e2e:local` resets the local DB and runs Playwright e2e.
- Deeper context: `docs/agent-context/claude-full-context.md`.
