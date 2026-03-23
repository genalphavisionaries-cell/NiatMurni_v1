<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminSettingsController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $this->transformMe($user);

        // Keep backward compatibility for existing admin shell consumers.
        return response()->json([
            'user' => $payload,
            'data' => $payload,
        ]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'recovery_email' => ['nullable', 'email', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'data' => $this->transformMe($user->fresh() ?? $user),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'data' => ['message' => 'Password changed successfully. Please log in again.'],
        ]);
    }

    public function settings(Request $request, SettingService $settings): JsonResponse
    {
        return response()->json([
            'data' => [
                'site_name' => (string) ($settings->get('admin_panel', 'site_name', config('app.name')) ?? config('app.name')),
                'logo_url' => (string) ($settings->get('admin_panel', 'logo_url', '') ?? ''),
                'theme_color' => (string) ($settings->get('admin_panel', 'theme_color', '#2563eb') ?? '#2563eb'),
                'support_email' => (string) ($settings->get('admin_panel', 'support_email', '') ?? ''),
                'support_phone' => (string) ($settings->get('admin_panel', 'support_phone', '') ?? ''),
            ],
        ]);
    }

    public function updateSettings(Request $request, SettingService $settings): JsonResponse
    {
        $validated = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'theme_color' => ['nullable', 'string', 'max:20'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:30'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'logo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $logoUrl = $validated['logo_url'] ?? (string) ($settings->get('admin_panel', 'logo_url', '') ?? '');
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('admin/settings', 'public');
            $baseUrl = rtrim((string) config('app.url'), '/');
            $logoUrl = $baseUrl . '/storage/' . ltrim($path, '/');
        }

        $actorId = (int) ($request->user()?->id ?? 0) ?: null;
        $settings->set('admin_panel', 'site_name', $validated['site_name'], false, $actorId);
        $settings->set('admin_panel', 'logo_url', $logoUrl, false, $actorId);
        $settings->set('admin_panel', 'theme_color', (string) ($validated['theme_color'] ?? '#2563eb'), false, $actorId);
        $settings->set('admin_panel', 'support_email', (string) ($validated['support_email'] ?? ''), false, $actorId);
        $settings->set('admin_panel', 'support_phone', (string) ($validated['support_phone'] ?? ''), false, $actorId);

        return response()->json([
            'data' => [
                'site_name' => $validated['site_name'],
                'logo_url' => $logoUrl,
                'theme_color' => (string) ($validated['theme_color'] ?? '#2563eb'),
                'support_email' => (string) ($validated['support_email'] ?? ''),
                'support_phone' => (string) ($validated['support_phone'] ?? ''),
            ],
        ]);
    }

    public function apiConnections(SettingService $settings): JsonResponse
    {
        return response()->json([
            'data' => [
                'google_analytics' => [
                    'measurement_id' => (string) ($settings->get('api_connections', 'google_analytics.measurement_id', '') ?? ''),
                    'service_account' => (string) ($settings->get('api_connections', 'google_analytics.service_account', '') ?? ''),
                ],
                'stripe' => [
                    'publishable_key' => (string) ($settings->get('api_connections', 'stripe.publishable_key', '') ?? ''),
                    'secret_key' => (string) ($settings->get('api_connections', 'stripe.secret_key', '') ?? ''),
                    'webhook_secret' => (string) ($settings->get('api_connections', 'stripe.webhook_secret', '') ?? ''),
                ],
            ],
        ]);
    }

    public function updateApiConnections(Request $request, SettingService $settings): JsonResponse
    {
        $validated = $request->validate([
            'google_analytics' => ['required', 'array'],
            'google_analytics.measurement_id' => ['nullable', 'string', 'max:255'],
            'google_analytics.service_account' => ['nullable', 'string'],
            'stripe' => ['required', 'array'],
            'stripe.publishable_key' => ['nullable', 'string', 'max:512'],
            'stripe.secret_key' => ['nullable', 'string', 'max:512'],
            'stripe.webhook_secret' => ['nullable', 'string', 'max:512'],
        ]);

        $googleAnalytics = $validated['google_analytics'] ?? [];
        $stripe = $validated['stripe'] ?? [];
        $actorId = (int) ($request->user()?->id ?? 0) ?: null;

        $settings->set('api_connections', 'google_analytics.measurement_id', (string) ($googleAnalytics['measurement_id'] ?? ''), true, $actorId);
        $settings->set('api_connections', 'google_analytics.service_account', (string) ($googleAnalytics['service_account'] ?? ''), true, $actorId);
        $settings->set('api_connections', 'stripe.publishable_key', (string) ($stripe['publishable_key'] ?? ''), true, $actorId);
        $settings->set('api_connections', 'stripe.secret_key', (string) ($stripe['secret_key'] ?? ''), true, $actorId);
        $settings->set('api_connections', 'stripe.webhook_secret', (string) ($stripe['webhook_secret'] ?? ''), true, $actorId);

        return response()->json([
            'data' => [
                'google_analytics' => [
                    'measurement_id' => (string) ($googleAnalytics['measurement_id'] ?? ''),
                    'service_account' => (string) ($googleAnalytics['service_account'] ?? ''),
                ],
                'stripe' => [
                    'publishable_key' => (string) ($stripe['publishable_key'] ?? ''),
                    'secret_key' => (string) ($stripe['secret_key'] ?? ''),
                    'webhook_secret' => (string) ($stripe['webhook_secret'] ?? ''),
                ],
            ],
        ]);
    }

    private function transformMe(User $user): array
    {
        $role = (string) ($user->admin_role ?: $user->role);

        return [
            'id' => (int) $user->id,
            'name' => (string) $user->name,
            'email' => (string) $user->email,
            'phone' => $user->phone,
            'recovery_email' => $user->recovery_email,
            'role' => $role,
            'modules' => $this->modulesForRole($user, $role),
            'status' => $user->is_active ? 'active' : 'inactive',
            'last_login_at' => optional($user->last_login_at)->toIso8601String(),
        ];
    }

    private function modulesForRole(User $user, string $role): array
    {
        if ($role === 'super_admin') {
            return [
                'programs', 'classes', 'bookings', 'participants', 'tutors', 'certificates',
                'finance', 'settings', 'users', 'cms', 'homepage', 'blog',
            ];
        }

        if ($role === 'technical_admin') {
            return ['programs', 'classes', 'bookings', 'participants', 'tutors', 'certificates', 'settings'];
        }

        if ($role === 'content_admin') {
            return ['cms', 'homepage', 'blog', 'settings'];
        }

        if (in_array($role, ['operations_admin', 'finance_admin'], true)) {
            return $user->userModules()->pluck('module_key')->values()->all();
        }

        return $user->resolvedModules();
    }
}
