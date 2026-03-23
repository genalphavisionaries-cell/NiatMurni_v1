<?php

namespace Database\Seeders;

use App\Services\SettingService;
use Illuminate\Database\Seeder;

class PlatformSettingsDefaultsSeeder extends Seeder
{
    /**
     * Seed platform_settings config keys into `settings` (idempotent).
     */
    public function run(): void
    {
        /** @var SettingService $svc */
        $svc = app(SettingService::class);

        foreach (config('platform_settings', []) as $group => $keys) {
            foreach ($keys as $key => $meta) {
                $type = $meta['type'] ?? 'text';
                $default = $meta['default'] ?? '';
                $encrypt = (bool) ($meta['encrypt'] ?? false);

                if ($type === 'password' && $default === '') {
                    continue;
                }

                $exists = \App\Models\Setting::query()
                    ->where('group', $group)
                    ->where('key', $key)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $svc->set($group, $key, $default, $encrypt);
            }
        }
    }
}
