<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CertificateLifecycleService
{
    public function __construct(
        protected CertificateService $certificateService,
        protected CertificatePdfService $certificatePdfService
    ) {}

    /**
     * Determine if a booking is eligible for certificate issuance.
     * Respects system settings require_attendance and require_exam_pass when set.
     */
    public function isEligibleForCertificate(Booking $booking): bool
    {
        $requireAttendance = $this->settingAsBool('require_attendance');
        $requireExamPass = $this->settingAsBool('require_exam_pass');

        if ($requireAttendance && $booking->attendance_status !== 'present') {
            return false;
        }

        if ($requireExamPass && $booking->exam_passed !== true) {
            return false;
        }

        return true;
    }

    /**
     * Get the currently active certificate for a booking (non-revoked), if any.
     */
    public function getActiveCertificateForBooking(Booking $booking): ?Certificate
    {
        return $booking->certificates()
            ->where('status', '!=', 'revoked')
            ->latest('id')
            ->first();
    }

    /**
     * Issue a certificate for an eligible booking. Manual issuance (Option B).
     * Prevents duplicate active certificates. Captures active template snapshot when present.
     *
     * @throws ValidationException if not eligible or already has active certificate
     */
    public function issueCertificateForBooking(int $bookingId): Certificate
    {
        $booking = Booking::with('participant')->findOrFail($bookingId);

        if (! $this->isEligibleForCertificate($booking)) {
            throw ValidationException::withMessages([
                'booking' => ['This booking is not eligible for a certificate. Mark as Attended and Passed, and ensure system settings allow it.'],
            ]);
        }

        $existing = $this->getActiveCertificateForBooking($booking);
        if ($existing) {
            throw ValidationException::withMessages([
                'booking' => ['A certificate has already been issued for this booking. Use Reissue if you need a new one.'],
            ]);
        }

        $template = CertificateTemplate::where('is_active', true)->first();
        $templateId = $template?->id;
        $templateName = $template?->name;

        return $this->certificateService->issueCertificate(
            $bookingId,
            $templateId,
            $templateName
        );
    }

    /**
     * Revoke a certificate. Keeps record and pdf_path for audit.
     */
    public function revokeCertificate(Certificate $certificate): Certificate
    {
        return DB::transaction(function () use ($certificate) {
            $certificate->update([
                'status' => 'revoked',
                'revoked_at' => now(),
            ]);
            return $certificate->fresh();
        });
    }

    /**
     * Reissue: revoke current certificate and create a new one with new number and token.
     * Old certificate remains in history as revoked.
     */
    public function reissueCertificate(Certificate $certificate): Certificate
    {
        $booking = $certificate->booking;
        if (! $booking) {
            throw ValidationException::withMessages([
                'certificate' => ['Certificate has no associated booking.'],
            ]);
        }

        return DB::transaction(function () use ($certificate, $booking) {
            $this->revokeCertificate($certificate);

            $template = CertificateTemplate::where('is_active', true)->first();
            $templateId = $template?->id;
            $templateName = $template?->name;

            return $this->certificateService->issueCertificate(
                $booking->id,
                $templateId,
                $templateName
            );
        });
    }

    private function settingAsBool(string $key): bool
    {
        $value = Setting::query()->where('key', $key)->value('value');

        return $value === 'true' || $value === '1';
    }
}
