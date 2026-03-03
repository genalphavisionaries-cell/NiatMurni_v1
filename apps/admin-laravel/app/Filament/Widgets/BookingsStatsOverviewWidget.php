<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\ClassSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class BookingsStatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = auth()->user();
        $bookingQuery = Booking::query();
        if ($user?->isTrainer()) {
            $bookingQuery->whereHas('classSession', fn ($q) => $q->where('trainer_id', $user->id));
        }
        $paidCount = (clone $bookingQuery)->where('status', 'paid')->count();
        $pendingCount = (clone $bookingQuery)->where('status', 'pending')->count();

        $classQuery = ClassSession::where('starts_at', '>', now())->whereIn('status', ['draft', 'confirmed']);
        if ($user?->isTrainer()) {
            $classQuery->where('trainer_id', $user->id);
        }
        $upcomingCount = $classQuery->count();

        return [
            Stat::make('Paid bookings', (string) $paidCount)
                ->description('Eligible for verification')
                ->color('success'),
            Stat::make('Pending bookings', (string) $pendingCount)
                ->description('Awaiting payment')
                ->color('warning'),
            Stat::make('Upcoming classes', (string) $upcomingCount)
                ->description('Scheduled sessions'),
        ];
    }
}
