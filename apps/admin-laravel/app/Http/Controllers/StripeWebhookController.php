<?php

namespace App\Http\Controllers;

use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, StripeService $stripeService): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('stripe.webhook_secret');

        if (empty($secret)) {
            return response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $stripeService->markPaidBySessionId($session->id);
                break;
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $stripeService->markPaidByPaymentIntentId($paymentIntent->id);
                break;
            case 'invoice.paid':
                $invoice = $event->data->object;
                $stripeService->markPaidByInvoiceId($invoice->id);
                break;
        }

        return response('', 200);
    }
}
