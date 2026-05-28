#!/usr/bin/env bash
# Bootstraps a fresh machine for local E2E development.
#
# Usage:
#   bash bin/e2e-bootstrap.sh            # default - reset DB so seeds are deterministic
#   bash bin/e2e-bootstrap.sh --no-reset # keep existing local DB volume

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RESET_FLAG="--reset"
for arg in "$@"; do
  case "$arg" in
    --no-reset) RESET_FLAG="" ;;
    --reset) RESET_FLAG="--reset" ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--reset|--no-reset]" >&2
      exit 2
      ;;
  esac
done

REQUIRED_NODE_MAJOR=22

log()  { printf '%s\n' "$*"; }
info() { printf '  %s\n' "$*"; }
ok()   { printf '[OK]   %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*" >&2; }
die()  { printf '[FAIL] %s\n' "$*" >&2; exit 1; }

check_docker() {
  log "==> Docker"
  if ! command -v docker >/dev/null 2>&1; then
    die "Docker CLI not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  fi
  if ! docker info >/dev/null 2>&1; then
    die "Docker is installed but not running. Start Docker Desktop and re-run."
  fi
  ok "Docker is running."
}

check_node() {
  log "==> Node"
  if ! command -v node >/dev/null 2>&1; then
    die "Node not found. Install Node >= ${REQUIRED_NODE_MAJOR}."
  fi
  local node_major
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  if (( node_major < REQUIRED_NODE_MAJOR )); then
    die "Node $(node -v) is too old. Required >= ${REQUIRED_NODE_MAJOR}."
  fi
  ok "Node $(node -v)."
}

check_supabase_cli() {
  log "==> Supabase CLI"
  if command -v supabase >/dev/null 2>&1; then
    ok "supabase $(supabase --version 2>/dev/null | head -n1)."
    return 0
  fi

  if [[ "$(uname -s)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    info "Supabase CLI missing. Installing via Homebrew: supabase/tap/supabase"
    if brew install supabase/tap/supabase; then
      ok "supabase $(supabase --version 2>/dev/null | head -n1)."
      return 0
    fi
    warn "Homebrew install failed."
  fi

  die "Supabase CLI not found and could not auto-install. Install manually: https://supabase.com/docs/guides/cli/getting-started"
}

check_npm_deps() {
  log "==> npm dependencies"
  if [[ -x "node_modules/.bin/playwright" ]]; then
    ok "node_modules already populated."
    return 0
  fi
  info "Running: npm install"
  npm install --no-audit --no-fund
  ok "npm dependencies installed."
}

check_playwright_browser() {
  log "==> Playwright Chromium"
  if npx --no-install playwright --version >/dev/null 2>&1; then
    if npx --no-install playwright install --dry-run chromium 2>&1 | grep -q "is already installed"; then
      ok "Chromium browser already installed."
      return 0
    fi
  fi
  info "Installing Playwright Chromium browser..."
  npx playwright install chromium
  ok "Chromium installed."
}

bring_up_supabase() {
  log "==> Supabase Local (delegating to bin/e2e-local-env.sh ${RESET_FLAG})"
  bash "$ROOT/bin/e2e-local-env.sh" $RESET_FLAG
}

check_docker
check_node
check_supabase_cli
check_npm_deps
check_playwright_browser
bring_up_supabase

cat <<MSG

[OK] Setup complete.

Next steps:
  npm run test:e2e:local     # full local E2E suite
  npm run test:e2e:ui        # interactive Playwright UI
  npm run dev                # React Router dev server (uses .dev.vars)

Supabase Studio:   http://127.0.0.1:54353
Inbucket (mail):   http://127.0.0.1:54354
MSG
