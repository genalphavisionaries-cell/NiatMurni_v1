<?php

use App\Http\Controllers\Api\CertificateVerificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Admin\AdminBookingCompletionController;
use App\Http\Controllers\Admin\AdminFinanceReportController;
use App\Http\Controllers\Admin\AdminRefundController;
use App\Http\Controllers\Public\CertificateDownloadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/homepage-settings', App\Http\Controllers\Api\HomepageSettingsController::class)->name('api.homepage-settings');

Route::get('/settings/{group}', [App\Http\Controllers\Api\SettingsGroupController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('api.settings.group');
Route::get('/public/cms', App\Http\Controllers\Api\PublicCmsController::class)->name('api.public.cms');
Route::post('/register', App\Http\Controllers\Api\RegisterForClassController::class)->name('api.register');
Route::prefix('public')->group(function () {
    Route::get('/classes/upcoming', [PublicController::class, 'upcomingClasses']);
    Route::get('/classes/{id}', [PublicController::class, 'classDetail']);
    Route::get('/bookings/{id}', [PublicController::class, 'bookingDetail']);
});

// Payment / Stripe checkout (public endpoint)
Route::post('/payments/checkout', [PaymentController::class, 'createCheckoutSession']);

// Stripe webhook (must remain public / unauthenticated)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

Route::get('/certificate/verify/{token}', [CertificateVerificationController::class, 'verify']);
Route::get('/certificate/download/{token}', [CertificateDownloadController::class, 'download']);

// Admin API auth (Sanctum token in HttpOnly cookie)
Route::post('/admin/login', [App\Http\Controllers\Api\AdminAuthController::class, 'login'])->name('api.admin.login');
Route::post('/admin/forgot-password', [App\Http\Controllers\Api\AdminAuthController::class, 'forgotPassword'])
    ->middleware('throttle:5,1')
    ->name('api.admin.forgot-password');
Route::post('/admin/reset-password', [App\Http\Controllers\Api\AdminAuthController::class, 'resetPassword'])
    ->middleware('throttle:10,1')
    ->name('api.admin.reset-password');

// Participant portal auth and certificate access
Route::post('/participant/login', [App\Http\Controllers\Api\ParticipantAuthController::class, 'login'])->name('api.participant.login');
Route::middleware('auth:sanctum')->prefix('participant')->name('api.participant.')->group(function () {
    Route::post('/logout', [App\Http\Controllers\Api\ParticipantAuthController::class, 'logout'])->name('logout');
    Route::get('/me', [App\Http\Controllers\Api\ParticipantAuthController::class, 'me'])->name('me');
    Route::get('/certificates', [App\Http\Controllers\Api\ParticipantCertificatesController::class, 'index'])->name('certificates.index');
});

Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdminAccess::class])->prefix('admin')->name('api.admin.')->group(function () {
    Route::post('/logout', [App\Http\Controllers\Api\AdminAuthController::class, 'logout'])->name('logout');
    Route::get('/me', [App\Http\Controllers\Api\AdminAuthController::class, 'me'])->name('me');
    Route::post('/change-password', [App\Http\Controllers\Api\AdminAuthController::class, 'changePassword'])
        ->middleware('throttle:10,1')
        ->name('change-password');

    // Secured admin operational endpoints.
    Route::post('/bookings/{bookingId}/refund', [AdminRefundController::class, 'refund']);
    Route::post('/bookings/{bookingId}/complete', [AdminBookingCompletionController::class, 'complete']);
    Route::get('/finance/revenue-timeline', [AdminFinanceReportController::class, 'revenueTimeline']);
    Route::get('/finance/refund-timeline', [AdminFinanceReportController::class, 'refundTimeline']);
    Route::get('/finance/tutor-payout-timeline', [AdminFinanceReportController::class, 'tutorPayoutTimeline']);

    // CMS
    Route::put('/homepage-settings', [App\Http\Controllers\Api\Admin\HomepageSettingsController::class, 'update'])->name('homepage-settings.update');

    // Programs
    Route::apiResource('programs', App\Http\Controllers\Api\Admin\ProgramController::class);

    // Class sessions
    Route::apiResource('class-sessions', App\Http\Controllers\Api\Admin\ClassSessionController::class);

    // Tutors (users with role trainer)
    Route::get('/tutors', [App\Http\Controllers\Api\Admin\TutorController::class, 'index'])->name('tutors.index');
    Route::post('/tutors', [App\Http\Controllers\Api\Admin\TutorController::class, 'store'])->name('tutors.store');
    Route::get('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'show'])->name('tutors.show');
    Route::put('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'update'])->name('tutors.update');
    Route::delete('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'destroy'])->name('tutors.destroy');

    // Bookings (sales)
    Route::get('/bookings', [App\Http\Controllers\Api\Admin\BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [App\Http\Controllers\Api\Admin\BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}', [App\Http\Controllers\Api\Admin\BookingController::class, 'update'])->name('bookings.update');

    // Participants
    Route::get('/participants', [App\Http\Controllers\Api\Admin\ParticipantController::class, 'index'])->name('participants.index');
    Route::get('/participants/{participant}', [App\Http\Controllers\Api\Admin\ParticipantController::class, 'show'])->name('participants.show');

    // Employers (for dropdowns)
    Route::get('/employers', [App\Http\Controllers\Api\Admin\EmployerController::class, 'index'])->name('employers.index');
});
