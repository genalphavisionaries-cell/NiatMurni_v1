<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'class_session_id',
        'participant_id',
        'employer_id',
        'qty',
        'status',
        'expires_at',
        'converted_booking_id',
        'hold_reference',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
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
