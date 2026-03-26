<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    // Reservation stores full checkout snapshot before payment

    // STANDARD STATUS ENUM - DO NOT MODIFY WITHOUT SYSTEM REVIEW
    public const STATUS_RESERVED = 'reserved';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    // Legacy compatibility during migration.
    public const LEGACY_STATUS_CONVERTED = 'converted';

    public const STANDARD_STATUSES = [
        self::STATUS_RESERVED,
        self::STATUS_EXPIRED,
        self::STATUS_CANCELLED,
    ];

    public const COMPATIBLE_STATUSES = [
        ...self::STANDARD_STATUSES,
        self::LEGACY_STATUS_CONVERTED,
    ];

    protected $fillable = [
        'class_session_id',
        'participant_id',
        'employer_id',
        'qty',
        'seats_reserved',
        'status',
        'expires_at',
        'converted_booking_id',
        'hold_reference',
        'full_name',
        'identity_no',
        'phone',
        'email',
        'company_name',
        'delivery_address',
        'delivery_type',
        'delivery_fee',
        'course_amount',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'delivery_fee' => 'decimal:2',
            'course_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function convertedBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'converted_booking_id');
    }
}
