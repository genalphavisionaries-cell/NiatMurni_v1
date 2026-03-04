# admin-laravel (Laravel + Filament)

Ops Admin + Finance/Compliance Admin UI. Thin client to Go Core.

**Can’t log in or not sure how to set up?** → See **[ADMIN-LOGIN-GUIDE.md](./ADMIN-LOGIN-GUIDE.md)** for step-by-step instructions (including Render and local testing).

## Run (local)

1. **Install dependencies** (requires PHP 8.2+ and Composer):
   ```bash
   cp .env.example .env
   composer install
   php artisan key:generate
   ```
2. **Optional:** SQLite for local auth/session. Create `database/database.sqlite` and run `php artisan migrate` if using DB.
3. **Create admin user** (so you can log in):
   ```bash
   php artisan db:seed --class=AdminUserSeeder
   ```
   Then log in at `/admin` with:
   - **Official:** `admin@niatmurniacademy.com` / `NiatMurniAdmin!`
   - **Legacy:** `admin@niatmurni.my` / `NiatMurniAdmin!`
   (Change passwords in production.)
4. **Install Filament panel** (first time only):
   ```bash
   php artisan filament:install --panels
   ```
5. **Start server:**
   ```bash
   php artisan serve
   ```
   Then open http://localhost:8000 (redirects to `/admin` when Filament is installed). Log in with the credentials above.

### Can't log in?

- **Reset admin passwords** (local or production):
  ```bash
  php artisan admin:ensure-admin
  ```
  Then try again with `admin@niatmurniacademy.com` / `NiatMurniAdmin!`
- **Production:** Ensure `SESSION_DRIVER=database` and migrations have run (so the `sessions` table exists). Run `php artisan admin:ensure-admin` after deploy if admins were not created.

## Rules

- Do NOT store business truth in Laravel DB.
- All reads/writes go through Go API (`GO_API_BASE_URL`, `GO_API_TOKEN`).
