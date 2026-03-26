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
Route::get('/public/cms', App\Http\Controllers\Api\Public\CmsController::class)->name('api.public.cms');
Route::get('/public/settings', App\Http\Controllers\Api\PublicSettingsController::class)
    ->middleware('throttle:60,1')
    ->name('api.public.settings');
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
    Route::get('/me', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'me'])->name('me');
    Route::put('/me', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'updateMe'])->name('me.update');
    Route::post('/me/change-password', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'changePassword'])
        ->middleware('throttle:10,1')
        ->name('me.change-password');
    Route::post('/change-password', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'changePassword'])
        ->middleware('throttle:10,1')
        ->name('change-password'); // backward-compatible alias

    Route::middleware('module:settings')->group(function () {
        Route::get('/settings', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'settings'])->name('settings.index');
        Route::put('/settings', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'updateSettings'])->name('settings.update');
    });
    Route::middleware('module:finance')->group(function () {
        Route::get('/settings/api-connections', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'apiConnections'])->name('settings.api-connections.index');
        Route::put('/settings/api-connections', [App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'updateApiConnections'])->name('settings.api-connections.update');
    });
    Route::get('/dashboard/overview', [App\Http\Controllers\Api\Admin\DashboardController::class, 'overview'])->name('dashboard.overview');

    // Secured admin operational endpoints.
    Route::middleware('module:bookings')->group(function () {
        Route::post('/bookings/{bookingId}/refund', [AdminRefundController::class, 'refund']);
        Route::post('/bookings/{bookingId}/complete', [AdminBookingCompletionController::class, 'complete']);
    });
    Route::middleware('module:finance')->group(function () {
        Route::get('/finance/revenue-timeline', [AdminFinanceReportController::class, 'revenueTimeline']);
        Route::get('/finance/refund-timeline', [AdminFinanceReportController::class, 'refundTimeline']);
        Route::get('/finance/tutor-payout-timeline', [AdminFinanceReportController::class, 'tutorPayoutTimeline']);
    });

    // Programs
    Route::middleware('module:programs')->group(function () {
        Route::apiResource('programs', App\Http\Controllers\Api\Admin\ProgramController::class);
    });

    // Class sessions
    Route::middleware('module:classes')->group(function () {
        Route::apiResource('class-sessions', App\Http\Controllers\Api\Admin\ClassSessionController::class);
        Route::post('/attendance/update', [App\Http\Controllers\Api\Admin\AttendanceController::class, 'update'])
            ->name('attendance.update');
        Route::post('/attendance/bulk-update', [App\Http\Controllers\Api\Admin\AttendanceController::class, 'bulkUpdate'])
            ->name('attendance.bulk-update');
    });

    // Tutors (users with role trainer)
    Route::middleware('module:tutors')->group(function () {
        Route::get('/tutors', [App\Http\Controllers\Api\Admin\TutorController::class, 'index'])->name('tutors.index');
        Route::post('/tutors', [App\Http\Controllers\Api\Admin\TutorController::class, 'store'])->name('tutors.store');
        Route::get('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'show'])->name('tutors.show');
        Route::put('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'update'])->name('tutors.update');
        Route::delete('/tutors/{user}', [App\Http\Controllers\Api\Admin\TutorController::class, 'destroy'])->name('tutors.destroy');
    });

    // Bookings (sales)
    Route::middleware('module:bookings')->group(function () {
        Route::get('/bookings', [App\Http\Controllers\Api\Admin\BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [App\Http\Controllers\Api\Admin\BookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}', [App\Http\Controllers\Api\Admin\BookingController::class, 'update'])->name('bookings.update');
    });

    // Participants
    Route::middleware('module:participants')->group(function () {
        Route::get('/participants', [App\Http\Controllers\Api\Admin\ParticipantController::class, 'index'])->name('participants.index');
        Route::get('/participants/{participant}', [App\Http\Controllers\Api\Admin\ParticipantController::class, 'show'])->name('participants.show');
    });

    // Employers (for dropdowns)
    Route::middleware('module:participants')->group(function () {
        Route::get('/employers', [App\Http\Controllers\Api\Admin\EmployerController::class, 'index'])->name('employers.index');
    });

    // CMS (Next.js admin — homepage sections + testimonials)
    Route::get('/cms/homepage', [App\Http\Controllers\Api\Admin\CmsHomepageController::class, 'show'])->name('cms.homepage.show');
    Route::put('/cms/homepage', [App\Http\Controllers\Api\Admin\CmsHomepageController::class, 'update'])->name('cms.homepage.update');
    Route::get('/cms/testimonials', [App\Http\Controllers\Api\Admin\CmsTestimonialController::class, 'index'])->name('cms.testimonials.index');
    Route::post('/cms/testimonials', [App\Http\Controllers\Api\Admin\CmsTestimonialController::class, 'store'])->name('cms.testimonials.store');
    Route::put('/cms/testimonials/{id}', [App\Http\Controllers\Api\Admin\CmsTestimonialController::class, 'update'])->name('cms.testimonials.update');
    Route::delete('/cms/testimonials/{id}', [App\Http\Controllers\Api\Admin\CmsTestimonialController::class, 'destroy'])->name('cms.testimonials.destroy');

    // Users (native Next.js admin user management)
    Route::middleware('module:users')->group(function () {
        Route::get('/users', [App\Http\Controllers\Api\Admin\UserController::class, 'index'])->name('users.index');
        Route::post('/users', [App\Http\Controllers\Api\Admin\UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [App\Http\Controllers\Api\Admin\UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [App\Http\Controllers\Api\Admin\UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/reset-password', [App\Http\Controllers\Api\Admin\UserController::class, 'resetPassword'])
            ->name('users.reset-password');
    });
});
