<?php

return [
    'panels' => [
        App\Providers\Filament\AdminPanelProvider::class,
    ],
    'assets_path' => null,
    'broadcasting' => [
        'enabled' => false,
    ],
    'default_filesystem_disk' => env('FILAMENT_FILESYSTEM_DISK', 'public'),
];
