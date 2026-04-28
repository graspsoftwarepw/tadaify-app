#!/usr/bin/env python3
"""
SessionStart hook: lightweight preflight ritual.

Fires automatically at the start of every Claude Code session.
Auto-detects whether the current repo is a "docs repo" (has docs/decisions/
or legacy doc monoliths) and, if so, emits a 1-page Markdown brief
as system-reminder context.

Design constraints:
  * NON-BLOCKING: always exit 0, never prevent a session from starting.
  * FAST (<1s): no gh API calls, no network I/O, no spec greps.
  * IDEMPOTENT: running multiple times in the same repo gives the same output.
  * SILENT: if docs/decisions/ is absent AND no legacy docs found, prints nothing.

Triggered by DEC-DOC-05 = 2 (auto-detect via test -d docs/decisions)
and DEC-277 = 1 (SessionStart hook, 2026-04-28).

For full preflight (gh + grep + research): /preflight
For pending dashboard: /pending
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
        Path.home() / "git" / "claude-project-orchestrator" / "projects.json",
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
# Helper: count and list recent decisions
# ---------------------------------------------------------------------------

def get_recent_decisions(decisions_dir: Path, n: int = 3) -> list[tuple[str, str]]:
    """Return [(filename, first_h1_line), ...] for the N most recently modified .md files."""
    if not decisions_dir.is_dir():
        return []
    md_files = sorted(
        decisions_dir.glob("*.md"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )[:n]
    result = []
    for f in md_files:
        heading = ""
        try:
            for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
                stripped = line.strip()
                if stripped.startswith("# "):
                    heading = stripped[2:].strip()
                    break
        except OSError:
            pass
        result.append((f.name, heading or "(no heading)"))
    return result


def count_decisions(decisions_dir: Path) -> int:
    if not decisions_dir.is_dir():
        return 0
    return len(list(decisions_dir.glob("*.md")))


# ---------------------------------------------------------------------------
# Helper: count pending DECs for this repo in decisions.json
# ---------------------------------------------------------------------------

def count_pending_decs(repo_name: str) -> int:
    decisions_path = Path("/tmp/claude-decisions/decisions.json")
    if not decisions_path.is_file():
        return 0
    try:
        data = json.loads(decisions_path.read_text())
    except (OSError, json.JSONDecodeError):
        return 0
    pending = [
        d for d in (data.get("decisions") or [])
        if d.get("status") == "pending"
        and d.get("repo") in (repo_name, "orchestrator")
    ]
    return len(pending)


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
    decisions_dir = repo_root / "docs" / "decisions"
    legacy_br = repo_root / "docs" / "BUSINESS_REQUIREMENTS.md"
    legacy_tr = repo_root / "docs" / "TECHNICAL_REQUIREMENTS.md"
    specs_dir = repo_root / "docs" / "specs"

    has_decisions = decisions_dir.is_dir()
    has_legacy = legacy_br.is_file() or legacy_tr.is_file() or specs_dir.is_dir()

    if not has_decisions and not has_legacy:
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
    decisions_count = count_decisions(decisions_dir)
    doc_parts: list[str] = []
    if has_decisions:
        doc_parts.append(f"{decisions_count} records in docs/decisions/")
    if legacy_br.is_file():
        doc_parts.append("legacy BUSINESS_REQUIREMENTS.md present")
    if legacy_tr.is_file():
        doc_parts.append("legacy TECHNICAL_REQUIREMENTS.md present")
    if has_decisions and (legacy_br.is_file() or legacy_tr.is_file()):
        doc_parts.append("⚠ MADR migration pending (DEC-DOC-13/14)")
    doc_state = " + ".join(doc_parts) if doc_parts else "no recognised doc structure"

    # Pending DECs
    pending_count = count_pending_decs(repo_name)

    # Recent decisions (top 3)
    recent = get_recent_decisions(decisions_dir)

    # Date
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Board label
    board_label = f"#{ board_num}" if board_num else "(not in projects.json)"

    # -----------------------------------------------------------------------
    # Emit brief
    # -----------------------------------------------------------------------
    lines: list[str] = [
        "## SessionStart preflight (light)",
        f"Project: {project_name} (board {board_label}) | Repo: {repo_name} | Branch: {branch} | Date: {today}",
        "",
        f"Doc state: {doc_state}",
        f"Pending DECs (this repo + orchestrator): {pending_count}",
    ]

    if recent:
        lines.append("Recent decisions (top 3 by mtime):")
        for fname, heading in recent:
            lines.append(f"  - {fname} — {heading}")
    else:
        lines.append("Recent decisions: (none — docs/decisions/ empty or absent)")

    lines += [
        "",
        "For full preflight (gh + grep + research): /preflight",
        "For pending dashboard: /pending",
    ]

    print("\n".join(lines))
    sys.exit(0)


if __name__ == "__main__":
    main()
