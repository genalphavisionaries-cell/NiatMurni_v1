<?php

namespace App\Services;

use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    protected StripeClient $client;

    public function __construct()
    {
        $secretKey = setting('stripe_secret_key');

        if (empty($secretKey)) {
            throw new \RuntimeException('Stripe secret key is not configured. Set stripe_secret_key in system settings.');
        }

        $this->client = new StripeClient($secretKey);
    }

    /**
     * Create a Stripe Checkout Session for a one-time payment.
     *
     * @throws ApiErrorException
     */
    public function createCheckoutSession(int $amountCents, string $currency, array $metadata = []): \Stripe\Checkout\Session
    {
        $appUrl = rtrim((string) config('app.url'), '/');

        return $this->client->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => $currency,
                    'unit_amount' => $amountCents,
                    'product_data' => [
                        'name' => 'Food Handler Course',
                    ],
                ],
                'quantity' => 1,
            ]],
            'metadata' => $metadata,
            'success_url' => $appUrl . '/payment-success',
            'cancel_url' => $appUrl . '/payment-cancel',
        ]);
    }

    /**
     * Verify and construct a Stripe webhook event from payload and signature.
     *
     * @throws SignatureVerificationException
     */
    public function constructEvent(string $payload, string $signature): \Stripe\Event
    {
        $secret = setting('stripe_webhook_secret');

        if (empty($secret)) {
            throw new \RuntimeException('Stripe webhook secret is not configured. Set stripe_webhook_secret in system settings.');
        }

        return Webhook::constructEvent(
            $payload,
            $signature,
            $secret,
        );
    }
}

<?php

namespace App\Services;

use App\Models\Booking;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeService
{
    public function __construct(
        protected StripeClient $stripe
    ) {}

    /**
     * Create a Checkout Session for a booking. Stores session ID on booking and returns redirect URL.
     */
    public function createCheckoutSession(Booking $booking): string
    {
        $priceId = config('stripe.price_id');
        if (empty($priceId)) {
            throw new \InvalidArgumentException('STRIPE_PRICE_ID is not set');
        }

        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('stripe.success_url') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('stripe.cancel_url'),
            'metadata' => [
                'booking_id' => (string) $booking->id,
            ],
            'client_reference_id' => (string) $booking->id,
        ]);

        $booking->update(['stripe_checkout_session_id' => $session->id]);

        return $session->url;
    }

    /**
     * Mark booking as paid by payment intent ID (idempotent).
     */
    public function markPaidByPaymentIntentId(string $paymentIntentId): ?Booking
    {
        $booking = Booking::where('stripe_payment_intent_id', $paymentIntentId)->first();
        if ($booking) {
            if ($booking->status !== 'paid') {
                $booking->update(['status' => 'paid', 'paid_at' => now()]);
            }
            return $booking;
        }
        return null;
    }

    /**
     * Mark booking as paid by Stripe Checkout Session ID (idempotent).
     * Used when we have session_id from redirect and want to set payment_intent_id from session.
     */
    public function markPaidBySessionId(string $sessionId): ?Booking
    {
        $booking = Booking::where('stripe_checkout_session_id', $sessionId)->first();
        if (! $booking) {
            return null;
        }
        if ($booking->status === 'paid') {
            return $booking;
        }
        try {
            $session = $this->stripe->checkout->sessions->retrieve($sessionId);
            $paymentIntentId = $session->payment_intent;
            if (is_object($paymentIntentId) && isset($paymentIntentId->id)) {
                $paymentIntentId = $paymentIntentId->id;
            }
            if (is_string($paymentIntentId)) {
                $booking->update([
                    'stripe_payment_intent_id' => $paymentIntentId,
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
            } else {
                $booking->update(['status' => 'paid', 'paid_at' => now()]);
            }
        } catch (ApiErrorException $e) {
            return null;
        }
        return $booking;
    }

    /**
     * Mark booking(s) as paid by Stripe invoice ID (idempotent). For subscription/invoice flow.
     */
    public function markPaidByInvoiceId(string $invoiceId): int
    {
        $updated = Booking::where('stripe_invoice_id', $invoiceId)
            ->where('status', '!=', 'paid')
            ->update(['status' => 'paid', 'paid_at' => now()]);
        return $updated;
    }

    /**
     * Store payment_intent_id on booking (e.g. from webhook metadata) then mark paid.
     */
    public function setPaymentIntentAndMarkPaid(int $bookingId, string $paymentIntentId): ?Booking
    {
        $booking = Booking::find($bookingId);
        if (! $booking) {
            return null;
        }
        $booking->update([
            'stripe_payment_intent_id' => $paymentIntentId,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        return $booking;
    }

    /**
     * Refund a booking via Stripe (if payment_intent_id exists) and optionally update status. Caller should log to audit.
     */
    public function refund(Booking $booking, ?string $reason = null): bool
    {
        $pi = $booking->stripe_payment_intent_id;
        if (empty($pi)) {
            return false;
        }
        try {
            $this->stripe->refunds->create([
                'payment_intent' => $pi,
                'reason' => 'requested_by_customer',
                'metadata' => $reason ? ['reason' => $reason] : [],
            ]);
        } catch (ApiErrorException $e) {
            return false;
        }
        return true;
    }
}
