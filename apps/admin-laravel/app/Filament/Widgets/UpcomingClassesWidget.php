<?php

namespace App\Filament\Widgets;

use App\Models\ClassSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

class UpcomingClassesWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = auth()->user();
        $query = ClassSession::query()
            ->whereIn('status', ['draft', 'confirmed'])
            ->where('starts_at', '>=', now());

        if ($user && $user->isTrainer()) {
            $query->where('trainer_id', $user->id);
        }

        $count = $query->count();

        return [
            Stat::make('Upcoming classes', $count)
                ->description('Draft or confirmed, starting after today')
                ->icon('heroicon-o-calendar-days'),
        ];
    }
}
