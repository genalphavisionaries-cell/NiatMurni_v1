<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
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

        $requireAttendance = $this->settingAsBool('require_attendance');
        $requireExamPass = $this->settingAsBool('require_exam_pass');

        if ($requireAttendance && $booking->attendance_status !== 'present') {
            return response()->json([
                'message' => 'Cannot complete booking: requirements not satisfied',
            ], 400);
        }

        if ($requireExamPass && $booking->exam_passed !== true) {
            return response()->json([
                'message' => 'Cannot complete booking: requirements not satisfied',
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

    private function settingAsBool(string $key): bool
    {
        $value = Setting::query()->where('key', $key)->value('value');

        return $value === 'true' || $value === '1';
    }
}
