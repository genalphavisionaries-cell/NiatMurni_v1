<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;

class AdminRefundController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function refund(int $bookingId)
    {
        $payment = $this->paymentService->handleRefund($bookingId);

        return response()->json([
            'status' => 'success',
            'payment' => $payment,
        ]);
    }
}

