<?php

use App\Models\Setting;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Cache;

if (! function_exists('setting')) {
    /**
     * Retrieve value from settings table (cached). Falls back to system_settings if key not in settings.
     */
    function setting(string $key, mixed $default = null): mixed
    {
        $cacheKey = 'setting.' . $key;

        $stored = Cache::remember($cacheKey, 3600, function () use ($key) {
            $row = Setting::query()->where('key', $key)->first();

            return $row === null ? ['_missing' => true] : ['value' => $row->value];
        });

        if (isset($stored['_missing'])) {
            return app(SettingsService::class)->get($key, $default);
        }

        return $stored['value'] ?? $default;
    }
}

