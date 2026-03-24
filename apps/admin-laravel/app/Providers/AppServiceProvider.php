<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\ClassSession;
use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\CmsTestimonial;
use App\Listeners\UpdateLastLoginAt;
use App\Observers\BookingObserver;
use App\Observers\CmsCacheObserver;
use App\Observers\ClassSessionObserver;
use App\Services\StripeService;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
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
        Event::listen(Login::class, UpdateLastLoginAt::class);

        $cmsObserver = CmsCacheObserver::class;
        CmsPage::observe($cmsObserver);
        CmsSection::observe($cmsObserver);
        CmsItem::observe($cmsObserver);
        CmsTestimonial::observe($cmsObserver);
    }
}
