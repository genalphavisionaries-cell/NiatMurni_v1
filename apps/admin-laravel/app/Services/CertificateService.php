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
     * Create and generate a new certificate for a booking.
     * Caller is responsible for eligibility and duplicate checks.
     *
     * @param  int  $bookingId
     * @param  int|null  $certificateTemplateId  Active template ID for snapshot (optional)
     * @param  string|null  $templateNameSnapshot  Template name at issue time (optional)
     */
    public function issueCertificate(
        int $bookingId,
        ?int $certificateTemplateId = null,
        ?string $templateNameSnapshot = null
    ): Certificate {
        $booking = Booking::with('participant')->findOrFail($bookingId);

        return DB::transaction(function () use ($booking, $certificateTemplateId, $templateNameSnapshot) {
            $nextId = (Certificate::max('id') ?? 0) + 1;
            $certificateNumber = 'NM-' . date('Y') . '-' . str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);

            $verificationToken = Str::uuid()->toString();
            $qrCode = '/certificate/verify/' . $verificationToken;

            $certificate = Certificate::create([
                'booking_id' => $booking->id,
                'certificate_template_id' => $certificateTemplateId,
                'template_name_snapshot' => $templateNameSnapshot,
                'certificate_number' => $certificateNumber,
                'verification_token' => $verificationToken,
                'qr_code' => $qrCode,
                'issued_at' => now(),
                'status' => 'issued',
            ]);

            return $this->certificatePdfService->generatePdf($certificate);
        });
    }
}
