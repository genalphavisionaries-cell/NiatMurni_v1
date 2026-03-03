<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class RevenueSummaryWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected static ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $bookingQuery = Booking::query();
        if (auth()->user()?->isTrainer()) {
            $bookingQuery->whereHas('classSession', fn ($q) => $q->where('trainer_id', auth()->id()));
        }
        $paidCount = (clone $bookingQuery)->where('status', 'paid')->count();
        // Revenue from paid bookings - no amount column yet; show count. Can add amount_cents later.
        return [
            Stat::make('Paid bookings (revenue count)', (string) $paidCount)
                ->description('Bookings with status paid'),
        ];
    }
}
