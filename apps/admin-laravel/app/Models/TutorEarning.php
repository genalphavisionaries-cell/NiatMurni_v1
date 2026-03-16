<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorEarning extends Model
{
    protected $fillable = [
        'tutor_id',
        'class_session_id',
        'booking_id',
        'amount_cents',
        'status',
        'locked_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'locked_at' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
