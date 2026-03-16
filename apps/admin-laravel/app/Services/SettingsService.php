<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;

class SettingsService
{
    /**
     * Get a setting value by key, with optional default.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        /** @var SystemSetting|null $setting */
        $setting = SystemSetting::query()->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        $raw = $setting->value;

        if ($setting->is_encrypted && $raw !== null) {
            $raw = Crypt::decryptString($raw);
        }

        return $this->castFromStorage($raw, $setting->type, $default);
    }

    /**
     * Set or update a setting value.
     */
    public function set(string $key, mixed $value, string $group = 'system'): SystemSetting
    {
        /** @var SystemSetting $setting */
        $setting = SystemSetting::query()->firstOrNew(['key' => $key]);

        $setting->group = $group;

        // Preserve existing type/is_encrypted if present; otherwise infer type and default is_encrypted=false.
        if (! $setting->exists || ! $setting->type) {
            $setting->type = $this->inferType($value);
        }

        if (! $setting->exists) {
            $setting->is_encrypted = (bool) ($setting->is_encrypted ?? false);
        }

        $stored = $this->castForStorage($value, $setting->type);

        if ($setting->is_encrypted && $stored !== null) {
            $stored = Crypt::encryptString($stored);
        }

        $setting->value = $stored;
        $setting->save();

        return $setting;
    }

    /**
     * Get all settings for a given group (key => value array).
     */
    public function getGroup(string $group): Collection
    {
        return SystemSetting::query()
            ->where('group', $group)
            ->get()
            ->mapWithKeys(function (SystemSetting $setting) {
                $raw = $setting->value;
                if ($setting->is_encrypted && $raw !== null) {
                    $raw = Crypt::decryptString($raw);
                }

                return [
                    $setting->key => $this->castFromStorage($raw, $setting->type, null),
                ];
            });
    }

    protected function inferType(mixed $value): string
    {
        return match (true) {
            is_bool($value) => 'boolean',
            is_int($value), is_float($value) => 'number',
            is_array($value) => 'json',
            default => 'string',
        };
    }

    protected function castForStorage(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'number' => (string) $value,
            'json' => json_encode($value),
            default => (string) $value,
        };
    }

    protected function castFromStorage(?string $value, string $type, mixed $default): mixed
    {
        if ($value === null) {
            return $default;
        }

        return match ($type) {
            'boolean' => $value === '1' || strtolower($value) === 'true',
            'number' => is_numeric($value) ? 0 + $value : $default,
            'json' => json_decode($value, true) ?? $default,
            default => $value,
        };
    }
}

