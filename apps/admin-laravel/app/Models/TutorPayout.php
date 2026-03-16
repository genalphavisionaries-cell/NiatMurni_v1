<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorPayout extends Model
{
    protected $fillable = [
        'tutor_id',
        'tutor_invoice_id',
        'payout_reference',
        'destination_type',
        'destination_details',
        'gross_amount_cents',
        'fee_cents',
        'net_amount_cents',
        'status',
        'initiated_at',
        'paid_at',
        'failed_at',
        'failure_reason',
    ];

    protected function casts(): array
    {
        return [
            'destination_details' => 'array',
            'initiated_at' => 'datetime',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function tutorInvoice(): BelongsTo
    {
        return $this->belongsTo(TutorInvoice::class);
    }

    public function payoutReceipts(): HasMany
    {
        return $this->hasMany(PayoutReceipt::class);
    }
}
