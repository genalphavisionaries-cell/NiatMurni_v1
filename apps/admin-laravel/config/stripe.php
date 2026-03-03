<?php

return [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    'price_id' => env('STRIPE_PRICE_ID'),
    'currency' => env('STRIPE_CURRENCY', 'myr'),
    'success_url' => env('STRIPE_SUCCESS_URL', '/admin/bookings?payment=success'),
    'cancel_url' => env('STRIPE_CANCEL_URL', '/admin/bookings?payment=cancelled'),
];
