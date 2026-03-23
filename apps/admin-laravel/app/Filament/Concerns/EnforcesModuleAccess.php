<?php

namespace App\Filament\Concerns;

use App\Models\User;

/**
 * Mixin for Filament Resources and Pages that should be gated by a module key.
 *
 * Usage in a Resource:
 *
 *   use App\Filament\Concerns\EnforcesModuleAccess;
 *
 *   class MyResource extends Resource
 *   {
 *       use EnforcesModuleAccess;
 *
 *       protected static string $requiredModule = AdminModules::MY_MODULE;
 *   }
 *
 * Super Admins always pass. Other users need the module in their access list.
 */
trait EnforcesModuleAccess
{
    /** The AdminModules key this resource requires. Set in each Resource class. */
    protected static string $requiredModule = '';

    public static function canViewAny(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    public static function canCreate(): bool
    {
        return static::actorHasModule(static::$requiredModule);
    }

    protected static function actorHasModule(string $module): bool
    {
        if ($module === '') {
            // No module restriction defined — allow all authenticated admin users.
            return auth()->check();
        }

        /** @var User|null $user */
        $user = auth()->user();

        return $user?->hasModuleAccess($module) ?? false;
    }
}
