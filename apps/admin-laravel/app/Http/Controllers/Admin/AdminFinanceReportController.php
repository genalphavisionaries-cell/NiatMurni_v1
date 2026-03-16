<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\FinanceReportService;
use Illuminate\Http\Request;

class AdminFinanceReportController extends Controller
{
    public function __construct(
        protected FinanceReportService $financeReport
    ) {}

    /**
     * Revenue timeline by period (day, week, month, year). Default: month.
     */
    public function revenueTimeline(Request $request)
    {
        $period = $this->validatedPeriod($request);
        $data = $this->financeReport->revenueByPeriod($period);

        return response()->json([
            'period' => $period,
            'data' => $data,
        ]);
    }

    /**
     * Refund timeline by period. Default: month.
     */
    public function refundTimeline(Request $request)
    {
        $period = $this->validatedPeriod($request);
        $data = $this->financeReport->refundsByPeriod($period);

        return response()->json([
            'period' => $period,
            'data' => $data,
        ]);
    }

    /**
     * Tutor payout timeline by period. Default: month.
     */
    public function tutorPayoutTimeline(Request $request)
    {
        $period = $this->validatedPeriod($request);
        $data = $this->financeReport->tutorPayoutsByPeriod($period);

        return response()->json([
            'period' => $period,
            'data' => $data,
        ]);
    }

    private function validatedPeriod(Request $request): string
    {
        $period = $request->query('period', 'month');

        if (! in_array($period, ['day', 'week', 'month', 'year'], true)) {
            $period = 'month';
        }

        return $period;
    }
}
