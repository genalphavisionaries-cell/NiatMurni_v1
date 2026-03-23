<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = Carbon::now();

        $bookingsToday = 0;
        $bookingsWeek = 0;
        $bookingsMonth = 0;
        $bookingsTotal = 0;

        try {
            if (Schema::hasTable('bookings')) {
                $bookingsTotal = DB::table('bookings')->count();

                if (Schema::hasColumn('bookings', 'created_at')) {
                    $bookingsToday = DB::table('bookings')
                        ->whereDate('created_at', $now->toDateString())
                        ->count();

                    $bookingsWeek = DB::table('bookings')
                        ->whereBetween('created_at', [
                            $now->copy()->startOfWeek(),
                            $now->copy()->endOfWeek(),
                        ])
                        ->count();

                    $bookingsMonth = DB::table('bookings')
                        ->whereMonth('created_at', $now->month)
                        ->whereYear('created_at', $now->year)
                        ->count();
                }
            }
        } catch (\Throwable) {
            $bookingsToday = 0;
            $bookingsWeek = 0;
            $bookingsMonth = 0;
            $bookingsTotal = 0;
        }

        $revenueToday = 0;
        $revenueMonth = 0;
        $revenueYear = 0;

        try {
            if (Schema::hasTable('bookings') && Schema::hasColumn('bookings', 'created_at')) {
                $amountColumn = null;

                if (Schema::hasColumn('bookings', 'amount')) {
                    $amountColumn = 'amount';
                } elseif (Schema::hasColumn('bookings', 'total_amount_cents')) {
                    $amountColumn = 'total_amount_cents';
                }

                if ($amountColumn !== null) {
                    $baseRevenueQuery = DB::table('bookings');
                    if (Schema::hasColumn('bookings', 'payment_status')) {
                        $baseRevenueQuery->where('payment_status', 'paid');
                    }

                    $revenueToday = (float) (clone $baseRevenueQuery)
                        ->whereDate('created_at', $now->toDateString())
                        ->sum($amountColumn);

                    $revenueMonth = (float) (clone $baseRevenueQuery)
                        ->whereMonth('created_at', $now->month)
                        ->whereYear('created_at', $now->year)
                        ->sum($amountColumn);

                    $revenueYear = (float) (clone $baseRevenueQuery)
                        ->whereYear('created_at', $now->year)
                        ->sum($amountColumn);

                    if ($amountColumn === 'total_amount_cents') {
                        $revenueToday = round($revenueToday / 100, 2);
                        $revenueMonth = round($revenueMonth / 100, 2);
                        $revenueYear = round($revenueYear / 100, 2);
                    }
                }
            }
        } catch (\Throwable) {
            $revenueToday = 0;
            $revenueMonth = 0;
            $revenueYear = 0;
        }

        $participantsTotal = 0;
        try {
            if (Schema::hasTable('participants')) {
                $participantsTotal = DB::table('participants')->count();
            }
        } catch (\Throwable) {
            $participantsTotal = 0;
        }

        $tutorsTotal = 0;
        $tutorsActive = 0;
        try {
            if (Schema::hasTable('tutors')) {
                $tutorsTotal = DB::table('tutors')->count();

                if (Schema::hasColumn('tutors', 'status')) {
                    $tutorsActive = DB::table('tutors')
                        ->where('status', 'active')
                        ->count();
                }
            }
        } catch (\Throwable) {
            $tutorsTotal = 0;
            $tutorsActive = 0;
        }

        $classesUpcoming = 0;
        $classesOngoing = 0;
        try {
            if (Schema::hasTable('class_sessions')) {
                $startColumn = null;
                $endColumn = null;

                if (Schema::hasColumn('class_sessions', 'start_at')) {
                    $startColumn = 'start_at';
                } elseif (Schema::hasColumn('class_sessions', 'starts_at')) {
                    $startColumn = 'starts_at';
                }

                if (Schema::hasColumn('class_sessions', 'end_at')) {
                    $endColumn = 'end_at';
                } elseif (Schema::hasColumn('class_sessions', 'ends_at')) {
                    $endColumn = 'ends_at';
                }

                if ($startColumn !== null) {
                    $classesUpcoming = DB::table('class_sessions')
                        ->where($startColumn, '>', $now)
                        ->count();

                    if ($endColumn !== null) {
                        $classesOngoing = DB::table('class_sessions')
                            ->where($startColumn, '<=', $now)
                            ->where($endColumn, '>=', $now)
                            ->count();
                    }
                }
            }
        } catch (\Throwable) {
            $classesUpcoming = 0;
            $classesOngoing = 0;
        }

        $certificatesIssued = 0;
        try {
            if (Schema::hasTable('certificates')) {
                $certificatesIssued = DB::table('certificates')->count();
            }
        } catch (\Throwable) {
            $certificatesIssued = 0;
        }

        return response()->json([
            'data' => [
                'revenue' => [
                    'today' => $revenueToday,
                    'this_month' => $revenueMonth,
                    'this_year' => $revenueYear,
                ],
                'bookings' => [
                    'today' => $bookingsToday,
                    'this_week' => $bookingsWeek,
                    'this_month' => $bookingsMonth,
                    'total' => $bookingsTotal,
                ],
                'participants' => [
                    'total' => $participantsTotal,
                ],
                'tutors' => [
                    'active' => $tutorsActive,
                    'total' => $tutorsTotal,
                ],
                'classes' => [
                    'upcoming' => $classesUpcoming,
                    'ongoing' => $classesOngoing,
                ],
                'certificates' => [
                    'issued' => $certificatesIssued,
                ],
            ],
        ]);
    }
}
