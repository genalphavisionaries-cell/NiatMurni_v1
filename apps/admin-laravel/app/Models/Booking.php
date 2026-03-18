<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
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
}
