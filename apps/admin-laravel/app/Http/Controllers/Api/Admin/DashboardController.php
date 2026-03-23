<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Certificate;
use App\Models\ClassSession;
use App\Models\Participant;
use App\Models\Tutor;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = Carbon::now();
        $todayStart = $now->copy()->startOfDay();
        $todayEnd = $now->copy()->endOfDay();
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $yearStart = $now->copy()->startOfYear();
        $yearEnd = $now->copy()->endOfYear();

        $revenueToday = $this->toCurrency(
            Booking::query()
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->sum('total_amount_cents')
        );
        $revenueThisMonth = $this->toCurrency(
            Booking::query()
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_amount_cents')
        );
        $revenueThisYear = $this->toCurrency(
            Booking::query()
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$yearStart, $yearEnd])
                ->sum('total_amount_cents')
        );

        $data = [
            'revenue' => [
                'today' => $revenueToday,
                'this_month' => $revenueThisMonth,
                'this_year' => $revenueThisYear,
            ],
            'bookings' => [
                'today' => Booking::query()->whereBetween('created_at', [$todayStart, $todayEnd])->count(),
                'this_week' => Booking::query()->whereBetween('created_at', [$weekStart, $weekEnd])->count(),
                'this_month' => Booking::query()->whereBetween('created_at', [$monthStart, $monthEnd])->count(),
                'total' => Booking::query()->count(),
            ],
            'participants' => [
                'total' => Participant::query()->count(),
            ],
            'tutors' => [
                'active' => Tutor::query()->where('status', 'active')->count(),
                'total' => Tutor::query()->count(),
            ],
            'classes' => [
                'upcoming' => ClassSession::query()->where('starts_at', '>', $now)->count(),
                'ongoing' => ClassSession::query()
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now)
                    ->count(),
            ],
            'certificates' => [
                'issued' => Certificate::query()->count(),
            ],
        ];

        return response()->json([
            'data' => $data,
        ]);
    }

    private function toCurrency(int|float $cents): float
    {
        return round(((float) $cents) / 100, 2);
    }
}
