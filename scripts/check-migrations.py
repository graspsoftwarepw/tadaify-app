#!/usr/bin/env python3
"""Post-cutoff migration gate.

Standard: docs/MIGRATION_GUIDE.md.
Adopted in tadaify-app via issue #309 (epic #303).

Binds ONLY migrations whose 14-digit timestamp is strictly greater than the
grandfather cutoff recorded in supabase/migration-cutoff. The 19
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
CUTOFF_FILE = REPO_ROOT / "supabase" / "migration-cutoff"
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
    """Read the grandfather cutoff (a single 14-digit timestamp) from
    supabase/migration-cutoff. Lines may carry `#` comments; blank lines are ignored."""
    for raw in CUTOFF_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if re.fullmatch(r"\d{14}", line):
            return line
    sys.exit(f"ERROR: no 14-digit cutoff timestamp found in {CUTOFF_FILE.relative_to(REPO_ROOT)}")


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


# Start of a delete_user_data definition, e.g.
#   CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
# Matches with or without the leading diff marker ('+'/'-'/' ') so we can both
# detect an ADDED definition (the strongest signal) and track the body scope
# across unchanged context lines.
DELETE_FN_DEF_BARE_RE = re.compile(
    r"^[+\- ]?\s*create\s+(?:or\s+replace\s+)?function\b[^\n]*\bdelete_user_data\b",
    re.I,
)


def _is_sql_comment_content(content: str) -> bool:
    """True if the diff-line content (after the leading +) is a SQL/header
    comment rather than executable SQL. Covers the C-style header block
    (`/* ... * GDPR: ... delete_user_data() ... */`), `--` line comments, and
    `#`-style notes. These must never count as a real function change."""
    s = content.strip()
    if not s:
        return False
    return s.startswith(("*", "/*", "*/", "--", "#"))


def delete_user_data_changed_in_diff(diff_text: str) -> bool:
    """Detect a genuine delete_user_data() *function* change in the diff.

    A mere mention of the literal string ``delete_user_data`` is NOT enough: the
    migration header comment emitted by bin/new-migration.sh contains
    ``delete_user_data()`` in its GDPR-impact guidance, so matching any ``^\\+``
    line that references the name produces a false PASS for a [x] user-data
    migration that never touches the function (PR #315 reviewer finding).

    We require a real signal, ignoring SQL/header comment lines:
      * an ADDED (``^\\+``) ``create or replace function … delete_user_data``
        definition line — the unambiguous signal, OR
      * an ADDED non-comment line *inside* a ``delete_user_data`` definition whose
        body content references ``delete_user_data`` (the definition may itself be
        an unchanged context line, so scope is tracked across context lines too).

    The migration header comment (``* GDPR-impact: … delete_user_data() …``) and
    the guideline block are comment lines and are skipped, so a [x] user-data
    migration that only mentions the name in its header no longer passes.
    """
    in_def_body = False  # inside a delete_user_data definition (any line origin)
    for raw in diff_text.splitlines():
        # Diff/file headers carry no SQL content.
        if raw.startswith(("+++", "---", "diff ", "@@", "index ")):
            continue
        origin = raw[:1]
        if origin not in ("+", "-", " "):
            # A non-hunk line (e.g. blank separator) cannot open/close a body.
            continue
        content = raw[1:]

        # Definition start (with or without the diff marker) opens the body
        # window; an added definition line is itself the strongest signal.
        if DELETE_FN_DEF_BARE_RE.match(raw):
            in_def_body = True
            if origin == "+":
                return True

        if origin == "+" and not _is_sql_comment_content(content):
            if in_def_body and "delete_user_data" in content.lower():
                return True

        # Close the body window at the function terminator: a line that is only
        # the closing dollar-quote (``$$`` or ``$$;``). The *opening* tag appears
        # as ``… AS $$`` on the signature line and must NOT close the window, so
        # we match the terminator as a standalone token, not any trailing ``$$``.
        if in_def_body and content.strip().rstrip(";") == "$$":
            in_def_body = False
    return False


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
    delete_user_data_changed = delete_user_data_changed_in_diff(diff_text)

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


def _self_test() -> int:
    """Regression tests for delete_user_data_changed_in_diff (PR #315 finding).

    Models the exact unified-diff text `git diff origin/main` emits for a
    committed migration. Case 1 (header/comment mention only) is the bug: the old
    ``re.search(r"^\\+.*delete_user_data", …)`` returned True here, wrongly
    PASSing a [x] user-data migration that never touched the function. Case 1 must
    now be False; Case 2 (a real function-body change) must be True.
    """
    header_only = (
        "+++ b/supabase/migrations/20260601120000_profile_extras_add_test_col.sql\n"
        "@@ -0,0 +1,7 @@\n"
        "+/*\n"
        "+ * GDPR-impact:  [x] user-data -> delete_user_data() + user-export-data updated\n"
        "+ */\n"
        "+--    delete_user_data(), and re-deploy user-export-data (record in Post-steps).\n"
        "+ALTER TABLE public.profile_extras ADD COLUMN nickname text;\n"
    )
    real_fn = header_only + (
        "+\n"
        "+CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)\n"
        "+  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$\n"
        "+BEGIN\n"
        "+  DELETE FROM profile_extras WHERE user_id = p_user_id;\n"
        "+END;\n"
        "+$$;\n"
    )
    # Definition is an unchanged context line; the body gains an added line that
    # references the function — still a real change.
    body_only = (
        "@@ -1,5 +1,6 @@\n"
        " CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid) AS $$\n"
        " BEGIN\n"
        "+  DELETE FROM profile_extras WHERE user_id = p_user_id;  -- delete_user_data extension\n"
        " END;\n"
        " $$;\n"
    )
    cases = [
        ("header/comment mention only -> no real change", header_only, False),
        ("real create-or-replace delete_user_data body", real_fn, True),
        ("added body line referencing the function", body_only, True),
        ("empty diff", "", False),
        (
            "removed line mentioning the name only",
            "-  DELETE FROM old;  -- delete_user_data cleanup\n+  SELECT 1;\n",
            False,
        ),
    ]
    failed = 0
    for label, diff, expected in cases:
        got = delete_user_data_changed_in_diff(diff)
        status = "ok  " if got == expected else "FAIL"
        if got != expected:
            failed += 1
        print(f"  [{status}] {label}: got={got} expected={expected}")
    if failed:
        print(f"check-migrations self-test: {failed} case(s) FAILED")
        return 1
    print("check-migrations self-test: all cases passed")
    return 0


def main() -> int:
    global ARGS
    ap = argparse.ArgumentParser(description="Post-cutoff migration gate (#309).")
    ap.add_argument("--base", default="origin/main", help="git base ref for the diff (default: origin/main)")
    ap.add_argument("--no-diff", action="store_true", help="skip diff-based gates (header/index only)")
    ap.add_argument(
        "--self-test",
        action="store_true",
        help="run the delete_user_data() diff-detection regression tests and exit",
    )
    ARGS = ap.parse_args()
    if ARGS.self_test:
        return _self_test()
    return check()


if __name__ == "__main__":
    raise SystemExit(main())
