<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorInvoice extends Model
{
    protected $fillable = [
        'tutor_id',
        'invoice_number',
        'period_start',
        'period_end',
        'total_amount_cents',
        'status',
        'issued_at',
        'due_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'issued_at' => 'datetime',
            'due_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function tutorPayouts(): HasMany
    {
        return $this->hasMany(TutorPayout::class);
    }
}
