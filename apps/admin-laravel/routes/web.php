<?php

use App\Http\Controllers\Web\CertificateVerificationPageController;
use Illuminate\Support\Facades\Route;

Route::get('/certificate/verify/{token}', [CertificateVerificationPageController::class, 'show']);

Route::get('/up', function () {
    return 'ok';
});

Route::get('/verify/{qrToken}', App\Http\Controllers\CertificateVerifyController::class)->name('verify.certificate');
Route::post('/webhooks/stripe', App\Http\Controllers\StripeWebhookController::class)->name('webhooks.stripe');

Route::get('/debug-settings', function () {
    return \App\Models\Setting::all();
});
