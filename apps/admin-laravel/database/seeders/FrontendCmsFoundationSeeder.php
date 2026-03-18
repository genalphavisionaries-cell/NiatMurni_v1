<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Support\FrontendCmsSettingKeys;
use Illuminate\Database\Seeder;

/**
 * Seeds empty `settings` rows for public CMS keys so Filament/API can update them later.
 * Safe to run multiple times (updateOrCreate).
 */
class FrontendCmsFoundationSeeder extends Seeder
{
    public function run(): void
    {
        foreach (array_keys(FrontendCmsSettingKeys::all()) as $key) {
            Setting::query()->firstOrCreate(
                ['key' => $key],
                ['value' => '']
            );
        }
    }
}
