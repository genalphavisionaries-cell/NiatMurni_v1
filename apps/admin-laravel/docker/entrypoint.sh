#!/bin/sh
set -e

# Replace listen port in nginx config with PORT (Render sets this)
PORT="${PORT:-8080}"
sed -i "s/listen 8080/listen ${PORT}/g"            /etc/nginx/sites-available/default
sed -i "s/listen \[::\]:8080/listen [::]:${PORT}/g" /etc/nginx/sites-available/default

echo "[entrypoint] Caching config / routes / views..."
php artisan config:cache 2>/dev/null || true
php artisan route:cache  2>/dev/null || true
php artisan view:cache   2>/dev/null || true

# PGOPTIONS tells PostgreSQL to abort any lock-wait after 30 s and any
# statement after 60 s, so a hung ALTER TABLE cannot block startup forever.
# The outer `timeout 90` is a last-resort OS-level kill in case the DB
# connection itself hangs before the session variables take effect.
echo "[entrypoint] Running migrations (lock_timeout=30s, os-timeout=90s)..."
PGOPTIONS='-c lock_timeout=30s -c statement_timeout=60s' \
  timeout 90 php artisan migrate --force --no-ansi \
  && echo "[entrypoint] Migrations complete." \
  || echo "[entrypoint] Migration timed out or failed — server starting anyway. Re-run: php artisan migrate --force"

echo "[entrypoint] Starting supervisor..."
exec "$@"
