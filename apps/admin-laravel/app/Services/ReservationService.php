<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ClassSession;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReservationService
{
    /**
     * Reserve seats for a class session before payment.
     *
     * @throws \InvalidArgumentException|\RuntimeException
     */
    public function reserveSeats(int $classSessionId, int $participantId, ?int $employerId, int $seats): Reservation
    {
        if ($seats < 1) {
            throw new \InvalidArgumentException('Seats must be at least 1');
        }

        if ($seats > 3) {
            throw new \InvalidArgumentException('Cannot reserve more than 3 seats in one reservation');
        }

        return DB::transaction(function () use ($classSessionId, $participantId, $employerId, $seats): Reservation {
            /** @var ClassSession $class */
            $class = ClassSession::query()->findOrFail($classSessionId);

            // 3. Count seats already booked (all non-cancelled bookings)
            $bookedSeatsQuery = Booking::query()
                ->where('class_session_id', $class->id)
                ->whereNull('cancelled_at');

            $bookedSeats = Schema::hasColumn('bookings', 'seats_reserved')
                ? (int) $bookedSeatsQuery->sum('seats_reserved')
                : (int) $bookedSeatsQuery->count();

            // 4. Count active reservations (status = reserved, not expired)
            $activeReservedSeats = Reservation::query()
                ->where('class_session_id', $class->id)
                ->where('status', 'reserved')
                ->where('expires_at', '>', Carbon::now())
                ->sum('seats_reserved');

            // 5. Calculate remaining seats
            $capacity = (int) $class->capacity;
            $remaining = $capacity - $bookedSeats - $activeReservedSeats;

            if ($remaining < $seats) {
                throw new \RuntimeException('Not enough seats available');
            }

            // 7. Create reservation
            $reservation = Reservation::query()->create([
                'class_session_id' => $class->id,
                'participant_id' => $participantId,
                'employer_id' => $employerId,
                'seats_reserved' => $seats,
                'status' => 'reserved',
                'expires_at' => Carbon::now()->addHours(24),
            ]);

            return $reservation;
        });
    }

    /**
     * Mark all expired reservations as expired so they no longer block capacity.
     */
    public function expireReservations(): int
    {
        return Reservation::query()
            ->where('status', 'reserved')
            ->where('expires_at', '<=', Carbon::now())
            ->update(['status' => 'expired']);
    }

    /**
     * Convert a reservation into a booking, preserving capacity rules.
     *
     * @throws ModelNotFoundException|\RuntimeException
     */
    public function convertReservationToBooking(int $reservationId): Booking
    {
        return DB::transaction(function () use ($reservationId): Booking {
            /** @var Reservation $reservation */
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservationId);

            if ($reservation->status !== 'reserved') {
                throw new \RuntimeException('Only active reserved reservations can be converted');
            }

            if ($reservation->expires_at <= Carbon::now()) {
                throw new \RuntimeException('Reservation has expired');
            }

            // Create booking using only fields confirmed in the Booking schema.
            $booking = Booking::query()->create([
                'participant_id' => $reservation->participant_id,
                'class_session_id' => $reservation->class_session_id,
                'employer_id' => $reservation->employer_id,
                'reservation_id' => $reservation->id,
            ]);

            $reservation->update([
                'status' => 'converted',
                'converted_booking_id' => $booking->id,
            ]);

            return $booking;
        });
    }
}

