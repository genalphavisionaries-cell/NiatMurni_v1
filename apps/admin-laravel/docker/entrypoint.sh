#!/bin/sh
set -e

# ── Port ──────────────────────────────────────────────────────────────────────
PORT="${PORT:-8080}"
sed -i "s/listen 8080/listen ${PORT}/g"            /etc/nginx/sites-available/default
sed -i "s/listen \[::\]:8080/listen [::]:${PORT}/g" /etc/nginx/sites-available/default

# ── Application caches ────────────────────────────────────────────────────────
# Each command is wrapped with timeout so a slow bootstrap never blocks startup.
echo "[entrypoint] caching config..."
timeout 25 php artisan config:cache 2>/dev/null || echo "[entrypoint] config:cache skipped"

echo "[entrypoint] caching routes..."
timeout 25 php artisan route:cache  2>/dev/null || echo "[entrypoint] route:cache skipped"

echo "[entrypoint] caching views..."
timeout 25 php artisan view:cache   2>/dev/null || echo "[entrypoint] view:cache skipped"

# ── Database migrations ───────────────────────────────────────────────────────
# Run in the BACKGROUND so nginx binds its port immediately and Render's
# health-check / deploy timer is not blocked by a lock-wait on the DB.
#
# All current pending migrations only add nullable columns which are
# backward-safe (existing app code handles NULL gracefully).
#
# PGOPTIONS sets a 30-second PostgreSQL lock_timeout so the migration fails
# fast on its own rather than waiting indefinitely for a table lock.
#
# If migration fails, a warning is logged.
# Re-run manually: php artisan migrate --force
echo "[entrypoint] starting background migration..."
(
  PGOPTIONS='-c lock_timeout=30s -c statement_timeout=120s' \
    php artisan migrate --force --no-ansi \
    && echo "[migrate] done" \
    || echo "[migrate] failed or timed out — re-run: php artisan migrate --force"
) &

# ── Start services ────────────────────────────────────────────────────────────
echo "[entrypoint] starting supervisord (nginx + php-fpm)..."
exec "$@"
