# CORS and login (api.niatmurniacademy.com)

If the frontend at **https://niatmurniacademy.com** gets a CORS error when calling **https://api.niatmurniacademy.com/api/admin/login** (“No 'Access-Control-Allow-Origin' header”), do the following on the **API server** (where Laravel runs).

## 1. Use the CORS config and clear cache

- Ensure `config/cors.php` is deployed with `allowed_origins` including `https://niatmurniacademy.com` (no trailing slash).
- On the server, run:
  ```bash
  cd /path/to/admin-laravel
  php artisan config:clear
  php artisan config:cache
  ```

## 2. Let Laravel handle OPTIONS (preflight)

The browser sends an **OPTIONS** request before POST. That request **must** be handled by Laravel so it can add CORS headers. If your reverse proxy (e.g. Nginx) answers OPTIONS itself, it will not send `Access-Control-Allow-Origin` and the browser will block the request.

- **Nginx**: Do **not** add a `location` that returns a 204/200 for `if ($request_method = 'OPTIONS')` for `/api/*`. Let `/api/*` fall through to `index.php` so Laravel runs and adds the CORS headers.
- Example: your `location /` (or the block that forwards to PHP) should route **all** requests (including OPTIONS) to Laravel, e.g. `try_files $uri $uri/ /index.php?$query_string;` and PHP handling for `index.php`.

## 3. If you must handle OPTIONS in Nginx

Only if you cannot pass OPTIONS to Laravel, add CORS headers in Nginx **for the same origin** as in `config/cors.php`:

```nginx
location /api {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://niatmurniacademy.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' '*';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Max-Age' 0;
        return 204;
    }
    try_files $uri $uri/ /index.php?$query_string;
}
```

Prefer **passing OPTIONS to Laravel** (step 2) so one place (`config/cors.php`) controls CORS.

## 4. Verify

- After deploy, run `php artisan config:clear` and `php artisan config:cache`.
- In the browser, Network tab: check the **OPTIONS** request to `https://api.niatmurniacademy.com/api/admin/login`. The response headers should include `Access-Control-Allow-Origin: https://niatmurniacademy.com` and `Access-Control-Allow-Credentials: true`.
