<?php

use App\Http\Controllers\Api\StripeWebhookController as ApiStripeWebhookController;
use App\Http\Controllers\Web\CertificateVerificationPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

Route::get('/certificate/verify/{token}', [CertificateVerificationPageController::class, 'show']);

Route::get('/up', function () {
    return 'ok';
});

Route::get('/verify/{qrToken}', App\Http\Controllers\CertificateVerifyController::class)->name('verify.certificate');
// Legacy route kept for compatibility; canonical processing is ApiStripeWebhookController.
Route::post('/webhooks/stripe', [ApiStripeWebhookController::class, 'handle'])->name('webhooks.stripe');
