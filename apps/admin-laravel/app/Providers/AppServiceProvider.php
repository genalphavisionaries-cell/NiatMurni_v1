<?php

namespace App\Providers;

use App\Models\ClassSession;
use App\Models\Booking;
use App\Observers\ClassSessionObserver;
use App\Observers\BookingObserver;
use App\Services\StripeService;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StripeClient::class, function () {
            $secret = config('stripe.secret');
            return new StripeClient($secret ?: '');
        });
        $this->app->singleton(StripeService::class);
    }

    public function boot(): void
    {
        ClassSession::observe(ClassSessionObserver::class);
        Booking::observe(BookingObserver::class);
    }
}
