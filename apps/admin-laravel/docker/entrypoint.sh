#!/bin/sh
set -e
# Replace listen port in nginx config with PORT (Render sets this)
PORT="${PORT:-8080}"
sed -i "s/listen 8080/listen ${PORT}/g" /etc/nginx/sites-available/default
sed -i "s/listen \[::\]:8080/listen [::]:${PORT}/g" /etc/nginx/sites-available/default
# Cache config and routes
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true
# Run database migrations automatically
php artisan migrate --force || true
# Start services
exec "$@"
