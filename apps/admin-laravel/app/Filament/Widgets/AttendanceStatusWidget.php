<?php

namespace App\Filament\Widgets;

use App\Models\AttendanceRecord;
use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

class AttendanceStatusWidget extends BaseWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        $user = auth()->user();
        $bookingsWithAttendance = AttendanceRecord::query()->select('booking_id')->groupBy('booking_id')->get()->count();
        $completedBookings = Booking::query()->where('status', 'completed')->count();
        $certifiedBookings = Booking::query()->where('status', 'certified')->count();

        if ($user && $user->isTrainer()) {
            $bookingsWithAttendance = AttendanceRecord::query()
                ->whereHas('booking.classSession', fn (Builder $q) => $q->where('trainer_id', $user->id))
                ->select('booking_id')
                ->groupBy('booking_id')
                ->get()
                ->count();
            $completedBookings = Booking::query()
                ->whereHas('classSession', fn (Builder $q) => $q->where('trainer_id', $user->id))
                ->where('status', 'completed')
                ->count();
            $certifiedBookings = Booking::query()
                ->whereHas('classSession', fn (Builder $q) => $q->where('trainer_id', $user->id))
                ->where('status', 'certified')
                ->count();
        }

        return [
            Stat::make('Bookings with attendance', $bookingsWithAttendance)
                ->description('Records in attendance_records')
                ->icon('heroicon-o-user-plus'),
            Stat::make('Completed (not yet certified)', $completedBookings)
                ->description('Eligible for certificate')
                ->icon('heroicon-o-document-check'),
            Stat::make('Certified', $certifiedBookings)
                ->description('Certificate issued')
                ->icon('heroicon-o-academic-cap'),
        ];
    }
}
