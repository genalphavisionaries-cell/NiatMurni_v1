<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\ReservationService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripeWebhookController extends Controller
{
    protected StripeService $stripe;

    protected ReservationService $reservations;

    public function __construct(
        StripeService $stripe,
        ReservationService $reservations
    ) {
        $this->stripe = $stripe;
        $this->reservations = $reservations;
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');

        $event = $this->stripe->constructEvent($payload, $signature);

        if ($event->type !== 'checkout.session.completed') {
            return response()->json(['received' => true]);
        }

        /** @var \Stripe\Checkout\Session $session */
        $session = $event->data->object;

        $reservationId = $session->metadata->reservation_id ?? null;

        if (! $reservationId) {
            return response()->json(['error' => 'Missing reservation_id in metadata'], 400);
        }

        $booking = $this->reservations->convertReservationToBooking((int) $reservationId);

        Payment::create([
            'booking_id' => $booking->id,
            'provider' => 'stripe',
            'provider_payment_id' => $session->payment_intent ?? null,
            'amount_cents' => $session->amount_total ?? 0,
            'currency' => $session->currency ?? 'myr',
            'status' => 'paid',
            'paid_at' => now(),
            'provider_payload' => json_encode($session),
        ]);

        return response()->json(['status' => 'success']);
    }
}

