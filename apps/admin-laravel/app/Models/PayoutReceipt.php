<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutReceipt extends Model
{
    protected $fillable = [
        'tutor_payout_id',
        'receipt_number',
        'pdf_url',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }

    public function tutorPayout(): BelongsTo
    {
        return $this->belongsTo(TutorPayout::class);
    }
}
