<?php

use App\Services\SettingsService;

if (! function_exists('setting')) {
    /**
     * Global helper to read system settings.
     */
    function setting(string $key, mixed $default = null): mixed
    {
        /** @var SettingsService $service */
        $service = app(SettingsService::class);

        return $service->get($key, $default);
    }
}

