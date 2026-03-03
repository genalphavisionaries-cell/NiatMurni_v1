<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'participant_id',
        'class_session_id',
        'booking_reference',
        'status',
        'payment_status',
        'stripe_payment_intent_id',
        'stripe_invoice_id',
        'stripe_checkout_session_id',
        'payment_amount',
        'payment_method',
        'booked_by_type',
        'paid_at',
        'verified_at',
        'completed_at',
        'certified_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'completed_at' => 'datetime',
            'certified_at' => 'datetime',
            'payment_amount' => 'decimal:2',
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

    public function verificationRecord(): HasOne
    {
        return $this->hasOne(VerificationRecord::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }
}
