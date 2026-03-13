<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

class BookingsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected function getStats(): array
    {
        $user = auth()->user();
        $baseQuery = Booking::query();
        if ($user && $user->isTrainer()) {
            $baseQuery->whereHas('classSession', fn (Builder $q) => $q->where('trainer_id', $user->id));
        }

        $paid = (clone $baseQuery)->where('status', 'paid')->count();
        $pending = (clone $baseQuery)->where('status', 'pending')->count();

        return [
            Stat::make('Paid bookings', $paid)
                ->description('Bookings with status paid')
                ->icon('heroicon-o-check-circle')
                ->color('success'),
            Stat::make('Pending bookings', $pending)
                ->description('Awaiting payment')
                ->icon('heroicon-o-clock')
                ->color('warning'),
        ];
    }
}
