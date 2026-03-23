<?php

namespace App\Filament\Concerns;

use App\Models\User;

/**
 * For Filament custom Pages: implements canAccess() using AdminModules.
 */
trait EnforcesModuleAccessPage
{
    protected static string $requiredModule = '';

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
