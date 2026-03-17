<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\CertificateService;

class AdminBookingCompletionController extends Controller
{
    public function __construct(
        protected CertificateService $certificateService
    ) {}

    public function complete(int $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->status === 'completed') {
            return response()->json([
                'status' => 'completed',
                'certificate_number' => optional($booking->certificate)->certificate_number,
            ]);
        }

        if ($booking->attendance_status !== 'present') {
            return response()->json([
                'message' => 'Cannot complete booking: attendance or exam not satisfied',
            ], 400);
        }

        if ($booking->exam_passed !== true) {
            return response()->json([
                'message' => 'Cannot complete booking: attendance or exam not satisfied',
            ], 400);
        }

        $booking->status = 'completed';
        $booking->save();

        $certificate = $this->certificateService->issueCertificate($booking->id);

        return response()->json([
            'status' => 'completed',
            'certificate_number' => $certificate->certificate_number,
        ]);
    }
}
