<?php

namespace App\Observers;

use App\Models\Booking;
use App\Services\CertificateLifecycleService;
use Illuminate\Validation\ValidationException;

class BookingObserver
{
    public function __construct(
        protected CertificateLifecycleService $certificateLifecycleService
    ) {}

    public function updated(Booking $booking): void
    {
        if ($booking->wasChanged('status') && $booking->status === 'completed') {
            try {
                $this->certificateLifecycleService->issueCertificateForBooking($booking->id);
            } catch (ValidationException $e) {
                // Not eligible or already has certificate; skip auto-issue
            }
        }
    }
}
