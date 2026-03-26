<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ClassSession;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class ReservationService
{
    /**
     * Reserve seats for a class session before payment.
     *
     * @throws \InvalidArgumentException|\RuntimeException
     */
    public function reserveSeats(
        int $classSessionId,
        int $participantId,
        ?int $employerId,
        int $seats,
        array $checkoutData = []
    ): Reservation
    {
        if ($seats < 1) {
            throw new \InvalidArgumentException('Seats must be at least 1');
        }

        if ($seats > 3) {
            throw new \InvalidArgumentException('Cannot reserve more than 3 seats in one reservation');
        }

        // Reservation stores full checkout snapshot before payment
        $payload = Validator::make($checkoutData, [
            'full_name' => ['required', 'string', 'max:255'],
            'identity_no' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'delivery_address' => ['nullable', 'string'],
            'delivery_type' => ['nullable', 'string', 'in:normal,fast'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
        ])->validate();

        return DB::transaction(function () use ($classSessionId, $participantId, $employerId, $seats, $payload): Reservation {
            /** @var ClassSession $class */
            $class = ClassSession::query()->findOrFail($classSessionId);

            // 3. Count seats already booked (all non-cancelled bookings)
            $bookedSeatsQuery = Booking::query()
                ->where('class_session_id', $class->id);

            if (Schema::hasColumn('bookings', 'cancelled_at')) {
                $bookedSeatsQuery->whereNull('cancelled_at');
            }

            $bookedSeats = Schema::hasColumn('bookings', 'seats_reserved')
                ? (int) $bookedSeatsQuery->sum('seats_reserved')
                : (int) $bookedSeatsQuery->count();

            // 4. Count active reservations (status = reserved, not expired)
            $activeReservedSeats = Reservation::query()
                ->where('class_session_id', $class->id)
                ->where('status', Reservation::STATUS_RESERVED)
                ->where('expires_at', '>', Carbon::now())
                ->sum('seats_reserved');

            // 5. Calculate remaining seats
            $capacity = (int) $class->capacity;
            $remaining = $capacity - $bookedSeats - $activeReservedSeats;

            if ($remaining < $seats) {
                throw new \RuntimeException('Not enough seats available');
            }

            $courseAmount = $class->price !== null
                ? (float) $class->price
                : ((float) ($class->price_cents ?? 0) / 100);
            $deliveryFee = (float) ($payload['delivery_fee'] ?? 0);
            $totalAmount = $courseAmount + $deliveryFee;

            // 7. Create reservation
            $reservationData = [
                'class_session_id' => $class->id,
                'participant_id' => $participantId,
                'employer_id' => $employerId,
                'seats_reserved' => $seats,
                'status' => Reservation::STATUS_RESERVED,
                'expires_at' => Carbon::now()->addHours(24),
            ];

            // Runtime-safe for environments where latest reservation snapshot migration is not yet applied.
            $optionalColumns = [
                'full_name' => $payload['full_name'],
                'identity_no' => $payload['identity_no'],
                'phone' => $payload['phone'],
                'email' => $payload['email'] ?? null,
                'company_name' => $payload['company_name'] ?? null,
                'delivery_address' => $payload['delivery_address'] ?? null,
                'delivery_type' => $payload['delivery_type'] ?? null,
                'delivery_fee' => $deliveryFee,
                'course_amount' => $courseAmount,
                'total_amount' => $totalAmount,
            ];

            foreach ($optionalColumns as $column => $value) {
                if (Schema::hasColumn('reservations', $column)) {
                    $reservationData[$column] = $value;
                }
            }

            $reservation = Reservation::query()->create($reservationData);

            return $reservation;
        });
    }

    /**
     * Mark all expired reservations as expired so they no longer block capacity.
     */
    public function expireReservations(): int
    {
        return Reservation::query()
            ->where('status', Reservation::STATUS_RESERVED)
            ->where('expires_at', '<=', Carbon::now())
            ->update(['status' => Reservation::STATUS_EXPIRED]);
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

            if ($reservation->status !== Reservation::STATUS_RESERVED) {
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
                // Temporary legacy state for idempotent conversion checks.
                'status' => Reservation::LEGACY_STATUS_CONVERTED,
                'converted_booking_id' => $booking->id,
            ]);

            return $booking;
        });
    }
}

