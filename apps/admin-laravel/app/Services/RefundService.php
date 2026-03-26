<?php

namespace App\Services;

use App\Models\Payment;

class RefundService
{
    public function __construct(private readonly PaymentService $paymentService) {}

    /**
     * Legacy adapter: delegates to PaymentService canonical refund flow.
     */
    public function refundBooking(int $bookingId): Payment
    {
        return $this->paymentService->handleRefund($bookingId);
    }
}

