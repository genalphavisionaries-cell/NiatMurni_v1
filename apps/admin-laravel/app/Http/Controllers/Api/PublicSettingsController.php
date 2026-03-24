<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\FrontendCmsSettingKeys;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

/**
 * Public site settings (non-secret) for Next.js widgets.
 */
class PublicSettingsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $s = fn (string $key): string => (string) (Setting::query()->where('key', $key)->value('value') ?? '');

        $raw = $s(FrontendCmsSettingKeys::WHATSAPP_PUBLIC_JSON);
        $whatsapp = [
            'enabled' => false,
            'phone' => '',
            'welcome_text' => '',
            'default_message' => '',
            'helper_text' => '',
            'auto_open_delay_ms' => 0,
        ];
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $whatsapp['enabled'] = filter_var($decoded['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $whatsapp['phone'] = isset($decoded['phone']) ? preg_replace('/\D+/', '', (string) $decoded['phone']) : '';
                $whatsapp['welcome_text'] = (string) ($decoded['welcome_text'] ?? '');
                $whatsapp['default_message'] = (string) ($decoded['default_message'] ?? '');
                $whatsapp['helper_text'] = (string) ($decoded['helper_text'] ?? '');
                $delay = $decoded['auto_open_delay_ms'] ?? 0;
                $whatsapp['auto_open_delay_ms'] = is_numeric($delay) ? max(0, (int) $delay) : 0;
            }
        }

        return response()->json([
            'data' => [
                'whatsapp' => $whatsapp,
            ],
        ]);
    }
}
