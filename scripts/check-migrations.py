#!/usr/bin/env python3
"""Post-cutoff migration gate.

Standard: agents-local/skills/grasp-app-structure/reference/migrations.md.
Adopted in tadaify-app via issue #309 (epic #303).

Binds ONLY migrations whose 14-digit timestamp is strictly greater than the
grandfather cutoff recorded in docs/app-structure.yml (migrations.cutoff). The 19
pre-cutoff legacy files are exempt — they are never inspected for headers and
MUST stay byte-for-byte untouched.

For every post-cutoff migration the gate requires:
  1. All 8 mandatory header keys present:
     Module, Feature, Issue, Summary, Tables, GDPR-impact, Depends-on, Post-steps.
  2. Non-empty Feature with at least one BR-* / TR-* reference.
  3. Module token matches the <module> token in the filename.
  4. docs/schema.sql touched in the same change set (git diff against a base ref).
  5. GDPR pair when GDPR-impact is ticked [x] user-data:
       - delete_user_data() changed in the diff, AND
       - "re-deploy user-export-data" present in Post-steps.
  6. supabase/MIGRATIONS.md is in sync with the headers.

Exit 0 = pass, 1 = one or more gate failures.

Usage:
  python3 scripts/check-migrations.py                 # diff against origin/main
  python3 scripts/check-migrations.py --base HEAD~1
  python3 scripts/check-migrations.py --no-diff        # header/index checks only
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
STRUCTURE_YML = REPO_ROOT / "docs" / "app-structure.yml"
SCHEMA_REL = "docs/schema.sql"

# A migration filename is <ts>_<module>_<verb_noun>.sql where BOTH the module and
# the verb_noun may contain underscores, so the filename alone cannot tell where
# the module ends. The header `Module:` is the authority; here we only assert the
# overall shape (timestamp + at least two underscore-joined lowercase tokens) and
# verify the module as a prefix segment below.
FILENAME_RE = re.compile(r"^(\d{14})_([a-z][a-z0-9_]*[a-z0-9])\.sql$")
HEADER_KEY_RE = re.compile(r"^\s*\*\s*([A-Za-z-]+):\s*(.*?)\s*$")
BRTR_RE = re.compile(r"\b(?:BR|TR)-[A-Za-z0-9_-]+")

REQUIRED_KEYS = [
    "Module",
    "Feature",
    "Issue",
    "Summary",
    "Tables",
    "GDPR-impact",
    "Depends-on",
    "Post-steps",
]


def read_cutoff() -> str:
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
            if re.match(r"^\S", line):
                break
    sys.exit("ERROR: migrations.cutoff not found in docs/app-structure.yml")


def parse_header(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.lstrip().startswith("/*") or "*/" not in text:
        return {}
    block = text[text.index("/*") + 2 : text.index("*/")]
    out: dict[str, str] = {}
    for line in block.splitlines():
        m = HEADER_KEY_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out


def git_diff_names(base: str | None) -> set[str] | None:
    """Files changed vs base ref (+ uncommitted). None if diff unavailable."""
    if base is None:
        return None
    names: set[str] = set()
    for args in (["diff", "--name-only", base], ["diff", "--name-only"], ["diff", "--name-only", "--cached"]):
        try:
            r = subprocess.run(
                ["git", "-C", str(REPO_ROOT), *args],
                capture_output=True, text=True, check=False,
            )
        except FileNotFoundError:
            return None
        if r.returncode != 0:
            return None
        names.update(n for n in r.stdout.splitlines() if n.strip())
    return names


def git_diff_text(base: str | None) -> str:
    if base is None:
        return ""
    out = []
    for args in (["diff", base], ["diff"], ["diff", "--cached"]):
        r = subprocess.run(
            ["git", "-C", str(REPO_ROOT), *args],
            capture_output=True, text=True, check=False,
        )
        if r.returncode == 0:
            out.append(r.stdout)
    return "\n".join(out)


def check() -> int:
    cutoff = read_cutoff()
    failures: list[str] = []

    files = sorted(p.name for p in MIGRATIONS_DIR.glob("*.sql"))
    post_cutoff = []
    for name in files:
        ts = name[:14]
        if ts.isdigit() and ts > cutoff:
            post_cutoff.append(name)

    if not post_cutoff:
        print(f"check-migrations: no post-cutoff migrations (cutoff {cutoff}); nothing to gate.")

    # Diff context (for schema.sql-touched and GDPR-pair gates).
    base = ARGS.base if not ARGS.no_diff else None
    changed = git_diff_names(base)
    diff_text = git_diff_text(base)
    diff_available = changed is not None
    schema_touched = diff_available and SCHEMA_REL in changed
    delete_user_data_changed = bool(re.search(r"^\+.*delete_user_data", diff_text, re.M))

    for name in post_cutoff:
        path = MIGRATIONS_DIR / name
        fm = FILENAME_RE.match(name)
        if not fm:
            failures.append(f"{name}: filename does not match YYYYMMDDHHMMSS_<module>_<verb_noun>.sql")
            continue
        ts = fm.group(1)
        header = parse_header(path)

        for key in REQUIRED_KEYS:
            if key not in header:
                failures.append(f"{name}: missing header key '{key}'")

        feature = header.get("Feature", "")
        if not feature or "NNN" in feature or not BRTR_RE.search(feature):
            failures.append(f"{name}: Feature must be non-empty with >=1 BR-*/TR-* ref (got: '{feature}')")

        # Module/filename agreement. Both module and verb_noun may contain
        # underscores, so the filename split is ambiguous — the header is the
        # authority. Require the filename to start <ts>_<module_lower>_… (the
        # module as a prefix segment, with a non-empty verb_noun after it).
        mod = header.get("Module", "").strip().lower()
        if mod:
            expected_prefix = f"{ts}_{mod}_"
            if not (name.startswith(expected_prefix) and len(name) > len(expected_prefix) + len(".sql")):
                failures.append(
                    f"{name}: Module '{mod}' is not a prefix segment of the filename "
                    f"(expected it to start '{expected_prefix}')"
                )

        for k in ("Issue", "Summary", "Tables", "Depends-on", "Post-steps"):
            if k in header and (not header[k] or "NNN" in header[k]):
                failures.append(f"{name}: header key '{k}' is empty or a placeholder")

        gdpr = header.get("GDPR-impact", "")
        gdpr_user_data = bool(re.search(r"\[x\]\s*user-data", gdpr, re.I))
        if gdpr_user_data:
            if diff_available and not delete_user_data_changed:
                failures.append(f"{name}: GDPR-impact [x] user-data but delete_user_data() not changed in diff")
            if "re-deploy user-export-data" not in header.get("Post-steps", "").lower():
                failures.append(f"{name}: GDPR-impact [x] user-data requires 're-deploy user-export-data' in Post-steps")

        # schema.sql-touched gate (only meaningful when this migration is part of the diff).
        if diff_available and f"supabase/migrations/{name}" in changed and not schema_touched:
            failures.append(f"{name}: post-cutoff migration changed but {SCHEMA_REL} not touched in the same change set")

    # Index freshness.
    gen = subprocess.run(
        ["python3", str(REPO_ROOT / "scripts" / "gen-migrations-index.py"), "--check"],
        capture_output=True, text=True, check=False,
    )
    if gen.returncode != 0:
        failures.append("supabase/MIGRATIONS.md is stale — run scripts/gen-migrations-index.sh")

    if not diff_available and base is not None:
        print(f"check-migrations: WARNING — git diff vs '{base}' unavailable; "
              "schema.sql-touched and GDPR delete_user_data() gates skipped.")

    if failures:
        print("check-migrations: FAIL")
        for f in failures:
            print(f"  - {f}")
        return 1

    print(f"check-migrations: PASS ({len(post_cutoff)} post-cutoff migration(s) gated, cutoff {cutoff}).")
    return 0


def main() -> int:
    global ARGS
    ap = argparse.ArgumentParser(description="Post-cutoff migration gate (#309).")
    ap.add_argument("--base", default="origin/main", help="git base ref for the diff (default: origin/main)")
    ap.add_argument("--no-diff", action="store_true", help="skip diff-based gates (header/index only)")
    ARGS = ap.parse_args()
    return check()


if __name__ == "__main__":
    raise SystemExit(main())
