<?php

namespace App\Filament\Widgets;

use App\Models\AttendanceRecord;
use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AttendanceStatusWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected function getStats(): array
    {
        $user = auth()->user();
        $bookingQuery = Booking::query();
        if ($user?->isTrainer()) {
            $bookingQuery->whereHas('classSession', fn ($q) => $q->where('trainer_id', $user->id));
        }
        $verifiedNotCompleted = (clone $bookingQuery)->where('status', 'verified')->count();
        $completed = (clone $bookingQuery)->whereIn('status', ['completed', 'certified'])->count();

        $attendanceQuery = AttendanceRecord::query()->select('booking_id')->groupBy('booking_id');
        if ($user?->isTrainer()) {
            $attendanceQuery->whereHas('booking', fn ($q) => $q->whereHas('classSession', fn ($q2) => $q2->where('trainer_id', $user->id)));
        }
        $withAttendance = $attendanceQuery->get()->count();

        return [
            Stat::make('Verified (awaiting attendance)', (string) $verifiedNotCompleted)
                ->color('info'),
            Stat::make('With attendance recorded', (string) $withAttendance),
            Stat::make('Completed / Certified', (string) $completed)
                ->color('success'),
        ];
    }
}
