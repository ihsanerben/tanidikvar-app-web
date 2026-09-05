#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ $# -gt 0 ]]; then
  echo 'Kullanım: ./run.sh veya npm run dev'
  echo 'Tüm Docker servisleri API klasöründen ./run.sh --docker ile başlatılır.'
  if [[ $# -eq 1 && ( "$1" == '--help' || "$1" == '-h' ) ]]; then exit 0; fi
  exit 1
fi
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
