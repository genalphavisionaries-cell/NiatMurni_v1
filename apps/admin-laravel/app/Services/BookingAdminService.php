<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Booking;
use Illuminate\Validation\ValidationException;

class BookingAdminService
{
    public function __construct(
        private readonly CertificateLifecycleService $certificateLifecycleService,
        private readonly PaymentService $paymentService,
    ) {}

    public function issueCertificateEligibility(Booking $booking): bool
    {
        return $this->certificateLifecycleService->isEligibleForCertificate($booking)
            && $this->certificateLifecycleService->getActiveCertificateForBooking($booking) === null;
    }

    /**
     * @return array{booking_id:int, old_status:string, new_status:string}
     */
    public function overrideStatus(Booking $booking, string $newStatus, string $reason, int $userId): array
    {
        $oldStatus = (string) $booking->status;
        $normalizedNewStatus = Booking::normalizeStatus($newStatus);

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'booking_status_override',
            'entity_type' => 'booking',
            'entity_id' => $booking->id,
            'reason' => $reason,
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $normalizedNewStatus],
        ]);

        $booking->update(['status' => $normalizedNewStatus]);

        return [
            'booking_id' => (int) $booking->id,
            'old_status' => $oldStatus,
            'new_status' => (string) $booking->status,
        ];
    }

    /**
     * @return array{booking_id:int, certificate_number:string}
     *
     * @throws ValidationException
     */
    public function issueCertificate(Booking $booking): array
    {
        $certificate = $this->certificateLifecycleService->issueCertificateForBooking((int) $booking->id);

        return [
            'booking_id' => (int) $booking->id,
            'certificate_number' => (string) $certificate->certificate_number,
        ];
    }

    /**
     * @return array{booking_id:int, certificate_number:string}
     *
     * @throws ValidationException
     */
    public function reissueCertificate(Booking $booking): array
    {
        $current = $this->certificateLifecycleService->getActiveCertificateForBooking($booking);
        if (! $current) {
            throw ValidationException::withMessages([
                'booking_id' => ['No active certificate found for this booking.'],
            ]);
        }

        $certificate = $this->certificateLifecycleService->reissueCertificate($current);

        return [
            'booking_id' => (int) $booking->id,
            'certificate_number' => (string) $certificate->certificate_number,
        ];
    }

    /**
     * @return array{booking_id:int, refunded:bool}
     */
    public function refund(Booking $booking, string $reason, int $userId): array
    {
        // Keep method for backward compatibility; canonical refund logic is centralized.
        $this->paymentService->handleRefund((int) $booking->id);

        return [
            'booking_id' => (int) $booking->id,
            'refunded' => true,
        ];
    }
}

