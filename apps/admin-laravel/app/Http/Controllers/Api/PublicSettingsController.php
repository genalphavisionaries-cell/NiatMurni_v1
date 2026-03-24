<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

/**
 * Public site settings (non-CMS): WhatsApp widget + safe integration metadata.
 */
class PublicSettingsController extends Controller
{
    public function __invoke(SettingService $settings): JsonResponse
    {
        $whatsapp = $settings->get('public', 'whatsapp', []);
        if (is_string($whatsapp) && $whatsapp !== '') {
            $decoded = json_decode($whatsapp, true);
            $whatsapp = is_array($decoded) ? $decoded : [];
        }
        if (! is_array($whatsapp)) {
            $whatsapp = [];
        }

        $whatsapp = array_merge([
            'enabled' => false,
            'phone' => '',
            'welcome_text' => '',
            'default_message' => '',
            'helper_text' => '',
            'auto_open_delay_ms' => 0,
        ], $whatsapp);

        $whatsapp['enabled'] = filter_var($whatsapp['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $whatsapp['phone'] = isset($whatsapp['phone']) ? preg_replace('/\D+/', '', (string) $whatsapp['phone']) : '';
        $whatsapp['welcome_text'] = (string) ($whatsapp['welcome_text'] ?? '');
        $whatsapp['default_message'] = (string) ($whatsapp['default_message'] ?? '');
        $whatsapp['helper_text'] = (string) ($whatsapp['helper_text'] ?? '');
        $delay = $whatsapp['auto_open_delay_ms'] ?? 0;
        $whatsapp['auto_open_delay_ms'] = is_numeric($delay) ? max(0, (int) $delay) : 0;

        $integrations = [
            'stripe' => [
                'publishable_key' => (string) $settings->get('api_connections', 'stripe.publishable_key', ''),
            ],
            'google_analytics' => [
                'measurement_id' => (string) $settings->get('api_connections', 'google_analytics.measurement_id', ''),
            ],
        ];

        return response()->json([
            'data' => [
                'whatsapp' => $whatsapp,
                'integrations' => $integrations,
            ],
        ]);
    }
}
