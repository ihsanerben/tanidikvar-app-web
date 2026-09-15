#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ $# -gt 0 ]]; then
  echo 'Kullanım: ./run.sh veya npm run dev'
  echo 'API ve Docker servisleri API reposundan ./run.sh --docker ile başlatılır.'
  exit 1
fi
if [[ ! -f .env.local ]]; then
  (umask 077; cp .env.example .env.local)
fi
if [[ ! -d node_modules ]]; then
  echo 'Önce bu klasörde npm install çalıştır.' >&2
  exit 1
fi
exec npm run dev
