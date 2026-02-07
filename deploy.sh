#!/usr/bin/env bash
set -euo pipefail

# Local CLI deploy — builds, pushes to DOCR, then pulls + restarts
# the frontend container on the Droplet via SSH.
#
# Prerequisites:
#   - doctl authenticated (doctl auth init)
#   - SSH key in agent (ssh-add)
#   - .env.deploy with at least DROPLET_IP
#
# Usage:
#   ./deploy.sh              # docker build + push + deploy
#   ./deploy.sh --full       # npm test + docker build + push + deploy
#   ./deploy.sh --build-only # docker build + push (no remote deploy)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${DEPLOY_ENV_FILE:-$SCRIPT_DIR/.env.deploy}"

# ── Load env ──────────────────────────────────────────────────────────────

if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
fi

# ── Resolve config ────────────────────────────────────────────────────────

REGISTRY="registry.digitalocean.com"
IMAGE_NAME="dms-frontend"
DROPLET_IP="${DROPLET_IP:?Set DROPLET_IP in $ENV_FILE}"
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
    --build-arg VITE_DOCUMENT_STORE_URL=https://app.cedar-stack.com \
    --build-arg VITE_AUTH_PROVIDER=https://auth.cedar-stack.com \
    --build-arg VITE_AUTH_CLIENT_ID=dms-fe \
    --build-arg VITE_AUTH_REALM=dms \
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
    "cd /opt/dms && docker-compose pull frontend && docker-compose up -d frontend"

log "Deploy complete! (commit: $GIT_SHA)"
notify_discord 3066993 "Deploy Succeeded" "**DMS Frontend** deployed to production via manual CLI deploy."
