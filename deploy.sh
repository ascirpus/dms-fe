#!/usr/bin/env bash
set -euo pipefail

# Local CLI deploy — builds, pushes to DOCR, then pulls + restarts
# the frontend container on the Droplet via SSH.
#
# Prerequisites:
#   - doctl authenticated (doctl auth init)
#   - SSH key in agent (ssh-add)
#   - deploy.conf with at least DROPLET_IP
#
# Usage:
#   ./deploy.sh              # docker build + push + deploy
#   ./deploy.sh --full       # npm test + docker build + push + deploy
#   ./deploy.sh --build-only # docker build + push (no remote deploy)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_CONF="${DEPLOY_CONF:-$SCRIPT_DIR/deploy.conf}"
APP_ENV="$SCRIPT_DIR/.env"

# ── Load deploy config ──────────────────────────────────────────────────

if [[ -f "$DEPLOY_CONF" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$DEPLOY_CONF"
    set +a
fi

# ── Load VITE_* build args from .env ────────────────────────────────────

BUILD_ARGS=()
if [[ -f "$APP_ENV" ]]; then
    while IFS='=' read -r key value; do
        [[ -z "$key" || "$key" =~ ^# ]] && continue
        if [[ "$key" == VITE_* ]]; then
            BUILD_ARGS+=(--build-arg "$key=$value")
        fi
    done < "$APP_ENV"
else
    echo "ERROR: $APP_ENV not found — cannot resolve build args." >&2
    exit 1
fi

# ── Resolve config ────────────────────────────────────────────────────────

REGISTRY="registry.digitalocean.com"
IMAGE_NAME="dms-frontend"
DROPLET_IP="${DROPLET_IP:?Set DROPLET_IP in $DEPLOY_CONF}"
DROPLET_USER="${DROPLET_USER:-deploy}"
DOCR_REGISTRY_NAME="${DOCR_REGISTRY_NAME:-$(doctl registry get --format Name --no-header)}"
FULL_IMAGE="$REGISTRY/$DOCR_REGISTRY_NAME/$IMAGE_NAME"
GIT_SHA="$(git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
GIT_BRANCH="$(git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo 'unknown')"

# ── Helpers ──────────────────────────────────────────────────────────────

log() { echo "[deploy] $(date '+%H:%M:%S') $*"; }

notify_discord() {
    local color="$1" title="$2" desc="$3"
    [[ -z "${DISCORD_WEBHOOK_URL:-}" ]] && return
    curl -sf -H "Content-Type: application/json" -d "{
        \"embeds\": [{
            \"title\": \"$title\",
            \"description\": \"$desc\",
            \"color\": $color,
            \"fields\": [
                {\"name\": \"Commit\", \"value\": \"\`$GIT_SHA\`\", \"inline\": true},
                {\"name\": \"Branch\", \"value\": \"\`$GIT_BRANCH\`\", \"inline\": true},
                {\"name\": \"Deployer\", \"value\": \"$(whoami)\", \"inline\": true}
            ]
        }]
    }" "$DISCORD_WEBHOOK_URL" > /dev/null || true
}

# ── Full build (run tests first) ─────────────────────────────────────────

if [[ "${1:-}" == "--full" ]]; then
    log "Running tests..."
    npm --prefix "$SCRIPT_DIR" test -- --run
    log "Tests passed."
fi

# ── Docker build ─────────────────────────────────────────────────────────

log "Building Docker image ($GIT_SHA)..."
docker build \
    "${BUILD_ARGS[@]}" \
    -t "$FULL_IMAGE:$GIT_SHA" \
    -t "$FULL_IMAGE:latest" \
    "$SCRIPT_DIR"

# ── Push ─────────────────────────────────────────────────────────────────

log "Authenticating with DOCR..."
doctl registry login

log "Pushing image..."
docker push "$FULL_IMAGE:$GIT_SHA"
docker push "$FULL_IMAGE:latest"
log "Push complete."

if [[ "${1:-}" == "--build-only" ]]; then
    log "Build-only mode — skipping remote deploy."
    exit 0
fi

# ── Deploy on remote ─────────────────────────────────────────────────────

log "Deploying frontend on $DROPLET_IP..."
ssh -o StrictHostKeyChecking=accept-new "$DROPLET_USER@$DROPLET_IP" \
    "cd /opt/dms && docker compose pull frontend && docker compose up -d frontend"

log "Deploy complete! (commit: $GIT_SHA)"
notify_discord 3066993 "Deploy Succeeded" "**DMS Frontend** deployed to production via manual CLI deploy."
