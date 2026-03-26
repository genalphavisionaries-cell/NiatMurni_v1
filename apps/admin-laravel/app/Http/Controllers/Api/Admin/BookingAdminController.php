<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingAdminService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingAdminController extends Controller
{
    public function __construct(
        private readonly BookingAdminService $bookingAdminService,
        private readonly PaymentService $paymentService,
    ) {}

    public function overrideStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'new_status' => ['required', 'string', Rule::in(Booking::COMPATIBLE_STATUSES)],
            'reason' => ['required', 'string'],
        ]);

        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail((int) $validated['booking_id']);

        $result = $this->bookingAdminService->overrideStatus(
            $booking,
            Booking::normalizeStatus((string) $validated['new_status']),
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

        // Allow paid/refunded to preserve idempotent refunds through PaymentService.
        if (! in_array((string) $booking->status, [Booking::STATUS_REFUNDED, ...Booking::confirmedLikeStatuses()], true)) {
            throw ValidationException::withMessages([
                'booking_id' => ['Booking is not eligible for admin-triggered refund.'],
            ]);
        }

        $this->paymentService->handleRefund((int) $booking->id);
        $result = [
            'booking_id' => (int) $booking->id,
            'refunded' => true,
        ];

        return response()->json([
            'message' => 'Refund initiated (audit logged).',
            'data' => $result,
        ]);
    }
}

