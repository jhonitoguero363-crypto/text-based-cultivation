#!/bin/sh
set -eu

export PORT="${PORT:-8001}"
export CHAT_INTERNAL_PORT="${CHAT_INTERNAL_PORT:-8787}"

envsubst '${PORT} ${CHAT_INTERNAL_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# 对话网关仅本机访问；对外仍走 nginx :$PORT
(
  cd /app/server
  PORT="$CHAT_INTERNAL_PORT" node src/index.js
) &

exec nginx -g 'daemon off;'
