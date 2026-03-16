<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\TutorEarning;

class FinanceService
{
    /**
     * Total revenue in cents from payments where status = 'paid'.
     */
    public function totalRevenue(): int
    {
        return (int) Payment::where('status', 'paid')->sum('amount_cents');
    }

    /**
     * Total refunded amount in cents from payments where status = 'refunded'.
     */
    public function totalRefunds(): int
    {
        return (int) Payment::where('status', 'refunded')->sum('refund_amount_cents');
    }

    /**
     * Net revenue: totalRevenue minus totalRefunds.
     */
    public function netRevenue(): int
    {
        return $this->totalRevenue() - $this->totalRefunds();
    }

    /**
     * Total amount in cents from tutor_earnings where status is 'pending' or 'payable'.
     */
    public function tutorPayable(): int
    {
        return (int) TutorEarning::whereIn('status', ['pending', 'payable'])->sum('amount_cents');
    }

    /**
     * Total amount in cents from tutor_earnings where status = 'paid'.
     */
    public function totalTutorPaid(): int
    {
        return (int) TutorEarning::where('status', 'paid')->sum('amount_cents');
    }

    /**
     * Outstanding tutor balance: tutorPayable minus totalTutorPaid.
     */
    public function outstandingTutorBalance(): int
    {
        return $this->tutorPayable() - $this->totalTutorPaid();
    }
}
