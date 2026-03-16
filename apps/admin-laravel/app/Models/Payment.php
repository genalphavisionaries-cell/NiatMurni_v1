<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'provider',
        'provider_payment_id',
        'amount_cents',
        'currency',
        'status',
        'paid_at',
        'provider_payload',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
