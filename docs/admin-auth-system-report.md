# Admin Authentication & Access System Report

## Current Auth Flow

### Filament Admin (`/admin`)
- Admin panel is mounted at `/admin` in `apps/admin-laravel/app/Providers/Filament/AdminPanelProvider.php`.
- Filament uses session auth (`web` guard) with auth middleware and redirects unauthenticated users to login.
- `User::canAccessPanel()` gates panel access by:
  - `is_active = true`
  - `canAccessAdmin() = true`

### Admin API (`/api/admin/*`)
- Login is handled by `apps/admin-laravel/app/Http/Controllers/Api/AdminAuthController.php`.
- Authenticated API routes use Sanctum token auth from cookie (`admin_token`) via `SanctumTokenFromCookie` middleware.

## Fixes Applied

## 1) Auth and Access Hardening
- Added middleware `apps/admin-laravel/app/Http/Middleware/EnsureAdminAccess.php`:
  - blocks unauthenticated requests (`401`)
  - blocks inactive/non-admin users (`403`)
- Registered middleware alias in `apps/admin-laravel/bootstrap/app.php` as `admin.access`.
- Applied `admin.access` to admin API route group in `apps/admin-laravel/routes/api.php`.

## 2) Password Management
- Enabled Filament password reset flow in `AdminPanelProvider`:
  - `->passwordReset()`
- Added admin password-reset endpoints in `routes/api.php`:
  - `POST /api/admin/forgot-password` (throttled)
  - `POST /api/admin/reset-password` (throttled)
- Implemented logic in `AdminAuthController`:
  - token-based reset via Laravel `Password` broker
  - secure validation
  - token revocation after reset
  - enumeration-safe forgot-password response
- Added authenticated password change endpoint:
  - `POST /api/admin/change-password`
  - validates `current_password`
  - enforces strong password rules
  - revokes existing tokens after password change
- Added reset email notification class:
  - `apps/admin-laravel/app/Notifications/ResetAdminPasswordNotification.php`
- Wired notification via `User::sendPasswordResetNotification()` in `apps/admin-laravel/app/Models/User.php`.
- Added `config/mail.php` and mail keys in `.env.example` for operational reset-email support.

## 3) Password Rules and Hashing
- Strengthened password policy to:
  - minimum 12 chars
  - uppercase/lowercase
  - number
  - symbol
- Applied to:
  - API reset/change password
  - Filament UserResource create/edit password fields
  - Filament manual reset-password action
- Hashing remains secure with `Hash::make`.

## 4) User Status Control
- Admin API login now blocks inactive users explicitly in `AdminAuthController@login`.
- Filament already blocked inactive users via `canAccessPanel`.
- Combined behavior now consistent across panel + API.

## 5) Role System Usage
- `admin_role` list remains:
  - `super_admin`
  - `operations_admin`
  - `finance_admin`
  - `cms_admin`
  - `accountant`
- Tightened `User::canAccessAdmin()` to use role + admin-role semantics while keeping legacy compatibility for old `admin` records without `admin_role`.

## 6) Module Access Enforcement
- Existing trait-based enforcement remains for most resources/pages.
- Hardened `UserResource` (previous outlier) to enforce module access for edit/delete paths:
  - requires `users` module for management actions
  - keeps super-admin elevated behavior where appropriate
- This improves consistency for hidden navigation + direct URL/resource action access.

## 7) Security Rules
- Added protections:
  - cannot delete last active `super_admin`
    - table delete action
    - bulk delete action
    - edit-page delete action
  - cannot deactivate self (including edit-save path, not only table toggle)
  - cannot remove own user-management access in self-edit path
- Existing protection to avoid removing the only active super admin was retained and extended.

## 8) Last Login Tracking
- Added login event listener:
  - `apps/admin-laravel/app/Listeners/UpdateLastLoginAt.php`
- Registered in `AppServiceProvider` for `Illuminate\Auth\Events\Login`.
- `last_login_at` now updates from generic auth-login events (including Filament session login), not only API controller path.

## Security Measures Added
- Admin-access middleware for API route group
- Password reset token flow + throttling
- Strong password validation policy
- Token revocation on password change/reset
- Inactive-account login block
- Last super-admin deletion guard
- Self-deactivation/self-lockout guard
- Auth-event based last-login tracking

## Gaps Remaining / Follow-Up
- Verify production mail transport settings (`MAIL_*`) and queue strategy for reset emails.
- Consider unifying webhook endpoints (`/webhooks/stripe` vs `/api/webhooks/stripe`) to reduce security/ops complexity.
- Consider role/ability-specific middleware for sensitive admin API domains (finance/refunds) beyond baseline `admin.access`.
- Add feature tests for:
  - forgot/reset/change password flows
  - inactive login denial
  - last super-admin safety constraints
  - module access denial on direct URL/resource actions
