<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\TutorEarning;
use Illuminate\Support\Facades\DB;

class FinanceReportService
{
    /**
     * Revenue grouped by period (day, week, month, year). Only paid payments.
     *
     * @return array<int, array{period: string, amount_cents: int}>
     */
    public function revenueByPeriod(string $period): array
    {
        $dateColumn = 'paid_at';
        return $this->paymentAggregateByPeriod($dateColumn, Payment::STATUS_PAID, $period);
    }

    /**
     * Refunds grouped by period. Only refunded payments, grouped by refunded_at.
     *
     * @return array<int, array{period: string, amount_cents: int}>
     */
    public function refundsByPeriod(string $period): array
    {
        $dateColumn = 'refunded_at';
        return $this->paymentRefundsAggregateByPeriod($dateColumn, $period);
    }

    /**
     * Tutor payouts (pending, eligible, paid) grouped by period. Group by created_at.
     * Includes legacy 'payable' during migration.
     *
     * @return array<int, array{period: string, amount_cents: int}>
     */
    public function tutorPayoutsByPeriod(string $period): array
    {
        $driver = TutorEarning::query()->getConnection()->getDriverName();
        $periodExpr = $this->periodExpression($driver, 'created_at', $period);
        $groupBy = $driver === 'pgsql' ? DB::raw($periodExpr) : 'period';

        $rows = TutorEarning::query()
            ->select(
                DB::raw($periodExpr . ' as period'),
                DB::raw('SUM(amount_cents) as amount_cents')
            )
            ->whereIn('status', [
                TutorEarning::STATUS_PENDING,
                TutorEarning::STATUS_ELIGIBLE,
                TutorEarning::STATUS_PAID,
                TutorEarning::LEGACY_STATUS_PAYABLE,
            ])
            ->groupBy($groupBy)
            ->orderBy('period')
            ->get();

        return $this->formatResult($rows);
    }

    /**
     * Payments where status = paid, grouped by paid_at (or given column).
     *
     * @return array<int, array{period: string, amount_cents: int}>
     */
    private function paymentAggregateByPeriod(string $dateColumn, string $status, string $period): array
    {
        $driver = Payment::query()->getConnection()->getDriverName();
        $periodExpr = $this->periodExpression($driver, $dateColumn, $period);
        $groupBy = $driver === 'pgsql' ? DB::raw($periodExpr) : 'period';

        $rows = Payment::query()
            ->select(
                DB::raw($periodExpr . ' as period'),
                DB::raw('SUM(amount_cents) as amount_cents')
            )
            ->where('status', $status)
            ->whereNotNull($dateColumn)
            ->groupBy($groupBy)
            ->orderBy('period')
            ->get();

        return $this->formatResult($rows);
    }

    /**
     * Payments where status = refunded, grouped by refunded_at. Sum refund_amount_cents.
     *
     * @return array<int, array{period: string, amount_cents: int}>
     */
    private function paymentRefundsAggregateByPeriod(string $dateColumn, string $period): array
    {
        $driver = Payment::query()->getConnection()->getDriverName();
        $periodExpr = $this->periodExpression($driver, $dateColumn, $period);
        $groupBy = $driver === 'pgsql' ? DB::raw($periodExpr) : 'period';

        $rows = Payment::query()
            ->select(
                DB::raw($periodExpr . ' as period'),
                DB::raw('SUM(refund_amount_cents) as amount_cents')
            )
            ->where('status', Payment::STATUS_REFUNDED)
            ->whereNotNull($dateColumn)
            ->groupBy($groupBy)
            ->orderBy('period')
            ->get();

        return $this->formatResult($rows);
    }

    /**
     * SQL expression for grouping by period (day, week, month, year).
     */
    private function periodExpression(string $driver, string $dateColumn, string $period): string
    {
        $wrapped = $driver === 'pgsql' ? "\"$dateColumn\"" : "`$dateColumn`";

        if ($period === 'day') {
            return "DATE($wrapped)";
        }

        if ($period === 'week') {
            if ($driver === 'pgsql') {
                return "to_char($wrapped, 'IYYY-\"W\"IW')";
            }
            if ($driver === 'mysql') {
                return "YEARWEEK($wrapped)";
            }
            return "strftime('%Y-%W', $wrapped)";
        }

        if ($period === 'month') {
            if ($driver === 'pgsql') {
                return "to_char($wrapped, 'YYYY-MM')";
            }
            if ($driver === 'mysql') {
                return "DATE_FORMAT($wrapped, '%Y-%m')";
            }
            return "strftime('%Y-%m', $wrapped)";
        }

        if ($period === 'year') {
            if ($driver === 'pgsql') {
                return "EXTRACT(YEAR FROM $wrapped)::text";
            }
            if ($driver === 'mysql') {
                return "YEAR($wrapped)";
            }
            return "strftime('%Y', $wrapped)";
        }

        throw new \InvalidArgumentException("Unsupported period: {$period}. Use: day, week, month, year.");
    }

    /**
     * @param  \Illuminate\Support\Collection  $rows
     * @return array<int, array{period: string, amount_cents: int}>
     */
    private function formatResult($rows): array
    {
        return $rows->map(fn ($row) => [
            'period' => (string) $row->period,
            'amount_cents' => (int) $row->amount_cents,
        ])->values()->all();
    }
}
