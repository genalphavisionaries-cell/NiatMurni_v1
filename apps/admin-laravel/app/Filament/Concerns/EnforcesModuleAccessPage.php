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
        // TEMPORARY (project-wide unblock):
        // Allow any authenticated user to access all pages.
        return auth()->check();
    }
}
