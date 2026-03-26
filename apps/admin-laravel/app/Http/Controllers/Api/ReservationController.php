<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    public function __construct(
        private readonly ReservationService $reservationService,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_session_id' => ['required', 'integer', 'exists:class_sessions,id'],
            'seat_count' => ['required', 'integer', 'min:1', 'max:3'],
            'full_name' => ['required', 'string', 'max:255'],
            'identity_no' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'delivery_address' => ['nullable', 'string'],
            'delivery_type' => ['nullable', 'string', 'in:normal,fast'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        $participant = Participant::query()->firstOrCreate(
            ['nric_passport' => (string) $validated['identity_no']],
            [
                'full_name' => (string) $validated['full_name'],
                'phone' => (string) $validated['phone'],
                'email' => $validated['email'] ?? null,
            ],
        );

        if (! $participant->wasRecentlyCreated) {
            $participant->update([
                'full_name' => (string) $validated['full_name'],
                'phone' => (string) $validated['phone'],
                'email' => $validated['email'] ?? $participant->email,
            ]);
        }

        $reservation = $this->reservationService->reserveSeats(
            classSessionId: (int) $validated['class_session_id'],
            participantId: (int) $participant->id,
            employerId: null,
            seats: (int) $validated['seat_count'],
            checkoutData: [
                'full_name' => (string) $validated['full_name'],
                'identity_no' => (string) $validated['identity_no'],
                'phone' => (string) $validated['phone'],
                'email' => $validated['email'] ?? null,
                'company_name' => $validated['company_name'] ?? null,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_type' => $validated['delivery_type'] ?? null,
                'delivery_fee' => $validated['delivery_fee'] ?? 0,
            ],
        );

        Log::info('reservation.created', [
            'reservation_id' => (int) $reservation->id,
            'class_session_id' => (int) $reservation->class_session_id,
            'participant_id' => (int) $reservation->participant_id,
            'seat_count' => (int) ($reservation->seats_reserved ?? 1),
        ]);

        $booking = Booking::query()->firstOrCreate(
            ['reservation_id' => (int) $reservation->id],
            [
                'participant_id' => (int) $participant->id,
                'class_session_id' => (int) $reservation->class_session_id,
                'employer_id' => null,
                'status' => Booking::LEGACY_STATUS_PENDING,
                'payment_status' => 'pending',
                'total_amount_cents' => (int) round((float) ($reservation->total_amount ?? 0) * 100),
                'source' => 'checkout',
            ],
        );

        return response()->json([
            'reservation_id' => (int) $reservation->id,
            'booking_id' => (int) $booking->id,
            'total_amount' => (float) $reservation->total_amount,
            'expires_at' => optional($reservation->expires_at)->toIso8601String(),
        ], 201);
    }
}
