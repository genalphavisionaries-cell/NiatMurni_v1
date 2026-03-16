<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceLedger extends Model
{
    protected $table = 'finance_ledger';

    protected $fillable = [
        'entry_type',
        'account_code',
        'booking_id',
        'payment_id',
        'refund_id',
        'tutor_id',
        'employer_id',
        'amount_cents',
        'currency',
        'description',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }
}
