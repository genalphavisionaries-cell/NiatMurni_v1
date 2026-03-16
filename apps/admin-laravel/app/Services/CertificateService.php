<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Certificate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(
        protected CertificatePdfService $certificatePdfService
    ) {}

    /**
     * Issue a certificate for a completed booking. Returns existing certificate if one already exists.
     */
    public function issueCertificate(int $bookingId): Certificate
    {
        $booking = Booking::with('participant')->findOrFail($bookingId);

        $existing = Certificate::where('booking_id', $bookingId)->first();
        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($booking) {
            $nextId = (Certificate::max('id') ?? 0) + 1;
            $certificateNumber = 'NM-' . date('Y') . '-' . str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);

            $verificationToken = Str::uuid()->toString();
            $qrCode = '/certificate/verify/' . $verificationToken;

            $certificate = Certificate::create([
                'booking_id' => $booking->id,
                'certificate_number' => $certificateNumber,
                'verification_token' => $verificationToken,
                'qr_code' => $qrCode,
                'issued_at' => now(),
            ]);

            return $this->certificatePdfService->generatePdf($certificate);
        });
    }
}
