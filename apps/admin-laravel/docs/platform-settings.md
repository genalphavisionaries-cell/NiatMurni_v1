# Platform settings (SaaS)

- **Table:** `settings` (columns: `group`, `key`, `value` text, `is_encrypted`, timestamps). Unique (`group`, `key`).
- **Config schema:** `config/platform_settings.php`
- **Service:** `App\Services\SettingService` — `get($group, $key, $default)`, `getByKey($key, $default)`, `getGroup($group)`, `set($group, $key, $value, $encrypt = false)`
- **Filament:** `Settings` → **Platform settings** (`/admin/platform-settings`), gated by `settings` module.
- **API:** `GET /api/settings/{group}` — public for `branding` and `feature_flags` (no secrets); other groups require `auth:sanctum`. Password/encrypted keys are never returned in JSON.
- **Seeder:** `PlatformSettingsDefaultsSeeder` (registered in `DatabaseSeeder`).

Legacy CMS keys (`cms_*`) are assigned `group = branding`; certificate rule keys use `group = system`. Existing `Setting::where('key', …)` lookups remain valid while keys stay globally unique.
