# Settings → Users — Admin User Management

**Resource class:** `App\Filament\Resources\UserResource`
**Navigation:** Settings → Users (sort 10)
**URL:** `/admin/users`

---

## 1. Current auth / user structure found

| Aspect | Detail |
|---|---|
| Auth guard | `web` (Laravel default session-based) |
| User model | `App\Models\User` — standard `Authenticatable` |
| Panel login | Filament's built-in login form at `/admin/login` |
| Panel gate | `canAccessPanel(Panel $panel)` on the User model (added in this step via `FilamentUser` interface) |
| Existing `role` column | `admin` / `tutor` / `staff` — coarse-grained panel access gate |
| `is_active` column | Already existed (added by `2026_03_04` migration) |
| `last_login_at` | Already existed; populated externally (not yet wired to login event) |
| Permissions library | **None** — no Spatie/Shield. Custom lightweight solution used. |

---

## 2. Source of truth for admin accounts

**The existing `users` table is the single source of truth.** No separate admin table was created.

Justification:
- All current admin accounts are already `users` rows with `role = admin`.
- The model already has `canAccessAdmin()`, `is_active`, and `email_verified_at`.
- Adding `admin_role` and `module_access` columns is non-breaking and backward-safe.

---

## 3. New columns added (migration `2026_03_14_120000`)

| Column | Type | Purpose |
|---|---|---|
| `admin_role` | `string(50)` nullable | Fine-grained admin role key |
| `module_access` | `json` nullable | Explicit array of allowed module keys |
| `recovery_email` | `string(255)` nullable | Secondary email for account recovery |

**Existing columns kept unchanged:** `role`, `is_active`, `last_login_at`, `email`, `email_verified_at`, `phone`.

---

## 4. Role structure

Roles are stored in the `admin_role` column.

| `admin_role` value | Label | Access level |
|---|---|---|
| `super_admin` | Super Admin | Full access to everything; bypasses all module checks |
| `finance_admin` | Finance Admin | Dashboard, Bookings, Payments, Refunds, Finance, Participants |
| `operations_admin` | Operations Admin | Dashboard, Programs, Classes, Bookings, Participants, Tutors, Certificates |
| `accountant` | Accountant | Dashboard, Payments, Refunds, Finance |
| `cms_admin` | CMS Admin | Dashboard, CMS |

Default module lists live in `App\Support\AdminModules::defaultsForRole()` and are only used when `module_access` is null.

---

## 5. Module access structure

Canonical module keys are defined in `App\Support\AdminModules`:

```
dashboard | programs | classes | bookings | participants | tutors
certificates | payments | refunds | finance | cms | settings | users
```

Resolution order when a request arrives:
1. If `admin_role = super_admin` → **full access**.
2. Else if `module_access` array is non-empty → use that array.
3. Else → derive from `AdminModules::defaultsForRole($user->admin_role)`.

This means admins don't need `module_access` set at all — assigning a role is enough. Override with an explicit list when you need to give narrower or broader access than the role default.

---

## 6. FilamentUser interface

`User` now implements `Filament\Models\Contracts\FilamentUser`, adding:

```php
public function canAccessPanel(Panel $panel): bool
{
    return (bool) $this->is_active && $this->canAccessAdmin();
}
```

This means **inactive accounts cannot log in** even if they have the correct credentials. Previously, all authenticated users could reach the panel regardless of `is_active`.

---

## 7. What the Users page can do now

| Feature | Status |
|---|---|
| List all admin/staff/tutor accounts | ✅ |
| Search by name / email | ✅ |
| Filter by admin role, active status, verification | ✅ |
| Create new admin account | ✅ Super Admin only |
| Edit account (name, email, phone, recovery email, role, module access) | ✅ Super Admin; or self (own profile fields only) |
| Set password on create | ✅ |
| Change password on edit (leave blank to keep) | ✅ |
| Reset password (modal action) | ✅ Super Admin only |
| Activate / deactivate account | ✅ Super Admin only, with safety checks |
| Show email verified status | ✅ |
| Show last login timestamp | ✅ |
| Delete account | ✅ Super Admin only (cannot delete self) |
| Module access assignment (CheckboxList) | ✅ Super Admin only |
| Prevent deactivating only Super Admin | ✅ |
| Prevent deleting self | ✅ |

---

## 8. Access control enforcement — now vs later

### Enforced NOW

| Area | What is enforced |
|---|---|
| Panel entry | `canAccessPanel()` — inactive accounts blocked |
| UserResource | Full CRUD gated by `hasModuleAccess('users')` / `isSuperAdmin()` |
| CMS pages (ManageFrontendCmsSettings, ManageHomepageSettings) | Gated by `hasModuleAccess('cms')` |
| Settings page (SystemSettings) | Gated by `hasModuleAccess('settings')` |
| Password reset action | Super Admin only |
| Role / status changes | Super Admin only |
| Last Super Admin safety | Enforced on deactivate and on save |

### Deferred to later

| Area | What remains |
|---|---|
| All other Resources (Programs, Bookings, Certificates, etc.) | Add `use EnforcesModuleAccess` trait + `$requiredModule` — see pattern below |
| `last_login_at` recording | Add listener/observer on `Login` event |
| Email verification send | Add "Send verification email" action to UserResource |
| Filament navigation hiding | Already works via `canViewAny()` on Resources — but Resources without the trait still show for all panel users |
| MFA / backup codes | Deferred |

### Pattern for adding enforcement to an existing Resource

```php
use App\Filament\Concerns\EnforcesModuleAccess;
use App\Support\AdminModules;

class BookingResource extends Resource
{
    use EnforcesModuleAccess;

    protected static string $requiredModule = AdminModules::BOOKINGS;
    // ...
}
```

---

## 9. Password reset approach

Two paths:

1. **Admin-initiated reset (this step):** Super Admin uses the "Reset password" action on the Users list. A modal collects `new_password` + `new_password_confirmation`, then calls `Hash::make()` and saves.

2. **Self-service reset (future):** Standard Laravel password reset via email (not yet wired). The `password_reset_tokens` table already exists from the base migration.

---

## 10. Commands to run after deploying

```bash
cd apps/admin-laravel

# Run the new migration
php artisan migrate

# Clear caches
php artisan config:clear
php artisan cache:clear

# (Optional) Set your own account as Super Admin — replace the email
php artisan tinker
>>> \App\Models\User::where('email', 'your@email.com')->update(['admin_role' => 'super_admin']);
>>> exit
```

Visit `/admin` → Settings → Users to start managing admin accounts.

---

## 11. What to build next for Settings → Users

| Priority | Item |
|---|---|
| High | Record `last_login_at` on successful login (listener on `Illuminate\Auth\Events\Login`) |
| High | Apply `EnforcesModuleAccess` trait to all remaining Resources |
| Medium | "Send verification email" action on UserResource |
| Medium | Self-service password reset via email |
| Low | Per-user activity log view (link to AuditLogResource filtered by user) |
| Low | MFA support |
