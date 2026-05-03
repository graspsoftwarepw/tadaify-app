#!/usr/bin/env bash
# bin/worktree-env-init.test.sh — Bash unit tests for bin/worktree-env-init.sh
#
# Usage: bash bin/worktree-env-init.test.sh
# Exit 0: all tests pass. Exit 1: at least one test failed.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/worktree-env-init.sh"

PASS=0
FAIL=0
ERRORS=()

# ── helpers ──────────────────────────────────────────────────────────────────

pass() { echo "  PASS: $1"; ((PASS++)); }
fail() { echo "  FAIL: $1"; ((FAIL++)); ERRORS+=("$1"); }

# Create a minimal git-initialised sandbox containing specified files.
# Args: tmp_dir env_example_content dev_vars_example_content
make_sandbox() {
  local dir="$1"
  local env_example="${2:-}"
  local dev_vars_example="${3:-}"

  git -C "$dir" init -q
  git -C "$dir" config user.email "test@test.local"
  git -C "$dir" config user.name  "Test"

  if [[ -n "$env_example" ]]; then
    printf '%s' "$env_example" > "$dir/.env.example"
  fi
  if [[ -n "$dev_vars_example" ]]; then
    printf '%s' "$dev_vars_example" > "$dir/.dev.vars.example"
  fi
}

ENV_EXAMPLE_CONTENT='VITE_SUPABASE_URL=http://localhost:54351
VITE_SUPABASE_ANON_KEY=eyJ...replace-with-output-of-supabase-status
BEFORE_USER_CREATED_HOOK_SECRET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
'

DEV_VARS_EXAMPLE_CONTENT='SUPABASE_URL=http://127.0.0.1:54351
SUPABASE_ANON_KEY=eyJ...replace-with-output-of-supabase-status
SUPABASE_SERVICE_ROLE_KEY=eyJ...replace-with-output-of-supabase-status
HANDLE_RESERVATION_TTL_SECONDS=600
'

# Regex for valid hook secret
VALID_SECRET_RE='^v1,whsec_[A-Za-z0-9+/=]{32,}$'

# Placeholder check (mirrors function in worktree-env-init.sh)
is_placeholder() {
  local val="$1"
  [[ -z "$val" ]] || [[ "$val" == *"replace-with"* ]] || [[ "$val" == "eyJ...replace"* ]]
}

# ── Mock supabase that reports as running with real-looking values ────────────
# We put a fake `supabase` in the PATH for tests that need it.

MOCK_SUPABASE_RUNNING="$(mktemp -d)/supabase"
cat > "$MOCK_SUPABASE_RUNNING" <<'MOCK'
#!/usr/bin/env bash
if [[ "${1:-}" == "status" ]]; then
  if [[ "${2:-}" == "-o" && "${3:-}" == "env" ]]; then
    echo "SUPABASE_URL=http://127.0.0.1:54351"
    echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.FAKEANON"
    echo "SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.FAKESRK"
    exit 0
  fi
  exit 0  # `supabase status` without -o env — just exit 0 (running)
fi
exit 0
MOCK
chmod +x "$MOCK_SUPABASE_RUNNING"
MOCK_SUPABASE_RUNNING_DIR="$(dirname "$MOCK_SUPABASE_RUNNING")"

MOCK_SUPABASE_STOPPED="$(mktemp -d)/supabase"
cat > "$MOCK_SUPABASE_STOPPED" <<'MOCK'
#!/usr/bin/env bash
# Simulate Supabase not running: `supabase status` exits non-zero
exit 1
MOCK
chmod +x "$MOCK_SUPABASE_STOPPED"
MOCK_SUPABASE_STOPPED_DIR="$(dirname "$MOCK_SUPABASE_STOPPED")"

# ── Test A: Both .env + .dev.vars missing → both created with valid secrets ──

echo ""
echo "A. Both .env + .dev.vars missing → created with valid values"
TMP_A="$(mktemp -d)"
make_sandbox "$TMP_A" "$ENV_EXAMPLE_CONTENT" "$DEV_VARS_EXAMPLE_CONTENT"

(
  cd "$TMP_A"
  PATH="$MOCK_SUPABASE_RUNNING_DIR:$PATH" bash "$SCRIPT" --quiet
)
A_EXIT=$?

if [[ $A_EXIT -ne 0 ]]; then
  fail "A: script exited $A_EXIT (expected 0)"
else
  # Check .env exists and has valid secret
  if [[ ! -f "$TMP_A/.env" ]]; then
    fail "A: .env not created"
  else
    SECRET_A=$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' "$TMP_A/.env" | cut -d= -f2-)
    if [[ "$SECRET_A" =~ $VALID_SECRET_RE ]]; then
      pass "A: .env created with valid BEFORE_USER_CREATED_HOOK_SECRET"
    else
      fail "A: .env secret '$SECRET_A' does not match $VALID_SECRET_RE"
    fi
  fi

  # Check .dev.vars exists and has real Supabase URL (not placeholder)
  if [[ ! -f "$TMP_A/.dev.vars" ]]; then
    fail "A: .dev.vars not created"
  else
    ANON_A=$(grep '^SUPABASE_ANON_KEY=' "$TMP_A/.dev.vars" | cut -d= -f2-)
    if [[ "$ANON_A" == *"replace-with"* ]] || [[ "$ANON_A" == "eyJ...replace"* ]]; then
      fail "A: .dev.vars SUPABASE_ANON_KEY still a placeholder: $ANON_A"
    else
      pass "A: .dev.vars created with real Supabase values"
    fi
  fi
fi
rm -rf "$TMP_A"

# ── Test B: .env has stale placeholder → secret regenerated ──────────────────

echo ""
echo "B. .env has stale placeholder → secret regenerated"
TMP_B="$(mktemp -d)"
make_sandbox "$TMP_B" "$ENV_EXAMPLE_CONTENT" "$DEV_VARS_EXAMPLE_CONTENT"

# Create .env with placeholder (same as .env.example)
cp "$TMP_B/.env.example" "$TMP_B/.env"

(
  cd "$TMP_B"
  PATH="$MOCK_SUPABASE_RUNNING_DIR:$PATH" bash "$SCRIPT" --quiet
)
B_EXIT=$?

if [[ $B_EXIT -ne 0 ]]; then
  fail "B: script exited $B_EXIT (expected 0)"
else
  SECRET_B=$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' "$TMP_B/.env" | cut -d= -f2-)
  if [[ "$SECRET_B" =~ $VALID_SECRET_RE ]]; then
    pass "B: stale placeholder replaced with valid secret"
  else
    fail "B: secret '$SECRET_B' not valid after regeneration"
  fi
fi
rm -rf "$TMP_B"

# ── Test C: All values already real (idempotent — second run is no-op) ────────

echo ""
echo "C. Real values already present → no-op (idempotent second run)"
TMP_C="$(mktemp -d)"
make_sandbox "$TMP_C" "$ENV_EXAMPLE_CONTENT" "$DEV_VARS_EXAMPLE_CONTENT"

(
  cd "$TMP_C"
  PATH="$MOCK_SUPABASE_RUNNING_DIR:$PATH" bash "$SCRIPT" --quiet
)

# Capture values after first run
SECRET_C1=$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' "$TMP_C/.env" | cut -d= -f2-)
ANON_C1=$(grep '^SUPABASE_ANON_KEY=' "$TMP_C/.dev.vars" | cut -d= -f2-)

# Second run
(
  cd "$TMP_C"
  PATH="$MOCK_SUPABASE_RUNNING_DIR:$PATH" bash "$SCRIPT" --quiet
)
C2_EXIT=$?

SECRET_C2=$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' "$TMP_C/.env" | cut -d= -f2-)
ANON_C2=$(grep '^SUPABASE_ANON_KEY=' "$TMP_C/.dev.vars" | cut -d= -f2-)

if [[ $C2_EXIT -ne 0 ]]; then
  fail "C: second run exited $C2_EXIT (expected 0)"
elif [[ "$SECRET_C1" != "$SECRET_C2" ]]; then
  fail "C: hook secret changed on second run (not idempotent)"
elif [[ "$ANON_C1" != "$ANON_C2" ]]; then
  fail "C: SUPABASE_ANON_KEY changed on second run (not idempotent)"
else
  pass "C: second run is a no-op (idempotent)"
fi
rm -rf "$TMP_C"

# ── Test D: .env.example missing → exit 1 with clear error ───────────────────

echo ""
echo "D. .env.example missing → exit 1 with clear error"
TMP_D="$(mktemp -d)"
make_sandbox "$TMP_D" "" "$DEV_VARS_EXAMPLE_CONTENT"
# Do NOT create .env.example

D_EXIT_FILE="$(mktemp)"
ERR_OUT_D="$(
  cd "$TMP_D"
  PATH="$MOCK_SUPABASE_RUNNING_DIR:$PATH" bash "$SCRIPT" --quiet 2>&1
  echo $? > "$D_EXIT_FILE"
)"
D_EXIT="$(cat "$D_EXIT_FILE")"
rm -f "$D_EXIT_FILE"

if [[ $D_EXIT -eq 0 ]]; then
  fail "D: expected exit 1 when .env.example missing, got 0"
elif echo "$ERR_OUT_D" | grep -qi "missing\|\.env\.example\|cannot"; then
  pass "D: exit 1 with clear error about missing .env.example"
else
  fail "D: exited $D_EXIT but error message unclear: '$ERR_OUT_D'"
fi
rm -rf "$TMP_D"

# ── Test E: Supabase not running → exit 0, .env valid, .dev.vars placeholder ──

echo ""
echo "E. Supabase not running → exit 0, .env valid, .dev.vars keys still placeholder"
TMP_E="$(mktemp -d)"
make_sandbox "$TMP_E" "$ENV_EXAMPLE_CONTENT" "$DEV_VARS_EXAMPLE_CONTENT"

(
  cd "$TMP_E"
  PATH="$MOCK_SUPABASE_STOPPED_DIR:$PATH" bash "$SCRIPT" --quiet
)
E_EXIT=$?

if [[ $E_EXIT -ne 0 ]]; then
  fail "E: expected exit 0 when Supabase not running (pre-start safe path), got $E_EXIT"
else
  # .env must have a valid hook secret even without Supabase
  SECRET_E=$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' "$TMP_E/.env" | cut -d= -f2-)
  if [[ "$SECRET_E" =~ $VALID_SECRET_RE ]]; then
    pass "E: .env has valid BEFORE_USER_CREATED_HOOK_SECRET without Supabase"
  else
    fail "E: .env secret '$SECRET_E' not valid without Supabase running"
  fi

  # .dev.vars should still have placeholder keys (not populated)
  ANON_E=$(grep '^SUPABASE_ANON_KEY=' "$TMP_E/.dev.vars" | cut -d= -f2-)
  if is_placeholder "$ANON_E"; then
    pass "E: .dev.vars keys correctly left as placeholders"
  else
    fail "E: .dev.vars should have placeholder keys when Supabase not running, got: $ANON_E"
  fi
fi
rm -rf "$TMP_E"

# ── Cleanup mock dirs ─────────────────────────────────────────────────────────

rm -rf "$(dirname "$MOCK_SUPABASE_RUNNING")"
rm -rf "$(dirname "$MOCK_SUPABASE_STOPPED")"

# ── Summary ───────────────────────────────────────────────────────────────────

TOTAL=$((PASS + FAIL))
echo ""
echo "Results: $PASS/$TOTAL passed"

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo ""
  echo "Failed tests:"
  for e in "${ERRORS[@]}"; do
    echo "  - $e"
  done
  exit 1
fi

exit 0
