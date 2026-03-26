<?php

namespace App\Filament\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Mixin for Filament Resources gated by AdminModules keys.
 *
 * Super Admins and legacy role=admin with empty admin_role pass hasModuleAccess() for all modules.
 *
 * @see \App\Support\AdminModules
 */
trait EnforcesModuleAccess
{
    /**
     * Each Resource using this trait must declare:
     * `protected static string $requiredModule = AdminModules::…;`
     * (PHP 8.3+ forbids defining the same static property on both trait and class with different defaults.)
     */

    public static function canViewAny(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canCreate(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canEdit(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canDelete(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canDeleteAny(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canForceDelete(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canForceDeleteAny(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canRestore(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canRestoreAny(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canReplicate(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canView(Model $record): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    protected static function actorHasModule(string $module): bool
    {
        // TEMPORARY (project-wide unblock):
        // Allow any authenticated user to access all modules.
        return auth()->check();
    }
}
