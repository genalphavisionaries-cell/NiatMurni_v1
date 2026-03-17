# Deploy: admin.niatmurniacademy.com (Laravel + Filament)

## Container (Render)

- Set **APP_URL** in the service environment: `https://admin.niatmurniacademy.com`
- Document root is fixed in `docker/nginx.conf` as `/var/www/html/public`; no manual Nginx changes needed.
- Use `/debug` to confirm Laravel is responding (returns "Laravel is working").

## Nginx (VPS)

Use `nginx-admin.niatmurniacademy.com.conf` on the server. Summary:

- **Root must be** `/var/www/html/public` (not `/var/www/html`). Laravel’s entry point is `public/index.php`; if root is the project root, Nginx won’t find `index.php` and can return **403 Forbidden**.
- **`location /`** must use `try_files $uri $uri/ /index.php?$query_string;` so all requests are passed to Laravel.
- **PHP** is handled via `location ~ \.php$` with `fastcgi_pass unix:/var/run/php/php-fpm.sock` and `SCRIPT_FILENAME $realpath_root$fastcgi_script_name`.

Adjust `root` if your app lives elsewhere (e.g. `/var/www/admin.niatmurniacademy.com/public`).

## Permissions (avoid 500/403 from Laravel)

On the server, ensure the web server user (e.g. `www-data`) can write to Laravel dirs:

```bash
cd /var/www/html   # or your app root
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

After deploy or composer install:

```bash
php artisan storage:link
php artisan optimize:clear
```
