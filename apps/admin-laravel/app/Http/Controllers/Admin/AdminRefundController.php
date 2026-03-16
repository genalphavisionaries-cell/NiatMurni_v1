<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RefundService;
use Illuminate\Http\Request;

class AdminRefundController extends Controller
{
    protected RefundService $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    public function refund(int $bookingId)
    {
        $payment = $this->refundService->refundBooking($bookingId);

        return response()->json([
            'status' => 'success',
            'payment' => $payment,
        ]);
    }
}

