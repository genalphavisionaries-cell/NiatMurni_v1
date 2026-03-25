#!/bin/sh
set -e

# ── Port ──────────────────────────────────────────────────────────────────────
# Render sets PORT at runtime; nginx must bind before health checks (do not block
# supervisord on artisan — that caused deploy timeouts / "no open ports detected").
PORT="${PORT:-8080}"
sed -i "s/listen 8080/listen ${PORT}/g"            /etc/nginx/sites-available/default
sed -i "s/listen \[::\]:8080/listen [::]:${PORT}/g" /etc/nginx/sites-available/default

# ── Application caches (background; must not delay nginx binding) ─────────────
# php -d max_execution_time= avoids relying on GNU timeout(1) in minimal images.
(
  echo "[entrypoint] caching config..."
  php -d max_execution_time=30 artisan config:cache 2>/dev/null || echo "[entrypoint] config:cache skipped"

  echo "[entrypoint] caching routes..."
  php -d max_execution_time=30 artisan route:cache  2>/dev/null || echo "[entrypoint] route:cache skipped"

  echo "[entrypoint] caching views..."
  php -d max_execution_time=30 artisan view:cache   2>/dev/null || echo "[entrypoint] view:cache skipped"
) &

# ── Database migrations (background; same rationale as caches) ────────────────
echo "[entrypoint] starting background migration..."
(
  PGOPTIONS='-c lock_timeout=30s -c statement_timeout=120s' \
    php artisan migrate --force --no-ansi \
    && echo "[migrate] done" \
    || echo "[migrate] failed or timed out — re-run: php artisan migrate --force"
) &

# ── Start services (nginx binds $PORT immediately) ──────────────────────────
echo "[entrypoint] starting supervisord (nginx + php-fpm)..."
exec "$@"
