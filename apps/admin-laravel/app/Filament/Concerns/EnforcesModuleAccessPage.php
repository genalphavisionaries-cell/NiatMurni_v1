<?php

namespace App\Filament\Concerns;

use App\Models\User;

/**
 * For Filament custom Pages: implements canAccess() using AdminModules.
 */
trait EnforcesModuleAccessPage
{
    /**
     * Each Page using this trait must declare:
     * `protected static string $requiredModule = AdminModules::…;`
     */

    public static function canAccess(): bool
    {
        if (static::$requiredModule === '') {
            return auth()->check();
        }

        /** @var User|null $user */
        $user = auth()->user();

        return $user?->hasModuleAccess(static::$requiredModule) ?? false;
    }
}
