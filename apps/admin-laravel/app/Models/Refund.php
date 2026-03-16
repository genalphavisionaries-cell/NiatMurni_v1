<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    protected $fillable = [
        'payment_id',
        'booking_id',
        'stripe_refund_id',
        'amount_cents',
        'currency',
        'status',
        'reason',
        'refunded_at',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'refunded_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
