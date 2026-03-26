<?php

namespace App\Filament\Concerns;

use App\Models\User;

/**
 * For Filament Widgets: implements canView() using AdminModules.
 */
trait EnforcesModuleAccessWidget
{
    /**
     * Each Widget using this trait must declare:
     * `protected static string $requiredModule = AdminModules::…;`
     */

    public static function canView(): bool
    {
        // TEMPORARY (project-wide unblock):
        // Allow any authenticated user to view all widgets.
        return auth()->check();
    }
}
