# Production Dockerfile for admin-laravel (Render)
# PHP 8.3 FPM + Nginx, no MySQL, calls Go API only

FROM php:8.3-fpm-bookworm AS base

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    unzip \
    git \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    libpq-dev \
    && docker-php-ext-install -j$(nproc) opcache pdo pdo_pgsql zip exif pcntl bcmath mbstring intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

# App
COPY . .

# Dependencies (production only)
RUN composer install --no-dev --no-interaction --optimize-autoloader --prefer-dist

# Laravel optimizations run at runtime (entrypoint) when env is available
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Supervisord
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Render: PORT env (default 8080)
ENV PORT=8080
EXPOSE 8080

# Entrypoint sets nginx listen to $PORT
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
