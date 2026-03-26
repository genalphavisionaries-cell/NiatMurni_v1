<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly PaymentService $payments,
    ) {
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');

        try {
            $event = $this->stripe->constructEvent($payload, $signature);
        } catch (\Throwable $e) {
            Log::warning('stripe.webhook.invalid_signature', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid Stripe signature'], 400);
        }

        $eventType = (string) ($event->type ?? 'unknown');
        $eventId = (string) ($event->id ?? '');
        $sessionData = (array) ($event->data->object ?? []);

        Log::info('stripe.webhook.received', [
            'event_id' => $eventId,
            'event_type' => $eventType,
        ]);

        $reservationId = $this->extractReservationIdFromEvent($sessionData);

        if (! $reservationId) {
            Log::warning('stripe.webhook.missing_reservation_metadata', [
                'event_id' => $eventId,
                'event_type' => $eventType,
            ]);
            return response()->json(['received' => true]);
        }

        if ($eventType === 'checkout.session.completed') {
            $result = $this->payments->handleSuccessfulPayment($reservationId, $sessionData);
            Log::info('stripe.webhook.processed_success', [
                'event_id' => $eventId,
                'reservation_id' => $reservationId,
                'booking_id' => $result['booking_id'],
                'payment_id' => $result['payment_id'],
                'idempotent' => $result['idempotent'],
            ]);
            return response()->json(['status' => 'success']);
        }

        if (in_array($eventType, [
            'checkout.session.expired',
            'checkout.session.async_payment_failed',
            'payment_intent.payment_failed',
        ], true)) {
            $this->payments->handleFailedPayment($reservationId, $sessionData);
            Log::info('stripe.webhook.processed_failed', [
                'event_id' => $eventId,
                'reservation_id' => $reservationId,
                'event_type' => $eventType,
            ]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * @param  array<string, mixed>  $stripeObject
     */
    private function extractReservationIdFromEvent(array $stripeObject): ?int
    {
        $metadata = $stripeObject['metadata'] ?? null;
        if (! is_array($metadata)) {
            return null;
        }

        $reservationId = $metadata['reservation_id'] ?? null;
        if ($reservationId === null) {
            return null;
        }

        $value = (int) $reservationId;
        return $value > 0 ? $value : null;
    }
}
