#!/usr/bin/env python3
"""
PreToolUse guard: validate that `supabase/seed.sql` still applies after any
Write or Edit to a file under `supabase/migrations/**`.

Why this exists:
  * Schema changes that drop a column or rename a table silently break
    `supabase/seed.sql` — every subsequent `supabase db reset` ends with
    an empty DB, zero test users, and a flurry of confused "nothing works"
    Slack messages.
  * Pre-PR gates already catch this, but by then the author has written
    the migration, committed, and often moved on. This hook catches the
    drift at the exact keystroke that introduced it.

Behavior:
  * Fires only for Write / Edit tool calls (matcher narrows to Write|Edit
    at the settings.json layer, this script does path filtering).
  * Path filter: tool_input.file_path must match `supabase/migrations/.*\\.sql$`.
  * Opt-out: if the post-write file content's first non-whitespace line is
    `-- seed-validator: skip`, the hook allows the write without running
    the seed check.
  * If Supabase / Docker is not available locally, the hook warns but
    allows (pre-PR gate will catch it proper).
  * Runs `supabase db reset --no-seed` + `psql -f supabase/seed.sql`.
    Timeout 60s total. On pass → exit 0. On fail → permissionDecision
    = "deny" with a human-readable reason.

To override the hook in a real emergency, edit `.claude/settings.json`
in the target repo and remove the PreToolUse entry whose command is
`.claude/hooks/seed-validator-pretool.py`. Document why in the next commit.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

MIGRATION_PATH_RE = re.compile(r"supabase/migrations/[^/]+\.sql$")
SKIP_MARKER = "-- seed-validator: skip"
TIMEOUT_SECONDS = 60


def emit_decision(decision: str, reason: str) -> None:
    """Emit PreToolUse decision JSON on stdout and exit 0."""
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": decision,
            "permissionDecisionReason": reason,
        }
    }
    print(json.dumps(payload))
    sys.exit(0)


def allow() -> None:
    """Pass through silently."""
    sys.exit(0)


def warn(msg: str) -> None:
    """Print warning to stderr but allow the tool call."""
    print(f"[seed-validator] WARN: {msg}", file=sys.stderr)
    sys.exit(0)


def first_nonblank_line(text: str) -> str:
    for line in text.splitlines():
        s = line.strip()
        if s:
            return s
    return ""


def extract_pending_content(tool_name: str, tool_input: dict) -> str | None:
    """
    Return the post-edit content of the migration file, or None if we can't
    determine it (in which case we conservatively run the check).
    """
    if tool_name == "Write":
        return tool_input.get("content", "")
    if tool_name == "Edit":
        # For Edit we can't cheaply reconstruct the full post-edit file, but
        # we can peek at the new_string for a skip marker. If it's present,
        # honour it; otherwise fall through and run the check.
        new = tool_input.get("new_string", "") or ""
        old = tool_input.get("old_string", "") or ""
        # Only short-circuit on a positive skip marker; never short-circuit
        # when we genuinely don't know what the final file looks like.
        if SKIP_MARKER in new or SKIP_MARKER in old:
            return new  # probably contains the marker; caller will re-check
        return None
    return None


def has_skip_marker(file_path: Path, pending_content: str | None) -> bool:
    """
    Check whether the opt-out marker is present, either in the pending
    content (Write) or in the file on disk (Edit fallback / best-effort).
    """
    if pending_content is not None and SKIP_MARKER in pending_content:
        # Honour it only if it's on the first non-blank line of the pending content.
        first = first_nonblank_line(pending_content)
        if first == SKIP_MARKER:
            return True
    # Fall back to on-disk content — catches the Edit case where the marker
    # was already in the file.
    try:
        text = file_path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return False
    return first_nonblank_line(text) == SKIP_MARKER


def supabase_available(cwd: Path) -> tuple[bool, str]:
    """Return (ok, reason). ok=False means we should warn + allow."""
    if shutil.which("supabase") is None:
        return False, "supabase CLI not on PATH"
    if shutil.which("docker") is None:
        return False, "docker CLI not on PATH"
    # Quick docker-daemon check — cheap.
    try:
        r = subprocess.run(
            ["docker", "info"],
            cwd=cwd,
            capture_output=True,
            timeout=5,
        )
        if r.returncode != 0:
            return False, "docker daemon unreachable"
    except (subprocess.TimeoutExpired, OSError) as exc:
        return False, f"docker info failed: {exc}"
    return True, ""


def resolve_db_port(cwd: Path) -> str | None:
    try:
        r = subprocess.run(
            ["supabase", "status", "--output", "json"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (subprocess.TimeoutExpired, OSError):
        return None
    if r.returncode != 0:
        return None
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        return None
    db_url = data.get("DB_URL", "") or ""
    m = re.search(r":(\d+)/", db_url)
    return m.group(1) if m else None


def tail(text: str, lines: int = 50) -> str:
    return "\n".join(text.splitlines()[-lines:])


def run_check(cwd: Path, migration_rel: str) -> None:
    """Run db reset + seed. Emit deny on failure, exit 0 on pass."""
    ok, reason = supabase_available(cwd)
    if not ok:
        warn(
            f"skipping seed check ({reason}); pre-PR gate will catch drift. "
            f"Allowing Write/Edit on {migration_rel}."
        )

    db_port = resolve_db_port(cwd)
    if db_port is None:
        warn(
            "could not resolve local Supabase DB port (is it started?); "
            f"skipping seed check for {migration_rel}. Pre-PR gate will catch drift."
        )

    # 1. supabase db reset --no-seed
    try:
        r = subprocess.run(
            ["supabase", "db", "reset", "--no-seed"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        emit_decision(
            "deny",
            f"SEED-VALIDATOR BLOCK\n"
            f"  migration: {migration_rel}\n"
            f"  stage:     db-reset\n"
            f"  exit_code: timeout ({TIMEOUT_SECONDS}s)\n"
            f"  hint: `supabase db reset --no-seed` did not complete in time. "
            f"Investigate migrations for infinite loops or unresponsive Docker.",
        )
    if r.returncode != 0:
        emit_decision(
            "deny",
            f"SEED-VALIDATOR BLOCK\n"
            f"  migration: {migration_rel}\n"
            f"  stage:     db-reset\n"
            f"  exit_code: {r.returncode}\n"
            f"  stderr (last 50 lines):\n{tail(r.stderr)}\n"
            f"  hint: migration itself is broken — check ordering, FK refs, column types.",
        )

    # 2. psql -f supabase/seed.sql
    seed_path = cwd / "supabase" / "seed.sql"
    if not seed_path.is_file():
        # No seed to validate — nothing to block on.
        sys.exit(0)

    db_url = f"postgresql://postgres:postgres@127.0.0.1:{db_port}/postgres"
    try:
        r = subprocess.run(
            ["psql", db_url, "-v", "ON_ERROR_STOP=1", "-f", str(seed_path)],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        emit_decision(
            "deny",
            f"SEED-VALIDATOR BLOCK\n"
            f"  migration: {migration_rel}\n"
            f"  stage:     seed\n"
            f"  exit_code: timeout ({TIMEOUT_SECONDS}s)\n"
            f"  hint: seed.sql did not complete — check for missing PG extensions.",
        )
    except FileNotFoundError:
        warn("psql not on PATH; cannot validate seed. Pre-PR gate will catch drift.")
    if r.returncode != 0:
        emit_decision(
            "deny",
            f"SEED-VALIDATOR BLOCK\n"
            f"  migration: {migration_rel}\n"
            f"  stage:     seed\n"
            f"  exit_code: {r.returncode}\n"
            f"  stderr (last 50 lines):\n{tail(r.stderr)}\n"
            f"  hint: seed.sql references a column/table/constraint that this migration "
            f"changed. Either update seed.sql to match, or add `{SKIP_MARKER}` as the "
            f"first line of the migration if this PR will also rewrite seed.sql.",
        )

    sys.exit(0)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if tool_name not in ("Write", "Edit"):
        sys.exit(0)

    tool_input = data.get("tool_input", {}) or {}
    file_path_str = tool_input.get("file_path", "") or ""
    if not file_path_str:
        sys.exit(0)

    # Normalise path-separator to forward-slash for regex match.
    norm = file_path_str.replace(os.sep, "/")
    if not MIGRATION_PATH_RE.search(norm):
        sys.exit(0)

    file_path = Path(file_path_str)
    cwd = Path.cwd()

    pending = extract_pending_content(tool_name, tool_input)
    if has_skip_marker(file_path, pending):
        # Opt-out honoured — allow the write silently.
        sys.exit(0)

    # Use the migration's path relative to cwd for the error message.
    try:
        migration_rel = str(file_path.resolve().relative_to(cwd.resolve()))
    except ValueError:
        migration_rel = file_path_str

    run_check(cwd, migration_rel)


if __name__ == "__main__":
    main()
