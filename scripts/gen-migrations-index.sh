#!/usr/bin/env bash
# scripts/gen-migrations-index.sh
#
# Regenerate supabase/MIGRATIONS.md from the current migration headers.
# Thin wrapper over scripts/gen-migrations-index.py. Output is byte-identical for
# an unchanged header set. Never hand-edit supabase/MIGRATIONS.md.
#
# Usage:
#   scripts/gen-migrations-index.sh           # write the index
#   scripts/gen-migrations-index.sh --check    # exit non-zero if stale (CI)
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec python3 "$REPO_ROOT/scripts/gen-migrations-index.py" "$@"
