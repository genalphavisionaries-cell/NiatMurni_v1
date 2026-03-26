<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

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

        try {
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
        } catch (Throwable $e) {
            Log::error('reservation.create_failed', [
                'class_session_id' => (int) $validated['class_session_id'],
                'participant_id' => (int) $participant->id,
                'seat_count' => (int) $validated['seat_count'],
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to create reservation at the moment. Please check availability and try again.',
            ], 422);
        }

        Log::info('reservation.created', [
            'reservation_id' => (int) $reservation->id,
            'class_session_id' => (int) $reservation->class_session_id,
            'participant_id' => (int) $reservation->participant_id,
            'seat_count' => (int) ($reservation->seats_reserved ?? 1),
        ]);

        $bookingLookup = ['reservation_id' => (int) $reservation->id];
        if (! Schema::hasColumn('bookings', 'reservation_id')) {
            $bookingLookup = [
                'participant_id' => (int) $participant->id,
                'class_session_id' => (int) $reservation->class_session_id,
            ];
        }

        $bookingCreate = [
            'participant_id' => (int) $participant->id,
            'class_session_id' => (int) $reservation->class_session_id,
        ];

        $optionalBookingColumns = [
            'employer_id' => null,
            'reservation_id' => (int) $reservation->id,
            'status' => Booking::LEGACY_STATUS_PENDING,
            'payment_status' => 'pending',
            'total_amount_cents' => (int) round((float) ($reservation->total_amount ?? 0) * 100),
            'source' => 'checkout',
        ];
        foreach ($optionalBookingColumns as $column => $value) {
            if (Schema::hasColumn('bookings', $column)) {
                $bookingCreate[$column] = $value;
            }
        }

        $booking = Booking::query()->firstOrCreate($bookingLookup, $bookingCreate);

        return response()->json([
            'reservation_id' => (int) $reservation->id,
            'booking_id' => (int) $booking->id,
            'total_amount' => (float) $reservation->total_amount,
            'expires_at' => optional($reservation->expires_at)->toIso8601String(),
        ], 201);
    }
}
