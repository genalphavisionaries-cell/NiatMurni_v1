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
    /** Set in each Resource: e.g. AdminModules::PROGRAMS */
    protected static string $requiredModule = '';

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
        if ($module === '') {
            return auth()->check();
        }

        /** @var User|null $user */
        $user = auth()->user();

        return $user?->hasModuleAccess($module) ?? false;
    }
}
