#!/bin/sh
# Generate runtime config from environment variables.
# Any value set here overrides the Vite build-time defaults.
cat > /usr/share/nginx/html/runtime-config.js << EOF
window.__RUNTIME_CONFIG__ = {
  API_URL: "${API_URL:-}",
  AUTH_URL: "${AUTH_URL:-}",
  AUTH_REALM: "${AUTH_REALM:-}",
  AUTH_CLIENT_ID: "${AUTH_CLIENT_ID:-}",
  TURNSTILE_SITE_KEY: "${TURNSTILE_SITE_KEY:-}"
};
EOF

exec nginx -g 'daemon off;'
