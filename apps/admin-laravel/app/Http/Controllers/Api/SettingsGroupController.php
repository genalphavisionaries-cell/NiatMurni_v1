<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsGroupController extends Controller
{
    /** Groups readable without authentication (public site / Next.js). */
    private const PUBLIC_GROUPS = [
        'branding',
        'feature_flags',
    ];

    /**
     * GET /api/settings/{group}
     *
     * Returns non-secret values for the given group. Password / encrypted keys are omitted.
     */
    public function show(Request $request, string $group): JsonResponse
    {
        $groups = config('platform_settings', []);
        if (! array_key_exists($group, $groups)) {
            abort(404, 'Unknown settings group.');
        }

        $isPublic = in_array($group, self::PUBLIC_GROUPS, true);
        if (! $isPublic && ! $request->user('sanctum')) {
            abort(401, 'Unauthenticated.');
        }

        /** @var SettingService $svc */
        $svc = app(SettingService::class);
        $data = $svc->getGroup($group);
        $data = $this->stripSensitiveKeys($group, $data);

        return response()->json([
            'group' => $group,
            'data' => $data,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function stripSensitiveKeys(string $group, array $data): array
    {
        $meta = config('platform_settings.'.$group, []);
        foreach ($meta as $key => $m) {
            if (($m['encrypt'] ?? false) || ($m['type'] ?? '') === 'password') {
                unset($data[$key]);
            }
        }

        return $data;
    }
}
