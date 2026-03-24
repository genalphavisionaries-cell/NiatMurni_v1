<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    // Performance note (index suggestions):
    // bookings(created_at), bookings(status), certificates(created_at), class_sessions(starts_at)
    public function overview(): JsonResponse
    {
        return $this->getOverview();
    }

    public function getOverview(): JsonResponse
    {
        try {
            $data = Cache::remember('admin_dashboard_overview', 60, function (): array {
                return $this->buildOverviewData();
            });

            return response()->json(['data' => $data]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Dashboard load failed',
                'error' => app()->environment('local') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function buildOverviewData(): array
    {
        $now = Carbon::now();
        $today = $now->toDateString();
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $yearStart = $now->copy()->startOfYear();

        $bookingsToday = 0;
        $bookingsWeek = 0;
        $bookingsMonth = 0;
        $bookingsTotal = 0;
        $bookingsPending = 0;
        $bookingsPaid = 0;
        $bookingsCancelled = 0;

        try {
            if (Schema::hasTable('bookings')) {
                $bookingsTotal = DB::table('bookings')->count();

                if (Schema::hasColumn('bookings', 'created_at')) {
                    $bookingsToday = DB::table('bookings')
                        ->whereDate('created_at', $today)
                        ->count();

                    $bookingsWeek = DB::table('bookings')
                        ->whereBetween('created_at', [$weekStart, $weekEnd])
                        ->count();

                    $bookingsMonth = DB::table('bookings')
                        ->whereBetween('created_at', [$monthStart, $now])
                        ->count();
                }

                if (Schema::hasColumn('bookings', 'status')) {
                    $bookingsPending = DB::table('bookings')->where('status', 'pending')->count();
                    $bookingsCancelled = DB::table('bookings')->where('status', 'cancelled')->count();
                }

                if (Schema::hasColumn('bookings', 'payment_status')) {
                    $bookingsPaid = DB::table('bookings')->where('payment_status', 'paid')->count();
                } elseif (Schema::hasColumn('bookings', 'status')) {
                    $bookingsPaid = DB::table('bookings')->where('status', 'paid')->count();
                }
            }
        } catch (\Throwable) {
            $bookingsToday = 0;
            $bookingsWeek = 0;
            $bookingsMonth = 0;
            $bookingsTotal = 0;
            $bookingsPending = 0;
            $bookingsPaid = 0;
            $bookingsCancelled = 0;
        }

        $revenueToday = 0;
        $revenueWeek = 0;
        $revenueMonth = 0;
        $revenueYear = 0;
        $revenueTotal = 0;

        try {
            if (Schema::hasTable('bookings')) {
                $amountColumn = $this->resolveAmountColumn('bookings');
                if ($amountColumn !== null) {
                    $baseRevenueQuery = DB::table('bookings');
                    if (Schema::hasColumn('bookings', 'payment_status')) {
                        $baseRevenueQuery->where('payment_status', 'paid');
                    } elseif (Schema::hasColumn('bookings', 'status')) {
                        $baseRevenueQuery->where('status', 'paid');
                    }

                    if (Schema::hasColumn('bookings', 'created_at')) {
                        $revenueToday = (float) (clone $baseRevenueQuery)->whereDate('created_at', $today)->sum($amountColumn);
                        $revenueWeek = (float) (clone $baseRevenueQuery)->whereBetween('created_at', [$weekStart, $weekEnd])->sum($amountColumn);
                        $revenueMonth = (float) (clone $baseRevenueQuery)->whereBetween('created_at', [$monthStart, $now])->sum($amountColumn);
                        $revenueYear = (float) (clone $baseRevenueQuery)->whereBetween('created_at', [$yearStart, $now])->sum($amountColumn);
                    }
                    $revenueTotal = (float) (clone $baseRevenueQuery)->sum($amountColumn);

                    if ($this->isCentsAmountColumn($amountColumn)) {
                        $revenueToday = $this->fromCents($revenueToday);
                        $revenueWeek = $this->fromCents($revenueWeek);
                        $revenueMonth = $this->fromCents($revenueMonth);
                        $revenueYear = $this->fromCents($revenueYear);
                        $revenueTotal = $this->fromCents($revenueTotal);
                    }
                }
            }
        } catch (\Throwable) {
            $revenueToday = 0;
            $revenueWeek = 0;
            $revenueMonth = 0;
            $revenueYear = 0;
            $revenueTotal = 0;
        }

        $participantsTotal = 0;
        $participantsActive = 0;
        $participantsNewThisMonth = 0;
        try {
            if (Schema::hasTable('participants')) {
                $participantsTotal = DB::table('participants')->count();
                if (Schema::hasColumn('participants', 'is_active')) {
                    $participantsActive = DB::table('participants')->where('is_active', true)->count();
                } else {
                    $participantsActive = $participantsTotal;
                }
                if (Schema::hasColumn('participants', 'created_at')) {
                    $participantsNewThisMonth = DB::table('participants')
                        ->whereBetween('created_at', [$monthStart, $now])
                        ->count();
                }
            }
        } catch (\Throwable) {
            $participantsTotal = 0;
            $participantsActive = 0;
            $participantsNewThisMonth = 0;
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

        $classesTotal = 0;
        $classesUpcoming = 0;
        $classesOngoing = 0;
        $classesCompleted = 0;
        $classesTotalSeats = 0;
        $classesBookedSeats = 0;
        try {
            if (Schema::hasTable('class_sessions')) {
                $classesTotal = DB::table('class_sessions')->count();
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

                if (Schema::hasColumn('class_sessions', 'status')) {
                    $classesCompleted = DB::table('class_sessions')->where('status', 'completed')->count();
                } elseif ($endColumn !== null) {
                    $classesCompleted = DB::table('class_sessions')->where($endColumn, '<', $now)->count();
                }

                if (Schema::hasColumn('class_sessions', 'capacity')) {
                    $classesTotalSeats = (int) DB::table('class_sessions')->sum('capacity');
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

                if (Schema::hasTable('bookings')) {
                    if (Schema::hasColumn('bookings', 'class_session_id')) {
                        if (Schema::hasColumn('bookings', 'status')) {
                            $classesBookedSeats = DB::table('bookings')
                                ->whereNotIn('status', ['cancelled'])
                                ->count();
                        } else {
                            $classesBookedSeats = DB::table('bookings')->count();
                        }
                    }
                }
            }
        } catch (\Throwable) {
            $classesTotal = 0;
            $classesUpcoming = 0;
            $classesOngoing = 0;
            $classesCompleted = 0;
            $classesTotalSeats = 0;
            $classesBookedSeats = 0;
        }

        $certificatesIssued = 0;
        $certificatesIssuedThisMonth = 0;
        $certificatesRevoked = 0;
        try {
            if (Schema::hasTable('certificates')) {
                $certificatesIssued = DB::table('certificates')->count();
                if (Schema::hasColumn('certificates', 'issued_at')) {
                    $certificatesIssuedThisMonth = DB::table('certificates')
                        ->whereBetween('issued_at', [$monthStart, $now])
                        ->count();
                } elseif (Schema::hasColumn('certificates', 'created_at')) {
                    $certificatesIssuedThisMonth = DB::table('certificates')
                        ->whereBetween('created_at', [$monthStart, $now])
                        ->count();
                }

                if (Schema::hasColumn('certificates', 'status')) {
                    $certificatesRevoked = DB::table('certificates')->where('status', 'revoked')->count();
                } elseif (Schema::hasColumn('certificates', 'revoked_at')) {
                    $certificatesRevoked = DB::table('certificates')->whereNotNull('revoked_at')->count();
                }
            }
        } catch (\Throwable) {
            $certificatesIssued = 0;
            $certificatesIssuedThisMonth = 0;
            $certificatesRevoked = 0;
        }

        $financeGrossRevenue = 0;
        $financeRefunds = 0;
        $financeNetRevenue = 0;
        try {
            $financeGrossRevenue = $revenueTotal;

            if (Schema::hasTable('refunds')) {
                if (Schema::hasColumn('refunds', 'amount')) {
                    $financeRefunds = (float) DB::table('refunds')->sum('amount');
                } elseif (Schema::hasColumn('refunds', 'amount_cents')) {
                    $financeRefunds = $this->fromCents((float) DB::table('refunds')->sum('amount_cents'));
                }
            } elseif (Schema::hasTable('payments')) {
                if (Schema::hasColumn('payments', 'refund_amount_cents')) {
                    $financeRefunds = $this->fromCents((float) DB::table('payments')->sum('refund_amount_cents'));
                } elseif (Schema::hasColumn('payments', 'refund_amount')) {
                    $financeRefunds = (float) DB::table('payments')->sum('refund_amount');
                }
            }

            $financeNetRevenue = round($financeGrossRevenue - $financeRefunds, 2);
        } catch (\Throwable) {
            $financeGrossRevenue = 0;
            $financeRefunds = 0;
            $financeNetRevenue = 0;
        }

        $revenueDaily = array_fill(0, 7, 0.0);
        $bookingsDaily = array_fill(0, 7, 0);
        try {
            if (Schema::hasTable('bookings') && Schema::hasColumn('bookings', 'created_at')) {
                $amountColumn = $this->resolveAmountColumn('bookings');
                for ($i = 6; $i >= 0; $i--) {
                    $day = $now->copy()->subDays($i);
                    $idx = 6 - $i;

                    $bookingsDaily[$idx] = DB::table('bookings')
                        ->whereDate('created_at', $day->toDateString())
                        ->count();

                    if ($amountColumn !== null) {
                        $query = DB::table('bookings')->whereDate('created_at', $day->toDateString());
                        if (Schema::hasColumn('bookings', 'payment_status')) {
                            $query->where('payment_status', 'paid');
                        } elseif (Schema::hasColumn('bookings', 'status')) {
                            $query->where('status', 'paid');
                        }
                        $sum = (float) $query->sum($amountColumn);
                        $revenueDaily[$idx] = $this->isCentsAmountColumn($amountColumn) ? $this->fromCents($sum) : round($sum, 2);
                    }
                }
            }
        } catch (\Throwable) {
            $revenueDaily = array_fill(0, 7, 0.0);
            $bookingsDaily = array_fill(0, 7, 0);
        }

        return [
            'revenue' => [
                'today' => $revenueToday,
                'this_week' => $revenueWeek,
                'this_month' => $revenueMonth,
                'this_year' => $revenueYear,
                'total' => $revenueTotal,
            ],
            'bookings' => [
                'today' => $bookingsToday,
                'this_week' => $bookingsWeek,
                'this_month' => $bookingsMonth,
                'total' => $bookingsTotal,
                'pending' => $bookingsPending,
                'paid' => $bookingsPaid,
                'cancelled' => $bookingsCancelled,
            ],
            'participants' => [
                'total' => $participantsTotal,
                'active' => $participantsActive,
                'new_this_month' => $participantsNewThisMonth,
            ],
            'tutors' => [
                'active' => $tutorsActive,
                'total' => $tutorsTotal,
            ],
            'classes' => [
                'total' => $classesTotal,
                'upcoming' => $classesUpcoming,
                'ongoing' => $classesOngoing,
                'completed' => $classesCompleted,
                'total_seats' => $classesTotalSeats,
                'booked_seats' => $classesBookedSeats,
            ],
            'certificates' => [
                'issued' => $certificatesIssued,
                'issued_total' => $certificatesIssued,
                'issued_this_month' => $certificatesIssuedThisMonth,
                'revoked' => $certificatesRevoked,
            ],
            'finance' => [
                'gross_revenue' => $financeGrossRevenue,
                'refunds' => $financeRefunds,
                'net_revenue' => $financeNetRevenue,
            ],
            'trends' => [
                'revenue_daily' => $revenueDaily,
                'bookings_daily' => $bookingsDaily,
            ],
        ];
    }

    private function resolveAmountColumn(string $table): ?string
    {
        if (Schema::hasColumn($table, 'amount')) {
            return 'amount';
        }
        if (Schema::hasColumn($table, 'total_amount')) {
            return 'total_amount';
        }
        if (Schema::hasColumn($table, 'amount_cents')) {
            return 'amount_cents';
        }
        if (Schema::hasColumn($table, 'total_amount_cents')) {
            return 'total_amount_cents';
        }

        return null;
    }

    private function isCentsAmountColumn(string $column): bool
    {
        return str_ends_with($column, '_cents');
    }

    private function fromCents(float $value): float
    {
        return round($value / 100, 2);
    }
}
