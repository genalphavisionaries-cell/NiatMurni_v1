<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

/**
 * Centralised access to the `settings` table (grouped keys + optional encryption).
 *
 * Legacy rows (single-key lookups) remain compatible: keys are globally unique in practice.
 */
class SettingService
{
    private const CACHE_PREFIX = 'settings.v1';

    private const CACHE_TTL_SECONDS = 3600;

    /**
     * Get a value for a group + key. Decrypts when is_encrypted is true.
     */
    public function get(string $group, string $key, mixed $default = null): mixed
    {
        $cacheKey = $this->cacheKey($group, $key);

        $resolved = Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($group, $key) {
            $row = Setting::query()
                ->where('group', $group)
                ->where('key', $key)
                ->first();

            if ($row === null) {
                return ['_missing' => true];
            }

            return ['value' => $this->decodeStoredValue($row)];
        });

        if (is_array($resolved) && ($resolved['_missing'] ?? false)) {
            return $default;
        }

        return is_array($resolved) ? ($resolved['value'] ?? $default) : $resolved;
    }

    /**
     * Legacy-friendly: resolve by key globally (first match). Prefer get($group, $key).
     */
    public function getByKey(string $key, mixed $default = null): mixed
    {
        $cacheKey = self::CACHE_PREFIX.'.key.'.$key;

        $resolved = Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($key) {
            $row = Setting::query()->where('key', $key)->first();

            if ($row === null) {
                return ['_missing' => true];
            }

            return ['value' => $this->decodeStoredValue($row)];
        });

        if (is_array($resolved) && ($resolved['_missing'] ?? false)) {
            return $default;
        }

        return is_array($resolved) ? ($resolved['value'] ?? $default) : $resolved;
    }

    /**
     * All keys for a group as key => value (decrypted).
     *
     * @return array<string, mixed>
     */
    public function getGroup(string $group): array
    {
        $cacheKey = self::CACHE_PREFIX.'.group.'.$group;

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($group) {
            $rows = Setting::query()->where('group', $group)->get();
            $out = [];
            foreach ($rows as $row) {
                $out[$row->key] = $this->decodeStoredValue($row);
            }

            return $out;
        });
    }

    /**
     * Upsert a setting. When $encrypt is true, value is encrypted at rest and is_encrypted is set.
     */
    public function set(string $group, string $key, mixed $value, bool $encrypt = false): Setting
    {
        $stored = $encrypt ? Crypt::encryptString($this->serializeValue($value)) : $this->serializeValue($value);

        $setting = Setting::query()->updateOrCreate(
            ['group' => $group, 'key' => $key],
            [
                'value' => $stored,
                'is_encrypted' => $encrypt,
            ]
        );

        $this->forgetCache($group, $key);
        Cache::forget('setting.'.$key);

        return $setting;
    }

    public function forgetCache(?string $group = null, ?string $key = null): void
    {
        if ($group !== null && $key !== null) {
            Cache::forget($this->cacheKey($group, $key));
            Cache::forget(self::CACHE_PREFIX.'.key.'.$key);
            Cache::forget(self::CACHE_PREFIX.'.group.'.$group);

            return;
        }

        if ($group !== null) {
            Cache::forget(self::CACHE_PREFIX.'.group.'.$group);
        }

        // Broad invalidation: version bump pattern would be better at scale; here flush group caches
        foreach (array_keys(config('platform_settings', [])) as $g) {
            Cache::forget(self::CACHE_PREFIX.'.group.'.$g);
        }
    }

    private function cacheKey(string $group, string $key): string
    {
        return self::CACHE_PREFIX.'.'.$group.'.'.$key;
    }

    private function decodeStoredValue(Setting $row): mixed
    {
        $raw = $row->value;
        if ($raw === null || $raw === '') {
            return null;
        }

        if ($row->is_encrypted) {
            try {
                $decrypted = Crypt::decryptString((string) $raw);

                return $this->unserializeValue($decrypted);
            } catch (\Throwable) {
                return null;
            }
        }

        return $this->coercePlainValue((string) $raw);
    }

    private function coercePlainValue(string $raw): mixed
    {
        $t = strtolower(trim($raw));
        if ($t === 'true') {
            return true;
        }
        if ($t === 'false') {
            return false;
        }

        return $raw;
    }

    private function serializeValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }
        if (is_scalar($value) || $value === null) {
            return (string) $value;
        }

        return json_encode($value);
    }

    private function unserializeValue(string $raw): mixed
    {
        $t = strtolower(trim($raw));
        if ($t === 'true') {
            return true;
        }
        if ($t === 'false') {
            return false;
        }

        return $raw;
    }
}
