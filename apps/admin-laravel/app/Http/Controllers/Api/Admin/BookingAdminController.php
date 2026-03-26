<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingAdminController extends Controller
{
    private const STATUSES = [
        'pending',
        'reserved',
        'paid',
        'verified',
        'completed',
        'certified',
        'cancelled',
        'transferred',
    ];

    public function __construct(
        private readonly BookingAdminService $bookingAdminService
    ) {}

    public function overrideStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'new_status' => ['required', 'string', Rule::in(self::STATUSES)],
            'reason' => ['required', 'string'],
        ]);

        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail((int) $validated['booking_id']);

        $result = $this->bookingAdminService->overrideStatus(
            $booking,
            (string) $validated['new_status'],
            (string) $validated['reason'],
            (int) $request->user()->id,
        );

        return response()->json([
            'message' => 'Booking status updated (audit logged).',
            'data' => $result,
        ]);
    }

    public function issueCertificate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
        ]);

        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail((int) $validated['booking_id']);

        if (! $this->bookingAdminService->issueCertificateEligibility($booking)) {
            throw ValidationException::withMessages([
                'booking_id' => ['This booking is not eligible for a certificate.'],
            ]);
        }

        $result = $this->bookingAdminService->issueCertificate($booking);

        return response()->json([
            'message' => 'Certificate issued.',
            'data' => $result,
        ]);
    }

    public function reissueCertificate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
        ]);

        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail((int) $validated['booking_id']);

        $result = $this->bookingAdminService->reissueCertificate($booking);

        return response()->json([
            'message' => 'Certificate reissued.',
            'data' => $result,
        ]);
    }

    public function refund(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'reason' => ['required', 'string'],
        ]);

        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail((int) $validated['booking_id']);

        // Same guard as Filament visibility condition.
        if ((string) $booking->status !== 'paid' || empty($booking->stripe_payment_intent_id)) {
            throw ValidationException::withMessages([
                'booking_id' => ['Booking is not eligible for admin-triggered refund.'],
            ]);
        }

        $result = $this->bookingAdminService->refund(
            $booking,
            (string) $validated['reason'],
            (int) $request->user()->id,
        );

        return response()->json([
            'message' => 'Refund initiated (audit logged).',
            'data' => $result,
        ]);
    }
}

