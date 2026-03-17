# Admin routing – current state

## Working admin URL

**https://niatmurniacademy.com/admin**

The admin panel is the **Next.js** UI at the path `/admin` on the main domain. It talks to the Laravel API (via `NEXT_PUBLIC_ADMIN_API_URL`). Filament (Laravel) remains at path `/admin` for when the Laravel app is accessed directly (e.g. backend host).

---

## Why subdomain migration was paused

An attempt was made to move the admin panel to **https://admin.niatmurniacademy.com** (Laravel + Filament on a subdomain). That migration is **paused** due to:

- 403 / routing issues when serving Filament at the subdomain.
- Need for a clear plan for DNS, Render custom domains, and SSL before switching.

The codebase is restored so that the **current domain** (niatmurniacademy.com) serves the admin UI at `/admin` again, with no redirect or proxy to the subdomain.

---

## Files that control admin routing

| Purpose | File |
|--------|------|
| **Next.js:** who can access `/admin` | `apps/web/middleware.ts` – redirects unauthenticated users to `/admin/login` |
| **Next.js:** admin UI pages | `apps/web/app/admin/*` |
| **Laravel:** Filament panel path | `apps/admin-laravel/app/Providers/Filament/AdminPanelProvider.php` → `->path('admin')` |
| **Laravel:** web routes (e.g. root → /admin) | `apps/admin-laravel/routes/web.php` |
| **Laravel (Docker):** request handling | `apps/admin-laravel/docker/nginx.conf` |

---

## Warning

**Do not change the admin domain or path** (e.g. to a subdomain or to `/`) without a **controlled migration plan** that covers:

- DNS and custom domains (e.g. on Render).
- Next.js middleware (no redirect/proxy unless intended).
- Laravel `APP_URL`, Filament path, and any CORS/config that assume a specific host or path.
- Testing of login, cookies, and API calls after the change.

Changing only one of these can break the admin panel or cause 403/redirect loops.
