#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f .env ]]; then
  (umask 077; cp .env.example .env)
fi
set -a
source .env
set +a
: "${VITE_API_BASE_URL:?VITE_API_BASE_URL zorunlu}"
if [[ ! -d node_modules ]]; then
  echo 'Önce bu klasörde npm install çalıştır.' >&2
  exit 1
fi
if lsof -nP -iTCP:"${WEB_PORT:-5173}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Web portu ${WEB_PORT:-5173} kullanımda. .env ayarını kontrol et." >&2
  exit 1
fi
exec npm run dev -- --host 127.0.0.1 --port "${WEB_PORT:-5173}" --strictPort
