<?php

namespace App\Models;

use App\Notifications\ResetAdminPasswordNotification;
use App\Support\AdminModules;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'recovery_email',
        'password',
        'role',
        'admin_role',
        'module_access',
        'employer_id',
        'phone',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'is_active'         => 'boolean',
            'module_access'     => 'array',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Filament panel access gate
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by Filament on every request to decide if the user may enter the panel.
     * Requires the account to be active AND have a valid admin-level role.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        $allowed = (bool) $this->is_active && $this->canAccessAdmin();
        if (! $allowed) {
            logger()->warning('User canAccessPanel denied', [
                'user_id' => $this->id,
                'is_active' => $this->is_active,
                'role' => $this->role,
                'admin_role' => $this->admin_role,
            ]);
        }

        return $allowed;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Role helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Returns true for roles that may open the admin panel (legacy gate). */
    public function canAccessAdmin(): bool
    {
        if ($this->role === 'tutor') {
            return true;
        }

        if (! in_array($this->role, ['admin', 'staff'], true)) {
            logger()->warning('User canAccessAdmin denied', [
                'user_id' => $this->id,
                'reason' => 'role_not_admin_or_staff',
                'role' => $this->role,
                'admin_role' => $this->admin_role,
            ]);
            return false;
        }

        // Backward compatibility: allow legacy admin records with empty admin_role.
        if ($this->admin_role === null || $this->admin_role === '') {
            $ok = $this->role === 'admin';
            if (! $ok) {
                logger()->warning('User canAccessAdmin denied', [
                    'user_id' => $this->id,
                    'reason' => 'empty_admin_role_not_admin',
                    'role' => $this->role,
                    'admin_role' => $this->admin_role,
                ]);
            }

            return $ok;
        }

        $ok = $this->hasValidAdminRole();
        if (! $ok) {
            logger()->warning('User canAccessAdmin denied', [
                'user_id' => $this->id,
                'reason' => 'invalid_admin_role',
                'role' => $this->role,
                'admin_role' => $this->admin_role,
            ]);
        }

        return $ok;
    }

    public function hasValidAdminRole(): bool
    {
        return array_key_exists((string) $this->admin_role, self::adminRoleLabels());
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTrainer(): bool
    {
        return $this->role === 'tutor';
    }

    public function isSuperAdmin(): bool
    {
        return self::isSuperAdminRole($this->role, $this->admin_role);
    }

    /**
     * Centralized definition of "super admin".
     *
     * Legacy compatibility:
     * - old admin records may have role=admin and empty admin_role
     * - existing logic treats those as having full module access
     */
    public static function isSuperAdminRole(?string $role, ?string $adminRole): bool
    {
        if ($adminRole === 'super_admin') {
            return true;
        }

        if ($adminRole === null || $adminRole === '') {
            return $role === 'admin';
        }

        return false;
    }

    public function isFinanceAdmin(): bool
    {
        return $this->admin_role === 'finance_admin';
    }

    /** Super Admin or Finance Admin (payments & finance tab visibility). */
    public function canAccessPaymentFinanceSettings(): bool
    {
        return $this->isSuperAdmin() || $this->isFinanceAdmin();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Module access
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns true if this user has explicit or role-derived access to the given module.
     * Super Admins always pass.
     */
    public function hasModuleAccess(string $module): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Legacy accounts (role=admin) created before admin_role existed: full module access.
        if ($this->role === 'admin' && ($this->admin_role === null || $this->admin_role === '')) {
            return true;
        }

        if (in_array($this->admin_role, ['operations_admin', 'finance_admin'], true)) {
            $moduleKeys = $this->relationLoaded('userModules')
                ? $this->userModules->pluck('module_key')->all()
                : $this->userModules()->pluck('module_key')->all();
            if ($moduleKeys !== []) {
                return in_array($module, $moduleKeys, true);
            }
        }

        // Explicit overrides stored in module_access column take precedence.
        if (is_array($this->module_access) && $this->module_access !== []) {
            return in_array($module, $this->module_access, true);
        }

        // Fall back to role defaults when no explicit list has been saved.
        $defaults = AdminModules::defaultsForRole((string) $this->admin_role);

        return in_array($module, $defaults, true);
    }

    /**
     * Returns the resolved list of accessible modules for this user.
     * Useful for display in the admin profile / user management page.
     *
     * @return string[]
     */
    public function resolvedModules(): array
    {
        if ($this->isSuperAdmin()) {
            return array_keys(AdminModules::labels());
        }

        if ($this->role === 'admin' && ($this->admin_role === null || $this->admin_role === '')) {
            return array_keys(AdminModules::labels());
        }

        if (in_array($this->admin_role, ['operations_admin', 'finance_admin'], true)) {
            $moduleKeys = $this->relationLoaded('userModules')
                ? $this->userModules->pluck('module_key')->all()
                : $this->userModules()->pluck('module_key')->all();
            if ($moduleKeys !== []) {
                return $moduleKeys;
            }
        }

        if (is_array($this->module_access) && $this->module_access !== []) {
            return $this->module_access;
        }

        return AdminModules::defaultsForRole((string) $this->admin_role);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin-role labels (static helpers)
    // ─────────────────────────────────────────────────────────────────────────

    public static function adminRoleLabels(): array
    {
        return [
            'super_admin'       => 'Super Admin',
            'technical_admin'   => 'Technical Admin',
            'content_admin'     => 'Content Admin',
            'finance_admin'     => 'Finance Admin',
            'operations_admin'  => 'Operations Admin',
            'accountant'        => 'Accountant',
            'cms_admin'         => 'CMS Admin',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function tutor(): HasOne
    {
        return $this->hasOne(Tutor::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function userModules(): HasMany
    {
        return $this->hasMany(UserModule::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetAdminPasswordNotification((string) $token));
    }
}
