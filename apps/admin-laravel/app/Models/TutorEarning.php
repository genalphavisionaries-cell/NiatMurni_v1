<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorEarning extends Model
{
    // STANDARD STATUS ENUM - DO NOT MODIFY WITHOUT SYSTEM REVIEW
    public const STATUS_PENDING = 'pending';
    public const STATUS_ELIGIBLE = 'eligible';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    // Legacy compatibility during migration.
    public const LEGACY_STATUS_PAYABLE = 'payable';

    public const STANDARD_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_ELIGIBLE,
        self::STATUS_PAID,
        self::STATUS_CANCELLED,
    ];

    public const COMPATIBLE_STATUSES = [
        ...self::STANDARD_STATUSES,
        self::LEGACY_STATUS_PAYABLE,
    ];

    protected $fillable = [
        'booking_id',
        'tutor_id',
        'amount_cents',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
