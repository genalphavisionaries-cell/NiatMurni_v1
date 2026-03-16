<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'employer_id',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_checkout_session_id',
        'stripe_invoice_id',
        'amount_cents',
        'currency',
        'status',
        'payment_method_type',
        'paid_at',
        'description',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }
}
