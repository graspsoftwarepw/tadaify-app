#!/usr/bin/env bash
set -euo pipefail

RESET_DB=0
QUIET=0

for arg in "$@"; do
  case "$arg" in
    --reset) RESET_DB=1 ;;
    --quiet) QUIET=1 ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="$(awk -F= '/^[[:space:]]*project_id[[:space:]]*=/{gsub(/[[:space:]"]/, "", $2); print $2; exit}' supabase/config.toml)"
PROJECT_ID="${PROJECT_ID:-tadaify}"

# Ports this project owns on every developer machine. Other Supabase Local
# projects must allocate their own range - see docs/LOCAL_DEVELOPMENT.md.
TADAIFY_PORTS=(54350 54351 54352 54353 54354 54357 54359)
HEALTH_URL="http://127.0.0.1:54351/auth/v1/health"
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

  API_URL="${API_URL:-http://127.0.0.1:54351}"
  ANON_KEY="${ANON_KEY:-$LOCAL_ANON_KEY}"
  SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-$LOCAL_SERVICE_ROLE_KEY}"

  cat > .env.local <<EOF
# Generated by bin/e2e-local-env.sh. Safe local-only test configuration.
E2E_ENV=local
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173
TEST_BASE_URL=http://127.0.0.1:5173
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
HANDLE_RESERVATION_TTL_SECONDS=600
INBUCKET_URL=http://127.0.0.1:54354
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
docker info >/dev/null 2>&1 || {
  echo "Docker is not running or is not reachable." >&2
  exit 1
}
need_cmd curl
need_cmd lsof
need_cmd openssl

ensure_hook_secret

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
log "Supabase Studio: http://127.0.0.1:54353"
log "Inbucket UI: http://127.0.0.1:54354"
