#!/usr/bin/env bash
set -euo pipefail

RESET_DB=0
QUIET=0
FOREGROUND_COMMAND_COUNT=0
ORIGINAL_ARGUMENT_COUNT="$#"
if [[ "${ORIGINAL_ARGUMENT_COUNT}" -gt 0 ]]; then
  ORIGINAL_ARGUMENTS=("$@")
fi

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --reset) RESET_DB=1 ;;
    --quiet) QUIET=1 ;;
    --)
      shift
      [[ "$#" -gt 0 ]] || { echo "A foreground command must follow --." >&2; exit 2; }
      FOREGROUND_COMMAND=("$@")
      FOREGROUND_COMMAND_COUNT="$#"
      break
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
  shift
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="$(awk -F= '/^[[:space:]]*project_id[[:space:]]*=/{gsub(/[[:space:]"]/, "", $2); print $2; exit}' supabase/config.toml)"
PROJECT_ID="${PROJECT_ID:-tadaify}"
RUNTIME_SKILL="${GRASP_LOCAL_RUNTIME_SKILL_DIR:-${HOME}/.claude/skills/grasp-running-local-apps}"
RUNTIME_SLOTS="${RUNTIME_SKILL}/scripts/runtime-slots"
RUNTIME_LEASES="${RUNTIME_SKILL}/scripts/runtime-leases"
RUNTIME_KEEPER="${ROOT}/bin/e2e-runtime-keeper"
LOCAL_RUNTIME_ACTIVE=0
LOCAL_RUNTIME_MARKER=""
LOCAL_RUNTIME_KEEPER_PID=""

# The reserved Supabase ports this project owns on every developer machine — the
# "second ten" of its 44200-44229 band. Source of truth: ports.yaml (grasp-running-local-apps);
# keep this list in sync with its `reserved` supabase entries. See docs/LOCAL_DEVELOPMENT.md.
TADAIFY_PORTS=(44210 44211 44212 44213 44214 44217 44219)
HEALTH_URL="http://127.0.0.1:44210/auth/v1/health"
HEALTH_TIMEOUT_SECS=90

LOCAL_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDQyMDAwMDAsImV4cCI6MTk2MDE4NTYwMH0.44dQ7bCx9P_I3cvHhvxJkIaL-YzrzU8hOVzRgf4jHsg"
LOCAL_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

log() {
  if [[ "$QUIET" != "1" ]]; then
    printf '%s\n' "$*"
  fi
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 127
  }
}

supabase_cmd() {
  if command -v supabase >/dev/null 2>&1; then
    supabase "$@"
  elif command -v npx >/dev/null 2>&1; then
    npx supabase "$@"
  else
    echo "Missing Supabase CLI. Install it or make npx available." >&2
    exit 127
  fi
}

supabase_command_json() {
  if command -v supabase >/dev/null 2>&1; then
    python3 -c 'import json,sys; print(json.dumps(sys.argv[1:]))' "$(command -v supabase)"
  elif command -v npx >/dev/null 2>&1; then
    python3 -c 'import json,sys; print(json.dumps(sys.argv[1:]))' "$(command -v npx)" supabase
  else
    echo "Missing Supabase CLI. Install it or make npx available." >&2
    return 127
  fi
}

start_runtime_keeper() {
  local owner_started token keeper_log command_json
  owner_started="$(ps -o lstart= -p $$ | awk '{$1=$1; print}')"
  [[ -n "${owner_started}" ]] || { echo "Cannot prove the local runtime owner identity." >&2; return 2; }
  token="$(openssl rand -hex 16)"
  command_json="$(supabase_command_json)" || return $?
  LOCAL_RUNTIME_MARKER="${TMPDIR:-/tmp}/tadaify-main-${PROJECT_ID}-${token}.owner"
  keeper_log="${LOCAL_RUNTIME_MARKER%.owner}.log"
  printf '%s\n%s\n' "${token}" starting >"${LOCAL_RUNTIME_MARKER}"
  python3 "${RUNTIME_KEEPER}" \
    --owner-pid "$$" --owner-started "${owner_started}" \
    --marker "${LOCAL_RUNTIME_MARKER}" --token "${token}" \
    --supabase-command-json "${command_json}" --workdir "${ROOT}" --repo "${ROOT}" \
    --project-id "${PROJECT_ID}" --runtime-leases "${RUNTIME_LEASES}" \
    >>"${keeper_log}" 2>&1 &
  LOCAL_RUNTIME_KEEPER_PID=$!
}

mark_runtime_running() {
  local token
  token="$(sed -n '1p' "${LOCAL_RUNTIME_MARKER}")"
  printf '%s\n%s\n' "${token}" running >"${LOCAL_RUNTIME_MARKER}"
}

cleanup_runtime() {
  local original_status="${1:-0}" cleanup_status
  trap - EXIT INT TERM HUP
  set +e
  if [[ "${LOCAL_RUNTIME_ACTIVE}" -eq 1 ]]; then
    supabase_cmd stop --project-id "${PROJECT_ID}" --workdir "${ROOT}" --no-backup --yes
    cleanup_status=$?
    if [[ "${cleanup_status}" -eq 0 && -n "$(docker ps --all --quiet --filter "label=com.supabase.cli.project=${PROJECT_ID}")" ]]; then
      cleanup_status=2
    fi
  else
    cleanup_status=0
  fi
  if [[ "${cleanup_status}" -eq 0 ]]; then
    rm -f "${LOCAL_RUNTIME_MARKER}"
    wait "${LOCAL_RUNTIME_KEEPER_PID}" 2>/dev/null || true
  else
    echo "e2e-local-env: cleanup failed; the detached keeper will retry it." >&2
  fi
  if [[ "${original_status}" -eq 0 && "${cleanup_status}" -ne 0 ]]; then exit "${cleanup_status}"; fi
  exit "${original_status}"
}

ensure_hook_secret() {
  if [[ ! -f .env ]]; then
    [[ -f .env.example ]] || {
      echo "Missing .env.example - cannot create .env for Supabase hook secrets." >&2
      exit 1
    }
    cp .env.example .env
    log "Created .env from .env.example."
  fi

  local hook_secret_line hook_secret_value new_secret
  hook_secret_line="$(grep '^BEFORE_USER_CREATED_HOOK_SECRET=' .env || true)"
  hook_secret_value="${hook_secret_line#BEFORE_USER_CREATED_HOOK_SECRET=}"

  if [[ "$hook_secret_value" =~ ^v1,whsec_[A-Za-z0-9+/=]{32,}$ ]]; then
    return 0
  fi

  new_secret="$(printf 'v1,whsec_%s' "$(openssl rand -base64 32)")"
  if grep -q '^BEFORE_USER_CREATED_HOOK_SECRET=' .env; then
    sed -i.bak "s|^BEFORE_USER_CREATED_HOOK_SECRET=.*$|BEFORE_USER_CREATED_HOOK_SECRET=$new_secret|" .env
  else
    printf '\nBEFORE_USER_CREATED_HOOK_SECRET=%s\n' "$new_secret" >> .env
  fi
  rm -f .env.bak
  log "Generated BEFORE_USER_CREATED_HOOK_SECRET in .env."
}

port_owner_container() {
  local port="$1"
  docker ps --format '{{.Names}}\t{{.Ports}}' 2>/dev/null \
    | awk -v p=":${port}->" '$0 ~ p {print $1; exit}' || true
}

port_owner_process() {
  local port="$1"
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null \
    | awk 'NR>1 {print $2, $1; exit}' || true
}

is_our_container() {
  local name="$1"
  [[ "$name" == *"_${PROJECT_ID}" ]]
}

other_project_from_container() {
  local name="$1"
  if [[ "$name" =~ ^supabase_[a-z_]+_(.+)$ ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
  fi
}

detect_port_collisions() {
  local conflicts=()
  local foreign_projects=()
  local port owner other_proj proc

  for port in "${TADAIFY_PORTS[@]}"; do
    owner="$(port_owner_container "$port")"
    if [[ -n "$owner" ]]; then
      if is_our_container "$owner"; then
        continue
      fi
      conflicts+=("port ${port}: docker container '${owner}'")
      other_proj="$(other_project_from_container "$owner")"
      if [[ -n "$other_proj" && ! " ${foreign_projects[*]:-} " == *" ${other_proj} "* ]]; then
        foreign_projects+=("$other_proj")
      fi
      continue
    fi

    proc="$(port_owner_process "$port")"
    if [[ -n "$proc" ]]; then
      conflicts+=("port ${port}: process ${proc}")
    fi
  done

  if (( ${#conflicts[@]} == 0 )); then
    return 0
  fi

  {
    echo
    echo "Port collision detected on ports reserved by ${PROJECT_ID}:"
    for c in "${conflicts[@]}"; do
      echo "  - $c"
    done
    echo
    echo "Reserved range for ${PROJECT_ID}: ${TADAIFY_PORTS[*]}"
    echo "See docs/LOCAL_DEVELOPMENT.md for the global Supabase Local port map."
    echo
    if (( ${#foreign_projects[@]} > 0 )); then
      echo "These Supabase Local projects must be moved to their own port range."
      echo "Stop them non-destructively (their data volumes are preserved):"
      for p in "${foreign_projects[@]}"; do
        echo "  supabase stop --project-id ${p}"
      done
      echo
      echo "Do NOT add --no-backup unless you intentionally want to wipe the"
      echo "foreign project's data - that flag deletes its data volumes."
    else
      echo "Stop whatever process holds these ports and re-run 'npm run setup'."
    fi
  } >&2
  exit 1
}

ensure_supabase_healthy() {
  local deadline=$(( SECONDS + HEALTH_TIMEOUT_SECS ))
  local code
  while (( SECONDS < deadline )); do
    code="$(curl -s -o /dev/null -w '%{http_code}' -m 2 "$HEALTH_URL" || true)"
    if [[ "$code" == "200" ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

restart_stack() {
  log "Restarting Supabase Local stack for ${PROJECT_ID} (preserving data volumes)..."
  supabase_cmd stop --project-id "$PROJECT_ID" >/dev/null 2>&1 || true
  supabase_cmd start
}

start_supabase() {
  if supabase_cmd start; then
    return 0
  fi

  if [[ "$RESET_DB" != "1" ]]; then
    return 1
  fi

  log "Supabase Local start failed during reset; intentionally clearing ${PROJECT_ID} data volumes and retrying..."
  supabase_cmd stop --project-id "$PROJECT_ID" --no-backup >/dev/null 2>&1 || true
  supabase_cmd start
}

get_status_value() {
  local key="$1"
  local raw
  raw="$(printf '%s\n' "$STATUS_ENV" | awk -F= -v k="$key" '$1 == k {print substr($0, index($0, "=") + 1)}' | tail -n 1)"
  raw="${raw#\"}"
  raw="${raw%\"}"
  printf '%s\n' "$raw"
}

write_env_files() {
  STATUS_ENV="$(supabase_cmd status -o env 2>/dev/null || true)"

  API_URL="$(get_status_value API_URL)"
  [[ -z "$API_URL" ]] && API_URL="$(get_status_value SUPABASE_URL)"
  ANON_KEY="$(get_status_value ANON_KEY)"
  [[ -z "$ANON_KEY" ]] && ANON_KEY="$(get_status_value SUPABASE_ANON_KEY)"
  SERVICE_ROLE_KEY="$(get_status_value SERVICE_ROLE_KEY)"
  [[ -z "$SERVICE_ROLE_KEY" ]] && SERVICE_ROLE_KEY="$(get_status_value SUPABASE_SERVICE_ROLE_KEY)"

  API_URL="${API_URL:-http://127.0.0.1:44210}"
  ANON_KEY="${ANON_KEY:-$LOCAL_ANON_KEY}"
  SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-$LOCAL_SERVICE_ROLE_KEY}"

  cat > .env.local <<EOF
# Generated by bin/e2e-local-env.sh. Safe local-only test configuration.
E2E_ENV=local
PLAYWRIGHT_BASE_URL=http://127.0.0.1:44200
TEST_BASE_URL=http://127.0.0.1:44200
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
HANDLE_RESERVATION_TTL_SECONDS=600
INBUCKET_URL=http://127.0.0.1:44214
EOF

  cat > .dev.vars <<EOF
# Generated by bin/e2e-local-env.sh. Safe local-only Workers bindings.
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
HANDLE_RESERVATION_TTL_SECONDS=600
EOF
}

need_cmd docker
need_cmd python3
docker info >/dev/null 2>&1 || {
  echo "Docker is not running or is not reachable." >&2
  exit 1
}
need_cmd curl
need_cmd lsof
need_cmd openssl

[[ -x "${RUNTIME_SLOTS}" ]] || { echo "Missing runtime slots helper: ${RUNTIME_SLOTS}" >&2; exit 2; }
[[ -f "${RUNTIME_LEASES}" && -x "${RUNTIME_KEEPER}" ]] || {
  echo "Managed local runtime cleanup helpers are unavailable." >&2
  exit 2
}
if [[ "${TADAIFY_LOCAL_ENV_RUNTIME_INNER:-0}" != "1" ]]; then
  if [[ "${ORIGINAL_ARGUMENT_COUNT}" -gt 0 ]]; then
    exec "${RUNTIME_SLOTS}" run --repo "${ROOT}" --purpose e2e-stack --mode test -- \
      env TADAIFY_LOCAL_ENV_RUNTIME_INNER=1 bash "${ROOT}/bin/e2e-local-env.sh" "${ORIGINAL_ARGUMENTS[@]}"
  fi
  exec "${RUNTIME_SLOTS}" run --repo "${ROOT}" --purpose e2e-stack --mode test -- \
    env TADAIFY_LOCAL_ENV_RUNTIME_INNER=1 bash "${ROOT}/bin/e2e-local-env.sh"
fi
[[ "${GRASP_RUNTIME_SLOT_TOKEN:-}" =~ ^[0-9a-f]{32}$ ]] || {
  echo "Missing runtime slot token." >&2
  exit 2
}
"${RUNTIME_SLOTS}" probe --token "${GRASP_RUNTIME_SLOT_TOKEN}" >/dev/null

ensure_hook_secret
start_runtime_keeper
LOCAL_RUNTIME_ACTIVE=1
trap 'cleanup_runtime $?' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

own_already_running="$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E "_${PROJECT_ID}\$" | head -n1 || true)"
if [[ -z "$own_already_running" ]]; then
  detect_port_collisions
fi

if ! supabase_cmd status >/dev/null 2>&1; then
  log "Starting Supabase Local..."
  start_supabase
fi

if ! ensure_supabase_healthy; then
  log "Supabase API not responding on ${HEALTH_URL}; restarting stack..."
  restart_stack
  ensure_supabase_healthy || {
    echo "Supabase Local failed to become healthy within ${HEALTH_TIMEOUT_SECS}s." >&2
    echo "Check 'docker ps' and 'supabase status' to diagnose." >&2
    exit 1
  }
fi

mark_runtime_running

if [[ "$RESET_DB" == "1" ]]; then
  log "Resetting Supabase Local database with seed.sql..."
  supabase_cmd db reset

  if ! ensure_supabase_healthy; then
    log "Supabase services unhealthy after db reset; restarting stack..."
    restart_stack
    ensure_supabase_healthy || {
      echo "Supabase Local failed to recover after db reset." >&2
      exit 1
    }
  fi
fi

write_env_files

log "Local E2E environment ready."
log "Supabase API: $API_URL"
log "Supabase Studio: http://127.0.0.1:44213"
log "Inbucket UI: http://127.0.0.1:44214"

if [[ "${FOREGROUND_COMMAND_COUNT}" -gt 0 ]]; then
  "${FOREGROUND_COMMAND[@]}"
fi
