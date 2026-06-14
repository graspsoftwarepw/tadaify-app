#!/usr/bin/env python3
"""
SessionStart hook: lightweight preflight ritual.

Fires automatically at the start of every Claude Code session.
Auto-detects whether the current repo is a "docs repo" (has legacy doc
monoliths or a specs dir) and, if so, emits a short Markdown brief
as system-reminder context.

Design constraints:
  * NON-BLOCKING: always exit 0, never prevent a session from starting.
  * FAST (<1s): no gh API calls, no network I/O, no spec greps.
  * IDEMPOTENT: running multiple times in the same repo gives the same output.
  * SILENT: if no recognised doc structure is found, prints nothing.

For full preflight (gh + grep + research): /preflight
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Helper: resolve project name + board number from projects.json
# ---------------------------------------------------------------------------

def load_projects_json() -> dict:
    candidates = [
        Path(__file__).parent.parent / "projects.json",  # relative to hooks/
    ]
    for p in candidates:
        if p.is_file():
            try:
                return json.loads(p.read_text())
            except (OSError, json.JSONDecodeError):
                pass
    return {}


def resolve_project(repo_name: str, projects: dict) -> tuple[str, str]:
    """Return (project_name, board_number_str) or ('unknown', '') if not found."""
    for pname, pdata in (projects.get("projects") or {}).items():
        repos = pdata.get("repos") or []
        if repo_name in repos:
            num = pdata.get("github_project_number")
            return pname, (str(num) if num else "")
    return "unknown", ""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # SessionStart hook receives JSON on stdin (same harness as other hooks)
    try:
        hook_data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        hook_data = {}

    # Resolve CWD from hook input or environment fallback
    project_dir = (
        hook_data.get("cwd")
        or os.environ.get("CLAUDE_PROJECT_DIR")
        or os.getcwd()
    )
    repo_root = Path(project_dir)

    # -----------------------------------------------------------------------
    # Auto-detect: should we fire the brief?
    # -----------------------------------------------------------------------
    legacy_br = repo_root / "docs" / "BUSINESS_REQUIREMENTS.md"
    legacy_tr = repo_root / "docs" / "TECHNICAL_REQUIREMENTS.md"
    specs_dir = repo_root / "docs" / "specs"

    has_legacy = legacy_br.is_file() or legacy_tr.is_file() or specs_dir.is_dir()

    if not has_legacy:
        # Silent exit — not a docs repo
        sys.exit(0)

    # -----------------------------------------------------------------------
    # Gather info
    # -----------------------------------------------------------------------
    repo_name = repo_root.name

    projects = load_projects_json()
    project_name, board_num = resolve_project(repo_name, projects)

    # Branch
    branch = "(unknown)"
    try:
        import subprocess  # noqa: PLC0415
        result = subprocess.run(
            ["git", "symbolic-ref", "--short", "HEAD"],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            timeout=2,
        )
        if result.returncode == 0:
            branch = result.stdout.strip()
    except Exception:  # noqa: BLE001
        pass

    # Doc state
    doc_parts: list[str] = []
    if legacy_br.is_file():
        doc_parts.append("legacy BUSINESS_REQUIREMENTS.md present")
    if legacy_tr.is_file():
        doc_parts.append("legacy TECHNICAL_REQUIREMENTS.md present")
    if specs_dir.is_dir():
        doc_parts.append("docs/specs/ present")
    doc_state = " + ".join(doc_parts) if doc_parts else "no recognised doc structure"

    # Date
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Board label
    board_label = f"#{board_num}" if board_num else "(not in projects.json)"

    # -----------------------------------------------------------------------
    # Emit brief
    # -----------------------------------------------------------------------
    lines: list[str] = [
        "## SessionStart preflight (light)",
        f"Project: {project_name} (board {board_label}) | Repo: {repo_name} | Branch: {branch} | Date: {today}",
        "",
        f"Doc state: {doc_state}",
        "",
        "For full preflight (gh + grep + research): /preflight",
    ]

    print("\n".join(lines))
    sys.exit(0)


if __name__ == "__main__":
    main()
