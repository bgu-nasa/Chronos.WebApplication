#!/bin/sh
# Inject runtime config directly into the built index.html
CONFIG_SCRIPT="<script>window.__ENV__={VITE_API_BASE_URL:\"${VITE_API_BASE_URL:-}\",VITE_DISCORD_WEBHOOK_URL:\"${VITE_DISCORD_WEBHOOK_URL:-}\"};</script>"
sed -i "s|<!-- __RUNTIME_CONFIG__ -->|${CONFIG_SCRIPT}|" /app/dist/index.html

exec "$@"
