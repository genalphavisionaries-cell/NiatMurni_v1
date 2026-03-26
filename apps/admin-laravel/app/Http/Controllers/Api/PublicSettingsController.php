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

        $methodsRaw = (string) ($settings->get('payment_delivery', 'manual_payment_methods', 'bank_transfer,qr,cash') ?? 'bank_transfer,qr,cash');
        $manualMethods = array_values(array_filter(array_map('trim', explode(',', $methodsRaw))));

        $checkout = [
            'delivery' => [
                'normal' => [
                    'enabled' => filter_var($settings->get('payment_delivery', 'delivery_normal_enabled', true), FILTER_VALIDATE_BOOLEAN),
                    'fee' => (float) ($settings->get('payment_delivery', 'delivery_normal_fee', 10) ?? 10),
                ],
                'fast' => [
                    'enabled' => filter_var($settings->get('payment_delivery', 'delivery_fast_enabled', true), FILTER_VALIDATE_BOOLEAN),
                    'fee' => (float) ($settings->get('payment_delivery', 'delivery_fast_fee', 20) ?? 20),
                ],
                'rules' => (string) ($settings->get('payment_delivery', 'delivery_rules', '') ?? ''),
            ],
            'manual_payment' => [
                'enabled' => filter_var($settings->get('payment_delivery', 'manual_payment_enabled', true), FILTER_VALIDATE_BOOLEAN),
                'methods' => $manualMethods,
                'qr_image_url' => (string) ($settings->get('payment_delivery', 'manual_payment_qr_image_url', '') ?? ''),
                'account_name' => (string) ($settings->get('payment_delivery', 'manual_payment_account_name', '') ?? ''),
                'bank_name' => (string) ($settings->get('payment_delivery', 'manual_payment_bank_name', '') ?? ''),
                'account_number' => (string) ($settings->get('payment_delivery', 'manual_payment_account_number', '') ?? ''),
                'bank_code' => (string) ($settings->get('payment_delivery', 'manual_payment_bank_code', '') ?? ''),
                'instructions' => (string) ($settings->get('payment_delivery', 'manual_payment_instructions', '') ?? ''),
            ],
            'success_paid_message' => (string) ($settings->get('payment_delivery', 'checkout_success_paid_message', '') ?? ''),
            'success_pending_message' => (string) ($settings->get('payment_delivery', 'checkout_success_pending_message', '') ?? ''),
            'manual_payment_notes' => (string) ($settings->get('payment_delivery', 'checkout_manual_payment_notes', '') ?? ''),
            'portal_instruction' => (string) ($settings->get('payment_delivery', 'checkout_portal_instruction', '') ?? ''),
        ];

        return response()->json([
            'data' => [
                'whatsapp' => $whatsapp,
                'integrations' => $integrations,
                'checkout' => $checkout,
            ],
        ]);
    }
}
