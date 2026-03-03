<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

Route::get('/up', function () {
    return 'ok';
});

Route::get('/verify/{qrToken}', App\Http\Controllers\CertificateVerifyController::class)->name('verify.certificate');
Route::post('/webhooks/stripe', App\Http\Controllers\StripeWebhookController::class)->name('webhooks.stripe');
