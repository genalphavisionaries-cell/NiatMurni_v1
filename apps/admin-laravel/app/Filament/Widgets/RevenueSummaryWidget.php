<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

class RevenueSummaryWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected function getStats(): array
    {
        $user = auth()->user();
        $query = Booking::query()->where('status', 'paid');
        if ($user && $user->isTrainer()) {
            $query->whereHas('classSession', fn (Builder $q) => $q->where('trainer_id', $user->id));
        }
        $total = $query->sum('payment_amount');
        if ($total == 0) {
            $total = $query->count() > 0 ? '—' : 0;
        } else {
            $total = 'RM ' . number_format($total, 2);
        }

        return [
            Stat::make('Revenue (paid bookings)', $total)
                ->description('Sum of payment_amount where status = paid')
                ->icon('heroicon-o-currency-dollar'),
        ];
    }
}
