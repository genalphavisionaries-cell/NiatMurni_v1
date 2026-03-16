<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected StripeService $stripe;

    public function __construct(StripeService $stripe)
    {
        $this->stripe = $stripe;
    }

    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'exists:reservations,id'],
        ]);

        $reservation = Reservation::with('classSession')->findOrFail($validated['reservation_id']);

        if ($reservation->status !== 'reserved') {
            abort(400, 'Reservation not active');
        }

        if ($reservation->expires_at <= now()) {
            abort(400, 'Reservation expired');
        }

        $priceCents = $reservation->classSession->price_cents;

        if (! $priceCents) {
            abort(500, 'Class price not configured');
        }

        $session = $this->stripe->createCheckoutSession(
            amountCents: (int) $priceCents,
            currency: 'myr',
            metadata: [
                'reservation_id' => $reservation->id,
            ],
        );

        return response()->json([
            'checkout_url' => $session->url,
        ]);
    }
}

