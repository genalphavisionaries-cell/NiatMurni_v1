<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\TutorEarning;
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

        // Load reservation (for seats_reserved) and then convert it to a booking.
        $reservation = Reservation::with('classSession.tutor')->findOrFail((int) $reservationId);

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

        // Tutor earnings calculation based on tutor payout configuration.
        $classSession = $booking->classSession;

        if ($classSession && $classSession->tutor_id) {
            $tutor = $classSession->tutor;

            if ($tutor) {
                $earningCents = 0;

                switch ($tutor->payout_type) {
                    case 'percent':
                        if ($tutor->payout_percent) {
                            $earningCents = (int) round(
                                $session->amount_total * ($tutor->payout_percent / 100)
                            );
                        }
                        break;

                    case 'per_student':
                        if ($tutor->payout_per_student_cents) {
                            $seats = $reservation->seats_reserved ?? 1;
                            $earningCents = $seats * $tutor->payout_per_student_cents;
                        }
                        break;

                    case 'per_class':
                        if ($tutor->payout_per_class_cents) {
                            $earningCents = $tutor->payout_per_class_cents;
                        }
                        break;
                }

                if ($earningCents > 0) {
                    TutorEarning::create([
                        'booking_id' => $booking->id,
                        'tutor_id' => $tutor->id,
                        'amount_cents' => $earningCents,
                        'status' => 'pending',
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}

