---
id: TR-006
type: tr
status: accepted
date: 2026-04-28
level: MUST
topics: [guard, hooks, block, supabase]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-28
---

# TR-006 — Guard hooks: `block-supabase-writes.py` blocks all Supabase MCP write tools.

> **Level:** MUST

`seed-validator-pretool.py` blocks migration writes that drift from `seed.sql`.

## Migration note

Migrated from `docs/TECHNICAL_REQUIREMENTS.md` on 2026-04-29; see git history for prior context.