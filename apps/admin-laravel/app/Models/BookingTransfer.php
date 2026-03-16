<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingTransfer extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'from_booking_id',
        'to_booking_id',
        'reason',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function fromBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'from_booking_id');
    }

    public function toBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'to_booking_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
