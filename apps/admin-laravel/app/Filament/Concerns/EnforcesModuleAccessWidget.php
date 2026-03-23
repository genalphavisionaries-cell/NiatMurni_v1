<?php

namespace App\Filament\Concerns;

use App\Models\User;

/**
 * For Filament Widgets: implements canView() using AdminModules.
 */
trait EnforcesModuleAccessWidget
{
    protected static string $requiredModule = '';

    public static function canView(): bool
    {
        if (static::$requiredModule === '') {
            return auth()->check();
        }

        /** @var User|null $user */
        $user = auth()->user();

        return $user?->hasModuleAccess(static::$requiredModule) ?? false;
    }
}
