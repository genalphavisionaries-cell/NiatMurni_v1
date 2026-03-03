<?php

namespace App\Observers;

use App\Models\Booking;
use App\Services\CertificateService;

class BookingObserver
{
    public function __construct(
        protected CertificateService $certificateService
    ) {}

    public function updated(Booking $booking): void
    {
        if ($booking->wasChanged('status') && $booking->status === 'completed') {
            $this->certificateService->issueForBooking($booking);
        }
    }
}
