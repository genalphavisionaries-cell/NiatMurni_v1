<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TutorEarning;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class RefundService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $secretKey = setting('stripe_secret_key');

        if (empty($secretKey)) {
            throw new \RuntimeException('Stripe secret key is not configured. Set stripe_secret_key in system settings.');
        }

        $this->stripe = new StripeClient($secretKey);
    }

    /**
     * Refund a booking: Stripe refund, payment status, booking status, tutor earnings.
     */
    public function refundBooking(int $bookingId): Payment
    {
        /** @var Booking $booking */
        $booking = Booking::query()->findOrFail($bookingId);

        /** @var Payment $payment */
        $payment = Payment::query()
            ->where('booking_id', $bookingId)
            ->where('status', 'paid')
            ->firstOrFail();

        DB::transaction(function () use ($payment, $booking): void {
            // 4. Call Stripe refund API
            $this->stripe->refunds->create([
                'payment_intent' => $payment->provider_payment_id,
            ]);

            // 5. Update payment
            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'refund_amount_cents' => $payment->amount_cents,
            ]);

            // 6. Cancel booking
            $booking->update([
                'status' => 'cancelled',
            ]);

            // 7. Cancel tutor earnings
            TutorEarning::query()
                ->where('booking_id', $booking->id)
                ->update(['status' => 'cancelled']);
        });

        // Reload and return the updated payment record
        return $payment->fresh();
    }
}

