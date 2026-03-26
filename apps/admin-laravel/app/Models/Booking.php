<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    // STANDARD STATUS ENUM - DO NOT MODIFY WITHOUT SYSTEM REVIEW
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_NO_SHOW = 'no_show';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_CANCELLED = 'cancelled';

    // Legacy compatibility during migration.
    public const LEGACY_STATUS_PENDING = 'pending';
    public const LEGACY_STATUS_RESERVED = 'reserved';
    public const LEGACY_STATUS_PAID = 'paid';
    public const LEGACY_STATUS_VERIFIED = 'verified';
    public const LEGACY_STATUS_CERTIFIED = 'certified';
    public const LEGACY_STATUS_TRANSFERRED = 'transferred';

    public const STANDARD_STATUSES = [
        self::STATUS_CONFIRMED,
        self::STATUS_COMPLETED,
        self::STATUS_NO_SHOW,
        self::STATUS_FAILED,
        self::STATUS_REFUNDED,
        self::STATUS_CANCELLED,
    ];

    public const COMPATIBLE_STATUSES = [
        ...self::STANDARD_STATUSES,
        self::LEGACY_STATUS_PENDING,
        self::LEGACY_STATUS_RESERVED,
        self::LEGACY_STATUS_PAID,
        self::LEGACY_STATUS_VERIFIED,
        self::LEGACY_STATUS_CERTIFIED,
        self::LEGACY_STATUS_TRANSFERRED,
    ];

    protected $fillable = [
        'participant_id',
        'class_session_id',
        'employer_id',
        'reservation_id',
        'status',
        'payment_status',
        'source',
        'stripe_payment_intent_id',
        'stripe_invoice_id',
        'stripe_checkout_session_id',
        'total_amount_cents',
        'paid_at',
        'verified_at',
        'completed_at',
        'certified_at',
        'cancelled_at',
        'attendance_status',
        'exam_passed',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'completed_at' => 'datetime',
            'certified_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'exam_passed' => 'boolean',
        ];
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function verificationRecord(): HasOne
    {
        return $this->hasOne(VerificationRecord::class);
    }

    /** All certificate records for this booking (including revoked, for history). */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /** The current active (non-revoked) certificate, if any. */
    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class)
            ->where('status', '!=', 'revoked')
            ->latestOfMany('id');
    }

    public function tutorEarnings(): HasMany
    {
        return $this->hasMany(TutorEarning::class);
    }

    public function questionnaireResponses(): HasMany
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }

    public static function normalizeStatus(string $status): string
    {
        return match ($status) {
            self::LEGACY_STATUS_PAID => self::STATUS_CONFIRMED,
            default => $status,
        };
    }

    /**
     * Statuses treated as revenue-confirmed bookings while legacy data exists.
     *
     * @return array<int, string>
     */
    public static function confirmedLikeStatuses(): array
    {
        return [self::STATUS_CONFIRMED, self::LEGACY_STATUS_PAID];
    }
}
