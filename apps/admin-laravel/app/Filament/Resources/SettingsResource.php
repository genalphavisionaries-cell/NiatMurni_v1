<?php

namespace App\Filament\Resources;

use App\Filament\Concerns\EnforcesModuleAccess;
use App\Filament\Resources\SettingsResource\Pages;
use App\Models\Setting;
use App\Support\AdminModules;
use Filament\Resources\Resource;

/**
 * SaaS-style platform settings (grouped keys). Single management page with tabs.
 */
class SettingsResource extends Resource
{
    use EnforcesModuleAccess;

    protected static string $requiredModule = AdminModules::SETTINGS;

    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-adjustments-horizontal';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Platform settings';

    protected static ?string $slug = 'platform-settings';

    protected static ?string $modelLabel = 'Setting';

    protected static ?string $pluralModelLabel = 'Settings';

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageSettings::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
