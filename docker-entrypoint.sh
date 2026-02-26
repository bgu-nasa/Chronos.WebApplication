#!/bin/sh
# Generate runtime config from environment variables
cat <<EOF > /app/dist/config.js
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",
  VITE_DISCORD_WEBHOOK_URL: "${VITE_DISCORD_WEBHOOK_URL:-}"
};
EOF

exec "$@"
