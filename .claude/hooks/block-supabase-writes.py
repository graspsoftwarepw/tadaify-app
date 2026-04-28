#!/usr/bin/env python3
"""
PreToolUse guard: block ALL write operations against Supabase MCP servers.

Why this exists:
  * The OAuth Supabase connector on claude.ai exposes write tools without
    any --read-only flag — it is server-side full-access.
  * The PAT-based MCP server in .mcp.json could theoretically be rewritten
    by Claude (drop the --read-only flag) before the user notices.
  * This hook is the only enforcement layer that survives Claude touching
    config files. It runs INSIDE the Claude Code harness on every tool
    call, before the tool executes.

Behavior:
  * For tools matching `mcp__supabase__*` or
    `mcp__1ddc824f-49c7-4807-9390-f3af643bae04__*` (the OAuth connector's
    UUID prefix):
      - Hard-block any tool in WRITE_TOOLS.
      - For execute_sql: allow only read-only verbs (SELECT/EXPLAIN/SHOW/
        WITH/TABLE/VALUES) at the start of the query, OR queries that
        wrap the work in BEGIN ... ROLLBACK (sandboxed test pattern).
  * Anything else: pass through (exit 0, no decision).

To override the hook in a real emergency, the user can disable it via
the /hooks UI or by editing .claude/settings.json. Both leave a paper
trail.
"""

from __future__ import annotations

import json
import re
import sys

WRITE_TOOLS = {
    "apply_migration",
    "deploy_edge_function",
    "create_branch",
    "delete_branch",
    "merge_branch",
    "rebase_branch",
    "reset_branch",
    "create_project",
    "pause_project",
    "restore_project",
    "confirm_cost",
}

SUPABASE_PREFIXES = (
    "mcp__supabase__",
    "mcp__1ddc824f-49c7-4807-9390-f3af643bae04__",
)

READ_ONLY_VERBS = ("SELECT", "EXPLAIN", "SHOW", "WITH", "TABLE", "VALUES")


def is_supabase_tool(name: str) -> bool:
    return any(name.startswith(p) for p in SUPABASE_PREFIXES)


def short_name(name: str) -> str:
    for p in SUPABASE_PREFIXES:
        if name.startswith(p):
            return name[len(p):]
    return name


def strip_sql_preamble(query: str) -> str:
    """Remove leading whitespace, BOM, line comments, block comments."""
    q = query.lstrip("\ufeff").lstrip()
    while True:
        if q.startswith("--"):
            nl = q.find("\n")
            q = q[nl + 1:].lstrip() if nl != -1 else ""
        elif q.startswith("/*"):
            end = q.find("*/")
            q = q[end + 2:].lstrip() if end != -1 else ""
        else:
            break
    return q


def is_read_only_sql(query: str) -> bool:
    q = strip_sql_preamble(query)
    if not q:
        return False
    head = q[:20].upper()
    return any(re.match(rf"\b{verb}\b", head) for verb in READ_ONLY_VERBS)


def is_sandboxed_test(query: str) -> bool:
    """Allow a query that explicitly wraps everything in BEGIN..ROLLBACK."""
    upper = query.upper()
    return "BEGIN" in upper and "ROLLBACK" in upper and "COMMIT" not in upper


def block(reason: str) -> None:
    """Emit PreToolUse block decision and exit."""
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }
    print(json.dumps(payload))
    sys.exit(0)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Don't break on malformed input — let the harness handle it
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if not is_supabase_tool(tool_name):
        sys.exit(0)

    short = short_name(tool_name)

    if short in WRITE_TOOLS:
        block(
            f"BLOCKED by .claude/hooks/block-supabase-writes.py: "
            f"Supabase MCP write tool '{short}' is forbidden. All schema "
            f"and data changes must go through supabase/migrations/ and "
            f"the deploy-prod GitHub Actions workflow. To override in a "
            f"real emergency, disable this hook in .claude/settings.json "
            f"and document why in the next commit."
        )

    if short == "execute_sql":
        query = data.get("tool_input", {}).get("query", "") or ""
        if is_read_only_sql(query):
            sys.exit(0)
        if is_sandboxed_test(query):
            sys.exit(0)
        block(
            "BLOCKED by .claude/hooks/block-supabase-writes.py: "
            "Supabase execute_sql appears to be a write query. "
            "Allowed verbs (after stripping comments/whitespace): "
            f"{', '.join(READ_ONLY_VERBS)}. To verify a write statement's "
            "syntax against a live database, wrap it in BEGIN ... ROLLBACK. "
            "For real changes, write a migration in supabase/migrations/."
        )

    # Other supabase read tools (list_tables, get_advisors, etc.) — pass through
    sys.exit(0)


if __name__ == "__main__":
    main()
