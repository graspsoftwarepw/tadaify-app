#!/usr/bin/env bash
# bin/new-migration.sh
#
# Create a new Supabase migration file with the org-standard wall-clock name and
# the mandatory 8-key header. Using this script is MANDATORY for every migration
# created after the grandfather cutoff — never hand-pick a timestamp.
#
# Standard: docs/MIGRATION_GUIDE.md
# Adopted in tadaify-app via issue #309 (epic #303). The 19 pre-cutoff legacy
# migrations (cutoff 20260531000002, see supabase/migration-cutoff) are exempt and
# stay byte-for-byte untouched.
#
# Problem it solves: a manually chosen timestamp (copied from another project or
# typed as a "round" datetime) can sort BEFORE an existing migration, and the
# Supabase CLI refuses out-of-order apply. The out-of-order guard below re-derives
# the latest existing migration and refuses to emit a non-increasing timestamp.
#
# Usage:
#   bin/new-migration.sh <module> <verb_noun>
#
# Examples:
#   bin/new-migration.sh profile_extras add_avatar_r2_key
#   bin/new-migration.sh accounts extend_delete_user_data_account_tags
#   bin/new-migration.sh blocks reorder_blocks_rpc
#
# Output:
#   supabase/migrations/<YYYYMMDDHHMMSS>_<module>_<verb_noun>.sql
#   (timestamp is UTC, computed at invocation time — always sorts after any
#    migration created before this moment)

set -euo pipefail

usage() {
  echo "Usage: bin/new-migration.sh <module> <verb_noun>"
  echo ""
  echo "Examples:"
  echo "  bin/new-migration.sh profile_extras add_avatar_r2_key"
  echo "  bin/new-migration.sh accounts extend_delete_user_data_account_tags"
}

if [[ -z "${1:-}" || -z "${2:-}" ]]; then
  usage
  exit 1
fi

MODULE="$1"
VERB_NOUN="$2"

# Validate: each token is lowercase letters, digits, and underscores; starts with
# a letter. Matches the canonical <module>/<verb_noun> contract.
ARG_RE='^[a-z][a-z0-9_]+$'
if [[ ! "$MODULE" =~ $ARG_RE ]]; then
  echo "ERROR: <module> must match ${ARG_RE} (lowercase letter, then letters/digits/underscores)."
  echo "  Got: $MODULE"
  exit 1
fi
if [[ ! "$VERB_NOUN" =~ $ARG_RE ]]; then
  echo "ERROR: <verb_noun> must match ${ARG_RE} (lowercase letter, then letters/digits/underscores)."
  echo "  Got: $VERB_NOUN"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "ERROR: $MIGRATIONS_DIR does not exist. Are you in the right repo?"
  exit 1
fi

# Compute timestamp in UTC (same format the Supabase CLI uses).
TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
FILENAME="${TIMESTAMP}_${MODULE}_${VERB_NOUN}.sql"
FILEPATH="$MIGRATIONS_DIR/$FILENAME"

# Out-of-order guard: exit non-zero if the freshly generated timestamp is not
# strictly greater than the latest existing migration's timestamp.
LATEST=$(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | xargs -I{} basename {} .sql | sort | tail -1 || true)
if [[ -n "$LATEST" ]]; then
  LATEST_TS="${LATEST%%_*}"
  if [[ "$TIMESTAMP" -le "$LATEST_TS" ]]; then
    echo "ERROR: Generated timestamp ($TIMESTAMP) is not greater than latest migration ($LATEST_TS)."
    echo "  Supabase CLI would refuse out-of-order apply. Ensure your system clock is set correctly."
    exit 1
  fi
fi

if [[ -e "$FILEPATH" ]]; then
  echo "ERROR: $FILEPATH already exists. Re-run in a moment (timestamps are per-second)."
  exit 1
fi

MODULE_UPPER=$(printf '%s' "$MODULE" | tr '[:lower:]' '[:upper:]')

# Write the stub seeded with the mandatory 8-key header. Each key is required;
# the post-cutoff gate (scripts/check-migrations.py) rejects a migration missing
# any key or with an empty Feature. Fill in the TODO placeholders before commit.
cat > "$FILEPATH" << STUB
/*
 * Module:       ${MODULE_UPPER}
 * Feature:      TR-tadaify-NNN
 * Issue:        #NNN
 * Summary:      One-line description of the schema change.
 * Tables:       public.<table>
 * GDPR-impact:  [x] none  [ ] user-data -> delete_user_data() + user-export-data updated
 * Depends-on:   none
 * Post-steps:   none
 */

-- Migration: ${MODULE}_${VERB_NOUN}
-- Created at: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
--
-- GUIDELINES:
-- 1. Define tables BEFORE the functions that reference them.
-- 2. Use LANGUAGE plpgsql for helper functions referencing tables not yet in the
--    current migration file (defers body validation to first call).
-- 3. Enable RLS on every new table:
--      ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
--    New user-data tables get own-row + service-role policies.
-- 4. Update docs/schema.sql with the DDL changes (gate requires it).
-- 5. If this touches a user-data table, tick GDPR-impact [x], update
--    delete_user_data(), and re-deploy user-export-data (record in Post-steps).
-- 6. Regenerate the index: scripts/gen-migrations-index.sh

-- TODO: replace with your SQL below

STUB

echo "Created: supabase/migrations/$FILENAME"
echo ""
echo "Next steps:"
echo "  1. Fill in the 8-key header (Module/Feature/Issue/Summary/Tables/GDPR-impact/Depends-on/Post-steps)."
echo "  2. Edit $FILEPATH"
echo "  3. Apply locally: supabase db reset --no-seed (or supabase migration up)"
echo "  4. Update docs/schema.sql to reflect the new DDL."
echo "  5. Regenerate the index: scripts/gen-migrations-index.sh"
echo "  6. Validate: python3 scripts/check-migrations.py"
