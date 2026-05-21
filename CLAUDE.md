# Claude operating contract - `tadaify-app`

This file is the default context router for Claude Code in this repository.
Keep it small. Load detailed context only when the task touches that area.

## Always Active

- Responses to the Owner: Polish.
- Code, comments, identifiers, commit messages, PR bodies, and docs: English.
- Never merge. Manual Owner merge is always required.
- Never commit directly to `main`. All work uses a feature branch and PR.
- Use repository branch naming, branch-issue links, Conventional Commits, and
  the required 7-section PR body contract before creating or updating PRs.
- Do not use GitHub CLI (`gh`) or GitHub connector fallback flows. GitHub
  automation must use the per-agent GitHub App identity resolved from
  `graspsoftwarepw/agents-team`.
- Pilot approval gate: before edits, labels, branch creation, PRs, agent
  dispatch, deploy changes, or merge-adjacent actions, provide a plan and wait
  for Owner approval. Full process contract lives in
  `graspsoftwarepw/agents-team`.
- New work starts from latest `main` in an isolated branch/worktree. If the repo
  is dirty or `main` cannot fast-forward, stop and report the blocker.
- Pricing and tier-gating are hard guardrails: Category C fake-margin gating is
  forbidden. Load full context before touching pricing, billing, analytics SQL,
  tier permissions, or paid/free feature copy.
- Marketing pillars locked on 2026-04-26 and Phase A/Phase B sequencing are
  hard product constraints. Load full context before touching marketing copy,
  branding, insights, multi-handle/Phase B scope, or DEC-084+ work.

## Context Loading

- Full pre-split repository instructions are preserved in
  `docs/agent-context/claude-full-context.md`.
- Open that full context before changing app architecture, build/test commands,
  deployment, external integrations, auth, storage, UI conventions, or process
  automation, product pricing, branding, marketing pillars, or PR/process
  contracts.
- For narrow inspection, tests, or small docs edits, read only the relevant
  source files plus the specific section of the full context you need.

Do not preload every referenced document. Read the minimum file set that proves
the decision or implementation.

## Token Hygiene

- Before broad search, exclude generated or archived context:
  `--glob '!node_modules/**' --glob '!.claude/worktrees/**' --glob '!exports/**'`
  `--glob '!dist/**' --glob '!build/**' --glob '!coverage/**'`.
- Do not run `rg` from repo root against `.claude`, `.codex`, Hermes logs, or
  exported dashboards unless that directory is the explicit target.
- For `.jsonl` sessions or logs, write a small parser that prints counts and the
  relevant top records. Do not dump large logs into the model.
- For secrets/auth diagnostics, print key names and present/missing status only.
- Prefer `rg --files` plus targeted file reads over recursive grep.

## Durable Notes

If a feature changes product behavior, technical contracts, verification plans,
or long-term operating rules, update the relevant durable doc or state why no
doc change is needed.
