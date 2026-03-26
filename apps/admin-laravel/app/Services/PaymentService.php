<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\TutorEarning;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly ReservationService $reservationService,
        private readonly StripeService $stripeService,
    ) {}

    /**
     * Create Stripe checkout session for a valid reservation.
     *
     * @return array{checkout_url:string, reservation_id:int, expires_at:string}
     */
    public function createCheckoutForReservation(int $reservationId): array
    {
        Log::info('payments.checkout.initiated', [
            'reservation_id' => $reservationId,
        ]);

        $reservation = Reservation::query()
            ->with('classSession.program')
            ->find($reservationId);

        if (! $reservation) {
            Log::warning('payments.checkout.invalid_reservation', [
                'reservation_id' => $reservationId,
            ]);
            throw ValidationException::withMessages([
                'reservation_id' => ['Reservation does not exist.'],
            ]);
        }

        if ((string) $reservation->status !== Reservation::STATUS_RESERVED) {
            Log::warning('payments.checkout.invalid_reservation', [
                'reservation_id' => $reservationId,
                'status' => (string) $reservation->status,
            ]);
            throw ValidationException::withMessages([
                'reservation_id' => ['Reservation is not active.'],
            ]);
        }

        if ($reservation->expires_at <= now()) {
            Log::warning('payments.checkout.expired_reservation', [
                'reservation_id' => $reservationId,
                'expires_at' => (string) $reservation->expires_at,
            ]);
            throw ValidationException::withMessages([
                'reservation_id' => ['Reservation has expired.'],
            ]);
        }

        $priceCents = (int) round((float) ($reservation->total_amount ?? 0) * 100);
        if ($priceCents <= 0) {
            $priceCents = (int) ($reservation->classSession?->price_cents ?? 0);
        }
        if ($priceCents <= 0) {
            throw ValidationException::withMessages([
                'reservation_id' => ['Class price is not configured.'],
            ]);
        }

        $precreatedBooking = $reservation->converted_booking_id
            ? Booking::query()->find($reservation->converted_booking_id)
            : Booking::query()->where('reservation_id', $reservation->id)->orderByDesc('id')->first();

        $customerEmail = $reservation->email ?: $reservation->participant?->email;

        $session = $this->stripeService->createCheckoutSessionForAmount(
            amountCents: $priceCents,
            currency: 'myr',
            metadata: [
                'reservation_id' => (string) $reservation->id,
                'booking_id' => (string) ($precreatedBooking?->id ?? ''),
                'program_id' => (string) ($reservation->classSession?->program?->public_id ?? $reservation->classSession?->program_id ?? ''),
                'session_id' => (string) ($reservation->classSession?->public_id ?? $reservation->classSession_id),
                'product_id' => (string) ($reservation->classSession?->public_id ?? $reservation->classSession_id),
            ],
            customerEmail: $customerEmail ? (string) $customerEmail : null,
        );

        Log::info('stripe.session.created', [
            'reservation_id' => (int) $reservation->id,
            'booking_id' => (int) ($precreatedBooking?->id ?? 0),
            'amount_cents' => $priceCents,
            'has_customer_email' => ! empty($customerEmail),
        ]);

        return [
            'checkout_url' => (string) $session->url,
            'reservation_id' => (int) $reservation->id,
            'expires_at' => (string) $reservation->expires_at,
        ];
    }

    /**
     * Convert reservation to booking, create payment record, ensure idempotency.
     *
     * @param  array<string, mixed>  $stripeData
     * @return array{booking_id:int, payment_id:int, idempotent:bool}
     */
    public function handleSuccessfulPayment(int $reservationId, array $stripeData): array
    {
        return DB::transaction(function () use ($reservationId, $stripeData): array {
            /** @var Reservation $reservation */
            $reservation = Reservation::query()
                ->lockForUpdate()
                ->findOrFail($reservationId);

            $providerPaymentId = $this->extractProviderPaymentId($stripeData);

            if ($providerPaymentId !== null) {
                $existingByProvider = Payment::query()
                    ->where('provider', Payment::PROVIDER_STRIPE)
                    ->where('provider_payment_id', $providerPaymentId)
                    ->first();

                if ($existingByProvider) {
                    return [
                        'booking_id' => (int) $existingByProvider->booking_id,
                        'payment_id' => (int) $existingByProvider->id,
                        'idempotent' => true,
                    ];
                }
            }

            if ($reservation->converted_booking_id) {
                $existingOnConverted = Payment::query()
                    ->where('booking_id', $reservation->converted_booking_id)
                    ->where('provider', Payment::PROVIDER_STRIPE)
                    ->where('status', Payment::STATUS_PAID)
                    ->first();

                if ($existingOnConverted) {
                    return [
                        'booking_id' => (int) $existingOnConverted->booking_id,
                        'payment_id' => (int) $existingOnConverted->id,
                        'idempotent' => true,
                    ];
                }
            }

            if ($reservation->converted_booking_id) {
                $booking = Booking::query()->findOrFail($reservation->converted_booking_id);
            } else {
                $booking = $this->reservationService->convertReservationToBooking($reservation->id);
            }

            $payment = Payment::query()->create([
                'booking_id' => $booking->id,
                'reservation_id' => $reservation->id,
                'provider' => Payment::PROVIDER_STRIPE,
                'method' => Payment::METHOD_CARD,
                'provider_payment_id' => $providerPaymentId,
                'amount_cents' => (int) ($stripeData['amount_total'] ?? 0),
                'currency' => (string) ($stripeData['currency'] ?? 'myr'),
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
                'provider_payload' => $stripeData,
            ]);

            $booking->update([
                'status' => Booking::STATUS_CONFIRMED,
                'paid_at' => now(),
            ]);

            $this->createTutorEarningIfNeeded($booking, $reservation, (int) ($stripeData['amount_total'] ?? 0));

            return [
                'booking_id' => (int) $booking->id,
                'payment_id' => (int) $payment->id,
                'idempotent' => false,
            ];
        });
    }

    /**
     * Mark payment flow as failed while avoiding duplicate failed records.
     *
     * @param  array<string, mixed>  $stripeData
     */
    public function handleFailedPayment(int $reservationId, array $stripeData): void
    {
        DB::transaction(function () use ($reservationId, $stripeData): void {
            /** @var Reservation $reservation */
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservationId);

            $providerPaymentId = $this->extractProviderPaymentId($stripeData);
            if ($providerPaymentId !== null) {
                $exists = Payment::query()
                    ->where('provider', Payment::PROVIDER_STRIPE)
                    ->where('provider_payment_id', $providerPaymentId)
                    ->exists();
                if ($exists) {
                    return;
                }
            }

            if ((string) $reservation->status === Reservation::STATUS_RESERVED) {
                $reservation->update([
                    'status' => Reservation::STATUS_CANCELLED,
                ]);
            }
        });
    }

    /**
     * Approve manual payment and finalize booking/payment lifecycle.
     *
     * @return array{booking_id:int,payment_id:int,idempotent:bool}
     */
    public function handleManualPayment(int $reservationId): array
    {
        return DB::transaction(function () use ($reservationId): array {
            /** @var Reservation $reservation */
            $reservation = Reservation::query()
                ->lockForUpdate()
                ->findOrFail($reservationId);

            $pendingOrPaidManual = Payment::query()
                ->where('provider', Payment::PROVIDER_MANUAL)
                ->where('reservation_id', $reservationId)
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($pendingOrPaidManual && (string) $pendingOrPaidManual->status === Payment::STATUS_PAID) {
                return [
                    'booking_id' => (int) $pendingOrPaidManual->booking_id,
                    'payment_id' => (int) $pendingOrPaidManual->id,
                    'idempotent' => true,
                ];
            }

            if ($reservation->converted_booking_id) {
                $existingPaid = Payment::query()
                    ->where('booking_id', $reservation->converted_booking_id)
                    ->where('provider', Payment::PROVIDER_MANUAL)
                    ->where('status', Payment::STATUS_PAID)
                    ->first();

                if ($existingPaid) {
                    return [
                        'booking_id' => (int) $existingPaid->booking_id,
                        'payment_id' => (int) $existingPaid->id,
                        'idempotent' => true,
                    ];
                }
            }

            if ((string) $reservation->status === Reservation::LEGACY_STATUS_CONVERTED && $reservation->converted_booking_id) {
                $booking = Booking::query()->findOrFail($reservation->converted_booking_id);
            } else {
                $booking = $this->reservationService->convertReservationToBooking($reservation->id);
            }

            $amountCents = (int) round((float) ($reservation->total_amount ?? 0) * 100);
            if ($amountCents <= 0) {
                $amountCents = (int) ($booking->total_amount_cents ?? 0);
            }

            if ($pendingOrPaidManual) {
                $pendingOrPaidManual->update([
                    'booking_id' => $booking->id,
                    'status' => Payment::STATUS_PAID,
                    'paid_at' => now(),
                    'amount_cents' => $amountCents,
                    'currency' => (string) ($pendingOrPaidManual->currency ?: 'myr'),
                ]);
                $payment = $pendingOrPaidManual->fresh();
            } else {
                $payment = Payment::query()->create([
                    'booking_id' => $booking->id,
                    'reservation_id' => $reservation->id,
                    'provider' => Payment::PROVIDER_MANUAL,
                    'method' => Payment::METHOD_BANK_TRANSFER,
                    'amount_cents' => $amountCents,
                    'currency' => 'myr',
                    'status' => Payment::STATUS_PAID,
                    'paid_at' => now(),
                    'provider_payload' => ['source' => 'manual_approval'],
                ]);
            }

            $booking->update([
                'status' => Booking::STATUS_CONFIRMED,
                'paid_at' => now(),
            ]);

            $this->createTutorEarningIfNeeded($booking, $reservation, $amountCents);

            return [
                'booking_id' => (int) $booking->id,
                'payment_id' => (int) $payment->id,
                'idempotent' => false,
            ];
        });
    }

    /**
     * Refund payment by booking through a single canonical flow.
     */
    public function handleRefund(int $bookingId): Payment
    {
        Log::info('payments.refund.initiated', [
            'booking_id' => $bookingId,
        ]);

        try {
            $payment = DB::transaction(function () use ($bookingId): Payment {
                /** @var Booking $booking */
                $booking = Booking::query()
                    ->lockForUpdate()
                    ->findOrFail($bookingId);

                /** @var Payment|null $payment */
                $payment = Payment::query()
                    ->where('booking_id', $bookingId)
                    ->where('provider', Payment::PROVIDER_STRIPE)
                    ->orderByDesc('id')
                    ->lockForUpdate()
                    ->first();

                if (! $payment) {
                    throw ValidationException::withMessages([
                        'booking_id' => ['No Stripe payment found for this booking.'],
                    ]);
                }

                // Idempotent safe return when already refunded.
                if ((string) $payment->status === Payment::STATUS_REFUNDED) {
                    if ((string) $booking->status !== Booking::STATUS_REFUNDED) {
                        $booking->update(['status' => Booking::STATUS_REFUNDED]);
                    }
                    return $payment;
                }

                $ok = $this->stripeService->refund($booking);
                if (! $ok) {
                    throw ValidationException::withMessages([
                        'booking_id' => ['Refund failed (check Stripe or payment intent).'],
                    ]);
                }

                $payment->update([
                    'status' => Payment::STATUS_REFUNDED,
                    'refunded_at' => now(),
                    'refund_amount_cents' => (int) $payment->amount_cents,
                ]);

                $booking->update([
                    'status' => Booking::STATUS_REFUNDED,
                ]);

                TutorEarning::query()
                    ->where('booking_id', $booking->id)
                    ->update(['status' => TutorEarning::STATUS_CANCELLED]);

                return $payment->fresh();
            });

            Log::info('payments.refund.success', [
                'booking_id' => $bookingId,
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);

            return $payment;
        } catch (\Throwable $e) {
            Log::error('payments.refund.failed', [
                'booking_id' => $bookingId,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function extractProviderPaymentId(array $stripeData): ?string
    {
        $value = $stripeData['payment_intent'] ?? $stripeData['id'] ?? null;
        if (! is_string($value) || $value === '') {
            return null;
        }

        return $value;
    }

    private function createTutorEarningIfNeeded(Booking $booking, Reservation $reservation, int $amountCents): void
    {
        $classSession = $booking->classSession()->with('tutor')->first();
        if (! $classSession || ! $classSession->tutor_id || ! $classSession->tutor) {
            return;
        }

        if (TutorEarning::query()->where('booking_id', $booking->id)->exists()) {
            return;
        }

        $tutor = $classSession->tutor;
        $earningCents = 0;

        switch ($tutor->payout_type) {
            case 'percent':
                if ($tutor->payout_percent) {
                    $earningCents = (int) round($amountCents * ((float) $tutor->payout_percent / 100));
                }
                break;
            case 'per_student':
                if ($tutor->payout_per_student_cents) {
                    $seats = (int) ($reservation->seats_reserved ?? 1);
                    $earningCents = $seats * (int) $tutor->payout_per_student_cents;
                }
                break;
            case 'per_class':
                if ($tutor->payout_per_class_cents) {
                    $earningCents = (int) $tutor->payout_per_class_cents;
                }
                break;
        }

        if ($earningCents <= 0) {
            return;
        }

        TutorEarning::query()->create([
            'booking_id' => $booking->id,
            'tutor_id' => $tutor->id,
            'amount_cents' => $earningCents,
            'status' => TutorEarning::STATUS_PENDING,
        ]);
    }
}
