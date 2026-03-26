<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function createCheckoutSession(Request $request): JsonResponse
    {
        if ($request->filled('booking_id')) {
            Log::warning('payments.checkout.deprecated_booking_input', [
                'booking_id' => $request->input('booking_id'),
            ]);

            return response()->json([
                'message' => 'Booking-based checkout is deprecated. Use reservation flow.',
            ], 422);
        }

        $validated = $request->validate([
            'reservation_id' => ['required', 'exists:reservations,id'],
        ]);

        $result = $this->payments->createCheckoutForReservation((int) $validated['reservation_id']);

        return response()->json([
            'checkout_url' => $result['checkout_url'],
        ]);
    }
}

