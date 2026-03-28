<?php

use App\Services\SettingService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * Adds branding primary / secondary / accent keys for public site theme (Platform settings schema).
 * Idempotent: skips rows that already exist (same as PlatformSettingsDefaultsSeeder per-key).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        $defaults = [
            'primary_color' => '#2563EB',
            'secondary_color' => '#64748B',
            'accent_color' => '#F59E0B',
        ];

        /** @var SettingService $svc */
        $svc = app(SettingService::class);

        foreach ($defaults as $key => $value) {
            $exists = \App\Models\Setting::query()
                ->where('group', 'branding')
                ->where('key', $key)
                ->exists();

            if (! $exists) {
                $svc->set('branding', $key, $value, false);
            }
        }
    }

    public function down(): void
    {
        // Optional: leave values in place so public theme does not break after rollback.
    }
};
