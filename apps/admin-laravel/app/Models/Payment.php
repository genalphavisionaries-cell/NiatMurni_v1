<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    // STANDARD STATUS ENUM - DO NOT MODIFY WITHOUT SYSTEM REVIEW
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    public const STANDARD_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_PAID,
        self::STATUS_FAILED,
        self::STATUS_REFUNDED,
    ];

    protected $fillable = [
        'booking_id',
        'provider',
        'provider_payment_id',
        'amount_cents',
        'currency',
        'status',
        'paid_at',
        'refunded_at',
        'refund_amount_cents',
        'provider_payload',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
