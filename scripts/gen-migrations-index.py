#!/usr/bin/env python3
"""Generate supabase/MIGRATIONS.md — the module-keyed migration index.

Standard: agents-local/skills/grasp-app-structure/reference/migrations.md §3.
Adopted in tadaify-app via issue #309.

The index is GENERATED, never hand-edited. It must reproduce byte-identical from
the current set of migration headers, so the output is fully deterministic:

- The generation date stamp is the latest migration's date (derived from the
  newest YYYYMMDDHHMMSS filename), NOT today's wall-clock — otherwise the file
  would change every day and could not be verified byte-identical.
- Post-cutoff migrations (timestamp > cutoff in docs/app-structure.yml) are
  parsed for their `Module` + `Summary` header keys and grouped by module.
- The 19 pre-cutoff legacy files have no header; they are listed verbatim under a
  single `Legacy (grandfathered, pre-cutoff)` section, ordered by filename.

Usage:
  python3 scripts/gen-migrations-index.py            # write supabase/MIGRATIONS.md
  python3 scripts/gen-migrations-index.py --check    # exit 1 if out of date
  python3 scripts/gen-migrations-index.py --stdout   # print, do not write
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
INDEX_PATH = REPO_ROOT / "supabase" / "MIGRATIONS.md"
STRUCTURE_YML = REPO_ROOT / "docs" / "app-structure.yml"

FILENAME_RE = re.compile(r"^(\d{14})_(.+)\.sql$")
HEADER_KEY_RE = re.compile(r"^\s*\*\s*([A-Za-z-]+):\s*(.*?)\s*$")


def read_cutoff() -> str:
    """Read migrations.cutoff from docs/app-structure.yml (string, no PyYAML dep)."""
    in_migrations = False
    for raw in STRUCTURE_YML.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line:
            continue
        if re.match(r"^migrations:\s*$", line):
            in_migrations = True
            continue
        if in_migrations:
            m = re.match(r"^\s+cutoff:\s*(\d{14})\s*$", line)
            if m:
                return m.group(1)
            # leaving the migrations: block (a new top-level key) → stop
            if re.match(r"^\S", line):
                break
    raise SystemExit("ERROR: migrations.cutoff not found in docs/app-structure.yml")


def parse_header(path: Path) -> dict[str, str]:
    """Extract the leading /* ... */ header block's key/value pairs."""
    text = path.read_text(encoding="utf-8")
    if not text.lstrip().startswith("/*"):
        return {}
    block = text[text.index("/*") + 2 : text.index("*/")] if "*/" in text else ""
    out: dict[str, str] = {}
    for line in block.splitlines():
        m = HEADER_KEY_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def build() -> str:
    files = sorted(p.name for p in MIGRATIONS_DIR.glob("*.sql"))
    cutoff = read_cutoff()

    legacy: list[str] = []
    modules: dict[str, list[tuple[str, str]]] = {}

    for name in files:
        m = FILENAME_RE.match(name)
        if not m:
            continue
        ts = m.group(1)
        if ts <= cutoff:
            legacy.append(name)
            continue
        header = parse_header(MIGRATIONS_DIR / name)
        module = header.get("Module", "").strip().lower() or "_unkeyed"
        summary = header.get("Summary", "").strip() or "(no Summary in header)"
        modules.setdefault(module, []).append((name, summary))

    # Date stamp derived from the newest migration filename (deterministic).
    newest_ts = max((FILENAME_RE.match(n).group(1) for n in files if FILENAME_RE.match(n)), default="")
    stamp = f"{newest_ts[0:4]}-{newest_ts[4:6]}-{newest_ts[6:8]}" if newest_ts else "(none)"

    lines: list[str] = []
    lines.append("# Migrations index")
    lines.append("")
    lines.append(
        f"Generated from migration headers (do not hand-edit — run "
        f"`scripts/gen-migrations-index.sh`). Latest migration: {stamp}."
    )
    lines.append("")

    for module in sorted(modules):
        lines.append(f"## {module}")
        for name, summary in sorted(modules[module]):
            lines.append(f"- {name} — {summary}")
        lines.append("")

    lines.append("## Legacy (grandfathered, pre-cutoff)")
    lines.append("")
    lines.append(
        f"The {len(legacy)} migrations at or before cutoff `{cutoff}` predate the "
        f"header standard (issue #309) and are exempt — never rewritten or "
        f"back-filled. Listed by filename."
    )
    lines.append("")
    for name in sorted(legacy):
        lines.append(f"- {name}")
    lines.append("")

    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate supabase/MIGRATIONS.md")
    ap.add_argument("--check", action="store_true", help="exit 1 if the index is stale")
    ap.add_argument("--stdout", action="store_true", help="print to stdout, do not write")
    args = ap.parse_args()

    content = build()

    if args.stdout:
        sys.stdout.write(content)
        return 0

    if args.check:
        current = INDEX_PATH.read_text(encoding="utf-8") if INDEX_PATH.exists() else ""
        if current != content:
            sys.stderr.write(
                "ERROR: supabase/MIGRATIONS.md is out of date. "
                "Run scripts/gen-migrations-index.sh.\n"
            )
            return 1
        return 0

    INDEX_PATH.write_text(content, encoding="utf-8")
    sys.stderr.write(f"Wrote {INDEX_PATH.relative_to(REPO_ROOT)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
